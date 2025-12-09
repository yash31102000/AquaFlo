import { createContext, useState, useEffect } from "react";

// Create UserContext
const UserContext = createContext();

// UserProvider Component
const UserProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")) || null);

    useEffect(() => {
        // Load token from localStorage on initial render
        const storedToken = localStorage.getItem("accessToken");
        const storedUserData = JSON.parse(localStorage.getItem("userData"));
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUserData) {
            setUserData(storedUserData);
        }
    }, []);

    // Function to log in and store the token
    const login = (accessToken, userData) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userData", JSON.stringify(userData));
        setToken(accessToken);
        setUserData(userData);
    };

    // Function to log out and clear stored token
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        setToken(null);
        setUserData(null);
    };

    return (
        <UserContext.Provider value={{ token, userData, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
