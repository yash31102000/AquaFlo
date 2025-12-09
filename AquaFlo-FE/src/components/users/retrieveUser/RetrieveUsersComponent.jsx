import React from 'react';
import Loader from '../../common/Loader';
import Input from '../../common/formInputs/Input';
import RetrieveUsersTable from '../RetrieveUsersTable';

function RetrieveUsersComponent({ navigate, loading, users, totalPages, currentPage, onPageChange, searchTerm, onSearchChange, onUserRetrieve }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
            >
                Back
            </button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Retrieve Users</h2>

                {/* Search Functionality & Add User Button */}
                <div className="flex items-center gap-4">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <Loader message="Loading users..." />
            ) : (
                <>
                    <RetrieveUsersTable 
                        users={users}
                        onUserRetrieve={onUserRetrieve}
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

export default RetrieveUsersComponent;
