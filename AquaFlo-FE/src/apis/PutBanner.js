import ApiInstance from "../services/ApiInstance";

export const updateBanner = async (id, data) => {
    const response = await ApiInstance.put(`/banner/${id}/`, data,{
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
