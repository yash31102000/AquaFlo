import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Layout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            localStorage.removeItem("accessToken");  
            navigate("/login"); 
        }
    }, [navigate]);

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="p-5 flex-1 overflow-auto bg-[#f0f8ff]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
