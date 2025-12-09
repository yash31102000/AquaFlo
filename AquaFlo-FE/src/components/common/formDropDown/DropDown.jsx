import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { CgChevronDown, CgChevronUp } from "react-icons/cg";
import Input from "../formInputs/Input";

const Dropdown = ({ 
        options, 
        selectedValue, 
        onChange, 
        placeholder = "Select an option", 
        error, 
        isWidthDropdown = false, 
        isSearchable = false,
        shouldSort = false,
        type="",
        isDisabled = false 
}) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchQuery, setSearchQuery] = useState("");

        const selectedOption = options.find(opt => opt.id === selectedValue);
        
        // To search & accending order list
        const filteredOptions = (shouldSort
                ? [...options].sort((a, b) => a.name.localeCompare(b.name))
                : [...options]
        ).filter(opt =>
                opt.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Reset search input on close
        useEffect(() => {
                if (!isOpen) {
                        setSearchQuery("");
                }
        }, [isOpen]);

        return (
                <Listbox value={selectedValue} onChange={(value) => {
                                if (isDisabled) return;
                                // Find the actual category without the prefix
                                if (selectedValue !== value) {
                                        const selectedCategory = options.find(opt => opt.id === value);
                                        onChange(selectedCategory?.id);
                                }
                                setIsOpen(false);
                        }}
                >
                        <div className="relative w-full">
                                <Listbox.Button
                                        className={`relative w-full cursor-pointer bg-white py-2 pl-3 ${type === "tax" ? "pr-2" : "pr-10"} text-left border rounded-md focus:outline-none ${
                                                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#13609b] focus:border-[#13609b]"
                                        }`}
                                        onClick={() => setIsOpen(!isOpen)}
                                >
                                        {/* <span className={`block truncate ${!selectedOption ? (error ? "text-red-500" : "text-gray-500") : "text-gray-700"}`}>
                                                {selectedOption ? selectedOption.name.replace(/^[→\s]+/, '') : placeholder}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                {isOpen ? (
                                                        <CgChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                ) : (
                                                        <CgChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                )}
                                        </span> */}
                                        {type === "tax" ? (
                                                <>
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                                {isOpen ? (
                                                                        <CgChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                ) : (
                                                                        <CgChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                )}
                                                        </span>
                                                        <span className={`block truncate text-right w-full ${!selectedOption ? (error ? "text-red-500" : "text-gray-500") : "text-gray-700"}`}>
                                                                {selectedOption ? selectedOption.name.replace(/^[→\s]+/, '') : placeholder}
                                                        </span>
                                                </>
                                                ) : (
                                                <>
                                                        <span className={`block truncate ${!selectedOption ? (error ? "text-red-500" : "text-gray-500") : "text-gray-700"}`}>
                                                                {selectedOption ? selectedOption.name.replace(/^[→\s]+/, '') : placeholder}
                                                        </span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                                {isOpen ? (
                                                                        <CgChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                ) : (
                                                                        <CgChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                )}
                                                        </span>
                                                </>
                                                )}

                                </Listbox.Button>

                                <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        // afterLeave={() => setIsOpen(false)}
                                >
                                        <Listbox.Options className={`absolute z-999 mt-1 max-h-60 ${isWidthDropdown ? 'w-full' : 'w-auto'} overflow-auto rounded-md border border-gray-400 bg-white text-base shadow-lg`}>
                                                {isSearchable && (
                                                        <div className="p-2">
                                                                <Input
                                                                        type="text"
                                                                        placeholder="Search..."
                                                                        value={searchQuery}
                                                                        className="w-full p-1 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b] text-sm"
                                                                        onChange={(e) =>
                                                                                setSearchQuery(e.target.value)
                                                                        }
                                                                />
                                                        </div>
                                                )}
                                                {filteredOptions.length > 0 ? (
                                                        filteredOptions.map((option) => (
                                                                <Listbox.Option
                                                                        key={option.id}
                                                                        className={({ active }) =>
                                                                                `relative select-none py-2 pl-10 pr-4 ${
                                                                                        active ? "bg-gray-200" : "text-gray-900"
                                                                                } ${option.disabled ? "opacity-50 cursor-not-allowed" :isDisabled ? "opacity-100 cursor-not-allowed" : "cursor-pointer"}`
                                                                        }
                                                                        disabled={option.disabled || isDisabled}
                                                                        value={option.id}
                                                                        // onClick={() => setIsOpen(false)}
                                                                >
                                                                        {({ selected }) => (
                                                                                <>
                                                                                        <span className={`block truncate ${selected ? "font-semibold" : "font-normal"} ${option.color}`}>
                                                                                        {option.name}
                                                                                        </span>
                                                                                        {selected && (
                                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg text-[#13609b] font-bold">
                                                                                                ✓
                                                                                        </span>
                                                                                        )}
                                                                                </>
                                                                        )}
                                                                </Listbox.Option>
                                                        ))
                                                ) : (
                                                        <div className="px-4 py-2 text-sm text-gray-500">No results found</div> 
                                                )}
                                        </Listbox.Options>
                                </Transition>
                        </div>
                </Listbox>
        );
};

export default Dropdown;
