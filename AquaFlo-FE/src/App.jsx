import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import './index.css';
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/layout/Layout";
import { UserProvider } from "./context/UserContext";

import { Login } from "./pages/login";
import { Users } from "./pages/users";
import { Orders } from "./pages/orders";
import { Category } from "./pages/category";
import { Banners } from "./pages/banners";
import { Invoices } from "./pages/invoices";

import { AddItem } from "./components/category/addItems";
import { AddCategory } from "./components/category/addCategories";

import { AddUser } from "./components/users/addUser";
import { ViewUserAddress } from "./components/users/viewUserAddress";
import { ViewUserOrders } from "./components/users/viewUserOrders";
import { EditUsers } from "./pages/editUsers";
import { RetrieveUsers } from "./components/users/retrieveUser";
import { CompleteOrder } from "./components/orders/completeOrder";
import { ViewInvoice } from "./components/orders/viewInvoice";

import { AddBanner } from "./components/banners/addBanner";
import { EditBanners } from "./components/banners/editBanners";
import { AddPricing } from "./pages/pricing";
import { BASE_PATH } from "./utils/Config";

function App() {
    return(
        <UserProvider>
            <Router basename={BASE_PATH}>
                <Toaster position="top-center" reverseOrder={false} />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            {/* All main routes */}
                                <Route path="/users" element={<Users />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/categories" element={<Category />} />
                                <Route path="/banners" element={<Banners />} />
                                <Route path="/add-pricing" element={<AddPricing />} />
                                <Route path="/invoices" element={<Invoices />} />
                            {/* End of all main routes */}

                            {/* Add categories & items routes */}
                                <Route path="/create-item" element={<AddItem />} />
                                <Route path="/create-category" element={<AddCategory />} />
                            {/* End of add categories & items routes */}

                            {/* Add, view, edit & retrieve user routes */}
                                <Route path="/add-user" element={<AddUser />} />
                                <Route path="/user-addresses" element={<ViewUserAddress />} />
                                <Route path="/view-orders/:id" element={<ViewUserOrders />} />
                                <Route path="/edit-user" element={<EditUsers />} />
                                <Route path="/retrieve-user" element={<RetrieveUsers />} />
                            {/* End of add, view & edit user routes */}

                            {/* Confirm & complete order routes */}
                                <Route path="/confirm-order/:id" element={<CompleteOrder />} />
                                <Route path="/view-invoice/:id" element={<ViewInvoice />} />
                            {/* End of confirm & complete order routes */}

                            {/* Add & edit banner routes */}
                                <Route path="/add-banner" element={<AddBanner />} />
                                <Route path="/edit-banner" element={<EditBanners />} />
                            {/* End of add & edit banner routes */}
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </UserProvider>
    );
};

export default App;
