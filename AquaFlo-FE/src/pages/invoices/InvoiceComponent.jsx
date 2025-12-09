import React from 'react';
import { IoIosWarning } from 'react-icons/io';
import Loader from '../../components/common/Loader';

function InvoiceComponent({ loading, invoices }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">List of Invoices</h2>
            </div>

            {loading ? (
                <Loader message="Loading Invocies..." />
            ) : invoices.length === 0 ? (
                <div className="flex justify-center items-center gap-2 text-yellow-500 p-4 border border-gray-300 rounded-md">
                    <IoIosWarning size={30}/>
                    <p className="text-center text-red-500 text-xl font-semibold py-4">No Invoices Available!</p>
                    <IoIosWarning size={30}/>   
                </div>
            ) : ( 
                invoices.map((invoice) => {
                    const {
                        invoice_number, order, tax_amount,
                        discount, issue_date, due_date, final_amount, total_amount
                    } = invoice;
    
                    const issuedDate = new Date(issue_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
    
                    const dueDateFormatted = due_date
                        ? new Date(due_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          })
                        : 'N/A';
    
                    return (
                        <div
                            key={invoice_number}
                            className="p-6 mb-6 bg-white rounded-lg border border-gray-300"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold">Invoice</h1>
                                    <p className="text-gray-600">Invoice Number #INV-{invoice_number.toString().padStart(6, '0')}</p>
                                </div>
                                {/* <div className="bg-gray-100 p-4 rounded-full">
                                    <div className="grid grid-cols-2 gap-1 w-10 h-10">
                                        <div className="bg-teal-600 rounded" />
                                        <div className="bg-teal-600 rounded" />
                                        <div className="bg-teal-600 rounded" />
                                        <div className="bg-teal-600 rounded" />
                                    </div>
                                </div> */}
                            </div>
    
                            {/* User Details & Shipping Adress */}
                            <div className="grid grid-cols-3 gap-60 mb-6 text-gray-800">
                                <div className="owner-details"> 
                                    <p className="font-semibold">Billed By:</p>
                                    <p className="font-bold">Abc Sales</p>
                                    <p>250, Platinum Point</p>
                                    <p>Surat, Gujarat - 395004</p>
                                </div>

                                <div className="user-details">
                                    <p className="font-semibold">Billed To:</p>
                                    <p className="font-bold">{order.user.first_name} {order.user.last_name}</p>
                                    <p>{order.user.email}</p>
                                    <p>{order.user.phone_number}</p>
                                </div>

                                <div className="shipping-details"> 
                                    <p className="font-semibold">Ship To:</p>
                                    <p className="font-bold">{order.user.first_name} {order.user.last_name}</p>
                                    <p>{order.address.street}</p>
                                    <p>{order.address.city}, {order.address.state}, {order.address.zip}</p>
                                </div>
                            </div>
    
                            {/* Issued & Due Date  */}
                            <div className="w-[75%] grid grid-cols-2 gap-8 mb-4 text-gray-800">
                                <div>
                                    <p className="font-bold">Date Issued:</p>
                                    <p className="font-medium">{issuedDate}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Due Date:</p>
                                    <p className="font-medium">{dueDateFormatted}</p>
                                </div>
                            </div>
                            
                            {/* Product Table */}
                            <div className="product-details">
                                <h2 className="text-lg font-semibold mb-1">Invoice Details</h2>
                                <div className="w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-100">
                                            <tr className="text-center">
                                                <th className="w-1/4 p-2">Item</th>
                                                <th className="w-1/6 p-2">Quantity</th>
                                                <th className="w-1/6 p-2">Unit Price</th>
                                                <th className="w-1/6 p-2">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.order_items.map((item, idx) => {
                                                const total =
                                                    item.discount_type === 'percentage'
                                                        ? item.quantity * item.price * (1 - item.per_item_discount / 100)
                                                        : item.quantity * (item.price - item.per_item_discount);
    
                                                return (
                                                    <tr key={idx} className="border-t border-gray-200">
                                                        <td className="w-1/4 p-2 text-center">
                                                            <div className="flex items-center gap-3">
                                                                {
                                                                    <img
                                                                        src={item.item.image}
                                                                        alt={item.item.name}
                                                                        className="w-8 h-8 object-cover rounded"
                                                                    />
                                                                }
                                                                {item.item.name}
                                                            </div>
                                                        </td>
                                                        <td className="w-1/6 p-2 text-center">{item.quantity}</td>
                                                        <td className="w-1/6 p-2 text-center">₹{Number(item.price).toLocaleString()}</td>
                                                        <td className="w-1/6 p-2 text-right font-bold">₹{total.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
    
                                    <div className="mt-3 flex justify-end">
                                        <table className="w-64 font-bold">
                                            <tbody>
                                                <tr>
                                                    <td className="py-1 text-gray-600">Subtotal</td>
                                                    <td className="pr-2 text-right">₹{total_amount.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-gray-600">Tax</td>
                                                    <td className="pr-2 text-right">₹{Number(tax_amount).toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 text-gray-600">Discount</td>
                                                    <td className="pr-2 text-right">₹{Number(discount).toLocaleString()}</td>
                                                </tr>
                                                <tr className="border-t border-gray-300">
                                                    <td className="py-2">Grand Total</td>
                                                    <td className="pr-2 text-right">₹{final_amount.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default InvoiceComponent;
