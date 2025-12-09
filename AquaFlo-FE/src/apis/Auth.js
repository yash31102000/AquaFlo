import toast from "react-hot-toast";
import ApiInstance from "../services/ApiInstance";

export const postLogin = async (data) => {
    try {
        const response = await ApiInstance.post("/login/", data);
        if (response.data?.status) {
            return response;
        } else {
            toast.error(response.data.message);
            return null;
        }
    } catch {
        toast.error("Invalid username or password");
    }
};