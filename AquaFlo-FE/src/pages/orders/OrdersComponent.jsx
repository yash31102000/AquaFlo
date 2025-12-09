/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { IoIosWarning } from 'react-icons/io';
import Loader from '../../components/common/Loader';
import Dropdown from '../../components/common/formDropDown/DropDown';
import Input from '../../components/common/formInputs/Input';
import DateFilterDropdown from '../../components/common/dateFilterDropDown/DateFilterDropDown';
import { motion, AnimatePresence } from "framer-motion";
import BaseImage from '../../components/common/BaseImage';

function OrdersComponent({
    loading, allOrders, filterOptions,
    selectedFilter, setSelectedFilter,
    userFilterOptions, selectedUser, setSelectedUser,
    getStatusColor, searchOrderId, setSearchOrderId,
    onHandleConfirmOrder, onHandleCancelOrder,
    onHandleCompleteOrder, onHandleViewInvoice,
    currentPage, totalPages, setCurrentPage,
    startDate, endDate, setStartDate, setEndDate,
    handleShare
}) {

    const [expandedRows, setExpandedRows] = useState(null);

    const toggleRow = (key) => {
        setExpandedRows(prevKey => (prevKey === key ? null : key));
    };

    const excludedKeys = [
        "id", "Size(mm)", "size (mm)", "Size (Mm)", "Inch", "od min.", "od max.",
        "thickness min. (mm)", "thickness max. (mm)", "code", "size", "mm", "nos",
        "ltr", "height", "width"
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">List All Order</h2>
            </div>

            {/* Funcationality Of Filter & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="w-full sm:w-[9%] flex flex-col items-start">
                    <strong>Status:</strong>
                    <Dropdown 
                        options={filterOptions} 
                        selectedValue={selectedFilter} 
                        onChange={setSelectedFilter}  
                    />
                </div>

                <div className="w-full sm:w-[9%] flex flex-col items-start">
                    <strong>User:</strong>
                    <Dropdown 
                        options={userFilterOptions}
                        selectedValue={selectedUser}
                        onChange={setSelectedUser}
                        isSearchable={true} 
                        shouldSort={true} 
                    />
                </div>

                <div className="w-full sm:w-fit flex flex-col items-start">
                    <strong>Date:</strong>
                    <DateFilterDropdown
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />
                </div>

                <div className="w-full sm:w-[12%] flex flex-col items-start">
                    <strong>Search Orders:</strong>
                    <div className="w-full sm:w-auto">
                        <Input 
                            type="text" 
                            placeholder="Enter Your Order ID"
                            value={searchOrderId}
                            onChange={(e) => setSearchOrderId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]" 
                            wrapperClass="mb-0"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading Orders..." />
            ) : allOrders.length === 0 ? (
                <div className="flex justify-center items-center gap-2 text-yellow-500 p-4 border border-gray-300 rounded-md">
                    <IoIosWarning size={30}/>
                    <p className="text-center text-red-500 text-xl font-semibold py-4">No Orders Available!</p>
                    <IoIosWarning size={30}/>   
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {allOrders.map((order) => {
                        const isExpanded = expandedRows === order.id;
                        return (
                            <div key={order.id} className="border border-gray-300 rounded-md px-4 py-2 bg-white shadow">
                                {/* Summary */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800">
                                            {order.user_data.first_name} {order.user_data.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-medium">Order ID: {order.id}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={() => toggleRow(order.id)}
                                            className="text-blue-600 text-sm border border-blue-600 px-3 py-1 rounded hover:bg-blue-100 cursor-pointer"
                                        >
                                            {isExpanded ? 'Hide Details' : 'Show Details'}
                                        </button>
                                    </div>
                                </div>

                                {/* Expandable Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden mt-4 border-t border-gray-300 pt-4"
                                        >
                                            {/* Order Items */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold mb-2">Order Details:</h4>
                                                <h2 className="font-semibold my-1">Total Items ({order.order_items.length})</h2>
                                                <div className="w-full max-h-40 overflow-auto thin-scrollbar">
                                                    <table className="w-full min-w-[600px] text-xs sm:text-sm text-left border-collapse">
                                                        <tbody className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-xs mt-1 text-gray-700">
                                                            {(() => {
                                                                // Group by name
                                                                const groupedItems = {};
                                                                order.order_items.forEach((item) => {
                                                                    const key = item.item?.name || 'Unnamed';
                                                                    if (!groupedItems[key]) groupedItems[key] = [];
                                                                    groupedItems[key].push(item);
                                                                });

                                                                return Object.entries(groupedItems).map(([productName, items], index) => (
                                                                    <tr key={index}>
                                                                        <td className="py-2 text-gray-800 font-medium">
                                                                            {productName.toUpperCase()}
                                                                            <ul className="list-disc list-inside text-xs mt-1 text-gray-700">
                                                                                {/* {items.map((item, i) => (
                                                                                    <li key={i}>
                                                                                        {item.item?.size ? `${item.item.size} - ` : ""}
                                                                                        {item.item?.weight ? `${item.item.weight} KG` : ""}
                                                                                    </li>
                                                                                ))} */}
                                                                                {items.map((item, subIdx) => {
                                                                                    const basic = item.item?.basic_data || {};
                                                                                    const mm = basic.mm || "";
                                                                                    const size = basic.size || "";
                                                                                    const sizeMM = basic["Size(mm)"] || basic["size (mm)"] ||"";
                                                                                    const ltr = basic.ltr || "";
                                                                                    const nos = item.quantity || "-";
                                                                                    const fittingNos = item.number_of_pic === "0" ? "-" : item.number_of_pic || "-";
                                                                                    const pipeNos = item.number_of_pic || "-";
                                                                                    const qty = item.quantity || "-";
                                                                                    const smallBag = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
                                                                                    const largeBag = item.large_bag_quantity === "0" ? "-" : item.large_bag_quantity || "-";
                                                                                    const category = item.item?.category?.toLowerCase() || "";
                                                                                    const type = category.toLowerCase().includes("pipe") || category.toLowerCase().includes("watr tank") ? "pipes" : "fittings";

                                                                                    let weight = 0;
                                                                                    let weightLabel = "";
                                                                                    if (type === "pipes") {
                                                                                        if (basic.weight) {
                                                                                            weight = Number(basic.weight);
                                                                                        } else {
                                                                                            for (const key in basic) {
                                                                                                if (!excludedKeys.includes(key) && !isNaN(Number(basic[key]))) {
                                                                                                    weight = Number(basic[key]);
                                                                                                    if (key.includes("Kgf / cm")) {
                                                                                                        const match = key.match(/^(\d+(\.\d+)?)/);
                                                                                                        const numberPart = match ? match[1] : "";
                                                                                                        weightLabel = `${numberPart}KG`;
                                                                                                    } else {
                                                                                                        weightLabel = key.toUpperCase();
                                                                                                    }
                                                                                                    break;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    const rawTotal = Math.round(nos * weight);
                                                                                    const totalWeight = isNaN(rawTotal) || rawTotal === 0 ? "-" : rawTotal;

                                                                                    return (
                                                                                        <tr key={subIdx} className="border-t border-gray-200 text-sm">
                                                                                            <td className="p-2 border border-gray-300 text-center font-bold">{subIdx+1}</td>
                                                                                            <td className="p-2 border border-gray-300 text-left w-45">
                                                                                                {/* {mm && mm !== "-" && size ? (
                                                                                                    <div>{mm}MM</div>
                                                                                                ) : sizeMM ? (
                                                                                                    <div>{sizeMM}MM{weightLabel ? ` X ${weightLabel}` : ""}</div>
                                                                                                ) : size ? (
                                                                                                    <div>{size} {!size.toLowerCase().includes("ml") && "Inch"}</div>
                                                                                                ) : ltr ? (
                                                                                                    <div>{ltr} ltr</div>
                                                                                                ) : null} */}
                                                                                                {(() => {
                                                                                                    const category = item.item?.category?.toLowerCase() || "";

                                                                                                    if (type === "fittings") {
                                                                                                        if (category.toLowerCase().includes("upvc") || category.toLowerCase().includes("cpvc")) {
                                                                                                            // Show size for UPVC/CPVC fittings
                                                                                                            return size ? <div>{size} Inch</div> : "-";
                                                                                                        } else if (category.toLowerCase().includes("agriculture") || category.toLowerCase().includes("swr")) {
                                                                                                            // Show mm for AGRICULTURE/SWR fittings
                                                                                                            return mm ? <div>{mm} MM</div> : "-";
                                                                                                        } else {
                                                                                                            return mm ? <div>{mm} MM</div> : "-";
                                                                                                        }
                                                                                                    }

                                                                                                    // Default pipes / tanks logic (same as before)
                                                                                                    if (mm && mm !== "-" && size) {
                                                                                                        return <div>{mm}MM</div>;
                                                                                                    } else if (sizeMM) {
                                                                                                        return <div>{sizeMM}MM{weightLabel ? ` X ${weightLabel}` : ""}</div>;
                                                                                                    } else if (size) {
                                                                                                        return <div>{size} {!size.toLowerCase().includes("ml") && "Inch"}</div>;
                                                                                                    } else if (ltr) {
                                                                                                        return <div>{ltr} ltr</div>;
                                                                                                    }
                                                                                                    return null;
                                                                                                })()}
                                                                                            </td>
                                                                                            {type === "fittings" &&  (
                                                                                                <td className="p-2 border border-gray-300 text-center w-25">
                                                                                                    {fittingNos === "-" ? "-" : `${fittingNos} Nos`}
                                                                                                </td>
                                                                                            )}
                                                                                            {type === "fittings" && (
                                                                                                <td className="p-2 border border-gray-300 text-center w-25">
                                                                                                    {smallBag === "-" ? "-" : `${smallBag} Small Pkt`}
                                                                                                </td>
                                                                                            )}
                                                                                            {type === "fittings" &&  (
                                                                                                <td className="p-2 border border-gray-300 text-center w-25">
                                                                                                    {largeBag === "-" ? "-" : `${largeBag} Large Pkt`}
                                                                                                </td>
                                                                                            )}
                                                                                            {type === "pipes" && (
                                                                                                <td className="p-2 border border-gray-300 text-center w-25">
                                                                                                    {pipeNos === "-" ? "-" : `${pipeNos} Nos`}
                                                                                                </td>
                                                                                            )}
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                ));
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold">Address:</h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-gray-800 font-medium">
                                                        {order.address.company_name}, {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={order.address_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 ml-1"
                                                        >
                                                            <BaseImage 
                                                                src="/location.png" 
                                                                alt="icon" 
                                                                className="w-5"
                                                                title="View Address"
                                                            />
                                                        </a>
                                                        <BaseImage 
                                                            src="/share.png" 
                                                            alt="icon" 
                                                            className="w-5 cursor-pointer"
                                                            title="Share Address"
                                                            onClick={() => handleShare(order.address_link)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex justify-center sm:justify-end items-center mt-4 gap-2">
                                                {order.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            className="bg-green-800 text-white px-4 py-2 rounded-md cursor-pointer"
                                                            onClick={() => onHandleConfirmOrder(order)}
                                                        >
                                                            Confirm Order
                                                        </button>
                                                        <button
                                                            className="bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer"
                                                            onClick={() => onHandleCancelOrder(order.id)}
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    </>
                                                )}
                                                {order.status === "CONFIRM" && (
                                                    <button 
                                                        className="bg-green-800 text-white px-4 py-2 rounded-md cursor-pointer"
                                                        onClick={() => onHandleCompleteOrder(order.id)}
                                                    >
                                                        Complete Order
                                                    </button>
                                                )}
                                                {order.status === "COMPLETED" && (
                                                    <button 
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-md cursor-pointer"
                                                        onClick={() => onHandleViewInvoice(order.id)}
                                                    >
                                                        View Invoice 
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 font-bold rounded-md disabled:opacity-50 cursor-pointer"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            className={`px-4 py-2 rounded font-semibold cursor-pointer ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 font-bold rounded-md disabled:opacity-50 cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default OrdersComponent;