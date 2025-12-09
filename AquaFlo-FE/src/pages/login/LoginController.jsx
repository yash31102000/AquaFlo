import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { postLogin } from '../../apis/Auth';
import LoginComponent from './LoginComponent';
import toast from 'react-hot-toast';

function LoginController() {
        const [credentials, setCredentials] = useState({
                phone_number: "",
                password: "",
        });
        const [showPassword, setShowPassword] = useState(false);
        const [errors, setErrors] = useState({});
        const [loading, setLoading] = useState(false);
        const { login } = useContext(UserContext);
        const navigate = useNavigate();

        const validateForm = () => {
                let newErrors = {};
        
                if (!credentials.phone_number.trim()) newErrors.phone_number = "User name is required";
                if (!credentials.password.trim()) newErrors.password = "Password is required";
                
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
        };

        const togglePassword = () => setShowPassword(prev => !prev);

        const handleInputChange = (e) => {
                const { name, value } = e.target;
                setCredentials((prev) => ({ ...prev, [name]: value }));
                setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        };
        
        const handleSubmit = async (e) => {
                e.preventDefault();
                if (!validateForm()) return;
                setLoading(true);
                try {
                        const response = await postLogin(credentials);
                        if (!response) return;
                        const { data } = response.data;
                        if (!data.is_admin) {
                                setLoading(false);
                                return toast.error("This user is not an admin!");
                        }
                        toast.success(response.data.message);
                        const  access  = data.tokens.access;
                        login(access, data);
                        navigate("/users");
                } catch {
                        return true;
                } finally {
                        setLoading(false);
                }
        };
        return (
                <LoginComponent
                        credentials={credentials}
                        loading={loading}
                        showPassword={showPassword}
                        errors={errors}
                        onShowPassword={togglePassword}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                />
        );
};

export default LoginController;