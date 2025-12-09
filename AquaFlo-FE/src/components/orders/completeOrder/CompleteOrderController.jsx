/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import CompleteOrderComponent from './CompleteOrderComponent';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateOrder } from '../../../apis/PutOrders';
import { postInvoice } from '../../../apis/PostInvoice';
import DeleteConfirmation from '../../common/DeleteConfirmation';

function CompleteOrderController() {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state;
    const order_id = order.id;
    const mode = order?.mode || 'confirm';
    
    const [itemsData, setItemsData] = useState([]);
    const [taxAmount, setTaxAmount] = useState("0");
    const [totalDiscount, setTotalDiscount] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [totalDiscountType, setTotalDiscountType] = useState("%");

    useEffect(() => {
        if (order?.order_items?.length) {
            const initializedItems = order.order_items
                .filter((item) => !item?.message)
                .map((item) => ({
                    item_id : item.item.id,
                    image: item.item.image,
                    name: item.item.name,
                    category: item.item.category,
                    number_of_pic: item.quantity,
                    quantity: item.bag_quantity ?? "",
                    bag_quantity: item.bag_quantity ?? "",
                    large_bag_quantity: item.large_bag_quantity ?? "",
                    packing: item.quantity ?? "",
                    price: item.price?.toString() || "",
                    discount: item.discount_percent?.toString() || "",
                    discountType: item.discount_type || '₹',
                    api_discount: item.discount_percent?.toString() || "",
                    api_discount_type: item.discount_type || '₹',
                    api_quantity: item.quantity,
                    basic_data: item.item.basic_data || {},
                }));
    
            setItemsData(initializedItems);
            setTaxAmount(order.tax_amount?.toString() || '');
            setTotalDiscount(order.total_discount?.toString() || '');
        }
    }, [order, mode]);
    
    //Calculation For Whole Order
    // useEffect(() => {
    //     let computedTotalAmount = 0;
    
    //     itemsData.forEach((item) => {
    //         const price = parseFloat(item.price) || 0;
    //         const quantity = parseInt(item.quantity) || 0;
    //         const discount = parseFloat(item.discount) || 0;
    //         const discountType = item.discountType;
    //         const itemTaxRate = parseFloat(item.tax) || 0;
    
    //         let discountedPrice = price;
    //         if (discountType === '%') {
    //             discountedPrice = price - (price * discount / 100);
    //         } else {
    //             discountedPrice = price - discount;
    //         }
    
    //         // Prevent negative discounted prices
    //         if (discountedPrice < 0) discountedPrice = 0;

    //         const itemTotal = discountedPrice * quantity;
    //         const taxValue = (itemTotal * itemTaxRate) / 100;
    
    //         computedTotalAmount += itemTotal + taxValue;
    //     });
    
    //     // Apply global discount first
    //     const globalDiscount = parseFloat(totalDiscount) || 0;
    //     let appliedGlobalDiscount = 0;
    
    //     if (totalDiscountType === '%') {
    //         appliedGlobalDiscount = (computedTotalAmount * globalDiscount) / 100;
    //     } else {
    //         appliedGlobalDiscount = globalDiscount;
    //     }
    
    //     const amountAfterDiscount = computedTotalAmount - appliedGlobalDiscount;
    
    //     // Apply global tax on the amount after discount
    //     const globalTaxRate = parseFloat(taxAmount) || 0;
    //     const globalTaxValue = (amountAfterDiscount * globalTaxRate) / 100;
    
    //     const computedFinalAmount = amountAfterDiscount + globalTaxValue;
    
    //     setTotalAmount(parseFloat(computedTotalAmount)); // Sum of all item totals (including per-item tax)
    //     setFinalAmount(parseFloat(computedFinalAmount)); // Final amount including global discount & global tax
    // }, [itemsData, taxAmount, totalDiscount, totalDiscountType]);

    useEffect(() => {
        let computedTotalAmount = 0;

        itemsData.forEach((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.number_of_pic) || parseInt(item.bag_quantity) || parseInt(item.large_bag_quantity) || 0;
            const discount = parseFloat(item.discount) || 0;
            const discountType = item.discountType;
            const itemTaxRate = parseFloat(item.tax) || 0;

            // Start with total = price * quantity
            let itemTotal = price * quantity;

            // Apply discount
            if (discountType === '%') {
                itemTotal -= (itemTotal * discount / 100);
            } else {
                itemTotal -= discount; // flat discount on total
            }

            if (itemTotal < 0) itemTotal = 0;

            // Apply per-item tax
            const taxValue = (itemTotal * itemTaxRate) / 100;

            computedTotalAmount += itemTotal + taxValue;
        });

        // Apply global discount
        const globalDiscount = parseFloat(totalDiscount) || 0;
        let appliedGlobalDiscount = 0;

        if (totalDiscountType === '%') {
            appliedGlobalDiscount = (computedTotalAmount * globalDiscount) / 100;
        } else {
            appliedGlobalDiscount = globalDiscount;
        }

        const amountAfterDiscount = computedTotalAmount - appliedGlobalDiscount;

        // Apply global tax
        const globalTaxRate = parseFloat(taxAmount) || 0;
        const globalTaxValue = (amountAfterDiscount * globalTaxRate) / 100;

        const computedFinalAmount = amountAfterDiscount + globalTaxValue;

        setTotalAmount(parseFloat(computedTotalAmount)); // Sum of all item totals
        setFinalAmount(parseFloat(computedFinalAmount)); // Final amount including global discount & tax
    }, [itemsData, taxAmount, totalDiscount, totalDiscountType]);
    
    // const calculateTotal = (price, number_of_pic, bag_quantity, large_bag_quantity, discount, discountType, taxRate = 0) => {
    //     price = parseFloat(price) || 0;
    //     const quantity = parseInt(number_of_pic) || parseInt(bag_quantity) || parseInt(large_bag_quantity) || 0;
    //     discount = parseFloat(discount) || 0;
    //     taxRate = parseFloat(taxRate) || 0;
    
    //     let discountedPrice = price;
    //     if (discountType === '%') {
    //         discountedPrice = price - (price * discount / 100);
    //     } else {
    //         discountedPrice = price - discount;
    //     }
    
    //     // Prevent negative discounted prices
    //     if (discountedPrice < 0) discountedPrice = 0;

    //     const itemTotal = discountedPrice * quantity;
    //     const taxValue = (itemTotal * taxRate) / 100;
    
    //     return parseFloat(itemTotal + taxValue);
    // };
    
    //Calculation For Each Products
    const calculateTotal = (price, number_of_pic, discount, discountType, taxRate = 0) => {
        price = parseFloat(price) || 0;
        const quantity = parseInt(number_of_pic) || 0;
        discount = parseFloat(discount) || 0;
        taxRate = parseFloat(taxRate) || 0;

        let itemTotal = price * quantity;

        // Apply discount
        if (discountType === '%') {
            itemTotal -= (itemTotal * discount / 100);
        } else {
            itemTotal -= discount;  // flat discount on total, not per unit
        }

        if (itemTotal < 0) itemTotal = 0;

        // Apply tax
        const taxValue = (itemTotal * taxRate) / 100;

        return parseFloat(itemTotal + taxValue);
    };
    
    const handleItemChange = (index, field, value) => {
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            const updatedItems = [...itemsData];
            updatedItems[index][field] = value;
            setItemsData(updatedItems);
        }
    };

    const handleDiscountTypeChange = (index, selectedValue) => {
        const updatedItems = [...itemsData];
        updatedItems[index].discountType = selectedValue;
        setItemsData(updatedItems);
    };

    const handleOtherChange = (setter) => (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            setter(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'complete') {
            const missingPrices = itemsData.some(item => !item.price);
            if (missingPrices) {
                toast.error('All item prices are required to complete the order.');
                return;
            }
        }

        const orderPayload = {
            status: 'COMPLETED',
            order_items: itemsData.map(({ 
                name, image, category, item_id, 
                discount, discountType, api_discount, api_discount_type,  
                api_quantity, quantity, large_bag_quantity, packing, number_of_pic, 
                basic_data, ...rest }) => {
                const itemPayload = {
                    item_id: item_id,
                    ...rest,
                };
        
                // Send only if it's available or change
                if (discount !== api_discount) {
                    itemPayload.discount_percent = discount;
                    itemPayload.discount_type = discountType;
                }
                if (discountType !== api_discount_type) {
                    itemPayload.discount_type = discountType;
                    itemPayload.discount_percent = discount;
                }
                if (api_quantity) {
                    itemPayload.quantity = api_quantity;
                }

                if (basic_data?.id) {
                    itemPayload.basic_data_id = parseInt(basic_data.id);
                }
    
                return itemPayload;
            }),
        };

        const invoicePayload = {
            order: order.id,
            tax_percentage: taxAmount || "0",
            tax_amount: "0",
            discount: totalDiscount || "0",
            discount_type: totalDiscountType,
        };

        try {
            // 1. Update order
            const orderResponse = await updateOrder(order.id, orderPayload);
            
            // console.log("orderPayload", orderPayload);
            // console.log("invoicePayload", invoicePayload);
            if (orderResponse?.status === true) {
                let invoiceResponse;

                // 2. Create or Update Invoice based on mode
                if (mode === 'confirm') {
                    invoiceResponse = await postInvoice(invoicePayload);
                } else if (mode === 'complete') {
                    // invoiceResponse = await updateInvoice(invoiceNumber, invoicePayload);
                    return null;
                }
    
                if (invoiceResponse?.status === true) {
                    toast.success(`Order ${mode === 'complete' ? '' : 'completed'} successfully!`);
                    navigate('/orders');
                } else {
                    toast.error('Failed to update order.');
                }
            } else {
                toast.error('Order update failed.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong while processing your request.');
        }
    };

    // Handle Cancel Product
    const handleCancelProduct = (orderId, ItemId, basicDataId) => {

        const payload = {
            old_order: String(order_id), 
            item_id: String(ItemId),
            basic_data_id: basicDataId,
        };

        DeleteConfirmation({
            id: orderId,
            apiEndpoint: "/order-split",
            name: "product",
            method: "POST",
            payload,
            onSuccess: () => {
                setItemsData(prevItems =>
                    prevItems.filter(item =>
                        !(item.item_id === ItemId && item.basic_data.id === basicDataId)
                    )
                );
            },
        });
    };

    //Discount Type Option
    const discountTypeOptions  = [
        { id: "₹", name: "₹" },
        { id: "%", name: "%" },
    ];

    //Tax Option
    const taxOptions  = [
        { id: "0", name: "0%" },
        { id: "9", name: "9%" },
        { id: "18", name: "18%" },
    ];

    return (
        <CompleteOrderComponent 
            navigate={navigate}
            itemsData={itemsData}
            taxAmount={taxAmount}
            setTaxAmount={setTaxAmount}
            totalDiscount={totalDiscount}
            setTotalDiscount={setTotalDiscount}
            totalDiscountType={totalDiscountType}
            setTotalDiscountType={setTotalDiscountType}
            handleItemChange={handleItemChange}
            calculateTotal={calculateTotal}
            handleDiscountTypeChange={handleDiscountTypeChange}
            handleOtherChange={handleOtherChange}
            handleSubmit={handleSubmit}
            totalAmount={totalAmount}
            finalAmount={finalAmount}
            order_id={order_id}
            discountTypeOptions={discountTypeOptions} 
            taxOptions={taxOptions}
            onHandleCancelProduct={handleCancelProduct}
        />
    );
};

export default CompleteOrderController;