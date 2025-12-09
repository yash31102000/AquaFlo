import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Input from '../../common/formInputs/Input';

function AddUserComponent({ navigate, form, showPassword, errors, onShowPassword, onInputChange, onAddressChange, onSubmit }) {
    const address = form.addresses[0];
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <button 
                type="button" 
                className="px-4 py-2 mb-[10px] font-medium bg-gray-300 border border-gray-300 rounded-md cursor-pointer"
                onClick={() => navigate(-1)}
            >
                Back
            </button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Add New User</h2>
            </div>

            <form onSubmit={onSubmit}>
                <Input 
                    label="First Name:"
                    type="text"
                    placeholder={errors.first_name ? errors.first_name : "Enter Your First Name"}  
                    name="first_name"
                    value={form.first_name}
                    className={
                        `w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                        ${errors.first_name ? "border-red-500 placeholder-red-500" : "border-gray-300"}`
                    }
                    onChange={onInputChange} 
                />

                <Input 
                    label="Last Name:"
                    type="text" 
                    placeholder="Enter Your Last Name"  
                    name="last_name"
                    value={form.last_name}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onInputChange} 
                />

                <Input 
                    label="Phone Number:"
                    type="text" 
                    placeholder={errors.phone_number ? errors.phone_number : "Enter Your Phone Number"}   
                    name="phone_number"
                    value={form.phone_number}
                    className={
                        `w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                        ${errors.phone_number ? "border-red-500 placeholder-red-500" : "border-gray-300"}`
                    }
                    onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length > 10) value = value.slice(0, 10);
                        onInputChange({ target: { name: "phone_number", value } });
                    }}
                />

                <Input 
                    label="Email Address:"
                    type="text" 
                    placeholder={`Enter Email Address`}  
                    name="email"
                    value={form.email}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onInputChange} 
                />

                {/* <Input 
                    label="Password:"
                    type="text" 
                    placeholder={errors.password ? errors.password : "Enter Your Password"}  
                    name="password"
                    value={form.password}
                    className={
                        `w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                        ${errors.password ? "border-red-500 placeholder-red-500" : "border-gray-300"}`
                    }
                    onChange={onInputChange} 
                /> */}

                <div className="relative">
                    <Input
                        label="Password:"
                        type={showPassword ? "text" : "password"} 
                        placeholder={errors.password ? errors.password : "Enter Your Password"}  
                        name="password"
                        value={form.password}
                        className={`w-full p-2 pr-10 border rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                        ${errors.password ? "border-red-500 placeholder-red-500" : "border-gray-300"}`}
                        onChange={onInputChange} 
                    />
                    <button
                        type="button"
                        onClick={onShowPassword}
                        className="absolute top-11 right-3 text-xl text-gray-600 focus:outline-none"
                    >
                        { showPassword ? <FaEyeSlash /> : <FaEye /> }
                    </button>
                </div>

                {/* Addresses Section */} 
                <h4 className="text-lg font-semibold mt-2">Address (optional)</h4>
                <Input 
                    label="Company Name:"
                    type="text" 
                    placeholder="Enter Your Company Name"
                    name={`company_name`}
                    value={address.company_name}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onAddressChange}
                />

                <Input 
                    label="GST Number:"
                    type="text" 
                    placeholder="Enter Your GST Number"
                    name={`GST_Number`}
                    value={address.GST_Number}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onAddressChange}
                />

                <Input 
                    label="Street:"
                    type="text" 
                    placeholder="Enter Your Street"
                    name={`street`}
                    value={address.street}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onAddressChange}
                />

                <Input 
                    label="City:"
                    type="text" 
                    placeholder="Enter Your City"
                    name={`city`}
                    value={address.city}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onAddressChange}
                />

                <Input 
                    label="State:"
                    type="text" 
                    placeholder="Enter Your State"
                    name={`state`}
                    value={address.state}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                    onChange={onAddressChange}
                />

                <Input 
                    label="Pin Code:"
                    type="text" 
                    placeholder={errors.zip ? errors.zip : "Enter Your Pin Code"}  
                    name="zip"
                    value={address.zip}
                    className={
                        `w-full p-2 border rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] 
                        ${errors.zip ? "border-red-500 placeholder-red-500" : "border-gray-300"}`
                    }
                    onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length > 6) value = value.slice(0, 6);
                        onAddressChange({ target: { name: "zip", value }});
                    }}
                />

                <div className="flex items-center justify-center mt-3">
                    <button
                        type="submit"
                        className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUserComponent;
