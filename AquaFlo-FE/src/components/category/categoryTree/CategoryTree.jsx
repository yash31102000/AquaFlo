/* eslint-disable no-unused-vars */
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { IoDuplicateSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import { Switch } from "@headlessui/react";
import Input from "../../common/formInputs/Input";
import BaseImage from "../../common/BaseImage";

function CategoryTree ({ category, expandedCategories, setExpandedCategories,
    onEditCategory, onEditItem, onItemToggleSwitch, 
    onDeleteItem, activeTabs, setActiveTabs , 
    level = 0, isPricing = false, priceChanges, 
    handleGroupedPricingChange, handleFlatPricingChange, handleSave }) {
    
    const isExpanded = expandedCategories[level] === category.id; // Check if the current category is expanded

    const toggleExpand = () => {
        setExpandedCategories(prev => ({
            ...prev,
            [level]: prev[level] === category.id ? null : category.id // Ensure only one is open per level
        }));
    };

    return (
        <div className={`border border-gray-300 rounded-md overflow-hidden ${level === 0 ? "mb-4" : "mb-2"} ml-${level * 4}`}>
            {/* Category/Subcategory Header */}
            <div
                className={`flex justify-between items-center cursor-pointer p-3 ${level === 0 ? "bg-gray-100" : "bg-gray-50"}`}
                onClick={toggleExpand}
            >
                <h3 className={`${level === 0 ? "text-lg font-bold" : "text-sm sm:text-base font-semibold"}`}>{category.name}</h3>
                <div className="flex items-center gap-3">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    {!isPricing && (
                        <>
                            <BaseImage 
                                src="/edit.png" 
                                alt="icon" 
                                className="w-5"
                                title="Edit Category"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCategory(category)
                                }}
                            />
                            <FaTrash
                                className="text-[#d33] hover:text-red-700 cursor-pointer"
                                title="Delete Category"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteItem(category.id)
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Subcategories and Products */}
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="p-4 border-t border-gray-300 bg-white">
                    {/* Render Nested Subcategories */}
                    {category.sub_categories && category.sub_categories.length > 0 ? (
                        category.sub_categories.map((subcat) => (
                            <CategoryTree
                                key={subcat.position}
                                category={subcat}
                                expandedCategories={expandedCategories}
                                setExpandedCategories={setExpandedCategories}
                                onEditCategory={onEditCategory}
                                onEditItem={onEditItem}
                                onItemToggleSwitch={onItemToggleSwitch}
                                onDeleteItem={onDeleteItem}
                                level={level + 1}
                                activeTabs={activeTabs}
                                setActiveTabs={setActiveTabs}
                                isPricing={isPricing}
                                priceChanges={priceChanges}
                                handleGroupedPricingChange ={handleGroupedPricingChange}
                                handleFlatPricingChange={handleFlatPricingChange}
                                handleSave={handleSave}
                            />
                        ))
                    ) : null}

                    {/* Render Products If Available */}
                    {category.product && category.product.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-4 overflow-y-auto max-h-screen">
                            {category.product.map((product) => (
                                <div key={product.id} className="mb-6 border border-gray-300 rounded-lg overflow-hidden h-fit">
                                    {/* Product Header */}
                                    <div className="flex items-center justify-between p-3 rounded-t-lg">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                            <h4 className="font-semibold text-lg text-gray-800">{product.name}</h4>
                                        </div>

                                        {isPricing ? (
                                            <button
                                                className="bg-[#13609b] text-white font-medium text-sm px-4 py-1 rounded hover:bg-[#084574] transition cursor-pointer"
                                                onClick={handleSave}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={product.marked_as_favorite}
                                                    onChange={() => onItemToggleSwitch(product)}
                                                    title="Mark as favourite"
                                                    className={`${
                                                        product.marked_as_favorite ? 'bg-green-500' : 'bg-gray-200'
                                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer`}
                                                >
                                                    <span
                                                        className={`${
                                                        product.marked_as_favorite ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform cursor-pointer`}
                                                    />
                                                </Switch>
                                                <BaseImage 
                                                    src="/edit.png" 
                                                    alt="edit"
                                                    className="w-5 cursor-pointer"
                                                    title="Edit Product"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditItem(product)
                                                    }}
                                                />
                                                {/* <IoDuplicateSharp 
                                                    className="text-green-700 hover:text-green-800 cursor-pointer"
                                                    title="Duplicate Product"
                                                    size={20}
                                                /> */}
                                                <FaTrash 
                                                    className="text-[#d33] hover:text-red-700 cursor-pointer"
                                                    title="Delete Product"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteItem(product.id)
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Basic Data Table */}
                                    {Array.isArray(product.basic_data) && product.basic_data.length > 0 ? (
                                        Array.isArray(product.basic_data[0]?.data) ? (
                                            // NEW FORMAT: [{name: '6_Kg', data: [..]}, {...}]
                                            <div>
                                                <div className="flex justify-center flex-wrap gap-3 my-4">
                                                    {product.basic_data.map((entry, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                setActiveTabs((prev) => ({
                                                                    ...prev,
                                                                    [product.id]: prev?.[product.id] === entry.name ? null : entry.name,
                                                                }))
                                                            }
                                                            className={`px-4 py-2 font-semibold cursor-pointer rounded border border-gray-500 ${
                                                                activeTabs?.[product.id] === entry.name
                                                                    ? 'bg-gray-500 text-white'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                        >
                                                            {entry.name.replace(/_/g, ' ')}
                                                        </button>
                                                    ))}
                                                </div>

                                                {product.basic_data.map((entry, index) => (
                                                    activeTabs?.[product.id] === entry.name && (
                                                        <div key={index} className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
                                                                <thead className="bg-gray-200 text-gray-700">
                                                                    <tr>
                                                                        {Object.keys(entry.data[0])
                                                                            .filter(
                                                                                (key) =>
                                                                                    isPricing 
                                                                                        ? ['code', 'size', 'Size(mm)', 'size (mm)'].includes(key) 
                                                                                        : key !== 'id' && key !== 'discount_percent' && key !== 'discount_type'
                                                                            )
                                                                            .map((key, i, arr) => (
                                                                                <th
                                                                                    key={key}
                                                                                    className={`px-4 py-2 font-semibold capitalize ${
                                                                                        i !== arr.length - 1 || isPricing ? 'border-r border-gray-300' : ''
                                                                                    }`}
                                                                                >
                                                                                    {key.replace(/_/g, ' ')}
                                                                                </th>
                                                                            ))}
                                                                            {isPricing && (
                                                                                <th className="px-4 py-2 font-semibold capitalize">Pricing</th>
                                                                            )}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {entry.data.map((item, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50">
                                                                            {Object.keys(item)
                                                                                .filter(
                                                                                    (key) =>
                                                                                        isPricing 
                                                                                            ? ['code', 'size', 'Size(mm)', 'size (mm)'].includes(key)
                                                                                            : key !== 'id' && key !== 'discount_percent' && key !== 'discount_type'
                                                                                )
                                                                                .map((key, i, arr) => {
                                                                                    return (
                                                                                        item[key] && item[key] !== 'null' && item[key] !== '-' && (
                                                                                            <td
                                                                                                key={key}
                                                                                                className={`px-4 py-2 ${
                                                                                                    i !== arr.length - 1 || isPricing ? 'border-r border-gray-200' : ''
                                                                                                }`}
                                                                                            >
                                                                                                {item[key]}
                                                                                            </td>
                                                                                        )
                                                                                    )
                                                                                })}
                                                                                {isPricing && (
                                                                                    <td className="px-4 py-2">
                                                                                        <Input
                                                                                            type="text"
                                                                                            inputMode="numeric"
                                                                                            pattern="[0-9]*"
                                                                                            placeholder="Enter price"
                                                                                            value={priceChanges?.[product.id]?.[entry.name]?.[item.id] ?? ''}
                                                                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                                            onChange={(e) => {
                                                                                                const cleaned = e.target.value.replace(/\D/g, '');
                                                                                                handleGroupedPricingChange(product.id, entry.name, item.id, cleaned);
                                                                                            }}
                                                                                            onPaste={(e) => {
                                                                                                const paste = e.clipboardData.getData('text');
                                                                                                if (!/^\d+$/.test(paste)) {
                                                                                                    e.preventDefault();
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        ) : (
                                            // OLD FORMAT: [ {MM: 'value', Size: 'value'} ]
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 bg-white text-sm text-left">
                                                    <thead className="bg-gray-200 text-gray-700">
                                                        <tr>
                                                            {Object.keys(product.basic_data[0])
                                                                .filter(
                                                                    (key) =>
                                                                        isPricing
                                                                            ? ['code', 'size'].includes(key)
                                                                            : key !== 'id' && key !== 'discount_percent' && key !== 'discount_type'
                                                                )
                                                                .map((key, i, arr) => (
                                                                    <th
                                                                        key={key}
                                                                        className={`px-4 py-2 font-semibold capitalize ${
                                                                            i !== arr.length - 1 || isPricing  ? 'border-r border-gray-300' : ''
                                                                        }`}
                                                                    >
                                                                        {key.replace(/_/g, ' ')}
                                                                    </th>
                                                                ))}
                                                                {isPricing && (
                                                                    <th className="px-4 py-2 font-semibold capitalize">Pricing</th>
                                                                )}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {product.basic_data.map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                {Object.keys(item)
                                                                    .filter(
                                                                        (key) =>
                                                                            isPricing
                                                                                ? ['code', 'size'].includes(key)
                                                                                : key !== 'id' && key !== 'discount_percent' && key !== 'discount_type'
                                                                    )
                                                                    .map((key, i, arr) => {
                                                                        return (
                                                                            item[key] && item[key] !== 'null' && item[key] !== '-' && item[key].toString().trim() !== '' && (
                                                                                <td
                                                                                    key={key}
                                                                                    className={`px-4 py-2 ${
                                                                                    i !== arr.length - 1 || isPricing ? 'border-r border-gray-200' : ''
                                                                                    }`}
                                                                                >
                                                                                    {item[key]}
                                                                                </td>
                                                                            )
                                                                        )
                                                                    })}
                                                                    {isPricing && (
                                                                        <td className="px-4 py-2">
                                                                            <Input
                                                                                type="text"
                                                                                inputMode="numeric"
                                                                                pattern="[0-9]*"
                                                                                placeholder="Enter price"
                                                                                value={priceChanges?.[product.id]?.[item.id] ?? ''}
                                                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                                onChange={(e) => {
                                                                                    const cleaned = e.target.value.replace(/\D/g, '');
                                                                                    handleFlatPricingChange(product.id, item.id, cleaned);
                                                                                }}
                                                                                onPaste={(e) => {
                                                                                    const paste = e.clipboardData.getData('text');
                                                                                    if (!/^\d+$/.test(paste)) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </td>
                                                                    )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    ) : (
                                        <div className="bg-gray-100 p-4 text-center text-black font-medium">No data available</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}
                    
                    {/* No Items Message (for nested categories) */}
                    {level !== 0 && category.sub_categories.length === 0 && category.product.length === 0 && (
                        <div className="flex justify-center items-center gap-2 text-yellow-500 mt-4">
                            <IoIosWarning size={30} />
                            <p className="text-center text-red-500 text-xl font-semibold py-4">No Items Available!</p>
                            <IoIosWarning size={30} />
                        </div>
                    )}

                    {/* Show message when no subcategories and no products */}
                    {category.sub_categories.length === 0 && category.product.length === 0 && level == 0 && (
                        <div className="flex justify-center items-center gap-2 text-yellow-500">
                            <IoIosWarning size={30} />
                            <p className="text-center text-red-500 text-lg font-semibold py-4">
                                No Items Available!
                            </p>
                            <IoIosWarning size={30} />
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CategoryTree;