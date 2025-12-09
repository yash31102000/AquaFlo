import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ViewAddressComponent from './ViewAddressComponent';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { addAddress } from '../../../apis/PostAddress';

function ViewAddressController() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { addresses: initialAddresses = [], name = "User", user_id } = state || {};
    const [addresses, setAddresses] = useState(initialAddresses);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedAddress, setEditedAddress] = useState({});

    const handleEditClick = (index, address) => {
        if (editingIndex === index) {
            setEditingIndex(null);
        } else {
            setEditingIndex(index);
            setEditedAddress(address);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('zip')) {
            // Allow only digits and max 6 characters
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setEditedAddress((prev) => ({ ...prev, zip: numericValue }));
        } else {
            setEditedAddress((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddAddress = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Address',
            html:
                '<label class="custom-swal-label">Company Name</label>' +
                '<input id="swal-company" class="swal2-input custom-swal-input" placeholder="Enter Company Name">' +
                '<label class="custom-swal-label">GST Number</label>' +
                '<input id="swal-gst" class="swal2-input custom-swal-input" placeholder="Enter GST Number">' +
                '<label class="custom-swal-label">Street</label>' +
                '<input id="swal-street" class="swal2-input custom-swal-input" placeholder="Enter Street">' +
                '<label class="custom-swal-label">City</label>' +
                '<input id="swal-city" class="swal2-input custom-swal-input" placeholder="Enter City">' +
                '<label class="custom-swal-label">State</label>' +
                '<input id="swal-state" class="swal2-input custom-swal-input" placeholder="Enter State">' +
                '<label class="custom-swal-label">Pin Code</label>' +
                '<input id="swal-zip" class="swal2-input custom-swal-input" placeholder="Enter Pin Code" oninput="this.value=this.value.replace(/[^0-9]/g, \'\').slice(0,6)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            confirmButtonColor: "#13609b",
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const zip = document.getElementById('swal-zip').value;
                if (!/^\d{6}$/.test(zip)) {
                    Swal.showValidationMessage("Pin Code must be 6 digits!");
                    return false;
                }
    
                return {
                    company_name: document.getElementById('swal-company').value,
                    GST_Number: document.getElementById('swal-gst').value,
                    street: document.getElementById('swal-street').value,
                    city: document.getElementById('swal-city').value,
                    state: document.getElementById('swal-state').value,
                    zip,
                };
            }
        });
    
        if (formValues) {
            const newAddressList = [...addresses, formValues];
            setAddresses(newAddressList);
    
            const addPayload = {
                user_id: user_id,
                addresses: newAddressList
            };

            const response = await addAddress(addPayload);
            if(response.data.status) {
                toast.success(response.data.message);
            }
            // console.log("New address added:", addPayload);
        }
    };

    const handleSave = async  (index) => {
        const updatedAddresses = [...addresses];
        updatedAddresses[index] = editedAddress;

        setAddresses(updatedAddresses); // Update state
        setEditingIndex(null);

        const payload = {
            user_id: user_id,
            addresses: updatedAddresses.map((addr) => ({
                company_name: addr.company_name,
                GST_Number: addr.GST_Number,
                street: addr.street,
                city: addr.city,
                state: addr.state,
                zip: addr.zip
            }))
        };

        try {
            const response = await addAddress(payload);
            if (response.data.status) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message || "Failed to update address");
            }
        } catch (error) {
            toast.error("Error  updating address");
            console.error("API Error:", error);
        }
        // console.log("Payload to send:", payload);
    };

    return (
        <ViewAddressComponent
            navigate={navigate} 
            addresses={addresses}
            name={name}
            editingIndex={editingIndex}
            editedAddress={editedAddress}
            onAddAddress={handleAddAddress}
            onEditClick={handleEditClick}
            onInputChange={handleInputChange}
            onSave={handleSave}
        />
    );
};

export default ViewAddressController;
