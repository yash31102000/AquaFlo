import ApiInstance from "../services/ApiInstance";

export const addPricing = async (data) => {
    return ApiInstance.post("/user-discount/", data);
};