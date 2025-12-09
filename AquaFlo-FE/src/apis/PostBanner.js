import ApiInstance from "../services/ApiInstance";

export const createBanner = async (payload) => {
    return ApiInstance.post("/banner/", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};