import ApiInstance from "../services/ApiInstance";

export const updateInvoice = async (id, data) => {
    const response = await ApiInstance.put(`/invoice/${id}/`, data);
    return response.data;
};
