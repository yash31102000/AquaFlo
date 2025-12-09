/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../../common/formInputs/Input';
import BaseImage from '../../common/BaseImage';

function ViewAddressComponent({ navigate, addresses, name, 
    editingIndex, onAddAddress, editedAddress,
    onEditClick, onInputChange, onSave }) {
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

                <button 
                    type="button" 
                    className="px-4 py-2 mb-[10px] custom-gradient text-black font-medium rounded-md"
                    onClick={onAddAddress}
                >
                    Add Address
                </button>

            </div>
            <h2 className="text-2xl font-bold mb-4">{name}'s Addresses</h2>
        
            {addresses.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addresses.map((address, index) => (
                        <li key={index} className={`bg-gray-50 border border-gray-300 p-4 rounded-md h-fit`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p><strong>Company:</strong> {address.company_name}</p>
                                    <p><strong>Street:</strong> {address.street}</p>
                                    <p><strong>City:</strong> {address.city}</p>
                                    <p><strong>State:</strong> {address.state}</p>
                                    <p><strong>Pin Code:</strong> {address.zip}</p>
                                    <p><strong>GST Number:</strong> {address.GST_Number || "N/A"}</p>
                                </div>
                                <button
                                    onClick={() => onEditClick(index, address)}
                                >
                                    <BaseImage 
                                        src={editingIndex === index ? "/close.png" : "/edit.png"} 
                                        alt={editingIndex === index ? "Icon" : "Icon"} 
                                        className={`${editingIndex === index ? "w-7 h-7" : "w-6 h-6"}`}
                                    />
                                </button>
                            </div>

                            <AnimatePresence>
                                {editingIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-4 bg-white p-4 rounded border border-gray-300 space-y-3"
                                    >
                                        <Input 
                                            label="Company Name:"
                                            type="text" 
                                            placeholder="Enter Company Name"
                                            name={`company_name`}
                                            value={editedAddress.company_name}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />

                                        <Input 
                                            label="GST Number:"
                                            type="text" 
                                            placeholder="Enter GST Number"
                                            name={`GST_Number`}
                                            value={editedAddress.GST_Number || ''}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />

                                        <Input 
                                            label="Street:"
                                            type="text" 
                                            placeholder="Enter Street"
                                            name={`street`}
                                            value={editedAddress.street}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />

                                        <Input 
                                            label="City:"
                                            type="text" 
                                            placeholder="Enter City"
                                            name={`city`}
                                            value={editedAddress.city}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />

                                        <Input 
                                            label="State:"
                                            type="text" 
                                            placeholder="Enter State"
                                            name={`state`}
                                            value={editedAddress.state}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />

                                        <Input 
                                            label="Pin Code:"
                                            type="text" 
                                            placeholder="Enter Pin Code"
                                            name={`zip`}
                                            value={editedAddress.zip}
                                            onChange={onInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md my-1 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                        />
                                        
                                        <div className="flex items-center justify-center mt-4">
                                            <button
                                                className="px-4 py-2 custom-gradient text-black font-medium rounded"
                                                onClick={() => onSave(index)}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-lg">No addresses available for this user.</p>
            )}
        </div>
    );
};

export default ViewAddressComponent;
