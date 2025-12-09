import { useState, useRef, useEffect, useContext } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { FiMenu } from "react-icons/fi";
import toast from "react-hot-toast";
import BaseImage from "../common/BaseImage";

const Header = ({ toggleSidebar }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { userData, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const user = {
        name: userData?.first_name || "User", 
        profilePic: "/user.png" 
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout(); // Call the logout function from context
        toast.success("Logout successfully!")
        navigate("/login"); // Redirect to login page
    };

    return (
        <div className="relative flex items-center justify-end p-4 bg-[#13609b] font-md text-white shadow-md">
            
            {/* Sidebar Menu Button */}
            <button
                className="lg:hidden bg-gray-300 p-2 text-xl absolute left-4 top-1/2 transform -translate-y-1/2"
                onClick={toggleSidebar}
            >
                <FiMenu />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                >
                    <span className="text-white text-base font-medium">{user.name}</span>
                    <BaseImage src={user.profilePic} alt="Profile" className="w-10 h-10 rounded-full border" />
                    {isOpen ? (
                        <FaCaretUp className="text-white"/>
                    ) : (
                        <FaCaretDown className="text-white"/>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white text-black shadow-lg rounded-md z-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-left text-base font-medium hover:bg-gray-50 duration-300 ease-in-out hover:text-[#13609b] rounded-md cursor-pointer"
                        >
                            Logout <TbLogout2 className="ml-[3px]"/> 
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
