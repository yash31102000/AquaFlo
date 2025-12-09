import { useEffect, useRef, useState } from "react";
import AddPricingComponent from "./AddPricingComponent";
import { getUsers } from "../../apis/FetchUsers";
import { getPipeCategories } from "../../apis/FetchItems";
import toast from "react-hot-toast";
import { addPricing } from "../../apis/PostPricing";

function AddPricingCotroller() {
    const hasFetched = useRef(false);
    const [loading, setLoading] = useState(true);
    const [cityList, setCityList] = useState([]);
    const [userData, setUserData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [pipeCategories, setPipesCategories] = useState([]);
    const [expandedCategories, setExpandedCategories ] = useState({});
    const [activeTabs, setActiveTabs] = useState({});
    const [priceChanges, setPriceChanges] = useState({});

    const fetchUserData = async () => {
        try {
            const response = await getUsers();
            if (response?.data?.status) {
                setCityList(response.data.city_list || []);
                setUserData(response.data.data || []);
            } else {
                setCityList([]);
                setUserData([]);
            }
        } catch (error) {
            toast.error("Error fetching city details");
            console.error("API Error:", error);
            setCityList([]);
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPipeCategories = async () =>{
        try {
            const response = await getPipeCategories();
            if (response?.data?.status) {
                setPipesCategories(response.data.data);
            } else {
                toast.error("Failed to fetch pipe categories");
                setPipesCategories([]);
            }
        } catch (error) {
            toast.error("Error fetching pipe categories");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    }
  
    useEffect(()=>{
        if (!hasFetched.current) {
            fetchUserData();
            fetchPipeCategories();
            hasFetched.current = true;
        }
    }, []);

    const handleCityChange = (city) => {
        setSelectedCity(city);
        const usersInCity = userData.filter((user) =>
            user.addresses.some((address) => address.city === city)
        );
        setFilteredUsers(usersInCity);
    };

    // Handle Search Functionality
    function filterCategories(data, searchTerm) {
    const lowerTerm = (searchTerm || '').toLowerCase();
    const searchParts = lowerTerm.split(' '); // Split search term into subcategory and product parts

    return Array.isArray(data) ? data
        .map(category => {
            const matchCategory = (category.name || '').toLowerCase().includes(searchParts[0]);

            const filteredSubCategories = Array.isArray(category.sub_categories) ? category.sub_categories
                .map(sub => {
                    const matchSub = (sub.name || '').toLowerCase().includes(searchParts[0]);

                    const filteredInnerSub = Array.isArray(sub.sub_categories) ? sub.sub_categories
                        .map(innerSub => {
                            const matchInner = (innerSub.name || '').toLowerCase().includes(searchParts[0]);

                            const filteredProducts = Array.isArray(innerSub.product) ? innerSub.product.filter(product => 
                                (product.name || '').toLowerCase().includes(searchParts[1] || '')
                            ) : [];

                            // If product or subcategory matches, keep the subcategory or product
                            if (matchInner || filteredProducts.length > 0) {
                                return {
                                    ...innerSub,
                                    product: matchInner && filteredProducts.length === 0 ? innerSub.product : filteredProducts,
                                };
                            }

                            return null;
                        })
                        .filter(Boolean) : [];

                    const allFilteredProducts = Array.isArray(sub.product) ? sub.product.filter(product => 
                        (product.name || '').toLowerCase().includes(searchParts[1] || '')
                    ) : [];

                    // If subcategory matches, keep subcategories or products
                    if (matchSub || filteredInnerSub.length > 0 || allFilteredProducts.length > 0) {
                        return {
                            ...sub,
                            sub_categories: filteredInnerSub,
                            product: matchSub && allFilteredProducts.length === 0 ? sub.product : allFilteredProducts,
                        };
                    }
                    return null;
                })
                .filter(Boolean) : [];

            const topLevelProducts = Array.isArray(category.product) ? category.product.filter(product =>
                (product.name || '').toLowerCase().includes(searchParts[1] || '')
            ) : [];

            // If category or product matches, return the filtered result
            if (matchCategory || filteredSubCategories.length > 0 || topLevelProducts.length > 0) {
                return {
                    ...category,
                    sub_categories: filteredSubCategories,
                    product: matchCategory && topLevelProducts.length === 0 ? category.product : topLevelProducts,
                };
            }

            return null;
        })
        .filter(Boolean) : [];
    }

    const filteredCategories = filterCategories(pipeCategories);

    //By Default Select 1st Data As Active Tab
    useEffect(() => {
        filteredCategories.forEach(category => {
            category.product?.forEach(product => {
                if (
                    Array.isArray(product.basic_data) &&
                    product.basic_data.length > 0 &&
                    typeof product.basic_data[0].data === 'object' &&
                    !activeTabs[product.id]
                ) {
                    setActiveTabs(prev => ({
                        ...prev,
                        [product.id]: product.basic_data[0].name
                    }));
                }
            });

            category.sub_categories?.forEach(sub => {
                sub.product?.forEach(product => {
                    if (
                        Array.isArray(product.basic_data) &&
                        product.basic_data.length > 0 &&
                        typeof product.basic_data[0].data === 'object' &&
                        !activeTabs[product.id]
                    ) {
                        setActiveTabs(prev => ({
                            ...prev,
                            [product.id]: product.basic_data[0].name
                        }));
                    }
                });

                sub.sub_categories?.forEach(innerSub => {
                    innerSub.product?.forEach(product => {
                        if (
                            Array.isArray(product.basic_data) &&
                            product.basic_data.length > 0 &&
                            typeof product.basic_data[0].data === 'object' &&
                            !activeTabs[product.id]
                        ) {
                            setActiveTabs(prev => ({
                                ...prev,
                                [product.id]: product.basic_data[0].name
                            }));
                        }
                    });
                });
            });
        });
    }, [filteredCategories, activeTabs]);

    //Handle Group Price Input Filed
    const handleGroupedPricingChange = (productId, groupName, rowId, newPrice) => {
        // console.log('Updating price:', productId, groupName,  rowId, newPrice);
        setPriceChanges(prev => {
            const updated = { ...prev };
            if (!updated[productId]) updated[productId] = {};
            if (!updated[productId][groupName]) updated[productId][groupName] = {};
            updated[productId][groupName][rowId] = newPrice;
            return updated;
        });
    };

    //Handle Flat Price Input Filed
    const handleFlatPricingChange = (productId, rowId, value) => {
        setPriceChanges((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                [rowId]: value,
            },
        }));
    };

    //Handle Payload
    const preparePricePayload = () => {
        const price_data = Object.entries(priceChanges).map(([productId, data]) => {
            if (typeof Object.values(data)[0] === 'object' && !Array.isArray(Object.values(data)[0])) {
                // Grouped format
                return {
                    id: productId,
                    basic_data: Object.entries(data).map(([groupName, items]) => ({
                        name: groupName,
                        data: Object.entries(items).map(([rowId, price]) => ({ id: rowId, price })),
                    }))
                };
            } else {
                // Old format
                return {
                    id: productId,
                    basic_data: Object.entries(data).map(([rowId, price]) => ({ id: rowId, price }))
                };
            }
        });

        return { price_data };
    };

    //Handle Save
    const handleSave = async () => {
        if (!selectedCity) {
            toast.error("Please select a city before adding the price");
            return;
        }

        const payload = preparePricePayload();

        try {
            for (const user of filteredUsers) {
                const userPayload = {
                    user: user.id,
                    price_data: payload.price_data,
                };

                const response = await addPricing(userPayload);

                // console.log('Sending payload:', JSON.stringify(userPayload, null, 2));
                // const response = { data: { status: true, message: `Pricing added for ${user.first_name}` } };
                if(response.data.status) {
                    toast.success(response.data.message);
                    setPriceChanges({});
                } else {
                    toast.error(response.data.message);
                }
            }
        } catch(error) {
            console.error("Error saving price", error);
        }
        
    };
    
    return (
        <AddPricingComponent 
            loading={loading}
            cityList={cityList}
            onCityChange={handleCityChange}
            selectedCity={selectedCity}
            users={filteredUsers}
            pipeCategories={filteredCategories}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            activeTabs={activeTabs}
            setActiveTabs={setActiveTabs}
            priceChanges={priceChanges}
            handleGroupedPricingChange={handleGroupedPricingChange}
            handleFlatPricingChange={handleFlatPricingChange}
            handleSave={handleSave}
        />
    );
};

export default AddPricingCotroller;