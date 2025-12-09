import React from "react";
import { FaTrash } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import BaseImage from "../common/BaseImage";

function UsersTable({ users, onUserViewAddresses, onUserViewOrders, onUserEdit, onUserDelete, onUserVerify }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">First Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Last Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <tr 
                                key={user.id} 
                                className={`hover:bg-gray-50 ${!user.role_flag ? "bg-yellow-200 hover:bg-yellow-200 font-semibold" : ""}`}
                            >

                                {/* Users details */}
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{user.first_name || "N/A"}</td>
                                <td className="border border-gray-300 px-4 py-2">{user.last_name || "N/A"}</td>
                                <td className="border border-gray-300 px-4 py-2">{user.phone_number || "N/A"}</td>
                                <td className={`border border-gray-300 px-4 py-2`}>{user.email || "-"}</td>
                                
                                {/* Main Action */}
                                <td className="border border-gray-300 px-4 py-2 text-center min-w-[160px]">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <BaseImage 
                                            src="/location.png" 
                                            alt="icon" 
                                            className="w-5 cursor-pointer"
                                            title="View Address"
                                            onClick={() => onUserViewAddresses(user)} 
                                        />

                                        <BaseImage 
                                            src="/invoice.png" 
                                            alt="icon" 
                                            className="w-5 cursor-pointer"
                                            title="View Orders"
                                            onClick={() => onUserViewOrders(user)}
                                        />

                                        <BaseImage 
                                            src="/edit.png" 
                                            alt="icon" 
                                            className="w-5 cursor-pointer"
                                            title="Edit User"
                                            onClick={() => onUserEdit(user)}
                                        />

                                        <button 
                                            onClick={() => onUserDelete(user.id)} 
                                            title="Delete User"
                                            className="text-[#d33] hover:text-red-700 cursor-pointer"
                                        >
                                            <FaTrash size={18} />
                                        </button>

                                        {!user.role_flag && (
                                            <button
                                                onClick={() => onUserVerify(user.id)}
                                                title="Verify User"
                                                className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) :(
                        <tr>
                            <td colSpan="7" className="text-center text-gray-500 py-4">
                                <div className="flex justify-center items-center gap-2 text-yellow-500">
                                    <IoIosWarning size={30}/>
                                    <p className="text-center text-red-500 text-xl font-semibold py-4">No Users Available!</p>
                                    <IoIosWarning size={30}/>   
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UsersTable;
