/* eslint-disable no-unused-vars */
import { useState } from "react";
import Dropdown from "../../common/formDropDown/DropDown";
import Input from "../../common/formInputs/Input";
import { AnimatePresence, motion } from "framer-motion";
import { FaPlus, FaTimes } from "react-icons/fa";

function AddItemComponent({ categories, category, setCategory, 
    itemName,  setItemName, navigate, 
    handleSubmit, pipeStructure, formValues, 
    setFormValues, handleAddGroupFormat, manualColumns, 
    setManualColumns, setGroupFormats, groupFormats, 
    groupName, setGroupName }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    // Handle Image Upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <button 
                type="button" 
                className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                onClick={() => navigate(-1)}
            >
                Back
            </button>
            <h2 className="text-2xl font-semibold mb-4">Create Item</h2>
            <form onSubmit={(e) => handleSubmit(e, image)} className="space-y-4">
                {/* Item Name Input */}
                <div className="mb-2">
                    <Input 
                        label="Item Name:"
                        type="text" 
                        placeholder="Enter Item Name"  
                        name="name"
                        value={itemName}
                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => setItemName(e.target.value)} 
                    />
                </div>

                <div className="mb-2">
                    <Input 
                        label="Group Format (optional):"
                        type="text" 
                        placeholder="Enter Group Format Name"  
                        name="group_format"
                        value={groupName}
                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => setGroupName(e.target.value)} 
                    />
                </div>

                {/* Category Dropdown */}
                <div className="mb-2">
                    <label className="block font-medium text-black-700 mb-1">Category:</label>
                    <Dropdown 
                        options={categories} 
                        selectedValue={category} 
                        onChange={(value) => setCategory(value)}
                        placeholder="Select a category"
                        isWidthDropdown={true}
                    />
                </div>

                <button
                    type="button"
                    className={`w-auto custom-gradient text-black font-medium p-2 mb-2 rounded-md ${!groupName ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={handleAddGroupFormat}
                    disabled={!groupName} 
                >
                    Add Group Format
                </button>

                {/* Image Upload */}
                <div>
                    <Input 
                        label="Upload Image:"
                        type="file" 
                        accept="image/*" 
                        className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={handleImageChange}
                    />
                    {preview && (
                        <div className="mt-3">
                            <img src={preview} alt="Preview" className="max-h-48 rounded-md p-2 border border-gray-300" />
                        </div>
                    )}
                </div>
                
                <div className="space-y-6">    
                    <AnimatePresence>
                         {groupFormats.length > 0 ? (
                            <>
                                {/* Grouped Format */}
                                {groupFormats.map((group, groupIndex) => (
                                    <motion.div
                                        key={groupIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border border-gray-300 rounded-md p-4 shadow mb-4"
                                    >
                                        <h4 className="font-semibold mb-2">{group.name}</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-300 bg-white">
                                                <thead className="bg-gray-50 text-gray-700">
                                                    <tr>
                                                        {group.columns.map((col, colIndex) => (
                                                            <th key={colIndex} className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap">
                                                                <Input
                                                                    type="text"
                                                                    className="w-full p-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                    value={col}
                                                                    placeholder={`Column ${colIndex + 1}`}
                                                                    onChange={(e) => {
                                                                        const updated = [...groupFormats];
                                                                        updated[groupIndex].columns[colIndex] = e.target.value;
                                                                        setGroupFormats(updated);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th className="px-4 py-2 font-semibold border border-gray-300 text-center whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.rows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {group.columns.map((col, colIndex) => (
                                                                <td key={colIndex} className="px-4 py-2 border border-gray-300">
                                                                    <Input
                                                                        type="text"
                                                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                        placeholder={col ? `Enter ${col}` : `Column ${colIndex + 1}`}
                                                                        value={row[col] || ""}
                                                                        onChange={(e) => {
                                                                            if (!col || !col.trim()) return; // ignore if column name empty
                                                                            const updated = [...groupFormats];
                                                                            if (!updated[groupIndex].rows[rowIndex]) updated[groupIndex].rows[rowIndex] = {};
                                                                            const colName = col.trim();
                                                                            updated[groupIndex].rows[rowIndex][colName] = e.target.value;
                                                                            setGroupFormats(updated);
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td className="text-center px-2 py-2 border border-gray-300">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="p-[12px] bg-green-400 text-white text-xl rounded-md cursor-pointer"
                                                                        onClick={() => {
                                                                            const updated = [...groupFormats];
                                                                            updated[groupIndex].rows.splice(rowIndex + 1, 0, {});
                                                                            setGroupFormats(updated);
                                                                        }}
                                                                    >
                                                                        <FaPlus />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={`p-[12px] bg-red-400 text-white text-xl rounded-md ${group.rows.length <= 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                                                        onClick={() => {
                                                                            if (group.rows.length > 1) {
                                                                                const updated = [...groupFormats];
                                                                                updated[groupIndex].rows.splice(rowIndex, 1);
                                                                                setGroupFormats(updated);
                                                                            }
                                                                        }}
                                                                        disabled={group.rows.length <= 1}

                                                                    >
                                                                        <FaTimes  />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Column controls */}
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded cursor-pointer"
                                                onClick={() => {
                                                    const updated = [...groupFormats];
                                                    updated[groupIndex].columns.push("");
                                                    setGroupFormats(updated);
                                                }}
                                            >
                                                Add Column
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-4 py-2 bg-red-500 text-white font-semibold rounded ${group.columns.length <= 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                disabled={group.columns.length <= 1}
                                                onClick={() => {
                                                    const updated = [...groupFormats];
                                                    const removed = updated[groupIndex].columns.pop();
                                                    updated[groupIndex].rows = updated[groupIndex].rows.map(r => {
                                                        const newRow = { ...r };
                                                        delete newRow[removed];
                                                        return newRow;
                                                    });
                                                    setGroupFormats(updated);
                                                }}
                                            >
                                                Remove Column
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        ) : (
                             <>
                                {/* Manual Column Entry Mode */}
                                {pipeStructure === "manual" && !groupName && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border border-gray-300 rounded-lg p-4 shadow"
                                    >
                                        <h4 className="font-semibold mb-4">Add New Details</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border border-gray-300 bg-white">
                                                <thead className="bg-gray-50 text-gray-700">
                                                    <tr>
                                                        {manualColumns.map((colName, colIndex) => (
                                                            <th key={colIndex} className="px-4 py-2 font-semibold border border-gray-300 whitespace-nowrap capitalize">
                                                                <Input
                                                                    type="text"
                                                                    className="w-full p-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                    placeholder={`Column ${colIndex + 1}`}
                                                                    value={colName}
                                                                    onChange={(e) => {
                                                                        const updated = [...manualColumns];
                                                                        updated[colIndex] = e.target.value;
                                                                        setManualColumns(updated);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(formValues["flat"]?.length ? formValues["flat"] : [{}]).map((row, rowIndex) => (
                                                        <tr key={rowIndex} className="hover:bg-gray-50">
                                                            {manualColumns.map((key, colIndex) => (
                                                                <td key={colIndex} className="px-4 py-2 border border-gray-300 ">
                                                                    <Input
                                                                        type="text"
                                                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                                                        placeholder={key ? `Enter ${key}` : `Column ${colIndex + 1}`}
                                                                        value={formValues["flat"]?.[rowIndex]?.[key] || ""}
                                                                        onChange={(e) => {
                                                                            setFormValues(prev => {
                                                                                const updated = { ...prev };
                                                                                if (!updated["flat"]) updated["flat"] = [];
                                                                                if (!updated["flat"][rowIndex]) updated["flat"][rowIndex] = {};
                                                                                updated["flat"][rowIndex][key] = e.target.value;
                                                                                return updated;
                                                                            });
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td className="text-center px-2 py-2 border border-gray-300 space-x-2">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {/* Add row */}
                                                                    <button
                                                                        type="button"
                                                                        className="p-[12px] bg-green-400 text-white text-xl rounded-md cursor-pointer"
                                                                        onClick={() => {
                                                                            setFormValues(prev => {
                                                                                const updated = { ...prev };
                                                                                const rows = [...(updated["flat"] || [{}])];
                                                                                rows.splice(rowIndex + 1, 0, {});
                                                                                updated["flat"] = rows;
                                                                                return updated;
                                                                            });
                                                                        }}
                                                                    >
                                                                        <FaPlus />
                                                                    </button>

                                                                    {/* Remove row */}
                                                                    <button
                                                                        type="button"
                                                                        className={`p-[12px] bg-red-400 text-white text-xl rounded-md ${(formValues["flat"]?.length || 0) <= 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                                                        onClick={() => {
                                                                            setFormValues(prev => {
                                                                                const updated = { ...prev };
                                                                                updated["flat"]?.splice(rowIndex, 1);
                                                                                return updated;
                                                                            });
                                                                        }}
                                                                        disabled={(formValues["flat"]?.length || 0) <= 1}
                                                                    >
                                                                        <FaTimes />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Column Controls */}
                                        <div className="flex gap-4 mt-4">
                                            {/* Add Column */}
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded cursor-pointer"
                                                onClick={() => {
                                                    setManualColumns(prev => [...prev, ""]);
                                                }}
                                            >
                                                Add Column
                                            </button>

                                            {/* Remove Column */}
                                            <button
                                                type="button"
                                                className={`px-4 py-2 bg-red-500 text-white font-semibold rounded ${manualColumns.length <= 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                onClick={() => {
                                                    const updatedColumns = [...manualColumns];
                                                    const removedKey = updatedColumns.pop();
                                                    setManualColumns(updatedColumns);

                                                    // Remove from all rows too
                                                    setFormValues(prev => {
                                                        const updated = { ...prev };
                                                        if (updated["flat"]) {
                                                            updated["flat"] = updated["flat"].map(row => {
                                                                const newRow = { ...row };
                                                                delete newRow[removedKey];
                                                                return newRow;
                                                            });
                                                        }
                                                        return updated;
                                                    });
                                                }}
                                                disabled={manualColumns.length <= 1}
                                            >
                                                Remove Column
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-center">
                    <button type="submit" className="w-auto custom-gradient text-black font-medium p-2 rounded-md cursor-pointer">
                        Save Item
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItemComponent;