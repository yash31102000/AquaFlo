import Loader from '../../common/Loader';
import { PDFDownloadLink, PDFViewer  } from '@react-pdf/renderer';
import InvoicePDF from '../../pdf/InvoicePDF';
import InvoiceTable from '../invoiceTable/InvoiceTable';
import { FiDownload } from 'react-icons/fi';
import { VscPreview } from 'react-icons/vsc';

function ViewInvoiceComponent( { navigate, loading, singleInvoice, onPdfPreview }) {
    const { invoice_number, order = {}, issue_date } = singleInvoice || {};

    const date = new Date(issue_date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const issuedDate = `${day}/${month}/${year}`;

    // const dueDateFormatted = due_date
    //     ? new Date(due_date).toLocaleDateString('en-US', {
    //           year: 'numeric',
    //           month: 'long',
    //           day: 'numeric',
    //       })
    //     : 'N/A';
    const user = order.user || {};
    const address = order.address || {};

    const orderItems = order?.order_items || [];

    //Filter items with category containing "pipes" and "watr tank"
    const pipesItems = orderItems.filter(item =>
        item.item?.category?.toLowerCase().includes("pipes") ||
        item.item?.category?.toLowerCase().includes("watr tank")
    );

    //Remaining items
    const fittingsItems = orderItems.filter(item =>
        !item.item?.category?.toLowerCase().includes("pipes") &&
        !item.item?.category?.toLowerCase().includes("watr tank")
    );

    //Group the product with same name
    const groupByProductName = (items) => {
        const groups = {};
        items.forEach((item) => {
            const name = item.item?.name || 'Unnamed';
            if (!groups[name]) groups[name] = [];
            groups[name].push(item);
        });
        return groups;
    };

    const groupedPipes = groupByProductName(pipesItems);
    const groupedOthers = groupByProductName(fittingsItems);

    //Heading For different categories
    const categories = orderItems.map(item => item?.item?.category?.split('➤')[0].trim().toLowerCase()).filter(Boolean);
    const hasPipes = categories.includes("pipes");
    const hasTank = categories.includes("watr tank");

    let heading = '';
    if (hasPipes && hasTank) {
        heading = 'Pipes & Tank Items';
    } else if (hasPipes) {
        heading = 'Pipe Items';
    } else {
        heading = 'Tank Items';
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex items-center justify-between mb-2">
                <button 
                    type="button" 
                    className="px-4 py-2 font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>

                {/* Responsive buttons */}
                <div className="flex gap-2">
                    {/* For medium and larger devices: show full text buttons */}
                    <div className="hidden sm:flex gap-2">
                        <PDFDownloadLink
                            document={<InvoicePDF invoice={singleInvoice} />}
                            fileName={`Invoice_INV-${singleInvoice?.invoice_number?.toString().padStart(6, '0')}.pdf`}
                            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                            Download PDF
                        </PDFDownloadLink>

                        <button
                            onClick={() => onPdfPreview(false)}
                            className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer"
                        >
                            Preview PDF
                        </button>
                    </div>

                    {/* For small devices: show icon buttons only */}
                    <div className="flex sm:hidden gap-2">
                        <PDFDownloadLink
                            document={<InvoicePDF invoice={singleInvoice} />}
                            fileName={`Invoice_INV-${singleInvoice?.invoice_number?.toString().padStart(6, '0')}.pdf`}
                            className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            <FiDownload size={20} />
                        </PDFDownloadLink>

                        <button
                            onClick={() => onPdfPreview(false)}
                            className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                            <VscPreview size={20} />
                        </button>
                    </div>
                </div>   
            </div>

            {loading ? (
                <Loader message="Loading Invocies..." />
            )  : (
                <div className="mb-4 bg-white rounded-md border border-black text-sm">
                    <div className="p-3 pb-0 border-b border-black">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-lg font-bold">
                                Invoice-{invoice_number?.toString().padStart(6, '0')}
                            </h1>
                            <div className="flex gap-1">
                                <p className="font-semibold">Date:</p>
                                <p className="font-medium">{issuedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-start justify-between mb-1">
                            <div className="flex gap-0.5 text-gray-800">
                                <p className="text-sm font-bold">Billed To:</p>
                                <p className="text-sm font-medium">
                                    {user.first_name} {user.last_name} ({user.phone_number})
                                </p>
                                <p className="text-sm font-medium">{address.street}</p>
                                <p className="text-sm font-medium">
                                    {address.city}, {address.state}, {address.zip}
                                </p>
                            </div>
                            <div className="w-[10%] h-10 border border-black" />
                        </div>
                    </div>

                    <div className="product-details p-3 pt-1">
                        <div className="w-full overflow-x-auto">
                            {pipesItems.length > 0 && (
                                <InvoiceTable
                                    title={fittingsItems.length > 0 ? heading : ""}
                                    groupedItems={groupedPipes}
                                    type="pipes"
                                />
                            )}

                            {fittingsItems.length > 0 && (
                                <InvoiceTable
                                    title={pipesItems.length > 0 ? "Fittings Items" : ""}
                                    groupedItems={groupedOthers}
                                    type="fittings"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* {!loading && (
            <div className="w-full h-[90vh] mt-10 border rounded-xl overflow-hidden">
                <PDFViewer width="100%" height="100%">
                    <InvoicePDF invoice={singleInvoice} />
                </PDFViewer>
            </div>
            )} */}
        </div>
    );
};

export default ViewInvoiceComponent;