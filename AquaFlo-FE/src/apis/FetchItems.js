import ApiInstance from "../services/ApiInstance";

export const getMainCategories = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/pipes/", { params });
        return response;
    } catch {
        return;
    }
};

export const getPipeCategories = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/pipes/?name=PIPE", { params });
        return response;
    } catch {
        return;
    }
};

export const getAllItemData = async (params = {}) => {
    try {
        const response = await ApiInstance.get("/pipe-key-template/", { params });
        return response;
    } catch {
        return;
    }
};

export const getSingleItemData = async (id) => {
    try {
        const response = await ApiInstance.get(`/pipe-key-template/?pipe_id=${id}`);
        return response;
    } catch {
        return;
    }
};