import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannersComponent from './BannersComponent';
import toast from 'react-hot-toast';
import { getBanners } from '../../apis/FetchBanners';
import { getMainCategories } from '../../apis/FetchItems';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import { updateBanner } from '../../apis/PutBanner';

function BannersController() {
    const navigate = useNavigate();
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchBanners = async () => {
        try {
            const response = await getBanners();
            if (response.data.status) {
                const formattedBanners = response.data.data.map(banner => ({
                    ...banner,
                    is_active: String(banner.flag).toLowerCase() === "true"
                }));
                setBanners(formattedBanners);
            } else {
                toast.error("Failed to fetch banners");
                setBanners([]);
            }
        } catch (error) {
            toast.error("Error fetching banners");
            console.error("API Error:", error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getMainCategories();
            if (response?.data?.status) {
                setCategories(response.data.data);
            }
        } catch (error) {
            toast.error("Error fetching categories");
            console.error("Category Error:", error);
        }
    };

    useEffect(()=>{
        if (!hasFetched.current) {
            fetchBanners();
            fetchCategories();
            hasFetched.current = true;
        }
    }, []);

    //Handle Pagination
    const indexOfLastBanners = currentPage * itemsPerPage;
    const indexOfFirstBanners = indexOfLastBanners - itemsPerPage;
    const currentBanners = banners .slice(indexOfFirstBanners, indexOfLastBanners);
    const totalPages = Math.ceil(banners .length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleToggleBannerStatus = async (banner) => {
        try {
            const updatedStatus = banner.is_active ? "False" : "True";
            const response = await updateBanner(banner.id, { flag: updatedStatus });
            if(response.status) {
                toast.success(`Banner ${updatedStatus === "True" ? "activated" : "deactivated"} successfully!`);
                fetchBanners();
            }   
        } catch (error) {
            toast.error("Failed to update banner status");
            console.error(error);
        }
    };

    // Handle Edit Banners
    const handleEditBanners = (banner) =>{
        navigate("/edit-banner", { state: banner })
    }

    // Handle Delete Banners
    const handleDeleteBanners = (id) => {
        DeleteConfirmation({
            id,
            apiEndpoint: "/banner",
            name: "banner",
            onSuccess: fetchBanners,
        });
    };

    return (
        <BannersComponent
            navigate={navigate} 
            loading={loading}
            banners={currentBanners}
            categories={categories}
            onToggleSwitch={handleToggleBannerStatus}
            onBannersEdit={handleEditBanners}
            onBannersDelete={handleDeleteBanners}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
        />
    );
};

export default BannersController;
