import ApiInstance from "../services/ApiInstance";

export const addAddress = async (payload) => {
    return ApiInstance.post("/add-remove-address/", payload);
};