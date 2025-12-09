import CategoryTree from "../../components/category/categoryTree/CategoryTree";
import Dropdown from "../../components/common/formDropDown/DropDown";
import Loader from "../../components/common/Loader";

function AddPricingComponent({ loading, cityList, onCityChange, selectedCity, users, 
    pipeCategories, expandedCategories, setExpandedCategories, activeTabs, setActiveTabs, 
    priceChanges, handleGroupedPricingChange, handleFlatPricingChange, handleSave}) {
    
    //City Option
    const cityOptions = cityList.map((city) => ({
        id: city,
        name: city
    }));

    //User Option
    const userOptions = users.map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name} (${user.phone_number})`
    }));

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-auto mx-auto mt-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Add Pricing</h2>
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block font-semibold">Select City:</label>
                        <Dropdown
                            options={cityOptions}
                            selectedValue={selectedCity}
                            onChange={onCityChange}
                            placeholder="Select a city"
                            isSearchable={true}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">View User:</label>
                        <Dropdown
                            options={userOptions}
                            selectedValue=""
                            onChange={() => {}}
                            placeholder="View user list"
                            isSearchable={true}
                            isDisabled={true}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <Loader message="Loading Pipes Data..." />
            ) : (
                <>
                    {pipeCategories.map((cat) => (
                        <CategoryTree
                            key={cat.id}
                            category={cat}
                            expandedCategories={expandedCategories}
                            setExpandedCategories ={setExpandedCategories}
                            activeTabs={activeTabs}
                            setActiveTabs={setActiveTabs}
                            isPricing={true}
                            priceChanges={priceChanges}
                            handleGroupedPricingChange={handleGroupedPricingChange}
                            handleFlatPricingChange={handleFlatPricingChange}
                            handleSave={handleSave}
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default AddPricingComponent;