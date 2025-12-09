import ApiInstance from "../services/ApiInstance";

export const updateUser = async (id, data) => {
    const response = await ApiInstance.put(`/user/${id}/`, data);
    return response.data;
};

