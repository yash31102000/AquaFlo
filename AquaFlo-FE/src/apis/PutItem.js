import ApiInstance from "../services/ApiInstance";

export const updateItem = async (id, data) => {
    const response = await ApiInstance.put(`/pipes/${id}/`, data,{
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const updateItemDetails = async (id, data) => {
    const response = await ApiInstance.put(`/pipe-detail/${id}/`, data);
    return response.data;
};