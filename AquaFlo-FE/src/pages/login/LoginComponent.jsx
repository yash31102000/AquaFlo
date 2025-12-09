import { RiUser3Fill } from 'react-icons/ri';
import Loader from '../../components/common/Loader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import BaseImage from '../../components/common/BaseImage';

function LoginComponent({credentials, loading, showPassword, errors, onShowPassword, handleInputChange, handleSubmit}) {
        return (
                <div className="flex items-center justify-center min-h-screen bg-[#f0f8ff]">
                        {loading ? (
                                <Loader message="Signing in..." />
                        ) : (
                                <div className="bg-white p-10 rounded-lg shadow-lg w-96 min-h-[500px] flex flex-col justify-center">
                                        <div className="flex justify-center mb-6">
                                                <BaseImage src="/logo.png" alt="Logo" className="h-20" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
                                
                                        <form onSubmit={handleSubmit}>
                                                {/* User name Field */}
                                                <div className="mb-4">
                                                        <label className="block text-gray-900 font-bold mb-1">
                                                                Username
                                                        </label>
                                                        <div 
                                                                className={`flex items-center border rounded-md focus-within:border-[#13609b] p-3 bg-gray-50 
                                                                        ${errors.phone_number ? "border-red-500 placeholder-red-500" : "border-gray-300"}`}
                                                        >
                                                                <input
                                                                        name="phone_number"
                                                                        type="text"
                                                                        placeholder={errors.phone_number ? errors.phone_number : "Enter your user name"}  
                                                                        value={credentials.phone_number}
                                                                        onChange={handleInputChange} 
                                                                        className={`w-full bg-transparent outline-none ${errors.phone_number ? "placeholder-red-500" : ""}`}
                                                                />
                                                                <RiUser3Fill className="text-gray-400" />
                                                        </div>
                                                </div>
                                        
                                                {/* Password Field */}
                                                <div className="mb-6">
                                                        <label className="block text-gray-900 font-bold mb-1">
                                                                Password
                                                        </label>
                                                        <div 
                                                                className={`flex items-center border rounded-md focus-within:border-[#13609b] p-3 bg-gray-50 
                                                                        ${errors.password ? "border-red-500 placeholder-red-500" : "border-gray-300"}`}
                                                        >
                                                                <input
                                                                        name="password"
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder={errors.password ? errors.password : "Enter your password"}  
                                                                        value={credentials.password}
                                                                        onChange={handleInputChange} 
                                                                        className={`w-full bg-transparent outline-none  ${errors.password ? "placeholder-red-500" : ""}`}
                                                                />
                                                                <button
                                                                        type="button"
                                                                        onClick={onShowPassword}
                                                                        className="focus:outline-none text-xl text-gray-400"
                                                                >
                                                                        { showPassword ? <FaEyeSlash /> : <FaEye /> }
                                                                </button>
                                                        </div>
                                                </div>
                                        
                                                <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="w-full custom-gradient text-black py-3 rounded-md font-semibold 
                                                                hover:custom-gradient transition duration-300 outline-none cursor-pointer"
                                                >
                                                        Sign In
                                                </button>
                                        </form>
                                </div>
                        )}
              </div>
        );
};

export default LoginComponent;