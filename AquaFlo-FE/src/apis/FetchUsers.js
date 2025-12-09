import ApiInstance from "../services/ApiInstance";

export const getUsers = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/user/", { params });
        return response;
    } catch {
        return;
    }
};