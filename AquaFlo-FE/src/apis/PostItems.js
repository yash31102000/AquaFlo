import ApiInstance from "../services/ApiInstance";

export const createMainCategory = async (payload) => {
    return ApiInstance.post("/pipes/", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};