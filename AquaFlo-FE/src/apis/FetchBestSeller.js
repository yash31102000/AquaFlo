import ApiInstance from "../services/ApiInstance";

export const getBestSeller = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/get-bestseller/", { params });
        return response;
    } catch {
        return;
    }
};