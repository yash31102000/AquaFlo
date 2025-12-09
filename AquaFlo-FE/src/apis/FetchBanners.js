import ApiInstance from "../services/ApiInstance";

export const getBanners = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/banner/", { params });
        return response;
    } catch {
        return;
    }
};