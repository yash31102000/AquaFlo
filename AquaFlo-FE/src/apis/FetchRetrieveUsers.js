import ApiInstance from "../services/ApiInstance";

export const getRetrieveUsers = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/deleted-user-list/", { params });
        return response;
    } catch {
        return;
    }
};