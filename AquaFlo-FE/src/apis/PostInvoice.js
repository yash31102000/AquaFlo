import ApiInstance from "../services/ApiInstance";

export const postInvoice = async (data) => {
    const response = await ApiInstance.post("/invoice/", data);
    return response.data;
};