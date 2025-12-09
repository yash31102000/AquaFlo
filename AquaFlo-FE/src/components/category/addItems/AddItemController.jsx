/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddItemComponent from "./AddItemComponent";
import { getMainCategories } from "../../../apis/FetchItems";
import { createMainCategory } from "../../../apis/PostItems";

function AddItemController() {
    const hasFetched = useRef(false);
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [pipeStructure, setPipeStructure] = useState(null)
    const [manualColumns, setManualColumns] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [groupFormats, setGroupFormats] = useState([]);
    const [groupName, setGroupName] = useState("");
   
    const navigate = useNavigate();

    const categoryColors = ["text-black", "text-blue-600", "text-green-600", "text-red-600"];
    const extractSubcategories = (categories, level = 0) => {
        let subcategories = [];
    
        const findCategories = (subCategoriesList, currentLevel) => {
            subCategoriesList.forEach(subCategory => {
                let categoryItem = {
                    id: subCategory.id,
                    name: `${'→ '.repeat(currentLevel)}${subCategory.name}`,
                    disabled: false,
                    color: categoryColors[currentLevel] || categoryColors[categoryColors.length - 1]
                };
                subcategories.push(categoryItem);
                if (subCategory.sub_categories && subCategory.sub_categories.length > 0) {
                    findCategories(subCategory.sub_categories, currentLevel + 1);
                } else {
                    subcategories[subcategories.length - 1].disabled = false; // Enable only leaf nodes
                }
            });
        };
    
        categories.forEach(category => {
            let categoryItem = {
                id: category.id,
                name: category.name,
                disabled: false,
                color: categoryColors[level] || categoryColors[categoryColors.length - 1]
            };
            subcategories.push(categoryItem);
            if (category.sub_categories && category.sub_categories.length > 0) {
                findCategories(category.sub_categories, level + 1);
            } 
            // else {
            //     subcategories[subcategories.length - 1].disabled = false; // Enable only leaf nodes
            // }
        });
    
        return subcategories;
    };
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getMainCategories();
                if (response.data.status) {
                    const subcategories = extractSubcategories(response.data.data);
                    setCategories(subcategories);
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
    }, []);

    const handleCategoryChange = async (value) => {
        setCategory(value);
        setPipeStructure("manual"); // Show manual builder
        setFormValues({ flat: [{}] });
        setManualColumns([""])
    };

    const handleAddGroupFormat = () => {
        if (!groupName || !category) {
            toast.error("Please enter group format name & select category first.");
            return;
        }

        setGroupFormats(prev => [
            ...prev,
            {
                name: groupName.trim(),
                columns: [""],
                rows: [{}]
            }
        ]);
        setGroupName("");
    };

    //Append Basic_Data According Group OR Flat
    const appendBasicDataToFormData = (formData, formValues, manualColumns, groupFormats) => {
        let basicData = [];

        if (groupFormats.length > 0) {
            basicData = groupFormats.map((group, gIndex) => ({
                name: group.name?.trim() || `Group_format${gIndex + 1}`,
                data: group.rows.map((row, rIndex) => {
                    const formattedRow = { id: rIndex + 1 };
                    group.columns
                        .filter(c => c?.trim())
                        .forEach(c => formattedRow[c.trim()] = row[c.trim()] || "");
                    return formattedRow;
                })
            }));
        } else {
            const flatRows = formValues["flat"] || [];
            basicData = flatRows.map((row, idx) => {
                const formattedRow = { id: idx + 1 };
                manualColumns.forEach(col => formattedRow[col] = row[col] || "");
                return formattedRow;
            });
        }

        formData.append("basic_data", JSON.stringify(basicData));
    };

    const handleSubmit = async (e, image) => {
        e.preventDefault();

        if (!category) {
            toast.error(" select category");
            return;
        }

        if (!image) {
            toast.error("Please upload an image.");
            return;
        }
    
        const formData = new FormData();
        formData.append("name", itemName);
    
        if (category) {
            formData.append("product", category);
        }
    
        if (image) {
            formData.append("image", image);  // only add image if exists
        }

        appendBasicDataToFormData(formData, formValues, manualColumns, groupFormats);

        // Log For Payload
        // console.log("🚀 FormData Payload:");
        // for (let pair of formData.entries()) {
        //     if (pair[0] === "basic_data") {
        //         try {
        //             console.log("basic_data:", JSON.stringify(JSON.parse(pair[1]), null, 2));
        //         } catch {
        //             console.log("basic_data (raw):", pair[1]);
        //         }
        //     } else {
        //         console.log(`${pair[0]}:`, pair[1]);
        //     }
        // }
        
        try {
            const response = await createMainCategory(formData);
            if (response.data.status) {
                toast.success("Item added successfully!");
                setItemName(""); // Clear input field
                setCategory(""); // Reset dropdown selection
    
                // Fetch updated categories after adding a new one
                const updatedCategories = await getMainCategories();
                if (updatedCategories.data.status) {
                    setCategories(extractSubcategories(updatedCategories.data.data));
                }
                navigate("/categories");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error adding item");
            console.error("API Error:", error);
        }
    };

    return (
        <AddItemComponent 
            categories={categories}
            category={category}
            setCategory={handleCategoryChange}
            itemName={itemName}
            setItemName={setItemName}
            navigate={navigate}
            handleSubmit={handleSubmit}
            pipeStructure={pipeStructure}
            formValues={formValues}
            setFormValues={setFormValues}
            handleAddGroupFormat={handleAddGroupFormat}
            manualColumns={manualColumns}
            setManualColumns={setManualColumns}
            groupFormats={groupFormats}
            setGroupFormats={setGroupFormats}
            groupName={groupName}
            setGroupName={setGroupName}
        />
    );
};

export default AddItemController;