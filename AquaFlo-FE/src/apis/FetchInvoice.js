import ApiInstance from "../services/ApiInstance";

export const getInvoices = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/invoice/", { params });
        return response.data.data;
    } catch {
        return;
    }
};

export const getSingleInvoice = async (id) => {
    try {
        const response = await ApiInstance.get(`/order-invoice/${id}/`);
        return response;
    } catch {
        return;
    }
};