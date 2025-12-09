import ApiInstance from "../services/ApiInstance";

export const addBestSeller = async (payload) => {
    const response = await ApiInstance.post("/bestseller/", payload);
    return response.data;
};