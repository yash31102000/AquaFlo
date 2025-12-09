import React, { useEffect, useRef, useState } from 'react';
import RetrieveUsersComponent from './RetrieveUsersComponent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getRetrieveUsers } from '../../../apis/FetchRetrieveUsers';
import { updateRetrieveUser } from '../../../apis/PutRetrieveUsers';

function RetrieveUsersController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [retrieveUsers, setRetrieveUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchRetrieveUsers = async () => {
        try {
            const response = await getRetrieveUsers();
            if (response.data.status) {
                setRetrieveUsers(response.data.data);
            } else {
                toast.error("Failed to fetch retrieve users");
                setRetrieveUsers([]);
            }
        } catch (error) {
            toast.error("Error fetching retrieve users");
            console.error("API Error:", error);
            setRetrieveUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchRetrieveUsers();
            hasFetched.current = true;
        }
    }, []);

    // Filtered users based on search term
    const filteredUsers = Array.isArray(retrieveUsers)
    ? retrieveUsers.filter(user =>
            `${user.first_name} ${user.last_name} ${user.email} ${user.phone_number}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
    : [];

    //Handle Pagination
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers .slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers .length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle Retrieve Users
    const handleRetrieveUsers = async (id) =>{
       try {
            const payload = {
                user_id: String(id),
            };
            const response = await updateRetrieveUser(id, payload);
            if(response.status) {
                toast.success("User retrieved successfully!");
                navigate(-1);
                fetchRetrieveUsers();   
            }  else {
                toast.error(response.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error retrieving user:", error);
            toast.error("Failed to retrieve user.");
        } 
    }

    return (
        <RetrieveUsersComponent
            navigate={navigate} 
            loading={loading}
            users={currentUsers}
            onUserRetrieve={handleRetrieveUsers}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        />
    );
};

export default RetrieveUsersController;
