import React, { useEffect, useRef, useState } from 'react';
import UsersComponent from './UsersComponent';
import toast from 'react-hot-toast';
import { getUsers } from '../../apis/FetchUsers';
import { updateUser } from '../../apis/PutUsers';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import { useNavigate } from 'react-router-dom';

function UsersController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            if (response.data.status) {
                setUsers(response.data.data);
            } else {
                toast.error("Failed to fetch users");
                setUsers([]);
            }
        } catch (error) {
            toast.error("Error fetching users");
            console.error("API Error:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchUsers();
            hasFetched.current = true;
        }
    }, []);

    // Filtered users based on search term
    const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
            `${user.first_name} ${user.last_name} ${user.email} ${user.phone_number}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
    : [];

    //Handle Pagination
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers .slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers .length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    //Handle View Addresses
    const handleViewAddresses = (user) => {
        navigate("/user-addresses", { state: { addresses: user.addresses, name: `${user.first_name} ${user.last_name}`, user_id: user.id } });
    };

    //Handle View Orders
    const handleViewOrders = (user) => {
        const userDetails = {
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number
        };
        navigate(`/orders/`, { state: userDetails });
    };

    // Handle Edit Users
    const handleEditUsers = (user) =>{
        navigate("/edit-user", { state: user })
    }

    // Handle Delete Users
    const handleDeleteUsers = (id) => {
        DeleteConfirmation({
            id,
            apiEndpoint: "/user",
            name: "user",
            onSuccess: fetchUsers,
        });
    };

    // // Handle Verify Users
    const handleVerifyUsers = async (id) =>{
       try {
            const payload = {
                is_active: true,
                role_flag: true,
            };
            const response = await updateUser(id, payload);
            if(response.status) {
                toast.success("User verified successfully!");
                fetchUsers();   
            }  else {
                toast.error(response.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error verifying user:", error);
            toast.error("Failed to verify user.");
        } 
    }

    return (
        <UsersComponent
            navigate={navigate} 
            loading={loading}
            users={currentUsers}
            onUserViewAddresses={handleViewAddresses}
            onUserViewOrders={handleViewOrders}
            onUserEdit={handleEditUsers}
            onUserDelete={handleDeleteUsers}
            onUserVerify={handleVerifyUsers}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    );
};

export default UsersController;
