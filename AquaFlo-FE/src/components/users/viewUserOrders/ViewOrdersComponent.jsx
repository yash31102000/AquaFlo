import React from 'react';
import Loader from '../../common/Loader';
import { MdLocationPin } from 'react-icons/md';
import BaseImage from '../../common/BaseImage';

function ViewOrdersComponent({ navigate, loading, singleOrder, getStatusColor }) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex items-center justify-between">
                <button 
                    type="button" 
                    className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
            <h2 className="text-2xl font-bold mb-4">{singleOrder?.[0]?.user_data?.first_name} {singleOrder?.[0]?.user_data?.last_name} Order</h2>

            {loading ? (
                <Loader message="Loading user order details..." />
            ) : singleOrder.length > 0 ? (
                singleOrder.map((order, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start">
                            <div className="text-red-600 font-semibold">
                                <h4 className={order.cancellation_reason ? '' : 'hidden'}>Cancellation Reason: <span>{order.cancellation_reason || "No reason provided"}</span></h4>  
                            </div>

                            <span className={`px-2 py-1 rounded-md text-base ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="mb-2">
                            <h3 className="font-semibold mb-1">Shipping Address:</h3>
                            <p className="flex flex-wrap items-center gap-1 font-medium">
                                <MdLocationPin className="hidden sm:block" />{order.address.company_name}, {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zip} {}
                                (
                                    <a 
                                        href={order.address_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-500"
                                    >
                                        View on Map
                                    </a>
                                )
                            </p>
                        </div>

                        <div className="mb-2">
                            <h3 className="font-semibold mb-1">GST Number:</h3>
                            <p className="font-semibold">{order.address.GST_Number}</p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-1">Items:</h3>
                            <div className="flex flex-col gap-2">
                                {order.order_items.map((itemData, i) => (
                                    <div key={i} className="flex items-center gap-3 border border-gray-300 p-2 rounded-md">
                                        <BaseImage 
                                            src={itemData.item.image} 
                                            alt={itemData.item.name} 
                                            className="w-12 h-12 object-cover rounded" 
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{itemData.item.name}</p>
                                            <p className="text-gray-600 font-semibold">Quantity: {itemData.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No order data available.</p>
            )}
        </div>
    );
};

export default ViewOrdersComponent;
