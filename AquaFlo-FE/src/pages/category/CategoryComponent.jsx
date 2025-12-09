import Loader from '../../components/common/Loader';
import { IoIosWarning } from 'react-icons/io';
import CategoryTree from '../../components/category/categoryTree/CategoryTree';
import Input from '../../components/common/formInputs/Input';

function CategoryComponent({ navigate, loading, hasFetch, mainCategories, 
    expandedCategories, setExpandedCategories, onManageBestSeller, onCategoryEdit, 
    onItemEdit, onItemToggleSwitch, onItemDelete, totalPages, 
    currentPage, onPageChange, searchTerm, setSearchTerm, 
    activeTabs, setActiveTabs }) {
    
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Categories</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        wrapperClass="mb-0"
                    />
                    <button
                        onClick={() => navigate("/create-category")}
                        className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Add Category
                    </button>

                    <button
                        onClick={() => navigate("/create-item")}
                        className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Add Item
                    </button>

                    <button
                        onClick={onManageBestSeller}
                        className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Manage Best Seller
                    </button>
                </div>
            </div>
            
            {loading && !hasFetch ? (
                <Loader message="Loading Categories..." />
            ) : (
                <div className="p-4">
                    {!loading && hasFetch && mainCategories.length === 0 ? (
                        <div className="flex justify-center items-center gap-2 text-yellow-500">
                            <IoIosWarning size={30}/>
                            <p className="text-center text-red-500 text-xl font-semibold py-4">No Categories Available!</p>
                            <IoIosWarning size={30}/>   
                        </div>
                    ) : (
                        <>
                            {mainCategories.map((cat) => (
                                <CategoryTree
                                    key={cat.position}
                                    category={cat}
                                    expandedCategories={expandedCategories}
                                    setExpandedCategories ={setExpandedCategories}
                                    onEditCategory={onCategoryEdit}
                                    onEditItem={onItemEdit}
                                    onItemToggleSwitch={onItemToggleSwitch}
                                    onDeleteItem={onItemDelete}
                                    activeTabs={activeTabs}
                                    setActiveTabs={setActiveTabs}
                                    isPricing={false}
                                />
                            ))}

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
            )}
        </div>
    );
};

export default CategoryComponent;
