import React from 'react';
import Loader from '../../components/common/Loader';
import BannersTable from '../../components/banners/BannersTable';

function BannersComponent({ navigate, loading, banners, 
    categories, onToggleSwitch, onBannersEdit, 
    onBannersDelete, totalPages, currentPage, 
    onPageChange }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Banners</h2>
                <button
                    onClick={() => navigate("/add-banner")}
                    className="px-4 py-2 mb-1 custom-gradient text-black font-medium rounded-md cursor-pointer"
                >
                    Add Banners
                </button>
            </div>

            {loading ? (
                <Loader message="Loading banners..." />
            ) : (
                <>
                    <BannersTable 
                        banners={banners}
                        categories={categories}
                        onToggleSwitch={onToggleSwitch}
                        onBannersEdit={onBannersEdit}
                        onBannersDelete={onBannersDelete}
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

export default BannersComponent;
