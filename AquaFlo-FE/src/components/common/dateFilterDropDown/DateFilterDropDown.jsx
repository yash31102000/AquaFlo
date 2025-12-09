/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Input from "../formInputs/Input";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";


function DateFilterDropdown({ startDate, endDate, setStartDate, setEndDate }) {
    const [open, setOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("");
    const dropdownRef = useRef(null);

    const handleQuickSelect = (option) => {
        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (option) {
        case "Today":
            break;
        case "Yesterday":
            from.setDate(from.getDate() - 1);
            to.setDate(to.getDate() - 1);
            break;
        case "This Month":
            from = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case "Past Month":
            from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
        case "Past 3 Months":
            from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            break;
        default:
            break;
        }

        setStartDate(format(from, "yyyy-MM-dd"));
        setEndDate(format(to, "yyyy-MM-dd"));
        setActiveFilter(option);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full"  ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-md cursor-pointer"
            >
                <p className="flex items-center justify-center gap-2">
                    {activeFilter || (startDate && endDate ? `${startDate} → ${endDate}` : "Any Date")} 
                    {open ? (
                        <FaChevronUp className="pt-1 text-gray-400" />
                    ) : (
                        <FaChevronDown className="pt-1 text-gray-400" />
                    )}
                </p>
            </button>

            {/* {open && (
                <div className="absolute z-10 mt-2 p-4 w-[300px] bg-white border border-gray-400 rounded-md shadow-lg space-y-2">
                    <div className="flex gap-2">
                        <div className="flex flex-col w-1/2">
                            <Input
                                label="From" 
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setActiveFilter("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                            />
                        </div>

                        <div className="flex flex-col w-1/2 overflow-auto">
                            <Input
                                label="To" 
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setActiveFilter("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                            />
                        </div>
                    </div>

                    {["Today", "Yesterday", "This Month", "Past Month", "Past 3 Months"].map((label) => (
                        <div>
                            <button
                                key={label}
                                onClick={() => handleQuickSelect(label)}
                                className={`w-full p-2 text-center border rounded ${
                                    activeFilter === label
                                        ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                                        : "hover:bg-gray-100 border-gray-300"
                                }`}
                            >
                                {label}
                            </button>
                        </div>
                    ))}
                </div>
            )} */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-2 p-4 w-[300px] bg-white border border-gray-400 rounded-md shadow-lg space-y-2"
                    >
                        <div className="flex gap-2">
                            <div className="flex flex-col w-1/2">
                                <Input
                                    label="From"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setActiveFilter("");
                                        setOpen(true);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                />
                            </div>

                            <div className="flex flex-col w-1/2">
                                <Input
                                    label="To"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setActiveFilter("");
                                        setOpen(false);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#13609b] focus:border-[#13609b]"
                                />
                            </div>
                        </div>

                        {["Today", "Yesterday", "This Month", "Past Month", "Past 3 Months"].map((label) => (
                            <div key={label}>
                                <button
                                    
                                    onClick={() => handleQuickSelect(label)}
                                    className={`w-full p-2 text-center border rounded cursor-pointer ${
                                        activeFilter === label
                                            ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                                            : "hover:bg-gray-100 border-gray-300"
                                    }`}
                                >
                                    {label}
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                setActiveFilter("");
                                setOpen(false);
                            }}
                            className="w-full p-2 text-center bg-red-100 border border-red-300 text-red-700 font-semibold rounded hover:bg-red-200"
                        >
                            Clear Filter
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default DateFilterDropdown;