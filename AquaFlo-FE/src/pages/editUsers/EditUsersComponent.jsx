import React from 'react';
import Input from '../../components/common/formInputs/Input';

function EditUsersComponent({ navigate, editUser,  onInputChange, onSubmit }) {
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
                <h2 className="text-2xl font-semibold">Edit Users</h2>
            </div>

            {editUser ? (
                <div>
                    <Input 
                        label="First Name:"
                        type="text" 
                        placeholder="Enter First Name"  
                        name="first_name"
                        value={editUser.first_name}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={onInputChange} 
                    />

                    <Input 
                        label="Last Name:"
                        type="text" 
                        placeholder="Enter Last Name"  
                        name="last_name"
                        value={editUser.last_name}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={onInputChange} 
                    />

                    <Input 
                        label="Phone Number:"
                        type="text" 
                        placeholder="Enter Phone Number"  
                        name="phone_number"
                        value={editUser.phone_number}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9]/g, "");
                            if (value.length > 10) value = value.slice(0, 10);
                            onInputChange({ target: { name: "phone_number", value } });
                        }}
                    />

                    <Input 
                        label="Email Address:"
                        type="text" 
                        placeholder={`${editUser.email ?"Enter Email Address": "No Email Address Available"}`}  
                        name="email"
                        value={editUser.email || ""}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                        onChange={onInputChange} 
                    />
                </div>
            ) : (
                <p>No user data found!</p>
            )}
            <div className="flex items-center justify-center mt-4">
                <button 
                    type="button"
                    className="px-4 py-2 custom-gradient text-black font-medium rounded-md cursor-pointer"
                    onClick={onSubmit}
                >
                    Update User
                </button>
            </div>
        </div>
    );
};

export default EditUsersComponent;
