/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react'
import CategoryComponent from './CategoryComponent';
import { getMainCategories } from '../../apis/FetchItems';
import { getBestSeller } from '../../apis/FetchBestSeller';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import Swal from 'sweetalert2';
import { updateItem, updateItemDetails } from '../../apis/PutItem';
import { updateBestSeller } from '../../apis/PutBestSeller';
import { addBestSeller } from '../../apis/PostBestSeller';

function CategoryController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTabs, setActiveTabs] = useState({});
    const [mainCategories, setMainCategories] = useState([]);
    const [hasFetch, setHasFetch] = useState(false);
    const [bestseller, setBestSeller] = useState([]);
    const [expandedCategories, setExpandedCategories ] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchMainCategories = async () => {
        try {
            const response = await getMainCategories();
            if (response.data.status) {
                setMainCategories(response.data.data);
            } else {
                toast.error("Failed to fetch main categories");
            }
        } catch (error) {
            toast.error("Error fetching main categories");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
            setHasFetch(true);
        }
    };

    const fetchBestSeller = async () => {
        try {
            const response = await getBestSeller();
            if (response.data.status) {
                setBestSeller(response.data.data);
            } else {
                toast.error("Failed to fetch best seller details");
            }
        } catch (error) {
            toast.error("Error fetching best seller details");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchMainCategories();
            fetchBestSeller();
            hasFetched.current = true;
        }
    }, []);

    // Handle Search Functionality
    function filterCategories(data, searchTerm) {
    const lowerTerm = (searchTerm || '').toLowerCase();
    const searchParts = lowerTerm.split(' '); // Split search term into subcategory and product parts

    return Array.isArray(data) ? data
        .map(category => {
            const matchCategory = (category.name || '').toLowerCase().includes(searchParts[0]);

            const filteredSubCategories = Array.isArray(category.sub_categories) ? category.sub_categories
                .map(sub => {
                    const matchSub = (sub.name || '').toLowerCase().includes(searchParts[0]);

                    const filteredInnerSub = Array.isArray(sub.sub_categories) ? sub.sub_categories
                        .map(innerSub => {
                            const matchInner = (innerSub.name || '').toLowerCase().includes(searchParts[0]);

                            const filteredProducts = Array.isArray(innerSub.product) ? innerSub.product.filter(product => 
                                (product.name || '').toLowerCase().includes(searchParts[1] || '')
                            ) : [];

                            // If product or subcategory matches, keep the subcategory or product
                            if (matchInner || filteredProducts.length > 0) {
                                return {
                                    ...innerSub,
                                    product: matchInner && filteredProducts.length === 0 ? innerSub.product : filteredProducts,
                                };
                            }

                            return null;
                        })
                        .filter(Boolean) : [];

                    const allFilteredProducts = Array.isArray(sub.product) ? sub.product.filter(product => 
                        (product.name || '').toLowerCase().includes(searchParts[1] || '')
                    ) : [];

                    // If subcategory matches, keep subcategories or products
                    if (matchSub || filteredInnerSub.length > 0 || allFilteredProducts.length > 0) {
                        return {
                            ...sub,
                            sub_categories: filteredInnerSub,
                            product: matchSub && allFilteredProducts.length === 0 ? sub.product : allFilteredProducts,
                        };
                    }
                    return null;
                })
                .filter(Boolean) : [];

            const topLevelProducts = Array.isArray(category.product) ? category.product.filter(product =>
                (product.name || '').toLowerCase().includes(searchParts[1] || '')
            ) : [];

            // If category or product matches, return the filtered result
            if (matchCategory || filteredSubCategories.length > 0 || topLevelProducts.length > 0) {
                return {
                    ...category,
                    sub_categories: filteredSubCategories,
                    product: matchCategory && topLevelProducts.length === 0 ? category.product : topLevelProducts,
                };
            }

            return null;
        })
        .filter(Boolean) : [];
    }

    const filteredCategories = filterCategories(mainCategories, searchTerm);

    //By Default Select 1st Data As Active Tab
    useEffect(() => {
        filteredCategories.forEach(category => {
            category.product?.forEach(product => {
                if (
                    Array.isArray(product.basic_data) &&
                    product.basic_data.length > 0 &&
                    typeof product.basic_data[0].data === 'object' &&
                    !activeTabs[product.id]
                ) {
                    setActiveTabs(prev => ({
                        ...prev,
                        [product.id]: product.basic_data[0].name
                    }));
                }
            });

            category.sub_categories?.forEach(sub => {
                sub.product?.forEach(product => {
                    if (
                        Array.isArray(product.basic_data) &&
                        product.basic_data.length > 0 &&
                        typeof product.basic_data[0].data === 'object' &&
                        !activeTabs[product.id]
                    ) {
                        setActiveTabs(prev => ({
                            ...prev,
                            [product.id]: product.basic_data[0].name
                        }));
                    }
                });

                sub.sub_categories?.forEach(innerSub => {
                    innerSub.product?.forEach(product => {
                        if (
                            Array.isArray(product.basic_data) &&
                            product.basic_data.length > 0 &&
                            typeof product.basic_data[0].data === 'object' &&
                            !activeTabs[product.id]
                        ) {
                            setActiveTabs(prev => ({
                                ...prev,
                                [product.id]: product.basic_data[0].name
                            }));
                        }
                    });
                });
            });
        });
    }, [filteredCategories, activeTabs]);

    //Handle Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle Manage Best Seller
    const handleManageBestSeller = async () => {
        const isEmpty = !bestseller[0] || Object.keys(bestseller[0]).length === 0;
        const bestSellerData = bestseller[0] || { quantity: 0, toggel: false }; // fallback if data is missing
        let id = bestSellerData.id;
        let quantity = bestSellerData.quantity;
        let toggel = bestSellerData.toggel;

        const { value: formValues } = await Swal.fire({
            title: isEmpty ? 'Add Best Seller' : 'Manage Best Seller',
            html: `
                <div style="text-align:left;">
                    ${isEmpty
                        ? `
                            <label class="custom-swal-label">Enter Minimum Quantity:</label>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button id="decrease-btn" type="button" class="swal2-confirm swal2-styled custom-swal-increase-decrease-btn">-</button>
                                <input type="number" id="swal-new-quantity" class="swal2-input custom-swal-input" value="0" style="text-align:center;" />
                                <button id="increase-btn" type="button" class="swal2-confirm swal2-styled custom-swal-increase-decrease-btn">+</button>
                            </div>
                        ` :
                            `<label class="custom-swal-label">Minimum Quantity:</label>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button id="decrease-btn" type="button" class="swal2-confirm swal2-styled custom-swal-increase-decrease-btn">-</button>
                                <input type="number" id="swal-quantity" class="swal2-input custom-swal-input" value="${quantity}" style="text-align:center;" />
                                <button id="increase-btn" type="button" class="swal2-confirm swal2-styled custom-swal-increase-decrease-btn">+</button>
                            </div>

                            <label class="custom-swal-label" style="margin-top: 15px;">Status:</label>
                            <label class="switch" style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                                <input type="checkbox" id="swal-toggle" ${toggel ? "checked" : ""} />
                                <!-- <span>Toggle is <strong>${toggel ? "ON" : "OFF"}</strong></span> -->
                            </label>
                        `
                    }
                </div>
            `,
            didOpen: () => {  
                const qtyInput = document.getElementById(isEmpty ? 'swal-new-quantity' : 'swal-quantity');
                const decreaseBtn = document.getElementById('decrease-btn');
                const increaseBtn = document.getElementById('increase-btn');
                const toggleInput = document.getElementById('swal-toggle');

                if (qtyInput) {
                    qtyInput.classList.add('no-spinner');

                    increaseBtn.addEventListener('click', () => {
                        qtyInput.value = parseInt(qtyInput.value) + 1;
                    });

                    decreaseBtn.addEventListener('click', () => {
                        const current = parseInt(qtyInput.value);
                        if (current > 0) {
                            qtyInput.value = current - 1;
                        }
                    });
                }

                if (!isEmpty) {
                    toggleInput.addEventListener('change', (e) => {
                        const label = toggleInput.nextElementSibling;
                        if (label) {
                            label.innerHTML = `Toggle is <strong>${e.target.checked ? "ON" : "OFF"}</strong>`;
                        }
                    });
                }
            },
            focusConfirm: false,
            preConfirm: () => {
                if (isEmpty) {
                    const newQty = parseInt(document.getElementById('swal-new-quantity').value);
                    if (isNaN(newQty) || newQty < 0) {
                        Swal.showValidationMessage("Quantity must be a non-negative number.");
                        return false;
                    }
                    return { quantity: newQty };
                } else {
                    const updatedQuantity = parseInt(document.getElementById('swal-quantity').value);
                    const updatedToggle = document.getElementById('swal-toggle').checked;

                    if (isNaN(updatedQuantity) || updatedQuantity < 0) {
                        Swal.showValidationMessage("Quantity must be a non-negative number.");
                        return false;
                    }

                    return {
                        quantity: updatedQuantity,
                        toggel: updatedToggle,
                    };
                }
            },
            showCancelButton: true,
            confirmButtonText: isEmpty ? 'Submit' : 'Update',
            confirmButtonColor: "#13609b",
        });

        if (formValues) {
            // console.log("Best Seller Updated Payload:", JSON.stringify(formValues, null, 2));
            const response = await (isEmpty ? addBestSeller(formValues) : updateBestSeller(id, formValues));
            // const response = { status: true, message: "Working" };
            if (response.status) {
                toast.success(response.message);
                fetchBestSeller();
                fetchMainCategories();
            } else {
                toast.error(response.message);
            }
        }
    };

    
    // Handle Edit Category
    const handleEditCategory = async (item) => {
        const imageExists = !!item.image;
        const { value: formValues } = await Swal.fire({
            title: `Category`,
            html:
                '<label class="custom-swal-label">Category Name</label>' +
                `<input id="swal-name" class="swal2-input custom-swal-input" placeholder="Category Name" value="${item.name}" />`+
                (imageExists
                    ? `<label class="custom-swal-label">Image</label>
                        <input type="file" id="swal-image" class="swal2-file custom-swal-input" />
                        <div class="image-preview-wrapper" style="margin-top:10px; text-align:center;">
                            <img id="swal-preview" src="${item.image}" alt="preview" style="width: 70px; height: 70px; border-radius: 6px; border: 1px solid #D1D5DB; padding: 2px;" />
                        </div>`
                    : ""
                ),
             didOpen: () => {
                if (imageExists) {
                    const input = document.getElementById('swal-image');
                    if (input) {
                        input.addEventListener('change', (e) => {
                            const file = e.target.files[0];
                            const preview = document.getElementById('swal-preview');
                            if (file && preview) {
                                preview.src = URL.createObjectURL(file);
                                preview.setAttribute('data-new-image', 'true');
                            }
                        });
                    }
                }
            },
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('swal-name').value.trim();
    
                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }

                let imageFile = null;
                if (imageExists) {
                    const fileInput = document.getElementById('swal-image');
                    if (fileInput && fileInput.files.length > 0) {
                        imageFile = fileInput.files[0];
                    }
                }
    
                return { name, imageFile };
            },
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: "#13609b",
        });
    
        if (formValues) {
            try {
                const formData = new FormData();
                formData.append('name', formValues.name);

                if (formValues.imageFile) {
                    formData.append('image', formValues.imageFile);
                }

                // Log For Payload
                // const payloadLog = {};
                // formData.forEach((value, key) => {
                //     payloadLog[key] = value instanceof File ? value.name : value;
                // });
                // console.log("🚀 Payload being sent:", JSON.stringify(payloadLog, null, 2));
                // console.log("item.id",item.id);

                const response = await updateItem(item.id, formData);
                if (response.status) {
                    toast.success("Category updated successfully");
                    fetchMainCategories();
                } else {
                    toast.error("Failed to update category");
                }
            } catch (error) {
                console.error("Update error:", error);
                toast.error("Error updating category");
            }
        }
    };

    //Handle Edit Item
    const handleEditItem = async (item) => {
        const isProduct = !!item.image;
        const isNewFormat = Array.isArray(item.basic_data) && item.basic_data[0]?.name && Array.isArray(item.basic_data[0]?.data);

        const { value: formValues } = await Swal.fire({
            title: `Product`,
            html: `
                <style>
                    .tab-btn.selected-tab {
                        background-color: #4B5563 !important;
                        color: white !important;
                        font-weight: 500;
                    }
                    .tab-btn {
                        font-weight: 500;
                    }
                </style>

                <label class="custom-swal-label">Name</label>
                <input id="swal-name" class="swal2-input custom-swal-input" placeholder="Name" value="${item.name}" />
                ${isProduct ? `
                    <label class="custom-swal-label">Image</label>
                    <input type="file" id="swal-image" class="swal2-file custom-swal-input" />
                    <div class="image-preview-wrapper" style="margin-top:10px; text-align:center;">
                        <img id="swal-preview" src="${item.image}" alt="preview" style="width: 70px; height: 70px; border-radius: 6px; border: 1px solid #D1D5DB; padding: 2px;" />
                    </div>
                ` : ''}

                ${isProduct && isNewFormat ? `
                    <div style="margin-top: 15px;" id="tabs-wrapper">
                        ${item.basic_data.map((block, idx) => `
                            <button 
                                type="button" 
                                class="tab-btn" 
                                data-tab-index="${idx}" 
                                style="margin-right: 5px; margin-bottom: 10px; background: #eee; padding: 5px 10px; border-radius: 5px; border: 1px solid #ccc;"
                            >
                                ${block.name}
                            </button>
                        `).join('')}
                    </div>
                    <div id="tab-contents-wrapper">
                        ${item.basic_data.map((block, idx) => `
                            <div class="tab-content" id="tab-${idx}" style="${idx === 0 ? '' : 'display:none;'}; max-height: 300px; overflow-y: auto;">
                                <table class="swal2-table" style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr>
                                            ${Object.keys(block.data[0] || {})
                                                .filter(key => !['id', 'discount_percent', 'discount_type'].includes(key))
                                                .map(key => `
                                                    <th style="padding: 5px; border: 1px solid #ccc; background: #eee;">${key}</th>
                                                `).join('')
                                            }
                                            <th style="padding: 5px; border: 1px solid #ccc; background: #eee;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${block.data.map((row, rowIndex) => `
                                            <tr>
                                                ${Object.keys(row)
                                                    .filter(key => !['id', 'discount_percent', 'discount_type'].includes(key))
                                                    .map(key => `
                                                    <td style="padding: 5px; border: 1px solid #ccc;">
                                                        <input 
                                                            type="text" 
                                                            class="swal2-input custom-swal-table-input" 
                                                            id="basic-${idx}-${rowIndex}-${key}" 
                                                            value="${row[key] ?? ''}" 
                                                        />
                                                    </td>
                                                `).join('')}
                                                </td>
                                                <td style="padding: 5px; border: 1px solid #ccc; text-align:center;">
                                                    <button 
                                                        type="button" 
                                                        class="remove-row-btn" 
                                                        data-block-index="${idx}" 
                                                        data-row-index="${rowIndex}" 
                                                        style="background:#c10007; color:#fff; border:none; border-radius:4px; padding:3px 6px; cursor:pointer;"
                                                    >
                                                        −
                                                    </button>
                                                </td> 
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="100%" style="text-align: left; padding: 10px; padding-left: 0px;">
                                                <button 
                                                    type="button" 
                                                    class="add-row-btn" 
                                                    data-block-index="${idx}" 
                                                    style="background:#016630; color:#fff; border:none; border-radius:5px; padding:5px 12px; cursor:pointer;"
                                                >
                                                    Add Row
                                                </button>
                                                <button 
                                                    type="button" 
                                                    class="add-col-btn"
                                                    data-block-index="${idx}"
                                                    style="background:#0a58ca; color:#fff; border:none; border-radius:5px; padding:5px 12px; cursor:pointer; margin-left:5px;"
                                                >
                                                    Add Column
                                                </button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${isProduct && !isNewFormat ? `
                    <div style="max-height: 300px; overflow-y: auto; margin-top: 15px;">
                        <table class="swal2-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    ${Object.keys(item.basic_data[0] || {})
                                    .filter(key => !['id', 'discount_percent', 'discount_type'].includes(key))
                                    .map(key => `
                                        <th style="padding: 5px; border: 1px solid #ccc; background: #eee;">${key.replace(/_/g, ' ')}</th>
                                    `).join('')}
                                    <th style="padding: 5px; border: 1px solid #ccc; background: #eee;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${item.basic_data.map((row, rowIndex) => `
                                    <tr>
                                        ${Object.keys(row)
                                            .filter(key => !['id', 'discount_percent', 'discount_type'].includes(key))
                                            .map(key => `
                                            <td style="padding: 5px; border: 1px solid #ccc;">
                                                <input 
                                                    type="text" 
                                                    class="swal2-input custom-swal-table-input" 
                                                    id="basic-${rowIndex}-${key}" 
                                                    value="${row[key] ?? ''}" 
                                                />
                                            </td>
                                        `).join('')}
                                        <td style="padding: 5px; border: 1px solid #ccc; text-align:center;">
                                            <button 
                                                type="button" 
                                                class="remove-row-btn" 
                                                data-block-index="${row}" 
                                                data-row-index="${rowIndex}" 
                                                style="background:#c10007; color:#fff; border:none; border-radius:4px; padding:3px 6px; cursor:pointer;"
                                            >
                                                −
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="100%" style="text-align: left; padding: 10px; padding-left: 0px;">
                                        <button 
                                            type="button" 
                                            class="add-row-btn" 
                                            style="background:#016630; color:#fff; border:none; border-radius:5px; padding:5px 12px; cursor:pointer;"
                                        >
                                            Add Row
                                        </button>
                                        <button 
                                            type="button" 
                                            class="add-col-btn"  
                                            style="background:#0a58ca; color:#fff; border:none; border-radius:5px; padding:5px 12px; cursor:pointer; margin-left:5px;"
                                        >
                                            Add Column
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ` : ''}
            `,
            customClass: {
                popup: 'custom-swal-class-product',
            },
            didOpen: () => {
                // Image preview logic
                const input = document.getElementById('swal-image');
                if (input) {
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        const preview = document.getElementById('swal-preview');
                        if (file && preview) {
                            preview.src = URL.createObjectURL(file);
                        }
                    });
                }

                // Tabs logic
                if (isNewFormat) {
                    const tabs = document.querySelectorAll('.tab-btn');
                    const tabContents = document.querySelectorAll('.tab-content');

                    tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                            const idx = tab.dataset.tabIndex;

                            // Switch tab content
                            tabContents.forEach((el, i) => {
                                el.style.display = i == idx ? 'block' : 'none';
                            });

                            // Highlight active tab
                            tabs.forEach(t => t.classList.remove('selected-tab'));
                            tab.classList.add('selected-tab');
                        });
                    });

                    // Set first tab as active initially
                    tabs[0]?.classList.add('selected-tab');
                }

                // Remove row handler
                document.querySelectorAll('.remove-row-btn').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        const row = btn.closest('tr');
                        if (row) row.remove();
                    });
                });

                // Add row handler
                document.querySelectorAll('.add-row-btn').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        let blockIndex = btn.dataset.blockIndex || 0;

                        // Find the first row in this table as a template
                        const table = btn.closest('table');
                        const tbody = table.querySelector('tbody');
                        const firstRow = tbody.querySelector('tr');
                        if (!firstRow) return;

                        const newRow = firstRow.cloneNode(true);
                        // Find last ID from tbody
                        let lastId = 0;
                        tbody.querySelectorAll('tr').forEach(tr => {
                            const firstInput = tr.querySelector('input');
                            if (firstInput && firstInput.dataset.rowId) {
                                lastId = Math.max(lastId, parseInt(firstInput.dataset.rowId, 10) || 0);
                            }
                        });
                        const newId = lastId + 1;

                        // Reset input values and update ids
                        newRow.querySelectorAll('input').forEach((input) => {
                            input.value = '';
                            const idParts = input.id.split('-');
                            if (idParts.length >= 4) {
                                idParts[2] = `${tbody.children.length}`;
                                input.id = idParts.join('-');
                            } else if (idParts.length >= 3) {
                                idParts[1] = `${tbody.children.length}`;
                                input.id = idParts.join('-');
                            }
                            // Store rowId in dataset for tracking
                            input.dataset.rowId = newId;
                        });

                        // Update remove-row-btn dataset
                        const removeBtn = newRow.querySelector('.remove-row-btn');
                        if (removeBtn) {
                            removeBtn.dataset.rowIndex = tbody.children.length;
                        }

                        tbody.appendChild(newRow);
                    });
                });

                // Add column handler
                // document.querySelectorAll('.add-col-btn').forEach((btn) => {
                //     btn.addEventListener('click', () => {
                //         const table = btn.closest('table');
                //         const theadRow = table.querySelector('thead tr');
                //         const tbodyRows = table.querySelectorAll('tbody tr');

                //         // 🔹 1. Create new TH with input for column name
                //         const th = document.createElement('th');
                //         th.style.padding = "5px";
                //         th.style.border = "1px solid #ccc";
                //         th.style.background = "#eee";

                //         const headerInput = document.createElement('input');
                //         headerInput.type = "text";
                //         headerInput.placeholder = "Column name";
                //         headerInput.className = "swal2-input custom-swal-table-input";

                //         th.appendChild(headerInput);

                //         // Insert before last column (remove button column)
                //         theadRow.insertBefore(th, theadRow.lastElementChild);

                //         // 🔹 2. Add blank inputs to each row
                //         tbodyRows.forEach((tr, rowIndex) => {
                //             const td = document.createElement('td');
                //             td.style.padding = "5px";
                //             td.style.border = "1px solid #ccc";

                //             const input = document.createElement('input');
                //             input.type = "text";
                //             input.className = "swal2-input custom-swal-table-input";
                //             input.id = `basic-${rowIndex}-col-${theadRow.children.length - 2}`; // dynamic id
                //             input.dataset.colIndex = headerInput.dataset.colIndex;
                //             input.value = ""; // blank

                //             td.appendChild(input);

                //             // Insert before last cell (remove button column)
                //             tr.insertBefore(td, tr.lastElementChild);
                //         });
                //     });
                // });

                // Add column handler
                document.querySelectorAll('.add-col-btn').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        const table = btn.closest('table');
                        const theadRow = table.querySelector('thead tr');
                        const tbodyRows = table.querySelectorAll('tbody tr');

                        // Create new TH with input for column name
                        const th = document.createElement('th');
                        th.style.padding = "5px";
                        th.style.border = "1px solid #ccc";
                        th.style.background = "#eee";

                        const colIndex = theadRow.children.length - 1; // unique index

                        const headerInput = document.createElement('input');
                        headerInput.type = "text";
                        headerInput.placeholder = "Column name";
                        headerInput.className = "swal2-input custom-swal-table-input";
                        headerInput.dataset.colIndex = colIndex;

                        th.appendChild(headerInput);
                        theadRow.insertBefore(th, theadRow.lastElementChild);

                        // Add blank inputs to each row
                        tbodyRows.forEach((tr, rowIndex) => {
                            const td = document.createElement('td');
                            td.style.padding = "5px";
                            td.style.border = "1px solid #ccc";

                            const input = document.createElement('input');
                            input.type = "text";
                            input.className = "swal2-input custom-swal-table-input";
                            input.id = `basic-${rowIndex}-col-${colIndex}`; // ✅ still unique id
                            input.dataset.colIndex = colIndex; // link with header
                            input.value = "";

                            td.appendChild(input);
                            tr.insertBefore(td, tr.lastElementChild);
                        });
                    });
                });
            },
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('swal-name').value.trim();
                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }

                let basic_data = [];

                if (isProduct && Array.isArray(item.basic_data)) {
                    if (isNewFormat) {
                        basic_data = item.basic_data.map((block, blockIndex) => {
                            const newBlock = {
                                name: block.name,
                                data: []
                            };

                            const rows = document.querySelectorAll(`#tab-${blockIndex} tbody tr`);
                            rows.forEach((row, rowIndex) => {
                                const newRow = { id: rowIndex + 1 }; // auto assign id
                                const inputs = row.querySelectorAll('input');
                                inputs.forEach(input => {
                                    let key = input.id.split('-').pop();

                                    // Use header name if this is dynamic column
                                    if (input.dataset.colIndex) {
                                        const headerInput = document.querySelector(
                                            `thead input[data-col-index="${input.dataset.colIndex}"]`
                                        );
                                        if (headerInput && headerInput.value.trim()) {
                                            key = headerInput.value.trim(); // use actual column name
                                        }
                                    }
                                    if (key && key !== "id") {
                                        const value = input.value.trim();
                                        newRow[key] = value === "" ? "-" : value;
                                    }
                                });

                                newBlock.data.push(newRow);
                            });

                            return newBlock;
                        });
                    } else {
                        basic_data = [];
                        const rows = document.querySelectorAll(`.swal2-table tbody tr`);
                        rows.forEach((row, rowIndex) => {
                            const newRow = { id: rowIndex + 1 }; // auto assign id
                            const inputs = row.querySelectorAll('input');
                            inputs.forEach(input => {
                                let key = input.id.split('-').pop();

                                // Use header name if this is dynamic column
                                if (input.dataset.colIndex) {
                                    const headerInput = document.querySelector(
                                        `thead input[data-col-index="${input.dataset.colIndex}"]`
                                    );
                                    if (headerInput && headerInput.value.trim()) {
                                        key = headerInput.value.trim(); // use actual column name
                                    }
                                }
                                if (key && key !== "id") {
                                    const value = input.value.trim();
                                    newRow[key] = value === "" ? "-" : value;
                                }
                            });

                            basic_data.push(newRow);
                        });
                    }
                }

                const imageFile = isProduct ? document.getElementById('swal-image')?.files[0] : null;

                return { name, imageFile, basic_data };
            },
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: "#13609b",
        });
        if (formValues) {
            try {
                const formData = new FormData();
                formData.append('name', formValues.name);
    
                if (isProduct) {
                    if (formValues.imageFile) {
                        formData.append('image', formValues.imageFile);
                    }
                }

                // console.log("updateItem payload:");
                // for (let [key, value] of formData.entries()) {
                //     console.log(`${key}:`, value , item.id);
                // }

                // API 1:
                const updateResponse = await updateItem(item.id, formData);

                // API 2:
                const basicPayload = { basic_data: formValues.basic_data };
                const detailResponse = await updateItemDetails(item.id, basicPayload);
                // console.log("basicPayload payload:", JSON.stringify(basicPayload, null, 2));
                
                // const response = { status: true };
    
                if (updateResponse.status && detailResponse .status) {
                    toast.success("Item updated successfully");
                    fetchMainCategories();
                } else {
                    toast.error("Failed to update item");
                }
            } catch (error) {
                console.error("Update error:", error);
                toast.error("Error updating item");
            }
        }
    };

    // Handle Delete Items
    const handleDeleteItems = (id) => {
        DeleteConfirmation({
            id,
            apiEndpoint: "/pipes",
            name: "item",
            onSuccess: fetchMainCategories,
        });
    };

    // Handle Product Mark As Favourite
    const handleToggleItemStatus = async (product) => {
        try {
            const updatedStatus = product.marked_as_favorite ? "False" : "True";
            const response = await updateItem(product.id, { marked_as_favorite: updatedStatus });
            if(response.status) {
                toast.success(`Item ${updatedStatus === "True" ? "mark as a favourite" : "unmark from favourite"} successfully!`);
                fetchMainCategories();
            }   
        } catch (error) {
            toast.error("Failed to update item status");
            console.error(error);
        }
    };

    return (
        <CategoryComponent
            navigate={navigate} 
            loading={loading}
            hasFetch={hasFetch}
            mainCategories={currentItems}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            onManageBestSeller={handleManageBestSeller}
            onCategoryEdit={handleEditCategory}
            onItemEdit={handleEditItem}
            onItemToggleSwitch={handleToggleItemStatus}
            onItemDelete={handleDeleteItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTabs={activeTabs}
            setActiveTabs={setActiveTabs}
        />
    );
};

export default CategoryController;
