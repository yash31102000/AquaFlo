import ApiInstance from "../services/ApiInstance";

export const updateBestSeller = async (id, data) => {
    const response = await ApiInstance.put(`/bestseller/${id}/`, data);
    return response.data;
};
