import React, { useState } from 'react';
import EditUsersComponent from './EditUsersComponent';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateUser } from '../../apis/PutUsers';

function EditUsersController() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state;
    const [editUser, setEditUser] = useState(user);

    // Handle input change for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle address input change
    const handleAddressChange = (e, index) => {
        const { name, value } = e.target;
        const updatedAddresses = [...editUser.addresses];
        updatedAddresses[index] = {
            ...updatedAddresses[index],
            [name]: value,
        };
        setEditUser((prev) => ({
            ...prev,
            addresses: updatedAddresses,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate phone number
        if (!/^\d{10}$/.test(editUser.phone_number)) {
            return toast.error("Phone number must be 10 digits.");
        }

        // Validate zip codes
        for (let address of editUser.addresses) {
            if (!/^\d{6}$/.test(address.zip)) {
                return toast.error("Zip code must be 6 digits.");
            }
        }

        const { id, ...payload } = editUser;
        try {
            const response = await updateUser(id, payload);
            if(response.status) {
                toast.success(response.message);
                navigate(-1);
            }  else {
                toast.error(response.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update user.");
        }
    };

    return (
        <EditUsersComponent
            navigate={navigate} 
            editUser={editUser}
            onInputChange={handleInputChange}
            onAddressChange={handleAddressChange}
            onSubmit={handleSubmit}
        />
    );
};

export default EditUsersController;
