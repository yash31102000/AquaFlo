/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddCategoryComponent from "./AddCategoryComponent";
import { getMainCategories } from "../../../apis/FetchItems";
import { createMainCategory } from "../../../apis/PostItems";


function AddCategoryController() {
    const hasFetched = useRef(false);
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const categoryColors = ["text-black", "text-blue-600", "text-green-600", "text-red-600"];
    const formatCategories = useCallback((categories, prefix = "", level = 0) => {
        let formatted = [];
        categories.forEach(category => {
            formatted.push({ 
                id: category.id, 
                name: `${prefix}${category.name}`, 
                color: categoryColors[level] || categoryColors[categoryColors.length - 1] // Ensure colors don't exceed the list
            });

            if (category.sub_categories && category.sub_categories.length > 0) {
                formatted = formatted.concat(formatCategories(category.sub_categories, prefix + "→ ", level + 1));
            }
        });
        return formatted;
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getMainCategories();
                if (response.data.status) {
                    const formattedCategories = formatCategories(response.data.data);
                    setCategories(formattedCategories);
                } else {
                    toast.error("Failed to fetch categories");
                }
            } catch (error) {
                toast.error("Error fetching categories");
                console.error("API Error:", error);
            }
        };
        if (!hasFetched.current) {
            fetchCategories();
            hasFetched.current = true;
        }
    }, [formatCategories]);

    // Handle Image Upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!itemName.trim()) {
            toast.error("Please enter a category name");
            return;
        }

        if (!category && !image) {
            toast.error("Please upload an image for category");
            return;
        }

        const formData = new FormData();
        formData.append("name", itemName);

        if (category) {
            formData.append("parent", category);
        }

        if (!category && image) {
            formData.append("image", image); // Only send image for main category
        }
        
        // console.log("🚀 FormData Payload:");
        // for (let pair of formData.entries()) {
        //     console.log(`${pair[0]}:`, pair[1]);
        // }
        
        try {
            const response = await createMainCategory(formData);
            if (response.data.status) {
                toast.success("Category added successfully!");
                setItemName(""); // Clear input field
                setCategory(""); // Reset dropdown selection
                setImage(null);
                setPreview(null);

                // Fetch updated category list after adding a new one
                const updatedCategories = await getMainCategories();
                if (updatedCategories.data.status) {
                    setCategories(updatedCategories.data.data);
                }
                navigate("/categories");
            } else {
                toast.error("Failed to add category");
            }
        } catch (error) {
            toast.error("Error adding category");
            console.error("API Error:", error);
        }
    };

    return (
        <AddCategoryComponent 
            categories={categories}
            category={category}
            setCategory={setCategory}
            itemName={itemName}
            setItemName={setItemName}
            navigate={navigate}
            image={image}
            preview={preview}
            handleImageChange={handleImageChange}
            handleSubmit={handleSubmit}
        />
    );
};

export default AddCategoryController;