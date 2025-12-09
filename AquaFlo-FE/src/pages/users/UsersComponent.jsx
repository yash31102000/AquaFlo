import React from 'react';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/formInputs/Input';
import UsersTable from '../../components/users/UsersTable';

function UsersComponent({ navigate, loading, users, 
    onUserViewAddresses, onUserViewOrders, onUserEdit, 
    onUserDelete, totalPages, currentPage, 
    onPageChange, searchTerm, onSearchChange, onUserVerify }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Users</h2>

                {/* Search Functionality & Add User Button */}
                <div className="flex items-center gap-4">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <button
                        onClick={() => navigate("/add-user")}
                        className="px-4 py-2 mb-1 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Add User
                    </button>
                    <button
                        onClick={() => navigate("/retrieve-user")}
                        className="px-4 py-2 mb-1 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Retrieve User
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading users..." />
            ) : (
                <>
                    <UsersTable 
                        users={users}
                        onUserViewAddresses={onUserViewAddresses}
                        onUserViewOrders={onUserViewOrders}
                        onUserEdit={onUserEdit}
                        onUserDelete={onUserDelete}
                        onUserVerify={onUserVerify}
                    />

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-300 font-bold rounded-md disabled:opacity-50 cursor-pointer"
                            >
                                Prev
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => onPageChange(index + 1)}
                                    className={`px-4 py-2 rounded font-semibold cursor-pointer ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-300 font-bold rounded-md disabled:opacity-50 cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UsersComponent;
