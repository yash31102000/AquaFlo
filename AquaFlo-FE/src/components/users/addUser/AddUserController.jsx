import { useState } from 'react';
import AddUserComponent from './AddUserComponent';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addUser } from '../../../apis/PostUser';

function AddUserController() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        addresses: [{
            company_name: "",
            GST_Number: "",
            street: "",
            city: "",
            state: "",
            zip: ""
        }]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const togglePassword = () => setShowPassword(prev => !prev);
    
    const onInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }
    };
    
    const onAddressChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            addresses: [{ ...prev.addresses[0], [name]: value }]
        }));
    };
    
    const validateForm = () => {
        let newErrors = {};
        const { first_name, phone_number, password, addresses } = form;
        if (!first_name.trim()) newErrors.first_name = "First name is required";
        if (!phone_number.trim()) {
                newErrors.phone_number = "Mobile number is required";
        } else {
            const numericOnly = phone_number.replace(/[^0-9]/g, "");
            if (numericOnly.length < 10) {
                toast.error("Mobile number must have at least 10 digits");
            }
        }
        if (!password.trim()) newErrors.password = "Password is required";
        if (addresses.length > 0 && addresses[0].zip && !/^\d{6}$/.test(addresses[0].zip)) {
            toast.error("Pin code must be 6 digits");
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            ...form,
            addresses: form.addresses.some(addr => Object.values(addr).some(v => v !== ""))
            ? form.addresses
            : []
        };

        // console.log("payload", payload);

        try {
            const response = await addUser(payload);
            if(response.data.status) {
                toast.success(response.data.message);
                navigate(-1);

                //Send Whatsapp Message From API Response
                const mobileNumber = form.phone_number?.replace(/\D/g, "");
                const whatsAppMessage = response.data.data.whatsappmessage;
                if (mobileNumber && mobileNumber.length >= 10) {
                    const fullNumber = mobileNumber.startsWith("91") ? mobileNumber : `91${mobileNumber}`;
                    const encodedMessage = encodeURIComponent(whatsAppMessage);
                    const whatsappUrl = `https://web.whatsapp.com/send?phone=${fullNumber}&text=${encodedMessage}`;
                    
                    //Open Whatsapp In New Tab
                    window.open(whatsappUrl, "_blank");
                }

            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            if (error.response?.data) {
                const errData = error.response.data;

                // Handle specific field errors
                if (typeof errData === "object") {
                    const errorMessages = Object.entries(errData)
                        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                        .join("\n");

                    toast.error(errorMessages);
                } else {
                    toast.error("Something went wrong");
                }
            } else {
                toast.error("Failed to add user");
            }
            console.log("API Error:", error);
        }
    };
    
    return (
        <AddUserComponent 
            navigate={navigate}
            form={form}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errors={errors}
            onShowPassword={togglePassword}
            onInputChange={onInputChange}
            onAddressChange={onAddressChange}
            onSubmit={handleSubmit}
        />
    );
};

export default AddUserController;
