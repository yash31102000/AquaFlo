import BaseImage from "../../common/BaseImage";
import Dropdown from "../../common/formDropDown/DropDown";
import Input from "../../common/formInputs/Input";

function AddCategoryComponent({ itemName, category, setItemName, setCategory, categories, navigate, image, preview, handleImageChange, handleSubmit }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <button 
                type="button" 
                className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                onClick={() => navigate(-1)}
            >
                Back
            </button>
            <h2 className="text-2xl font-semibold mb-4">Create Category</h2>
            <form onSubmit={(e) => handleSubmit(e, image)} className="space-y-4">
                {/* Item Name Input */}
                <div>
                    <Input 
                        label="Category Name:"
                        type="text" 
                        placeholder="Enter Category Name"  
                        name="name"
                        value={itemName}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => setItemName(e.target.value)} 
                    />
                </div>

                {/* Category Dropdown */}
                <div>
                    <label className="block font-medium text-black-700 mb-2">Choosee Parent Category(optional):</label>
                    <Dropdown 
                        options={categories} 
                        selectedValue={category} 
                        onChange={(value) => setCategory(value)}
                        placeholder="Select a category"
                        renderOption={(option) => (
                            <span className={option.color}>{option.name}</span> // Apply color variation
                        )}
                        isWidthDropdown={true}
                    />
                </div>

                {/* Image Upload */}
                {!category && (
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
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-center">
                    <button type="submit" className="w-auto custom-gradient text-black font-medium p-2 rounded-md cursor-pointer">
                        Save Category
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCategoryComponent;
