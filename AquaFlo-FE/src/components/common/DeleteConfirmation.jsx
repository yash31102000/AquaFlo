import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import ApiInstance from "../../services/ApiInstance";

const DeleteConfirmation = async ({ id, apiEndpoint, name, onSuccess, method = "DELETE", payload = {} }) => {
    const result = await Swal.fire({
        title: `Are you sure you want to delete this ${name}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c2272d",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
        try {
            let response;
            
            if (method === "DELETE") {
                response = await ApiInstance.delete(`${apiEndpoint}/${id}/`);
            } else if (method === "POST") {
                response = await ApiInstance.post(`${apiEndpoint}/`, payload);
            }
            
            if (response.data.status) {
                toast.success(response.data.message);
                if (onSuccess) onSuccess();
            } else {
                toast.error(`Failed to delete ${name}`);
            }
        } catch (error) {
            toast.error(`Error deleting ${name}`);
            console.error("Delete API Error:", error);
        }
    }
};

export default DeleteConfirmation;