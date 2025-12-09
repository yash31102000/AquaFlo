import ApiInstance from "../services/ApiInstance";

export const getAllOrders = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/order/", { params });
        return response;
    } catch {
        return;
    }
};

export const getSingleOrder = async (id) => {
    try {
        const response = await ApiInstance.get(`/order/?user_id=${id}`);
        return response;
    } catch {
        return;
    }
};