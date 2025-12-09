/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import ViewOrdersComponent from './ViewOrdersComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { getSingleOrder } from '../../../apis/FetchOrders';
import toast from 'react-hot-toast';

function ViewOrdersController() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [singleOrder, setSingleOrder] = useState([]);

    const fetchSingleOrder = async () => {
        try {
            const response = await getSingleOrder(id);
            if (response.data.status) {
                setSingleOrder(response.data.data);
            } else {
                toast.error("Failed to fetch orders");
            }
        } catch (error) {
            toast.error("Error fetching orders");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(id) {
            fetchSingleOrder();
        }
    }, [id]);
    
    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRM":
                return "bg-green-200 text-green-700";
            case "COMPLETED":
                return "bg-green-200 text-green-700";
            case "CANCEL":
                return "bg-red-200 text-red-700";
            default:
                return "bg-yellow-200 text-yellow-700";
        }
    };

    return (
        <ViewOrdersComponent 
            navigate={navigate}
            loading={loading}
            singleOrder={singleOrder}
            getStatusColor={getStatusColor}
        />
    );
};

export default ViewOrdersController;
