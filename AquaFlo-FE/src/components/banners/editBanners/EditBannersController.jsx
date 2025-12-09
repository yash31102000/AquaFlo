/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from "react";
import EditBannersComponent from "./EditBannersComponent";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateBanner } from "../../../apis/PutBanner";
import { getMainCategories } from "../../../apis/FetchItems";

function EditBannersController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const location = useLocation();
    const banner = location.state;
    const [editBanner, setEditBanner] = useState(banner);
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    
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

    // Handle input change for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditBanner((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle Image change
    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditBanner(prev => ({ ...prev, image: file }));
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            if (errors.image) {
                setErrors(prev => ({ ...prev, image: "" }));
            }
        }
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const validateForm = () => {
        const newErrors = {};
        if (!editBanner.title.trim()) newErrors.title = "Title is required";
        if (!editBanner.image) newErrors.image = "Banner image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const { id, image, ...rest } = editBanner;

        const formData = new FormData();
        formData.append("title", rest.title);
        formData.append("description", rest.description || "");
        formData.append("category", rest.category);
        formData.append("flag", rest.flag ? "True" : "False");

        if (image instanceof File) {
            formData.append("image", image);
        }

        // for (let pair of formData.entries()) {
        //     console.log(`${pair[0]}:`, pair[1]);
        // }

        try {
            const response = await updateBanner(editBanner.id, formData);
            if (response.status) {
                toast.success(response.message);
                navigate(-1);
            } else {
                toast.error(response.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update user.");
        }
    };

    return (
        <EditBannersComponent
            navigate={navigate}
            errors={errors}
            editBanner={editBanner}
            categories={categories}
            onInputChange={handleInputChange}
            onImageChange={onImageChange}
            onSubmit={handleSubmit}
            preview={preview}
        />
    );
}

export default EditBannersController;
