// /* eslint-disable no-unused-vars */
// import React, { useState } from "react";
// import Input from "../../common/formInputs/Input";
// import Dropdown from "../../common/formDropDown/DropDown";
// import { FaCaretDown, FaCaretUp, FaTrash } from "react-icons/fa";
// import { AnimatePresence, motion } from "framer-motion";

// function CompleteOrderComponent({
//   navigate,
//   itemsData,
//   taxAmount,
//   setTaxAmount,
//   totalDiscount,
//   setTotalDiscount,
//   totalDiscountType,
//   setTotalDiscountType,
//   calculateTotal,
//   handleItemChange,
//   handleDiscountTypeChange,
//   handleOtherChange,
//   handleSubmit,
//   totalAmount,
//   finalAmount,
//   order_id,
//   discountTypeOptions,
//   taxOptions,
//   onHandleCancelProduct,
// }) {
//   const [expandedCategories, setExpandedCategories] = useState([]);

//   // Group products by category
//   const groupedItems = itemsData.reduce((acc, item) => {
//     if (!acc[item.category]) acc[item.category] = [];
//     acc[item.category].push(item);
//     return acc;
//   }, {});

//   const toggleCategory = (category) => {
//     setExpandedCategories((prev) =>
//       prev.includes(category)
//         ? prev.filter((c) => c !== category)
//         : [...prev, category]
//     );
//   };

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
//       <div className="flex items-center justify-between">
//         <button
//           type="button"
//           className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
//           onClick={() => navigate(-1)}
//         >
//           Back
//         </button>
//       </div>
//       <h2 className="text-2xl font-bold mb-6">
//         Confirm Order ({order_id})
//       </h2>

//       <form onSubmit={handleSubmit}>
//         {Object.entries(groupedItems).map(([category, products], catIdx) => {
//           const isExpanded = expandedCategories.includes(category);
//           return (
//             <div
//               key={catIdx}
//               className="border rounded-lg mb-6 overflow-hidden shadow-sm"
//             >
//               {/* Category Header */}
//               <div
//                 className="flex justify-between items-center bg-gray-200 px-4 py-3 cursor-pointer"
//                 onClick={() => toggleCategory(category)}
//               >
//                 <h3 className="font-semibold text-lg">{category}</h3>
//                 <span className="text-xl">
//                   {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
//                 </span>
//               </div>

//               {/* Products under category */}
//               <AnimatePresence>
//                 {isExpanded && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="overflow-hidden"
//                   >
//                     <table className="w-full border-collapse">
//                       <thead>
//                         <tr className="bg-gray-100 text-center">
//                           <th className="w-[20%] p-2 border">Product</th>
//                           <th className="w-[10%] p-2 border">Quantity</th>
//                           <th className="w-[10%] p-2 border">Price</th>
//                           <th className="w-[14%] p-2 border">Discount</th>
//                           <th className="w-[10%] p-2 border">Tax</th>
//                           <th className="w-[8%] p-2 border">Action</th>
//                           <th className="w-[12%] p-2 border">Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {products.map((item, index) => (
//                           <React.Fragment key={index}>
//                             <tr>
//                               {/* Product Info */}
//                               <td className="p-2 border text-sm">
//                                 <div className="flex items-center gap-3">
//                                   {item.image && (
//                                     <img
//                                       src={item.image}
//                                       alt={item.name}
//                                       className="w-8 h-8 object-cover rounded"
//                                     />
//                                   )}
//                                   <span className="font-medium">
//                                     {item.name}
//                                   </span>
//                                 </div>

//                                 {/* Basic Data */}
//                                 {item.basic_data && (
//                                   <div className="mt-2">
//                                     <table className="text-xs w-full border">
//                                       <thead>
//                                         <tr className="bg-gray-50 text-center">
//                                           {Object.entries(item.basic_data)
//                                             .filter(
//                                               ([key, value]) =>
//                                                 key !== "id" && value
//                                             )
//                                             .map(([key], idx) => (
//                                               <th
//                                                 key={idx}
//                                                 className="px-2 py-1 border capitalize"
//                                               >
//                                                 {key.replace(/_/g, " ")}
//                                               </th>
//                                             ))}
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         <tr className="text-center">
//                                           {Object.entries(item.basic_data)
//                                             .filter(
//                                               ([key, value]) =>
//                                                 key !== "id" && value
//                                             )
//                                             .map(([_, value], idx) => (
//                                               <td
//                                                 key={idx}
//                                                 className="px-2 py-1 border"
//                                               >
//                                                 {value}
//                                               </td>
//                                             ))}
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 )}
//                               </td>

//                               {/* Quantity */}
//                               <td className="p-2 border text-sm text-center">
//                                 {item.quantity && (
//                                   <div>Packing: {item.quantity}</div>
//                                 )}
//                                 {item.large_bag_quantity && (
//                                   <div>Large Bag: {item.large_bag_quantity}</div>
//                                 )}
//                               </td>

//                               {/* Price */}
//                               <td className="p-2 border">
//                                 <Input
//                                   type="text"
//                                   placeholder="Price"
//                                   name={`price_${index}`}
//                                   value={item.price}
//                                   onChange={(e) =>
//                                     handleItemChange(
//                                       index,
//                                       "price",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-full p-2 text-right border rounded-md"
//                                 />
//                               </td>

//                               {/* Discount */}
//                               <td className="p-2 border">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-[60%]">
//                                     <Input
//                                       type="text"
//                                       placeholder="Discount"
//                                       name={`discount_${index}`}
//                                       value={item.discount}
//                                       onChange={(e) =>
//                                         handleItemChange(
//                                           index,
//                                           "discount",
//                                           e.target.value
//                                         )
//                                       }
//                                       className="w-full p-2 text-right border rounded-md"
//                                     />
//                                   </div>
//                                   <div className="w-[40%]">
//                                     <Dropdown
//                                       options={discountTypeOptions}
//                                       selectedValue={item.discountType}
//                                       onChange={(selected) =>
//                                         handleDiscountTypeChange(index, selected)
//                                       }
//                                     />
//                                   </div>
//                                 </div>
//                               </td>

//                               {/* Tax */}
//                               <td className="p-2 border">
//                                 <Dropdown
//                                   options={taxOptions}
//                                   selectedValue={item.tax || "0"}
//                                   onChange={(selected) =>
//                                     handleItemChange(index, "tax", selected)
//                                   }
//                                   isWidthDropdown={true}
//                                   type="tax"
//                                 />
//                               </td>

//                               {/* Delete */}
//                               <td className="p-2 border text-center text-red-600">
//                                 <FaTrash
//                                   onClick={() =>
//                                     onHandleCancelProduct(
//                                       item.id,
//                                       item.item_id,
//                                       item.basic_data?.id
//                                     )
//                                   }
//                                   className="cursor-pointer"
//                                 />
//                               </td>

//                               {/* Total */}
//                               <td className="p-2 border text-right font-semibold">
//                                 ₹
//                                 {calculateTotal(
//                                   item.price,
//                                   item.number_of_pic,
//                                   item.discount,
//                                   item.discountType,
//                                   item.tax
//                                 ).toLocaleString("en-IN", {
//                                   minimumFractionDigits: 2,
//                                 })}
//                               </td>
//                             </tr>
//                           </React.Fragment>
//                         ))}
//                       </tbody>
//                     </table>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           );
//         })}

//         {/* Overall Totals */}
//         <div className="border-t pt-4 mt-6">
//           <table className="w-full border-collapse">
//             <tbody>
//               <tr>
//                 <td className="text-right font-bold p-2">Total Amount:</td>
//                 <td className="text-right p-2 font-bold">
//                   ₹
//                   {totalAmount.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                   })}
//                 </td>
//               </tr>
//               <tr>
//                 <td className="text-right font-bold p-2">Total Discount:</td>
//                 <td className="p-2">
//                   <div className="flex items-center gap-2">
//                     <div className="w-[70%]">
//                       <Input
//                         type="text"
//                         placeholder="Total Discount"
//                         name="totalDiscount"
//                         value={totalDiscount}
//                         onChange={handleOtherChange(setTotalDiscount)}
//                         className="w-full p-2 text-right border rounded-md"
//                       />
//                     </div>
//                     <div className="w-[30%]">
//                       <Dropdown
//                         options={discountTypeOptions}
//                         selectedValue={totalDiscountType}
//                         onChange={(selected) => setTotalDiscountType(selected)}
//                       />
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//               <tr>
//                 <td className="text-right font-bold p-2">Tax:</td>
//                 <td className="p-2">
//                   <Dropdown
//                     options={taxOptions}
//                     selectedValue={taxAmount}
//                     onChange={(selected) => setTaxAmount(selected)}
//                     isWidthDropdown={true}
//                     type="tax"
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td className="text-right font-bold p-2">Final Amount:</td>
//                 <td className="text-right font-bold p-2 text-xl">
//                   ₹
//                   {finalAmount.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                   })}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Submit */}
//         <div className="flex items-center justify-center mt-6">
//           <button
//             type="submit"
//             className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold rounded-md shadow-md"
//           >
//             Confirm Order
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default CompleteOrderComponent;


/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Input from '../../common/formInputs/Input';
import Dropdown from '../../common/formDropDown/DropDown';
import { FaCaretDown, FaCaretUp, FaTrash } from "react-icons/fa";
import { AnimatePresence, motion } from 'framer-motion';

function CompleteOrderComponent({ 
    navigate, itemsData, taxAmount, 
    setTaxAmount, totalDiscount, setTotalDiscount, 
    totalDiscountType, setTotalDiscountType, calculateTotal, 
    handleItemChange, handleDiscountTypeChange, handleOtherChange, 
    handleSubmit, totalAmount, finalAmount, 
    order_id, discountTypeOptions, taxOptions,
    onHandleCancelProduct }) {

    const [expandedRows, setExpandedRows] = useState([]);
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
                            <th className="w-[25%] p-2 border border-gray-300">Product Name</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Quantity</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Price</th>
                            <th className="w-[14%] p-2 border border-gray-300">Discount</th>
                            <th className="w-[10%] p-2 border border-gray-300">Tax</th>
                            <th className="w-[0%] p-2 border border-gray-300">Action</th>
                            <th className="w-[8.57%] p-2 border border-gray-300">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsData.map((item, index) => {
                            const isExpanded = expandedRows === index;
                            const toggleRow = (index) => {
                                setExpandedRows(prev => (prev === index ? null : index));
                            };

                            return (
                                <React.Fragment key={index}>
                                    <tr>
                                        {/* Product Name */}
                                        <td className="w-[25%] p-2 border border-gray-300">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="whitespace-pre-wrap text-[12px]">{item.category}</div>
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                        )}
                                                        {item.name}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRow(index)}
                                                    className="text-black text-xl cursor-pointer"
                                                >
                                                    {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
                                                </button>
                                            </div>
                                            {/* Expanded basic_data row with animation */}
                                            <AnimatePresence>
                                                {isExpanded && item.basic_data && (
                                                    <div className="mt-2">
                                                        <tr>
                                                            <td colSpan="7" className="bg-gray-100">
                                                                <motion.div
                                                                    key="expanded"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <table className="text-xs text-gray-700 w-full">
                                                                        <thead>
                                                                            <tr className="text-center  ">
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
                                                                            <tr className="text-center">
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
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </td>

                                        {/* Product Quantity */}
                                        <td className="w-[8.57%] p-2 border border-gray-300">
                                            {item.quantity ? (
                                                <div>Packing Qty: {item.quantity}</div>
                                            ) : null}

                                            {item.large_bag_quantity ? (
                                                <div>Large Bag Qty: {item.large_bag_quantity}</div>
                                            ) : null}

                                            {/* {item.packing ? (
                                                <div>Qty: {item.packing}</div>
                                            ) : null} */}
                                        </td>

                                        <td className="w-[8.57%] p-2 border border-gray-300">
                                            <Input 
                                                type="text"
                                                placeholder="Enter Price"
                                                name={`price_${index}`}
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                            />
                                        </td>

                                        {/* Each Prodcut Discount */}
                                        <td className="w-[14%] p-2 border border-gray-300">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className='w-[60%]'>
                                                    <Input 
                                                        type="text"
                                                        placeholder="Enter Discount"
                                                        name={`discount_${index}`}
                                                        value={item.discount}
                                                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                                        className="w-full p-2 text-right bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                    />
                                                </div>
                                                <div className="w-[30%] mb-1">
                                                    <Dropdown 
                                                        options={discountTypeOptions } 
                                                        selectedValue={item.discountType}
                                                        onChange={(selected) => handleDiscountTypeChange(index, selected)}
                                                    />
                                                </div>
                                            </div>
                                            
                                        </td>

                                        {/* Each Prodcut Tax */}
                                        <td className="w-[10%] p-2 border border-gray-300">
                                            <div className="flex justify-center">
                                                <div className="w-[70%]">
                                                    <Dropdown 
                                                        options={taxOptions} 
                                                        selectedValue={item.tax || "0"}
                                                        onChange={(selected) => handleItemChange(index, 'tax', selected)}
                                                        isWidthDropdown = {true} 
                                                        type="tax"
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Prodcut Remove Action */}
                                        <td className="w-[0%] p-2 border border-gray-300 text-red-700">
                                            <div className="flex items-center justify-center">
                                                <FaTrash 
                                                    onClick={() => onHandleCancelProduct(item.id, item.item_id, item.basic_data.id)}
                                                    className="cursor-pointer"
                                                    title="Delete Product"
                                                />
                                            </div>
                                        </td>

                                        {/* Each Prodcut Total */}
                                        <td className="w-[8.57%] p-2 border border-gray-300 text-right">
                                            ₹{calculateTotal(item.price, item.number_of_pic, item.discount, item.discountType, item.tax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td> 
                                    </tr>

                                    
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

                {/* Submit Button */}
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






// ========EXTRA CODE=========

//                 {/* Totals */}
//                 <div className="mt-6">
//                     <table className="w-full border-collapse">
//                         <tbody>
//                         <tr>
//                             <td className="text-right font-bold p-2">Total Amount:</td>
//                             <td className="text-right font-bold p-2">
//                             ₹
//                             {totalAmount.toLocaleString("en-IN", {
//                                 minimumFractionDigits: 2,
//                             })}
//                             </td>
//                         </tr>
//                         <tr>
//                             <td className="text-right font-bold p-2">Total Discount:</td>
//                             <td className="p-2">
//                             <div className="flex items-center gap-2">
//                                 <Input
//                                 type="text"
//                                 placeholder="Total Discount"
//                                 value={totalDiscount}
//                                 onChange={handleOtherChange(setTotalDiscount)}
//                                 className="w-[70%] p-2 text-right border rounded-md"
//                                 />
//                                 <Dropdown
//                                 options={discountTypeOptions}
//                                 selectedValue={totalDiscountType}
//                                 onChange={(selected) => setTotalDiscountType(selected)}
//                                 />
//                             </div>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td className="text-right font-bold p-2">Tax:</td>
//                             <td className="p-2">
//                             <Dropdown
//                                 options={taxOptions}
//                                 selectedValue={taxAmount}
//                                 onChange={(selected) => setTaxAmount(selected)}
//                                 isWidthDropdown={true}
//                                 type="tax"
//                             />
//                             </td>
//                         </tr>
//                         <tr>
//                             <td className="text-right font-bold p-2">Final Amount:</td>
//                             <td className="text-right font-bold p-2 text-xl">
//                             ₹
//                             {finalAmount.toLocaleString("en-IN", {
//                                 minimumFractionDigits: 2,
//                             })}
//                             </td>
//                         </tr>
//                         </tbody>
//                     </table>
//                 </div>








// ===================================INVOICE TABLE OLD CODE========================================
// /* eslint-disable no-unused-vars */
// import React from "react";

// function InvoiceTable({title, groupedItems, type}) {
//     const excludedKeys = [
//         "id", "Size(mm)", "size (mm)", "Size (Mm)", "Inch", "od min.", "od max.",
//         "thickness min. (mm)", "thickness max. (mm)", "code", "size", "mm", "nos",
//         "ltr", "height", "width"
//     ];

//     return (
//         <>
//             {title && <h3 className="mb-1 text-lg font-bold text-gray-700 underline">{title}</h3>}
//             <table className="w-full border-collapse border border-gray-300">
//                 <thead className="bg-gray-100">
//                     <tr className="text-center">
//                         <th className="p-2 border border-gray-300">Sr.</th>
//                         <th className="p-2 border border-gray-300 text-left">Description of Goods</th>
//                         {type === "fittings" && (
//                             <th className="p-2 border border-gray-300  w-50">Nos</th>
//                         )}
//                         {type === "fittings" && (
//                             <th className="p-2 border border-gray-300 w-50">Small Packets</th>
//                         )}
//                         {type === "fittings" && (
//                             <th className="p-2 border border-gray-300 w-50">Large Packets</th>
//                         )}
//                         {type === "fittings" && (
//                             <th className="p-2 border border-gray-300 w-50">Total Quntity</th>
//                         )}
//                         {/* <th className="p-2 border border-gray-300 w-50">{type === "pipes" ? "Kgs/Mtr" : "Large Bag"}</th> */}
//                         <th className="p-2 border border-gray-300">Check</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {(() => {
//                         let counter = 1;
//                         return Object.entries(groupedItems).map(([productName, items], idx) => (
//                             <React.Fragment key={productName}>
//                                 <tr key={idx} className="bg-gray-50">
//                                     <td className="p-2 border border-gray-300 text-center font-bold"></td>
//                                     <td colSpan={5} className="p-2 border border-gray-300 font-bold text-gray-700">
//                                         {productName.toUpperCase()}
//                                     </td>
//                                 </tr>
//                                 {items.map((item, subIdx) => {
//                                     const basic = item.item.basic_data || {};
//                                     const mm = basic.mm || "";
//                                     const size = basic.size || "";
//                                     const sizeMM = basic["Size(mm)"] || basic["size (mm)"] ||"";
//                                     const ltr = basic.ltr || "";
//                                     const nos = item.quantity || "-";
//                                     const fittingNos = item.number_of_pic || "-";
//                                     const qty = item.quantity || "-";
//                                     const smallBag = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
//                                     const largeBag = item.large_bag_quantity === "0" ? "-" : item.large_bag_quantity || "-";

//                                     let weight = 0;
//                                     let weightLabel = "";
//                                     if (type === "pipes") {
//                                         if (basic.weight) {
//                                             weight = Number(basic.weight);
//                                         } else {
//                                             for (const key in basic) {
//                                                 if (!excludedKeys.includes(key) && !isNaN(Number(basic[key]))) {
//                                                     weight = Number(basic[key]);
//                                                     if (key.includes("Kgf / cm")) {
//                                                         const match = key.match(/^(\d+(\.\d+)?)/);
//                                                         const numberPart = match ? match[1] : "";
//                                                         weightLabel = `${numberPart}KG`;
//                                                     } else {
//                                                         weightLabel = key.toUpperCase();
//                                                     }
//                                                     break;
//                                                 }
//                                             }
//                                         }
//                                     }

//                                     const rawTotal = Math.round(nos * weight);
//                                     const totalWeight = isNaN(rawTotal) || rawTotal === 0 ? "-" : rawTotal;

//                                     return (
//                                         <tr key={subIdx} className="border-t border-gray-200 text-sm">
//                                             <td className="p-2 border border-gray-300 text-center font-bold">{counter++}</td>
//                                             <td className="flex p-2 text-left">
//                                                 {mm && mm !== "-" && size ? (
//                                                     <div>{mm}MM</div>
//                                                 ) : sizeMM ? (
//                                                     <div>{sizeMM}MM{weightLabel ? ` X ${weightLabel}` : ""}</div>
//                                                 ) : size ? (
//                                                     <div>{size} {!size.toLowerCase().includes("ml") && "Inch"}</div>
//                                                 ) : ltr ? (
//                                                     <div>{ltr} ltr</div>
//                                                 ) : null}

//                                                 {type === "pipes" && nos !== "-" && (
//                                                     <span className="ml-2 font-medium">({nos} Nos)</span>
//                                                 )}

//                                             </td>
//                                             {type === "fittings" && (
//                                                 <td className="p-2 border border-gray-300 text-center w-50">{fittingNos}</td>
//                                             )}
//                                             {type === "fittings" && (
//                                                 <td className="p-2 border border-gray-300 text-center w-50">{smallBag}</td>
//                                             )}
//                                             {type === "fittings" && (
//                                                 <td className="p-2 border border-gray-300 text-center w-50">{largeBag}</td>
//                                             )}
//                                             {type === "fittings" && (
//                                                 <td className="p-2 border border-gray-300 text-center w-50">{qty}</td>
//                                             )}
//                                             {/* <td className="p-2 border border-gray-300 text-center w-50">
//                                                 {type === "pipes" ? (totalWeight !== "-" ? `${totalWeight} KG` : "-") : largeBag}
//                                             </td> */}
//                                             <td className="p-2 border border-gray-300 text-center">
//                                                 <div className="flex items-center justify-center gap-7">
//                                                     <div className="w-4 h-4 border border-black" title="Plan A"></div>
//                                                     <div className="w-4 h-4 border border-black" title="Plan B"></div>
//                                                     <div className="w-4 h-4 border border-black" title="Plan C"></div>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </React.Fragment>
//                         ));
//                     })()}
//                 </tbody>
//             </table>
//         </>
//     );
// };

// export default InvoiceTable;
// ===================================INVOICE TABLE OLD CODE========================================







// ========================================INVOICE PDF TABLE OLD CODE==================================
// /* eslint-disable no-unused-vars */
// import { View, Text, StyleSheet } from '@react-pdf/renderer';
// const styles = StyleSheet.create({
//     table: {
//         display: 'table',
//         width: '100%',
//         borderWidth: 1,
//         borderStyle: 'solid',
//         borderColor: '#d1d5dc',
//         marginTop: 5,
//         marginBottom: 10,
//     },
//     tableRow: {
//         flexDirection: 'row',
//     },
//     tableColSr: {
//         width: '10%', // Small
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColDesc: {
//         width: '40%', // Largest
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColDesc2: {
//         width: '50%', // Largest
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColCheck: {
//         width: '20%', // Medium
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColCheck2: {
//         width: '60%', // Largest
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColNos: {
//         width: '15%', // Smaller than check
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableColKgs: {
//         width: '15%', // Same as Nos
//         borderStyle: 'solid',
//         borderWidth: 1,
//         borderColor: '#d1d5dc',
//         padding: 4,
//     },
//     tableCell: {
//         fontSize: 10,
//         textAlign: 'center',
//     },
//     tableColHeader: {
//         backgroundColor: '#EEE',
//         fontSize: 10,
//         fontWeight: 'bold',
//         textAlign: 'center',
//     },
//     tableCol: {
//         flex: 1,
//         padding: 5,
//         fontSize: 10,
//         textAlign: 'center',
//         fontWeight: 'bold',
//     },
//     tableColLeft: {
//         flex: 1,
//         padding: 5,
//         fontSize: 10,
//         textAlign: 'left',
//     },
//     productGroupTitle: {
//         flexDirection: 'row',
//         backgroundColor: '#fbf9fa',
//         paddingVertical: 4,
//         paddingHorizontal: 5,
//     },
//     productGroupText: {
//         fontSize: 10,
//         fontWeight: 'bold',
//         textAlign: 'left',
//         flex: 11, // spans multiple columns
//     },
//     productGroupText1: {
//         fontSize: 10,
//         fontWeight: 'bold',
//         textAlign: 'left',
//         flex: 14, // spans multiple columns
//     },
//     textCenter: {
//         textAlign: 'center',
//     },
//     textLeftMargin: {
//        marginLeft: 4, 
//     },
//     bold: {
//         fontWeight: 'bold',
//     }
// });

// const excludedKeys = ['code', 'size', 'mm', 'packing', 'large_bag', 'ltr', 'Size(mm)', 'Size (Mm)'];

// const InvoiceTablePDF = ({ groupedItems, type }) => {
//     return (
//         <View style={styles.table}>
//             {/* Table Header */}
//             <View style={styles.tableRow}>
//                 <Text style={[styles.tableColSr, styles.tableColHeader]}>Sr.</Text>
//                 <Text style={[type === "pipes" ? styles.tableColDesc2 : styles.tableColDesc, styles.tableColHeader, { textAlign: "left" }]}>Description of Goods</Text>
//                 {type === "fittings" && (
//                     <Text style={[styles.tableColNos, styles.tableColHeader]}>Nos</Text>
//                 )}
//                 {type === "fittings" && (
//                     <Text style={[styles.tableColNos, styles.tableColHeader]}>Small Packets</Text>
//                 )}
//                 {type === "fittings" && (
//                     <Text style={[styles.tableColNos, styles.tableColHeader]}>Large Packets</Text>
//                 )}
//                 {type === "fittings" && (
//                     <Text style={[styles.tableColNos, styles.tableColHeader]}>Total Quntity</Text>
//                 )}
//                 <Text style={[type === "pipes" ? styles.tableColCheck2 : styles.tableColCheck, styles.tableColHeader ]}>Check</Text>
//             </View>

//             {/* Table Rows */}
//             {(() => {
//                 let counter = 1;
//                 return Object.entries(groupedItems).map(([productName, items], idx) => (
//                     <View key={idx}>
//                         {/* Product Group Header */}
//                         <View style={styles.productGroupTitle}>
//                             <Text style={styles.tableCol}></Text>
//                             <Text style={[type === 'pipes' ? styles.productGroupText : styles.productGroupText1]}>
//                                 {productName.toUpperCase()}
//                             </Text>
//                         </View>
                    
//                         {items.map((item, index) => {
//                             const basic = item.item?.basic_data || {};
//                             const mm = basic.mm || "";
//                             const size = basic.size || "";
//                             const sizeMM = basic["Size(mm)"] || basic["size (mm)"] || "";
//                             const ltr = basic.ltr || "";
//                             const nos = item.quantity || "-";
//                             const fittingNos = item.number_of_pic || "-";
//                             const qty = item.quantity || "-";
//                             const packing = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
//                             const smallBag = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
//                             const largeBag = item.large_bag_quantity === "0" ? "-" : item.large_bag_quantity || "-";

//                             let weight = 0;
//                             let weightLabel = "";

//                             if (type === "pipes") {
//                                 if (basic.weight) {
//                                     weight = Number(basic.weight);
//                                 } else {
//                                     for (const key in basic) {
//                                         if (!excludedKeys.includes(key) && !isNaN(Number(basic[key]))) {
//                                             weight = Number(basic[key]);
//                                             if (key.includes("Kgf / cm")) {
//                                                 const match = key.match(/^(\d+(\.\d+)?)/);
//                                                 const numberPart = match ? match[1] : "";
//                                                 weightLabel = `${numberPart}KG`;
//                                             } else {
//                                                 weightLabel = key.toUpperCase();
//                                             }
//                                             break;
//                                         }
//                                     }
//                                 }
//                             }

//                             const rawTotal = Math.round(nos * weight);
//                             const totalWeight = isNaN(rawTotal) || rawTotal === 0 ? "-" : `${rawTotal} KG`;

//                             let description = "";
//                             if (mm && mm!== "-" && size) {
//                                 description = `${mm}MM`;
//                             } else if (sizeMM) {
//                                 description = `${sizeMM}MM${weightLabel ? ` X ${weightLabel}` : ""}`;
//                             } else if (size) {
//                                 description = `${size}${!size.toLowerCase().includes("ml") ? " Inch" : ""}`;
//                             } else if (ltr) {
//                                 description = `${ltr} ltr`;
//                             }

//                             return (
//                                 <View style={styles.tableRow} key={index}>
//                                     <View style={[styles.tableColSr, {alignItems: 'center'}]}>
//                                         <Text style={styles.bold}>{counter++}</Text>
//                                     </View>
//                                     <View style={[type === "pipes" ? styles.tableColDesc2 : styles.tableColDesc, { padding: 0 }]}>
//                                         <Text style={styles.tableColLeft}>
//                                             {description} {type === "pipes" && nos !== "-" && (
//                                                 <Text style={[styles.textLeftMargin, styles.bold]}>({nos} Nos)</Text>
//                                             )}
//                                         </Text>
//                                     </View>
//                                     {type === "fittings" && (
//                                         <View style={styles.tableColNos}>
//                                             <Text style={styles.textCenter}>{fittingNos}</Text>
//                                         </View>
//                                     )}
//                                     {type === "fittings" && (
//                                         <View style={styles.tableColNos}>
//                                             <Text style={styles.textCenter}>{smallBag}</Text>
//                                         </View>
//                                     )}
//                                     {type === "fittings" && (
//                                         <View style={styles.tableColNos}>
//                                             <Text style={styles.textCenter}>{largeBag}</Text>
//                                         </View>
//                                     )}
//                                     {type === "fittings" && (
//                                         <View style={styles.tableColNos}>
//                                             <Text style={styles.textCenter}>{qty}</Text>
//                                         </View>
//                                     )}
//                                     <View style={[
//                                         type === "pipes" ? styles.tableColCheck2 : styles.tableColCheck,
//                                         {
//                                             flexDirection: 'row',
//                                             justifyContent: 'center',
//                                             alignItems: 'center',
//                                             gap: 10,}]
//                                         }
//                                     >
//                                         <View style={{ width: 10, height: 10, border: '1px solid black' }} />
//                                         <View style={{ width: 10, height: 10, border: '1px solid black' }} />
//                                         <View style={{ width: 10, height: 10, border: '1px solid black' }} />
//                                     </View>
//                                 </View>
//                             );
//                         })}
//                     </View>
//                 ));
//             })()}
//         </View>
//     );
// };

// export default InvoiceTablePDF;
// ========================================INVOICE PDF TABLE OLD CODE==================================







// ==========================================Whole Order Calcultion by CHATGPT============================
// useEffect(() => {
//     let computedTotalAmount = 0;

//     itemsData.forEach((item) => {
//         const price = parseFloat(item.price) || 0;
//         const quantity = parseInt(item.number_of_pic) || parseInt(item.bag_quantity) || parseInt(item.large_bag_quantity) || 0;
//         const discount = parseFloat(item.discount) || 0;
//         const discountType = item.discountType;
//         const itemTaxRate = parseFloat(item.tax) || 0;

//         // Start with total = price * quantity
//         let itemTotal = price * quantity;

//         // Apply discount
//         if (discountType === '%') {
//             itemTotal -= (itemTotal * discount / 100);
//         } else {
//             itemTotal -= discount; // flat discount on total
//         }

//         if (itemTotal < 0) itemTotal = 0;

//         // Apply per-item tax
//         const taxValue = (itemTotal * itemTaxRate) / 100;

//         computedTotalAmount += itemTotal + taxValue;
//     });

//     // Apply global discount
//     const globalDiscount = parseFloat(totalDiscount) || 0;
//     let appliedGlobalDiscount = 0;

//     if (totalDiscountType === '%') {
//         appliedGlobalDiscount = (computedTotalAmount * globalDiscount) / 100;
//     } else {
//         appliedGlobalDiscount = globalDiscount;
//     }

//     const amountAfterDiscount = computedTotalAmount - appliedGlobalDiscount;

//     // Apply global tax
//     const globalTaxRate = parseFloat(taxAmount) || 0;
//     const globalTaxValue = (amountAfterDiscount * globalTaxRate) / 100;

//     const computedFinalAmount = amountAfterDiscount + globalTaxValue;

//     setTotalAmount(parseFloat(computedTotalAmount)); // Sum of all item totals
//     setFinalAmount(parseFloat(computedFinalAmount)); // Final amount including global discount & tax
// }, [itemsData, taxAmount, totalDiscount, totalDiscountType]);




// =========================================================ADD ITEM PAGES=======================

// /* eslint-disable no-unused-vars */
// import { useState } from "react";
// import Dropdown from "../../common/formDropDown/DropDown";
// import Input from "../../common/formInputs/Input";
// import { AnimatePresence, motion } from "framer-motion";
// import { FaPlus, FaTimes } from "react-icons/fa";

// function AddItemComponent({ categories, category, setCategory, 
//     itemName,  setItemName, navigate, 
//     handleSubmit, pipeStructure, selectedGroups, 
//     formValues, setFormValues, handleGroupClick,
//     manualColumns, setManualColumns, handleAddMultiCategory, multiCategories }) {
//     const [image, setImage] = useState(null);
//     const [preview, setPreview] = useState(null);
//     const [multiInput, setMultiInput] = useState("");

//     // Handle Image Upload
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImage(file);
//             setPreview(URL.createObjectURL(file));
//         }
//     };

//     return (
//         <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
//             <button 
//                 type="button" 
//                 className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
//                 onClick={() => navigate(-1)}
//             >
//                 Back
//             </button>
//             <h2 className="text-2xl font-semibold mb-4">Create Item</h2>
//             <form onSubmit={(e) => handleSubmit(e, image)} className="space-y-4">
//                 {/* Item Name Input */}
//                 <div className="mb-2">
//                     <Input 
//                         label="Item Name:"
//                         type="text" 
//                         placeholder=" Enter Item Name"  
//                         name="name"
//                         value={itemName}
//                         className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                         onChange={(e) => setItemName(e.target.value)} 
//                     />
//                 </div>

//                 <div>
//                     <Input
//                         label="Multiple Category:"
//                         type="text"
//                         placeholder="Enter category names separated by commas or press Enter"
//                         name="name"
//                         value={multiInput}
//                         onChange={(e) => setMultiInput(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key === "Enter") {
//                                 e.preventDefault();
//                                 if (multiInput.trim()) {
//                                 multiInput
//                                     .split(",")
//                                     .map((cat) => cat.trim())
//                                     .filter(Boolean)
//                                     .forEach((cat) => handleAddMultiCategory(cat)); // 👈 loop individually
//                                 setMultiInput("");
//                                 }
//                             }
//                         }}

//                         className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                     />
//                     <button
//                         type="button"
//                         className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
//                         onClick={() => {
//                             if (multiInput.trim()) {
//                                 multiInput
//                                 .split(",")
//                                 .map((cat) => cat.trim())
//                                 .filter(Boolean)
//                                 .forEach((cat) => handleAddMultiCategory(cat)); // 👈 call for each category
//                                 setMultiInput("");
//                             }
//                         }}
//                     >
//                         Add
//                     </button>
//                 </div>

//                 {/* Category Dropdown */}
//                 <div className="mb-2">
//                     <label className="block font-medium text-black-700 mb-1">Category:</label>
//                     <Dropdown 
//                         options={categories} 
//                         selectedValue={category} 
//                         onChange={(value) => setCategory(value)}
//                         placeholder="Select a category"
//                         isWidthDropdown={true}
//                     />
//                 </div>

//                 {/* Image Upload */}
//                 <div className="mb-2">
//                     <Input 
//                         label="Upload Image:"
//                         type="file" 
//                         accept="image/*" 
//                         className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                         onChange={handleImageChange}
//                     />
//                     {preview && (
//                         <div className="mt-3">
//                             <img src={preview} alt="Preview" className="max-h-48 rounded-md p-2 border border-gray-300" />
//                         </div>
//                     )}
//                 </div>

//                 <div className="mt-4">
//                     {multiCategories.length > 0 ? (
//                         multiCategories.map(cat => {
//                         const rows = formValues[cat] || [{}];
//                         return (
//                             <motion.div
//                                 key={cat}
//                                 initial={{ opacity: 0, y: 20 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 transition={{ duration: 0.3 }}
//                                 className="border border-gray-300 rounded-md p-4 shadow mb-4"
//                             >
//                                 <h4 className="font-semibold mb-2">{cat}</h4>
//                                 <div className="overflow-x-auto">
//                                     <table className="min-w-full border border-gray-300 bg-white text-base">
//                                         <thead className="bg-gray-100 text-gray-700">
//                                             <tr>
//                                                 {manualColumns.map((col, i) => (
//                                                     <th
//                                                         key={i}
//                                                         className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap"
//                                                     >
//                                                         {col || `Column ${i + 1}`}
//                                                     </th>
//                                                 ))}
//                                                 <th className="px-4 py-2 font-semibold border border-gray-300 text-center whitespace-nowrap">
//                                                     Actions
//                                                 </th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {rows.map((_, rowIndex) => (
//                                                 <tr key={rowIndex} className="hover:bg-gray-50">
//                                                     {manualColumns.map((col, colIndex) => (
//                                                     <td
//                                                         key={colIndex}
//                                                         className="px-4 py-2 border border-gray-300"
//                                                     >
//                                                         <Input
//                                                             type="text"
//                                                             placeholder={col || `Column ${colIndex + 1}`}
//                                                             className="w-full p-2 border border-gray-300 rounded-md"
//                                                             value={formValues[cat]?.[rowIndex]?.[col] || ""}
//                                                             onChange={(e) => {
//                                                                 setFormValues((prev) => {
//                                                                     const updated = { ...prev };
//                                                                     if (!updated[cat]) updated[cat] = [];
//                                                                     if (!updated[cat][rowIndex]) updated[cat][rowIndex] = {};
//                                                                     updated[cat][rowIndex][col] = e.target.value;
//                                                                     return updated;
//                                                                 });
//                                                             }}
//                                                         />
//                                                     </td>
//                                                     ))}
//                                                     <td className="px-2 py-2 border border-gray-300 text-center">
//                                                         <button
//                                                             type="button"
//                                                             className="p-2 bg-green-400 text-white rounded-md mr-2"
//                                                             onClick={() => {
//                                                                 setFormValues((prev) => {
//                                                                     const updated = { ...prev };
//                                                                     updated[cat].splice(rowIndex + 1, 0, {});
//                                                                     return updated;
//                                                                 });
//                                                             }}
//                                                         >
//                                                             <FaPlus />
//                                                         </button>
//                                                         <button
//                                                             type="button"
//                                                             className={`p-2 bg-red-400 text-white rounded-md ${
//                                                                 rows.length <= 1 ? "opacity-50 cursor-not-allowed" : ""
//                                                             }`}
//                                                             onClick={() => {
//                                                                 setFormValues((prev) => {
//                                                                     const updated = { ...prev };
//                                                                     updated[cat].splice(rowIndex, 1);
//                                                                     return updated;
//                                                                 });
//                                                             }}
//                                                             disabled={rows.length <= 1}
//                                                         >
//                                                             <FaTimes />
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </motion.div>
//                         );
//                         })
//                     ) : (
//                         <AnimatePresence>
//                             {/* Grouped Format */}
//                             {Array.isArray(pipeStructure) && typeof pipeStructure[0] === "object" &&
//                                 selectedGroups.map(groupName => {
//                                 const group = pipeStructure.find(g => g.name === groupName);
//                                 const rows = formValues[groupName] && formValues[groupName].length > 0
//                                     ? formValues[groupName]
//                                     : [{}];

//                                 return (
//                                     <motion.div
//                                         key={groupName}
//                                         initial={{ opacity: 0, y: 20 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         transition={{ duration: 0.3 }}
//                                         className="border border-gray-300 rounded-md p-4 shadow mb-4"
//                                     >
//                                         <h4 className="font-semibold mb-2">{group.name}</h4>
//                                         <div className="overflow-x-auto">
//                                             <table className="min-w-full border border-gray-300 bg-white text-base">
//                                                 <thead className="bg-gray-100 text-gray-700">
//                                                     <tr>
//                                                         {group.key.map(key => (
//                                                             <th key={key} className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap">
//                                                             {key}
//                                                             </th>
//                                                         ))}
//                                                         <th className="px-4 py-2 font-semibold border border-gray-300 text-center whitespace-nowrap">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {rows.map((_, rowIndex) => (
//                                                         <tr key={rowIndex} className="hover:bg-gray-50">
//                                                             {group.key.map(key => (
//                                                                 <td key={key} className="px-4 py-2 border border-gray-300">
//                                                                     <Input
//                                                                         type="text"
//                                                                         className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                                                         value={formValues[groupName]?.[rowIndex]?.[key] || ""}
//                                                                         placeholder={`Enter ${key}`}
//                                                                         onChange={(e) => {
//                                                                             setFormValues(prev => {
//                                                                                 const updated = { ...prev };
//                                                                                 if (!updated[groupName]) updated[groupName] = [];
//                                                                                 if (!updated[groupName][rowIndex]) updated[groupName][rowIndex] = {};
//                                                                                 updated[groupName][rowIndex][key] = e.target.value;
//                                                                                 return updated;
//                                                                             });
//                                                                         }}
//                                                                     />
//                                                                 </td>
//                                                             ))}
//                                                             <td className="text-center px-2 py-2 border border-gray-300">
//                                                                 <div className="flex items-center justify-center gap-2">
//                                                                     <button
//                                                                         type="button"
//                                                                         className="p-[12px] bg-green-400 text-white text-xl rounded-md cursor-pointer"
//                                                                         onClick={() => {
//                                                                             setFormValues(prev => {
//                                                                                 const updated = { ...prev };
//                                                                                 const groupRows = [...(updated[groupName] || [{}])];
//                                                                                 const baseRow = groupRows[rowIndex] || {};
//                                                                                 groupRows.splice(rowIndex + 1, 0, {});
//                                                                                 updated[groupName] = groupRows;
//                                                                                 return updated;
//                                                                             });
//                                                                         }}
//                                                                     >
//                                                                         <FaPlus />
//                                                                     </button>
//                                                                     <button
//                                                                         type="button"
//                                                                         className={`p-[12px] bg-red-400 text-white text-xl rounded-md ${rows.length <= 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
//                                                                         onClick={() => {
//                                                                             setFormValues(prev => {
//                                                                                 const updated = { ...prev };
//                                                                                 updated[groupName]?.splice(rowIndex, 1);
//                                                                                 return updated;
//                                                                             });
//                                                                         }}
//                                                                         disabled={rows.length <= 1}
//                                                                     >
//                                                                         <FaTimes  />
//                                                                     </button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </motion.div>
//                                 );
//                             })}

//                             {/* Flat Key Format */}
//                             {Array.isArray(pipeStructure) && typeof pipeStructure[0] === "string" && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: 20 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ duration: 0.3 }}
//                                     className="border border-gray-300 rounded-lg p-4 shadow"
//                                 >
//                                     <h4 className="font-semibold mb-2">Details</h4>
//                                     <div className="overflow-x-auto">
//                                         <table className="min-w-full border border-gray-300 bg-white">
//                                             <thead className="bg-gray-100 text-gray-700">
//                                                 <tr>
//                                                     {pipeStructure.map(key => (
//                                                         <th key={key} className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap capitalize">{key}</th>
//                                                     ))}
//                                                     <th className="px-4 py-2 font-semibold border border-gray-300 text-center whitespace-nowrap">Actions</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {(formValues["flat"]?.length ? formValues["flat"] : [{}]).map((row, rowIndex) => (
//                                                     <tr key={rowIndex} className="hover:bg-gray-50">
//                                                         {pipeStructure.map(key => (
//                                                             <td key={key} className="px-4 py-2 border border-gray-300">
//                                                                 <Input
//                                                                     type="text"
//                                                                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                                                     placeholder={`Enter ${key}`}
//                                                                     value={formValues["flat"]?.[rowIndex]?.[key] || ""}
//                                                                     onChange={(e) => {
//                                                                         setFormValues(prev => {
//                                                                             const updated = { ...prev };
//                                                                             if (!updated["flat"]) updated["flat"] = [];
//                                                                             if (!updated["flat"][rowIndex]) updated["flat"][rowIndex] = {};
//                                                                             updated["flat"][rowIndex][key] = e.target.value;
//                                                                             return updated;
//                                                                             });
//                                                                     }}
//                                                                 />
//                                                             </td>
//                                                         ))}
//                                                         <td className="text-center px-2 py-2 border border-gray-300 space-x-2">
//                                                         <div className="flex items-center justify-center gap-2">
//                                                             <button
//                                                                 type="button"
//                                                                 className="p-[12px] bg-green-400 text-white text-xl rounded-md cursor-pointer"
//                                                                 onClick={() => {
//                                                                     setFormValues(prev => {
//                                                                         const updated = { ...prev };
//                                                                         const flatRows = [...(updated["flat"] || [{}])];
//                                                                         const baseRow = flatRows[rowIndex] || {};
//                                                                         flatRows.splice(rowIndex + 1, 0, {});
//                                                                         updated["flat"] = flatRows;
//                                                                         return updated;
//                                                                     });
//                                                                 }}
//                                                             >
//                                                                 <FaPlus />
//                                                             </button>
//                                                             <button
//                                                                 type="button"
//                                                                 className={`p-[12px] bg-red-400 text-white text-xl rounded-md ${((formValues["flat"]?.length || 0) <= 1) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
//                                                                 onClick={() => {
//                                                                     setFormValues(prev => {
//                                                                         const updated = { ...prev };
//                                                                         updated["flat"]?.splice(rowIndex, 1);
//                                                                         return updated;
//                                                                     });
//                                                                 }}
//                                                                 disabled={(formValues["flat"]?.length || 0) <= 1}
//                                                             >
//                                                                 <FaTimes />
//                                                             </button>
//                                                         </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </motion.div>
//                             )}

//                             {/* Manual Column Entry Mode */}
//                             {pipeStructure === "manual" && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: 20 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ duration: 0.3 }}
//                                     className="border border-gray-300 rounded-lg p-4 shadow"
//                                 >
//                                     <h4 className="font-semibold mb-4">Add New Details</h4>
//                                     <div className="overflow-x-auto">
//                                         <table className="min-w-full border border-gray-300 bg-white">
//                                             <thead className="bg-gray-50 text-gray-700">
//                                                 <tr>
//                                                     {manualColumns.map((colName, colIndex) => (
//                                                         <th key={colIndex} className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap capitalize">
//                                                             <Input
//                                                                 type="text"
//                                                                 className="w-full p-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                                                 placeholder={`Column ${colIndex + 1}`}
//                                                                 value={colName}
//                                                                 onChange={(e) => {
//                                                                     const updated = [...manualColumns];
//                                                                     updated[colIndex] = e.target.value;
//                                                                     setManualColumns(updated);
//                                                                 }}
//                                                             />
//                                                         </th>
//                                                     ))}
//                                                     <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Actions</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {(formValues["flat"]?.length ? formValues["flat"] : [{}]).map((row, rowIndex) => (
//                                                     <tr key={rowIndex} className="hover:bg-gray-50">
//                                                         {manualColumns.map((key, colIndex) => (
//                                                             <td key={colIndex} className="px-4 py-2 border border-gray-300 ">
//                                                                 <Input
//                                                                     type="text"
//                                                                     className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
//                                                                     placeholder={key ? `Enter ${key}` : `Column ${colIndex + 1}`}
//                                                                     value={formValues["flat"]?.[rowIndex]?.[key] || ""}
//                                                                     onChange={(e) => {
//                                                                         setFormValues(prev => {
//                                                                             const updated = { ...prev };
//                                                                             if (!updated["flat"]) updated["flat"] = [];
//                                                                             if (!updated["flat"][rowIndex]) updated["flat"][rowIndex] = {};
//                                                                             updated["flat"][rowIndex][key] = e.target.value;
//                                                                             return updated;
//                                                                         });
//                                                                     }}
//                                                                 />
//                                                             </td>
//                                                         ))}
//                                                         <td className="text-center px-2 py-2 border border-gray-300 space-x-2">
//                                                             <div className="flex items-center justify-center gap-2">
//                                                                 {/* Add row */}
//                                                                 <button
//                                                                     type="button"
//                                                                     className="p-[12px] bg-green-400 text-white text-xl rounded-md cursor-pointer"
//                                                                     onClick={() => {
//                                                                         setFormValues(prev => {
//                                                                             const updated = { ...prev };
//                                                                             const rows = [...(updated["flat"] || [{}])];
//                                                                             rows.splice(rowIndex + 1, 0, {});
//                                                                             updated["flat"] = rows;
//                                                                             return updated;
//                                                                         });
//                                                                     }}
//                                                                 >
//                                                                     <FaPlus />
//                                                                 </button>

//                                                                 {/* Remove row */}
//                                                                 <button
//                                                                     type="button"
//                                                                     className={`p-[12px] bg-red-400 text-white text-xl rounded-md ${(formValues["flat"]?.length || 0) <= 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
//                                                                     onClick={() => {
//                                                                         setFormValues(prev => {
//                                                                             const updated = { ...prev };
//                                                                             updated["flat"]?.splice(rowIndex, 1);
//                                                                             return updated;
//                                                                         });
//                                                                     }}
//                                                                     disabled={(formValues["flat"]?.length || 0) <= 1}
//                                                                 >
//                                                                     <FaTimes />
//                                                                 </button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     {/* Column Controls */}
//                                     <div className="flex gap-4 mt-4">
//                                         {/* Add Column */}
//                                         <button
//                                             type="button"
//                                             className="px-4 py-2 bg-blue-500 text-white font-semibold rounded cursor-pointer"
//                                             onClick={() => {
//                                                 setManualColumns(prev => [...prev, ""]);
//                                             }}
//                                         >
//                                             Add Column
//                                         </button>

//                                         {/* Remove Column */}
//                                         <button
//                                             type="button"
//                                             className={`px-4 py-2 bg-red-500 text-white font-semibold rounded ${manualColumns.length <= 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                                             onClick={() => {
//                                                 const updatedColumns = [...manualColumns];
//                                                 const removedKey = updatedColumns.pop();
//                                                 setManualColumns(updatedColumns);

//                                                 // Remove from all rows too
//                                                 setFormValues(prev => {
//                                                     const updated = { ...prev };
//                                                     if (updated["flat"]) {
//                                                         updated["flat"] = updated["flat"].map(row => {
//                                                             const newRow = { ...row };
//                                                             delete newRow[removedKey];
//                                                             return newRow;
//                                                         });
//                                                     }
//                                                     return updated;
//                                                 });
//                                             }}
//                                             disabled={manualColumns.length <= 1}
//                                         >
//                                             Remove Column
//                                         </button>
//                                     </div>
//                                 </motion.div>
//                             )}

//                     </AnimatePresence>
//                     )}
//                     </div>

                
               

//                 {/* Submit Button */}
//                 <div className="flex items-center justify-center">
//                     <button type="submit" className="w-auto custom-gradient text-black font-medium p-2 rounded-md cursor-pointer">
//                         Save Item
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddItemComponent;



// /* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import AddItemComponent from "./AddItemComponent";
// import { getMainCategories } from "../../../apis/FetchItems";
// import { createMainCategory } from "../../../apis/PostItems";


// function AddItemController() {
//     const hasFetched = useRef(false);
//     const [itemName, setItemName] = useState("");
//     const [category, setCategory] = useState("");
//     const [categories, setCategories] = useState([]);
//     const [pipeStructure, setPipeStructure] = useState(null)
//     // const [selectedGroups, setSelectedGroups] = useState([]); // if grouped format
//     const [manualColumns, setManualColumns] = useState([]);
//     const [formValues, setFormValues] = useState({});
//     // const [hasInteracted, setHasInteracted] = useState(false);
//     const [groupFormats, setGroupFormats] = useState([]); // [{ name: "", columns: [""], rows: [{}] }]
//     const [tempGroupName, setTempGroupName] = useState(""); // input field value
   
//     const navigate = useNavigate();

//     const categoryColors = ["text-black", "text-blue-600", "text-green-600", "text-red-600"];
//     const extractSubcategories = (categories, level = 0) => {
//         let subcategories = [];
    
//         const findCategories = (subCategoriesList, currentLevel) => {
//             subCategoriesList.forEach(subCategory => {
//                 let categoryItem = {
//                     id: subCategory.id,
//                     name: `${'→ '.repeat(currentLevel)}${subCategory.name}`,
//                     disabled: false,
//                     color: categoryColors[currentLevel] || categoryColors[categoryColors.length - 1]
//                 };
//                 subcategories.push(categoryItem);
//                 if (subCategory.sub_categories && subCategory.sub_categories.length > 0) {
//                     findCategories(subCategory.sub_categories, currentLevel + 1);
//                 } else {
//                     subcategories[subcategories.length - 1].disabled = false; // Enable only leaf nodes
//                 }
//             });
//         };
    
//         categories.forEach(category => {
//             let categoryItem = {
//                 id: category.id,
//                 name: category.name,
//                 disabled: false,
//                 color: categoryColors[level] || categoryColors[categoryColors.length - 1]
//             };
//             subcategories.push(categoryItem);
//             if (category.sub_categories && category.sub_categories.length > 0) {
//                 findCategories(category.sub_categories, level + 1);
//             } 
//             // else {
//             //     subcategories[subcategories.length - 1].disabled = false; // Enable only leaf nodes
//             // }
//         });
    
//         return subcategories;
//     };
    
//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const response = await getMainCategories();
//                 if (response.data.status) {
//                     const subcategories = extractSubcategories(response.data.data);
//                     setCategories(subcategories);
//                 } else {
//                     toast.error("Failed to fetch categories");
//                 }
//             } catch (error) {
//                 toast.error("Error fetching categories");
//                 console.error("API Error:", error);
//             }
//         };
//         if (!hasFetched.current) {
//             fetchCategories();
//             hasFetched.current = true;
//         }
//     }, []);

//     const handleCategoryChange = async (value) => {
//         setCategory(value);
//         // setHasInteracted(false);
        
//         setPipeStructure("manual"); // Show manual builder
//         setFormValues({ flat: [{}] });
//         setManualColumns([""])
//     };

//     // useEffect(() => {
//     //     // if (!hasInteracted || !pipeStructure) return;

//     //     setFormValues(prev => {
//     //         const updated = { ...prev };

//     //         // if (Array.isArray(pipeStructure) && typeof pipeStructure[0] === "object") {
//     //         //     selectedGroups.forEach(groupName => {
//     //         //         if (!updated[groupName] || updated[groupName].length === 0) {
//     //         //             updated[groupName] = [{}];
//     //         //         }
//     //         //     });
//     //         // }

//     //         // if (Array.isArray(pipeStructure) && typeof pipeStructure[0] === "string") {
//     //         //     if (!updated["flat"] || updated["flat"].length === 0) {
//     //         //         updated["flat"] = [{}];
//     //         //     }
//     //         // }

//     //         return updated;
//     //     });
//     // }, [pipeStructure,]);

//     const handleAddGroupFormat = () => {
//         if (!tempGroupName || !category) {
//             alert("Please enter group format name and select category first.");
//             return;
//         }

//         setGroupFormats(prev => [
//             ...prev,
//             {
//                 name: tempGroupName.trim(),
//                 columns: [""],
//                 rows: [{}]
//             }
//         ]);

//         setTempGroupName("");
//     };



//     //Append Basic_Data According Group OR Flat
//     // const appendBasicDataToFormData = (formData, pipeStructure, formValues, manualColumns, groupFormats) => {
//     //     let basicData = [];

//     //     if (pipeStructure === "manual" && Array.isArray(manualColumns)) {
//     //         // Manual format
//     //         const flatRows = formValues["flat"] || [];

//     //         // Ensure only columns from manualColumns are sent, in order
//     //         basicData = flatRows.map((row, index) => {
//     //             const formattedRow = { id: index + 1 };
//     //             manualColumns.forEach(col => {
//     //                 formattedRow[col] = row[col] || "";
//     //             });
//     //             return formattedRow;
//     //         });
//     //     } 
//     //     if (Array.isArray(groupFormats) && groupFormats.length > 0) {
//     //         const generateBasicData = (groupFormats) => {
//     //             return groupFormats.map((group, gIndex) => ({
//     //                 name: group.name?.trim() || `Group_format${gIndex + 1}`,
//     //                 data: group.rows.map((row, rIndex) => {
//     //                 const formattedRow = { id: rIndex + 1 };

//     //                 group.columns
//     //                     .filter(col => col && col.trim())  // ignore empty columns
//     //                     .forEach(col => {
//     //                     const colName = col.trim();
//     //                     formattedRow[colName] = row[colName] || ""; // fetch value safely
//     //                     });

//     //                 return formattedRow;
//     //                 })
//     //             }));
//     //         };
//     //         basicData = generateBasicData(groupFormats);
//     //     }

//     //     // Append to formData
//     //     formData.append("basic_data", JSON.stringify(basicData));
//     // };

//     const appendBasicDataToFormData = (formData, formValues, manualColumns, groupFormats) => {
//     let basicData = [];

//     if (groupFormats.length > 0) {
//         basicData = groupFormats.map((group, gIndex) => ({
//             name: group.name?.trim() || `Group_format${gIndex + 1}`,
//             data: group.rows.map((row, rIndex) => {
//                 const formattedRow = { id: rIndex + 1 };
//                 group.columns
//                     .filter(c => c?.trim())
//                     .forEach(c => formattedRow[c.trim()] = row[c.trim()] || "");
//                 return formattedRow;
//             })
//         }));
//     } else {
//         const flatRows = formValues["flat"] || [];
//         basicData = flatRows.map((row, idx) => {
//             const formattedRow = { id: idx + 1 };
//             manualColumns.forEach(col => formattedRow[col] = row[col] || "");
//             return formattedRow;
//         });
//     }

//     formData.append("basic_data", JSON.stringify(basicData));
// };


//     const handleSubmit = async (e, image) => {
//         e.preventDefault();

//         if (!category) {
//             toast.error(" select category");
//             return;
//         }
    
//         const formData = new FormData();
//         formData.append("name", itemName);
    
//         if (category) {
//             formData.append("product", category);
//         }
    
//         if (image) {
//             formData.append("image", image);  // only add image if exists
//         }

//         appendBasicDataToFormData(formData, formValues, manualColumns, groupFormats);

//         console.log("🚀 FormData Payload:");
//         for (let pair of formData.entries()) {
//             if (pair[0] === "basic_data") {
//                 try {
//                     console.log("basic_data:", JSON.stringify(JSON.parse(pair[1]), null, 2));
//                 } catch {
//                     console.log("basic_data (raw):", pair[1]);
//                 }
//             } else {
//                 console.log(`${pair[0]}:`, pair[1]);
//             }
//         }

//         // console.log("Prepared Payload:");
//         // console.log(JSON.stringify(groupFormats, null, 2));
        
//         try {
//             // const response = await createMainCategory(formData);
//             if (response.data.status) {
//                 toast.success("Item added successfully!");
//                 setItemName(""); // Clear input field
//                 setCategory(""); // Reset dropdown selection
    
//                 // Fetch updated categories after adding a new one
//                 // const updatedCategories = await getMainCategories();
//                 if (updatedCategories.data.status) {
//                     setCategories(extractSubcategories(updatedCategories.data.data));
//                 }
//                 navigate("/categories");
//             } else {
//                 toast.error(response.data.message);
//             }
//         } catch (error) {
//             toast.error("Error adding item");
//             console.error("API Error:", error);
//         }
//     };

//     return (
//         <AddItemComponent 
//             categories={categories}
//             category={category}
//             setCategory={handleCategoryChange}
//             itemName={itemName}
//             setItemName={setItemName}
//             navigate={navigate}
//             handleSubmit={handleSubmit}
//             pipeStructure={pipeStructure}
//             // selectedGroups={selectedGroups}
//             formValues={formValues}
//             setFormValues={setFormValues}
//             handleGroupClick={handleAddGroupFormat}
//             manualColumns={manualColumns}
//             setManualColumns={setManualColumns}
//             groupFormats={groupFormats}
//             setGroupFormats={setGroupFormats}
//             tempGroupName={tempGroupName}
//             setTempGroupName={setTempGroupName}
//         />
//     );
// };

// export default AddItemController;