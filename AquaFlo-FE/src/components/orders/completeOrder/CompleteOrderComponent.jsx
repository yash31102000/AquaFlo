// /* eslint-disable no-unused-vars */
// import React, { useState } from 'react';
// import Input from '../../common/formInputs/Input';
// import Dropdown from '../../common/formDropDown/DropDown';
// import { FaCaretDown, FaCaretUp, FaTrash } from "react-icons/fa";
// import { AnimatePresence, motion } from 'framer-motion';

// function CompleteOrderComponent({ 
//     navigate, itemsData, taxAmount, 
//     setTaxAmount, totalDiscount, setTotalDiscount, 
//     totalDiscountType, setTotalDiscountType, calculateTotal, 
//     handleItemChange, handleDiscountTypeChange, handleOtherChange, 
//     handleSubmit, totalAmount, finalAmount, 
//     order_id, discountTypeOptions, taxOptions,
//     onHandleCancelProduct }) {

//     const [expandedRows, setExpandedRows] = useState([]);
//     return (
//         <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
//             <div className="flex items-center justify-between">
//                 <button 
//                     type="button" 
//                     className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
//                     onClick={() => navigate(-1)}
//                 >
//                     Back
//                 </button>
//             </div>
//             <h2 className="text-2xl font-bold mb-4">Confirm Order({order_id})</h2>

//             <form onSubmit={handleSubmit}>
//                 <table className="w-full mb-1 table-auto border-collapse border-gray-300">
//                     <thead>
//                         <tr className="bg-gray-100 text-center">
//                             <th className="w-[25%] p-2 border border-gray-300">Product Name</th>
//                             <th className="w-[8.57%] p-2 border border-gray-300">Quantity</th>
//                             <th className="w-[8.57%] p-2 border border-gray-300">Price</th>
//                             <th className="w-[14%] p-2 border border-gray-300">Discount</th>
//                             <th className="w-[10%] p-2 border border-gray-300">Tax</th>
//                             <th className="w-[0%] p-2 border border-gray-300">Action</th>
//                             <th className="w-[8.57%] p-2 border border-gray-300">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {itemsData.map((item, index) => {
//                             const isExpanded = expandedRows === index;
//                             const toggleRow = (index) => {
//                                 setExpandedRows(prev => (prev === index ? null : index));
//                             };

//                             return (
//                                 <React.Fragment key={index}>
//                                     <tr>
//                                         {/* Product Name */}
//                                         <td className="w-[25%] p-2 border border-gray-300">
//                                             <div className="flex items-start justify-between">
//                                                 <div>
//                                                     <div className="whitespace-pre-wrap text-[12px]">{item.category}</div>
//                                                     <div className="flex items-center gap-3">
//                                                         {item.image && (
//                                                             <img
//                                                                 src={item.image}
//                                                                 alt={item.name}
//                                                                 className="w-8 h-8 object-cover rounded"
//                                                             />
//                                                         )}
//                                                         {item.name}
//                                                     </div>
//                                                 </div>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => toggleRow(index)}
//                                                     className="text-black text-xl cursor-pointer"
//                                                 >
//                                                     {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
//                                                 </button>
//                                             </div>
//                                             {/* Expanded basic_data row with animation */}
//                                             <AnimatePresence>
//                                                 {isExpanded && item.basic_data && (
//                                                     <div className="mt-2">
//                                                         <tr>
//                                                             <td colSpan="7" className="bg-gray-100">
//                                                                 <motion.div
//                                                                     key="expanded"
//                                                                     initial={{ opacity: 0, height: 0 }}
//                                                                     animate={{ opacity: 1, height: 'auto' }}
//                                                                     exit={{ opacity: 0, height: 0 }}
//                                                                     transition={{ duration: 0.3 }}
//                                                                     className="overflow-hidden"
//                                                                 >
//                                                                     <table className="text-xs text-gray-700 w-full">
//                                                                         <thead>
//                                                                             <tr className="text-center  ">
//                                                                                 {Object.entries(item.basic_data)
//                                                                                     .filter(([key, value]) => key !== 'id' && value)
//                                                                                     .map(([key], idx) => (
//                                                                                         <th key={idx} className="px-2 py-1 capitalize font-medium">
//                                                                                             {key.replace(/_/g, ' ')}
//                                                                                         </th>
//                                                                                     ))}
//                                                                             </tr>
//                                                                         </thead>
//                                                                         <tbody>
//                                                                             <tr className="text-center">
//                                                                                 {Object.entries(item.basic_data)
//                                                                                     .filter(([key, value]) => key !== 'id' && value)
//                                                                                     .map(([_, value], idx) => (
//                                                                                         <td key={idx} className="px-2 py-1">
//                                                                                             {value}
//                                                                                         </td>
//                                                                                     ))}
//                                                                             </tr>
//                                                                         </tbody>
//                                                                     </table>
//                                                                 </motion.div>
//                                                             </td>
//                                                         </tr>
//                                                     </div>
//                                                 )}
//                                             </AnimatePresence>
//                                         </td>

//                                         {/* Product Quantity */}
//                                         <td className="w-[8.57%] p-2 border border-gray-300">
//                                             {item.quantity ? (
//                                                 <div>Packing Qty: {item.quantity}</div>
//                                             ) : null}

//                                             {item.large_bag_quantity ? (
//                                                 <div>Large Bag Qty: {item.large_bag_quantity}</div>
//                                             ) : null}

//                                             {/* {item.packing ? (
//                                                 <div>Qty: {item.packing}</div>
//                                             ) : null} */}
//                                         </td>

//                                         <td className="w-[8.57%] p-2 border border-gray-300">
//                                             <Input 
//                                                 type="text"
//                                                 placeholder="Enter Price"
//                                                 name={`price_${index}`}
//                                                 value={item.price}
//                                                 onChange={(e) => handleItemChange(index, 'price', e.target.value)}
//                                                 className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                             />
//                                         </td>

//                                         {/* Each Prodcut Discount */}
//                                         <td className="w-[14%] p-2 border border-gray-300">
//                                             <div className="flex items-center justify-center gap-2">
//                                                 <div className='w-[60%]'>
//                                                     <Input 
//                                                         type="text"
//                                                         placeholder="Enter Discount"
//                                                         name={`discount_${index}`}
//                                                         value={item.discount}
//                                                         onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
//                                                         className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                                     />
//                                                 </div>
//                                                 <div className="w-[30%] mb-1">
//                                                     <Dropdown 
//                                                         options={discountTypeOptions } 
//                                                         selectedValue={item.discountType}
//                                                         onChange={(selected) => handleDiscountTypeChange(index, selected)}
//                                                     />
//                                                 </div>
//                                             </div>
                                            
//                                         </td>

//                                         {/* Each Prodcut Tax */}
//                                         <td className="w-[10%] p-2 border border-gray-300">
//                                             <div className="flex justify-center">
//                                                 <div className="w-[70%]">
//                                                     <Dropdown 
//                                                         options={taxOptions} 
//                                                         selectedValue={item.tax || "0"}
//                                                         onChange={(selected) => handleItemChange(index, 'tax', selected)}
//                                                         isWidthDropdown = {true} 
//                                                         type="tax"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </td>

//                                         {/* Prodcut Remove Action */}
//                                         <td className="w-[0%] p-2 border border-gray-300 text-red-700">
//                                             <div className="flex items-center justify-center">
//                                                 <FaTrash 
//                                                     onClick={() => onHandleCancelProduct(item.id, item.item_id, item.basic_data.id)}
//                                                     className="cursor-pointer"
//                                                     title="Delete Product"
//                                                 />
//                                             </div>
//                                         </td>

//                                         {/* Each Prodcut Total */}
//                                         <td className="w-[8.57%] p-2 border border-gray-300 text-right">
//                                             ₹{calculateTotal(item.price, item.number_of_pic, item.discount, item.discountType, item.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                                         </td> 
//                                     </tr>

                                    
//                                 </React.Fragment>
//                             );
//                         })}
//                         {/* Total Amount With Calculation */}
//                         <tr>
//                             <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Total Amount:</td>
//                             <td className="w-[14%] h-[63px] p-2 border border-gray-300 font-bold text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                         </tr>

//                         {/* Total Discount On All Product*/}
//                         <tr>
//                             <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Total Discount:</td>
//                             <td className="w-[14%] p-2 border border-gray-300">
//                                 <div className="flex items-center gap-2">
//                                     <div className='w-[72%]'>
//                                         <Input 
//                                             type="text"
//                                             placeholder={"Enter Total Discount"}  
//                                             name="totalDiscount"
//                                             value={totalDiscount}
//                                             onChange={handleOtherChange(setTotalDiscount)}
//                                             className={`w-full p-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]`}
//                                         />
//                                     </div>
//                                     <div className="w-[30%] mb-1">
//                                         <Dropdown 
//                                             options={discountTypeOptions }
//                                             placeholder="Type" 
//                                             selectedValue={totalDiscountType}
//                                             onChange={(selected) => setTotalDiscountType(selected)}
//                                         />
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>

//                         {/* Tax */}
//                         <tr>
//                             <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Tax:</td>
//                             <td className="w-[14%] p-2 border border-gray-300">
//                                 <div className="flex justify-center">
//                                     <div className="w-[100%]">
//                                         <Dropdown 
//                                             options={taxOptions} 
//                                             selectedValue={taxAmount}
//                                             onChange={(selected) => setTaxAmount(selected)}
//                                             isWidthDropdown = {true} 
//                                             type="tax"
//                                         />
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>

//                         {/* Final Amount With Tax Amount & Total Discount */}
//                         <tr>
//                             <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Final Amount:</td>
//                             <td className="w-[14%] h-[63px] p-2 border border-gray-300 font-bold text-right">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//                         </tr>
//                     </tbody>       
//                 </table>

//                 {/* Submit Button */}
//                 <div className="flex items-center justify-center mt-4">
//                     <button type="submit" className="w-25 custom-gradient text-black font-medium p-2 rounded-md cursor-pointer">
//                         Confirm
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default CompleteOrderComponent;

/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Input from "../../common/formInputs/Input";
import Dropdown from "../../common/formDropDown/DropDown";
import { FaTrash } from "react-icons/fa";

function CompleteOrderComponent({
    navigate, itemsData, taxAmount, 
    setTaxAmount, totalDiscount, setTotalDiscount, 
    totalDiscountType, setTotalDiscountType, calculateTotal, 
    handleItemChange, handleDiscountTypeChange, handleOtherChange, 
    handleSubmit, totalAmount, finalAmount, 
    order_id, discountTypeOptions, taxOptions,
    onHandleCancelProduct }) {

    const [expandedCategories, setExpandedCategories] = useState([]);

    // Group products by category
    const groupedItems = itemsData.reduce((acc, item, idx) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({ ...item, globalIndex: idx });
        return acc;
    }, {});

    const toggleCategory = (category) => {
        setExpandedCategories((prev) =>
        prev.includes(category)
            ? prev.filter((c) => c !== category)
            : [...prev, category]
        );
    };

    let srNo = 1;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
            <h2 className="text-2xl font-bold mb-4">Confirm Order({order_id})</h2>

            <form onSubmit={handleSubmit}>
                <table className="w-full mb-1 table-auto border-collapse border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-center">
                            {/* <th className="w-[5%] p-2 border border-gray-300">Sr.</th> */}
                            <th className="w-[25%] p-2 border border-gray-300">Description of Goods</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Quantity</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Price</th>
                            <th className="w-[14%] p-2 border border-gray-300">Discount</th>
                            <th className="w-[10%] p-2 border border-gray-300">Tax</th>
                            <th className="w-[0%] p-2 border border-gray-300">Action</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedItems).map(([category, products], catIdx) => {
                            const isExpanded = expandedCategories.includes(category);
                            return (
                                <React.Fragment key={catIdx}>
                                    {products.length > 0 && (
                                        <tr className="bg-gray-50">
                                            <td colSpan="7" className="p-2 border border-gray-300 font-bold text-gray-700 text-left">
                                                {products[0].name}
                                            </td>
                                        </tr>
                                    )}

                                    {products.map((item, index) => {
                                        const description = Object.entries(item.basic_data || {})
                                            .filter(([key, value]) => key !== "id" && value)
                                            .map(([key, value]) => value)
                                            .join(" X ");

                                        return (
                                            <tr key={item.globalIndex} className="text-center">
                                                {/* <td className="border border-gray-300 p-2">{srNo++}</td> */}
                                                <td className="w-[25%] border border-gray-300 p-2 text-left">
                                                    <table className="w-full table-auto border border-gray-300 text-xs text-gray-700">
                                                        <thead>
                                                            <tr className="text-center bg-gray-200">
                                                                {Object.entries(item.basic_data)
                                                                    .filter(([key, value]) => key !== 'id' && value)
                                                                    .map(([key], idx) => (
                                                                        <th key={idx} className="px-2 py-1 capitalize font-medium">
                                                                            {key.replace(/_/g, ' ')}
                                                                        </th>
                                                                    ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="text-center bg-gray-50">
                                                                {Object.entries(item.basic_data)
                                                                    .filter(([key, value]) => key !== 'id' && value)
                                                                    .map(([_, value], idx) => (
                                                                        <td key={idx} className="px-2 py-1">
                                                                            {value}
                                                                        </td>
                                                                    ))}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td className="w-[8.57%] p-2 border border-gray-300">
                                                    {item.number_of_pic && Number(item.number_of_pic) !== 0 ? (
                                                        <div>Nos: {item.number_of_pic}</div>
                                                    ) : null}

                                                    {item.quantity && Number(item.quantity) !== 0 ? (
                                                        <div>Small Packets Qty: {item.quantity}</div>
                                                    ) : null}

                                                    {item.large_bag_quantity && Number(item.large_bag_quantity) !== 0 ? (
                                                        <div>Large Packets Qty: {item.large_bag_quantity}</div>
                                                    ) : null}
                                                </td>
                                                <td className="w-[8.57%] border border-gray-300 p-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter Price"
                                                        name={`price_${item.globalIndex}`}
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(item.globalIndex, "price", e.target.value)}
                                                        className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                    />
                                                </td>
                                                <td className="w-[14%] border border-gray-300 p-2">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-[60%]">
                                                            <Input
                                                                type="text"
                                                                placeholder="Enter Discount"
                                                                name={`discount_${item.globalIndex}`}
                                                                value={item.discount}
                                                                onChange={(e) => handleItemChange(item.globalIndex, "discount", e.target.value)}
                                                                className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                            />
                                                        </div>
                                                        <div className="w-[30%] mb-1">
                                                            <Dropdown
                                                                options={discountTypeOptions}
                                                                selectedValue={item.discountType}
                                                                onChange={(selected) => handleDiscountTypeChange(item.globalIndex, selected)}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 p-2">
                                                    <Dropdown
                                                        options={taxOptions}
                                                        selectedValue={item.tax || "0"}
                                                        onChange={(selected) => handleItemChange(item.globalIndex, "tax", selected)}
                                                        isWidthDropdown={true}
                                                        type="tax"
                                                    />
                                                </td>
                                                <td className="w-[0%] border border-gray-300 p-2 text-red-700">
                                                    <div className="flex items-center justify-center">
                                                        <FaTrash 
                                                            onClick={() => onHandleCancelProduct(item.id, item.item_id, item.basic_data.id)}
                                                            className="cursor-pointer"
                                                            title="Delete Product"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 p-2 text-right font-semibold">
                                                    ₹{calculateTotal(item.price, item.number_of_pic, item.discount, item.discountType, item.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}    
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                        {/* Total Amount With Calculation */}
                        <tr>
                            <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Total Amount:</td>
                            <td className="w-[14%] h-[63px] p-2 border border-gray-300 font-bold text-right">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>

                        {/* Total Discount On All Product*/}
                        <tr>
                            <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Total Discount:</td>
                            <td className="w-[14%] p-2 border border-gray-300">
                                <div className="flex items-center gap-2">
                                    <div className='w-[72%]'>
                                        <Input 
                                            type="text"
                                            placeholder={"Enter Total Discount"}  
                                            name="totalDiscount"
                                            value={totalDiscount}
                                            onChange={handleOtherChange(setTotalDiscount)}
                                            className={`w-full p-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]`}
                                        />
                                    </div>
                                    <div className="w-[30%] mb-1">
                                        <Dropdown 
                                            options={discountTypeOptions }
                                            placeholder="Type" 
                                            selectedValue={totalDiscountType}
                                            onChange={(selected) => setTotalDiscountType(selected)}
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>

                        {/* Tax */}
                        <tr>
                            <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Tax:</td>
                            <td className="w-[14%] p-2 border border-gray-300">
                                <div className="flex justify-center">
                                    <div className="w-[100%]">
                                        <Dropdown 
                                            options={taxOptions} 
                                            selectedValue={taxAmount}
                                            onChange={(selected) => setTaxAmount(selected)}
                                            isWidthDropdown = {true} 
                                            type="tax"
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>

                        {/* Final Amount With Tax Amount & Total Discount */}
                        <tr>
                            <td colSpan="6" className="w-[14%] p-2 border border-gray-300 text-right font-bold">Final Amount:</td>
                            <td className="w-[14%] h-[63px] p-2 border border-gray-300 font-bold text-right">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Submit */}
                <div className="flex items-center justify-center mt-4">
                    <button type="submit" className="w-25 custom-gradient text-black font-medium p-2 rounded-md cursor-pointer">
                        Confirm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompleteOrderComponent;
