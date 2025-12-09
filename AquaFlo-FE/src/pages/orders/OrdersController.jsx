import { useEffect, useRef, useState } from "react";
import OrdersComponent from "./OrdersComponent";
import toast from "react-hot-toast";
import { getAllOrders } from "../../apis/FetchOrders";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { updateOrder } from "../../apis/PutOrders";
import { TfiEmail } from "react-icons/tfi";
import { FaWhatsapp } from "react-icons/fa";

function OrdersController() {
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [allOrders, setAllOrders] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState("All");
    const [searchOrderId, setSearchOrderId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const MySwal = withReactContent(Swal);

    const fetchAllOrders = async () => {
        try {
            const response = await getAllOrders();
            if (response.data.status) {
                setAllOrders(response.data.data);
            } else {
                setAllOrders([]);
                toast.error("Failed to fetch orders");
            }
        } catch (error) {
            toast.error("Error fetching orders");
            console.error("API Error:", error);
            setAllOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchAllOrders();
            hasFetched.current = true;
        }
    }, []);

    //Handle Filtering
    
    useEffect(() => {
        const userFromState = location.state;

        if (userFromState?.phone_number) {
            setSelectedUser(userFromState.phone_number);
        }
    }, [location.state]);

    const getFilteredorders = () => {
        if (!Array.isArray(allOrders)) return [];
        let filtered = [...allOrders];
        
        // Filter by status
        if (selectedFilter !== "All") {
            filtered = filtered.filter(order => order.status.toUpperCase() === selectedFilter.toUpperCase());
        }
    
        // Filter by user
        if (selectedUser !== "All") {
            filtered = filtered.filter(order => order.user_data.phone_number === selectedUser);
        }

        // Filter by order ID
        if (searchOrderId.trim() !== "") {
            filtered = filtered.filter(order => order.id.toString().includes(searchOrderId.trim()));
        }

         // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            filtered = filtered.filter(order => {
                const [day, month, year] = order.created_at.split("-");
                const orderDate = new Date(`${year}-${month}-${day}`);
                return orderDate >= start && orderDate <= end;
            });
        }
    
        return filtered;
    };

    //Handle Pagination
    const getPaginatedOrders = () => {
        const filtered = getFilteredorders();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };
    
    const totalPages = Math.ceil(getFilteredorders().length / itemsPerPage);
    
    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRM":
                return "bg-blue-200 text-blue-700";
            case "COMPLETED":
                return "bg-green-200 text-green-700";
            case "CANCEL":
                return "bg-red-200 text-red-700";
            default:
                return "bg-yellow-200 text-yellow-700";
        }
    };

    // Handle Confirm Order
    const handleConfirmOrder = (order) => {
        navigate(`/confirm-order/${order.id}` , {state: { ...order, mode: 'confirm' }});
    };

    // Handle Cancel Order
    const handleCancelOrder = async (orderId) => {
        const { value: reason } = await Swal.fire({
            title: 'Cancel Order',
            input: 'text',
            inputLabel: 'Cancelation Reason',
            inputPlaceholder: 'Enter Cancelation Reason',
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonColor: "#13609b",
            cancelButtonText: 'Cancel',
            customClass: {
                inputLabel: 'custom-swal-input-label',
                input: 'custom-swal-order-input'                       
            },

            preConfirm: async (value) => {
                if (!value) {
                    Swal.showValidationMessage('Cancelation reason is required');
                }
                return value;
            }
        });

        if (reason) {
            try {
                const payload = {
                    status: "CANCEL",
                    cancellation_reason: reason
                };
                const response = await updateOrder(orderId, payload);
                if (response.status) {
                    toast.success("Order cancelled successfully");
                    fetchAllOrders();
                    Swal.close();
                } else {
                    toast.error("Failed to cancel order");
                }
            } catch (error) {
                toast.error("Error cancelling order");
                console.error("Cancel order error:", error);
            }
        }
    }

    // Handle Complete Order
    const handleCompleteOrder = () => {
        // navigate(`/complete-order/${order.id}`, {
        //     state: { ...order, mode: 'complete' },
        // });
    };

    //Handle View Invoice
    const handleViewInvoice = (id) => {
        navigate(`/view-invoice/${id}`);
    };

    //Filter Options For Status
    const filterOptions = [
        { id: "All", name: "All" },
        { id: "Pending", name: "Pending" },
        { id: "Cancel", name: "Cancel" },
        { id: "Completed", name: "Completed" },
    ];

    //Filter Options For User
    const userMap = new Map(
        Array.isArray(allOrders)
        ? allOrders.map(order => [
            order.user_data.phone_number,
            {
                id: order.user_data.phone_number,
                name: `${order.user_data.first_name} ${order.user_data.last_name}`,
            },
        ])
        : []
    );

    // Add entry for user with no orders, if applicable
    if (
        selectedUser !== "All" &&
        selectedUser !== "" &&
        !userMap.has(selectedUser)
    ) {
        const { first_name = "", last_name = "" } = location.state || {};
        userMap.set(selectedUser, {
            id: selectedUser,
            name:
                first_name || last_name
                    ? `${first_name} ${last_name}`
                    : `No orders found for ${selectedUser}`,
        });
    }

    const userFilterOptions = [
        { id: "All", name: "All" },
        ...Array.from(userMap.values()),
    ];

    // Handle Share address
    const handleShare = (link) => {
        const emailSubject = "Address Sharing";
        const emailBody = `Location Link:\n${link}`;
      
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        const whatsappLink = `https://web.whatsapp.com/send?text=${encodeURIComponent(link)}`;
      
        MySwal.fire({
            title: 'Share Address',
            html: (
                <div className="flex flex-col gap-3 text-[16px] items-start">
                    <a
                        href={gmailLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-red-600"
                    >
                        <TfiEmail size={20} /> Share via Gmail
                    </a>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-500"
                    >
                        <FaWhatsapp size={20} /> Share via WhatsApp
                    </a>
                </div>
            ),
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'rounded-lg shadow-lg p-6'
            }
        });
    };

    return (
        <OrdersComponent 
            navigate={navigate}
            loading={loading}
            allOrders={getPaginatedOrders()}
            getStatusColor={getStatusColor}
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            setSelectedFilter={(val) => {
                setCurrentPage(1);
                setSelectedFilter(val);
            }}
            userFilterOptions={userFilterOptions}
            selectedUser={selectedUser}
            setSelectedUser={(val) => {
                setCurrentPage(1);
                setSelectedUser(val);
            }}
            searchOrderId={searchOrderId}
            setSearchOrderId={(val) => {
                setCurrentPage(1);
                setSearchOrderId(val);
            }}
            onHandleConfirmOrder={handleConfirmOrder}
            onHandleCancelOrder={handleCancelOrder}
            onHandleCompleteOrder={handleCompleteOrder}
            onHandleViewInvoice={handleViewInvoice}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            handleShare={handleShare}
        />
    );
};

export default OrdersController;
