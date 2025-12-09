import ApiInstance from "../services/ApiInstance";

export const addUser = async (payload) => {
    return ApiInstance.post("/register/", payload);
};