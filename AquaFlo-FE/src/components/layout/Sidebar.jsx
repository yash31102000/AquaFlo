/* eslint-disable no-unused-vars */
import {  useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { HugeiconsIcon } from "@hugeicons/react";
import { Invoice02Icon, MenuSquareIcon, Note03Icon, UserSquareIcon, WebDesign01Icon } from '@hugeicons/core-free-icons';
import  { motion }  from "framer-motion";
import BaseImage from "../common/BaseImage";

const menuItems = [
    { 
        name: "Users", 
        path: "/users", 
        icon: <HugeiconsIcon icon={UserSquareIcon} size={30} color="#000000" /> 
    },
    { 
        name: "Orders", 
        path: "/orders", 
        icon: <HugeiconsIcon icon={Note03Icon} size={30} color="#000000" /> 
    },
    { 
        name: "Categories", 
        path: "/categories", 
        icon: <HugeiconsIcon icon={MenuSquareIcon} size={30} color="#000000" /> 
    },
    { 
        name: "Banners", 
        path: "/banners", 
        icon: <HugeiconsIcon icon={WebDesign01Icon} size={30} color="#000000" /> 
    },
    { 
        name: "Pricing", 
        path: "/add-pricing", 
        icon: <HugeiconsIcon icon={Invoice02Icon} size={30} color="#000000" />
    },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const sidebarRef = useRef(null);
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
            };
            document.addEventListener("mousedown", handleOutsideClick);
            return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [setSidebarOpen]);

    // Function to automatic close sidebar on small screens
    const handleItemClick = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    const toggleMenu = (menuName) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const activePaths = {
        "/users": ["/users", "/add-user","/user-addresses", "/view-orders", "/edit-user", "/retrieve-user"],
        "/orders": ["/orders", "/confirm-order", "/view-invoice"],
        "/categories": ["/categories", "/create-category", "/create-item"],
        "/banners": ["/banners", "/add-banner", "/edit-banner"],
        "/add-pricing": ["/add-pricing"],
    };
    
    const isMenuItemActive = (itemPath) => {
        return activePaths[itemPath]?.some(path => location.pathname.startsWith(path)) || location.pathname === itemPath;
    };

    return (
        
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-screen max-h-screen w-64 bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:relative lg:translate-x-0 lg:h-auto`}
            >
                <div className="p-5 flex justify-center">
                    <BaseImage src="/logo.png" alt="Logo" className="h-auto" />
                </div>
                <ul className="space-y-4 text-black p-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            {item.children ? (
                                <>
                                    <div
                                        className={`flex items-center justify-between cursor-pointer px-4 py-2 text-lg font-medium rounded-md duration-300 hover:bg-[#f0f8ff] ${
                                            expandedMenus[item.name] ? "bg-[#f0f8ff]" : ""
                                        }`}
                                        onClick={() => toggleMenu(item.name)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </div>
                                        {expandedMenus[item.name] ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>

                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: expandedMenus[item.name] ? "auto" : 0, opacity: expandedMenus[item.name] ? 1 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <ul className="pl-6 mt-2 space-y-2">
                                            {item.children.map((child, childIndex) => (
                                                <li key={childIndex}>
                                                    <Link
                                                        to={child.path}
                                                        onClick={handleItemClick}
                                                        className={`block px-4 py-2 text-md rounded-md duration-300 hover:bg-[#cfe1f1] ${
                                                            isMenuItemActive(child.path) ? "bg-[#cfe1f1]" : ""
                                                        }`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    onClick={handleItemClick}
                                    className={`flex items-center space-x-3 px-4 py-2 text-lg font-medium rounded-md duration-300 hover:bg-[#cfe1f1] ${
                                        isMenuItemActive(item.path) ? "bg-[#cfe1f1]" : ""
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        
    );
};

export default Sidebar;
