import ApiInstance from "../services/ApiInstance";

export const updateOrder = async (id, data) => {
    const response = await ApiInstance.put(`/order/${id}/`, data);
    return response.data;
};

