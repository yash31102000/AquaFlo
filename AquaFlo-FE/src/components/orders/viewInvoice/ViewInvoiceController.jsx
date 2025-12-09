/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import ViewInvoiceComponent from './ViewInvoiceComponent';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSingleInvoice } from '../../../apis/FetchInvoice';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../../pdf/InvoicePDF';

function ViewInvoiceController() {
    const { id } = useParams();
    const hasFetched = useRef(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [singleInvoice, setSingleInvoice] = useState([]);

    const fetchSingleInvoice = async () => {
        try {
            const response = await getSingleInvoice(id);
            if (response.status) {
                setSingleInvoice(response.data.data[0]);
            } else {
                toast.error("Failed to fetch invoice");
            }
        } catch (error) {
            toast.error("Error fetching orders");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(!hasFetched.current) {
            fetchSingleInvoice();
            hasFetched.current = true;
        }
    }, []);

    const openPdfPreview = ( excludeFinancials = false ) => {
        pdf(<InvoicePDF invoice={singleInvoice} hideFinancials={excludeFinancials} />)
            .toBlob()
            .then((blob) => {
                const url = URL.createObjectURL(blob); 
                const invoiceNumber = singleInvoice?.invoice_number || 'default-invoice-number';
    
                // Open the PDF in a new tab
                const newTab = window.open();
                newTab.document.title = `Invoice_INV-${invoiceNumber.toString().padStart(6, '0')}`;
                newTab.document.body.innerHTML = `
                    <div style="position: absolute; top: 15px; right: 30px; z-index: 10; display: flex; gap: 10px;">
                        <button id="downloadBtn" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                            Download PDF
                        </button>
                        <button id="printBtn" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                            Print PDF
                        </button>
                    </div>

                    <iframe
                        src="${url}"
                        width="100%"
                        height="100%"
                        style="border: none;"
                    />
                `;
    
                // Download button functionality
                newTab.document.getElementById('downloadBtn').addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Invoice_INV-${invoiceNumber.toString().padStart(6, '0')}.pdf`;  // Set custom file name
                    link.click();
                });
    
                // Print button functionality
                newTab.document.getElementById('printBtn').addEventListener('click', () => {
                    const iframe = newTab.document.querySelector('iframe');
                    iframe.contentWindow.print();
                });
            }
        );
    };
    
    return (
        <ViewInvoiceComponent 
            navigate={navigate}
            loading={loading}
            singleInvoice={singleInvoice}
            onPdfPreview={openPdfPreview}
        />
    );
};

export default ViewInvoiceController;
