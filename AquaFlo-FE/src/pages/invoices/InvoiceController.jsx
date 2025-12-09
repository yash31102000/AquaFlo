import React, { useEffect, useRef, useState } from 'react';
import InvoiceComponent from './InvoiceComponent';
import toast from 'react-hot-toast';
import { getInvoices } from '../../apis/FetchInvoice';

function InvoiceController() {
     const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);

    const fetchInvoices = async () => {
        try {
            const response = await getInvoices();
            if (response) {
                setInvoices(response);
            } else {
                toast.error("Failed to fetch orders");
                setInvoices([]);
            }
        } catch (error) {
            toast.error("Error fetching orders");
            console.error("API Error:", error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchInvoices();
            hasFetched.current = true;
        }
    }, []);

    return (
        <InvoiceComponent 
            loading={loading}
            invoices={invoices}
        />
    );
};

export default InvoiceController;
