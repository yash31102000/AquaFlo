import ApiInstance from "../services/ApiInstance";

export const updateRetrieveUser = async (id, data) => {
    const response = await ApiInstance.put(`/retrieve-deleted-user/`, data);
    return response.data;
};