import React from 'react';
import Input from '../../common/formInputs/Input';
import Dropdown from '../../common/formDropDown/DropDown';
import { Switch } from '@headlessui/react';
import BaseImage from '../../common/BaseImage';

function EditBannersComponent({ navigate, editBanner, categories, errors,  onInputChange, onImageChange, onSubmit, preview }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <button 
                type="button" 
                className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                onClick={() => navigate(-1)}
            >
                Back
            </button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Edit Banner</h2>
            </div>

            {editBanner ? (
                <div>
                    <Input 
                        label="Banner Name:"
                        type="text"
                        placeholder={errors.title ? errors.title : "Enter Banner Name"}  
                        name="title"
                        value={editBanner.title}
                        className={
                            `w-full p-2 border rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                            ${errors.title ? "border-red-500 placeholder-red-500" : "border-gray-300"}`
                        }
                        onChange={onInputChange} 
                    />

                    <Input 
                        label="Description:"
                        type="text" 
                        placeholder="Enter Description"  
                        name="description"
                        value={editBanner.description}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={onInputChange} 
                    />

                    <div className="mb-1">
                        <label className="block font-medium mb-1">Category:</label>
                        <Dropdown
                            options={categories} 
                            selectedValue={editBanner.category}
                            onChange={(value) => onInputChange({ target: { name: 'category', value } })}
                            placeholder="Select a category"
                            renderOption={(option) => (
                                <span className={option.color}>{option.name}</span> // Apply color variation
                            )}
                            isWidthDropdown={true}
                        />
                    </div>

                    <div className="mb-1">
                        <label className="block font-medium mb-1">Status:</label>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={editBanner.flag}
                                onChange={(value) => onInputChange({ target: { name: 'flag', value } })}
                                className={`${
                                    editBanner.flag ? 'bg-green-500' : 'bg-gray-200'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span className="sr-only">Toggle status</span>
                                <span
                                    className={`${
                                        editBanner.flag ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                            <span className="text-gray-700 text-lg">{editBanner.flag ? "Active" : "Inactive"}</span>
                        </div>
                        
                    </div>

                    <div className="mb-1">
                        <label className="block font-medium mb-1">Upload Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className={`w-full p-2 border rounded-md ${errors.image ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.image && <p className="text-red-500 text-base mt-1">{errors.image}</p>}
                        
                        {/* Preview Image */}
                        {(preview || typeof editBanner.image === "string") && (
                            <div className="mt-4">
                                <img src={preview || editBanner.image} alt="Preview" className="max-h-48 rounded-md p-2 border border-gray-300" />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p>No banner data found!</p>
            )}
            <div className="flex items-center justify-center mt-4">
                <button 
                    type="button"
                    className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    onClick={onSubmit}
                >
                    Update Banner
                </button>
            </div>
        </div>
    );
};

export default EditBannersComponent;
