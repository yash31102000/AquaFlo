/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AddBannerComponent from './AddBannerComponent';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBanner } from '../../../apis/PostBanner';
import { getMainCategories } from '../../../apis/FetchItems';

function AddBannerController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        image: null,
        status: false
    });
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
    
    const onInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }
    };
    
    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));

            if (errors.image) {
                setErrors(prev => ({ ...prev, image: "" }));
            }
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!String(form.category).trim()) newErrors.category = "Category is required";
        if (!form.image) newErrors.image = "Banner image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = new FormData();
        payload.append("title", form.title);
        payload.append("description", form.description);
        payload.append("category", form.category);
        payload.append("flag", form.flag ? "True" : "False");
        payload.append("image", form.image);

        // console.log("FormData Payload:");
        // for (let pair of payload.entries()) {
        //     console.log(`${pair[0]}:`, pair[1]);
        // }

        try {
            const response = await createBanner(payload);
            if(response.data.status) {
                toast.success(response.data.message);
                navigate(-1);
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Failed to add banner");
            console.log("API Error:", error)
        }
    };
    
    return (
        <AddBannerComponent 
            navigate={navigate}
            form={form}
            categories={categories} 
            errors={errors}
            onInputChange={onInputChange}
            onImageChange={onImageChange}
            onSubmit={handleSubmit}
            preview={preview}
        />
    );
};

export default AddBannerController;
