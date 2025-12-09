import React from "react";
import { IoIosWarning } from "react-icons/io";

function RetrieveUsersTable({ users, onUserRetrieve }) {
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
                                    <button
                                        onClick={() => onUserRetrieve(user.id)}
                                        title="Retrieve User"
                                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer"
                                    >
                                        Retrieve User
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) :(
                        <tr>
                            <td colSpan="7" className="text-center text-gray-500 py-4">
                                <div className="flex justify-center items-center gap-2 text-yellow-500">
                                    <IoIosWarning size={30}/>
                                    <p className="text-center text-red-500 text-xl font-semibold py-4">No Retrieve Users Available!</p>
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

export default RetrieveUsersTable;
