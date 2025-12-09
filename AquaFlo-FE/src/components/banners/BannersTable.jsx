import React from "react";
import { FaTrash } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { Switch } from "@headlessui/react";
import BaseImage from "../common/BaseImage";

function BannersTable({ banners, categories, onToggleSwitch, onBannersEdit, onBannersDelete }) {
    
    const getCategoryName = (categoryId, categories = []) => {
        if (!Array.isArray(categories)) return "N/A";
        for (const category of categories) {
          if (category.id === categoryId) return category.name;
      
          if (Array.isArray(category.sub_categories)) {
            for (const subCategory of category.sub_categories) {
              if (subCategory.id === categoryId) return subCategory.name;
            }
          }
        }
        return "N/A";
    };
  
    return (
        <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.length > 0 ? (
                        banners.map((banner, index) => (
                            <tr key={banner.id} className="hover:bg-gray-50">

                                {/* Banners details */}
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <img 
                                            src={banner.image}
                                            alt={banner.title} 
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                        {banner.title || "N/A"}    
                                    </div>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">{banner.description || "N/A"}</td>
                                <td className="border border-gray-300 px-4 py-2">{getCategoryName(banner.category, categories) || "N/A"}</td>
                                <td className={`border border-gray-300 px-4 py-2`}>
                                    <div className="flex justify-center">
                                        <Switch
                                            checked={banner.is_active}
                                            onChange={() => onToggleSwitch(banner)}
                                            title="Banner Active/Inactive"
                                            className={`${
                                                banner.is_active ? 'bg-green-500' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer`}
                                        >
                                            <span
                                                className={`${
                                                banner.is_active ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform cursor-pointer`}
                                            />
                                        </Switch>
                                    </div>
                                </td>
                                
                                {/* Main Action */}
                                <td className="border border-gray-300 px-4 py-2 text-center min-w-[160px]">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <BaseImage 
                                            src="/edit.png" 
                                            alt="icon" 
                                            className="w-5 cursor-pointer"
                                            title="Edit Banner"
                                            onClick={() => onBannersEdit(banner)}
                                        />

                                        <button 
                                            onClick={() => onBannersDelete(banner.id)}
                                            title="Delete Banner" 
                                            className="text-[#d33] hover:text-red-700 cursor-pointer"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) :(
                        <tr>
                            <td colSpan="7" className="text-center text-gray-500 py-4">
                                <div className="flex justify-center items-center gap-2 text-yellow-500">
                                    <IoIosWarning size={30}/>
                                    <p className="text-center text-red-500 text-xl font-semibold py-4">No Banners Available!</p>
                                    <IoIosWarning size={30}/>   
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BannersTable;