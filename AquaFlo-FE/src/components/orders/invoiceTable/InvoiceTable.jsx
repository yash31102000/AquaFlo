/* eslint-disable no-unused-vars */
import React from "react";

function InvoiceTable({ title, groupedItems, type }) {
    const excludedKeys = [
        "id", "Size(mm)", "size (mm)", "Size (Mm)", "Inch", "od min.", "od max.",
        "thickness min. (mm)", "thickness max. (mm)", "code", "size", "mm", "nos",
        "ltr", "height", "width"
    ];

    return (
        <>
            {title && <h3 className="mb-1 text-sm font-bold text-gray-700 underline">{title}</h3>}
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="text-center">
                        <th className="px-1 py-0.5 border border-black">Sr.</th>
                        <th className="px-1 py-0.5 border border-black text-left">Description of Goods</th>
                        {type === "fittings" && <th className="px-1 py-0.5 border border-black w-50">Large Pkt</th>}
                        {type === "fittings" && <th className="px-1 py-0.5 border border-black w-50">Small Pkt</th>}
                        {type === "fittings" && <th className="px-1 py-0.5 border border-black w-50">Nos</th>}
                        {type === "fittings" && <th className="px-1 py-0.5 border border-black w-50">Total Qty</th>}
                        <th className="px-1 py-0.5 border border-black">Check</th>
                    </tr>
                </thead>
                <tbody>
                    {(() => {
                        let counter = 1;
                        return Object.entries(groupedItems).map(([productName, items], idx) => {
                            const category = items[0]?.item?.category || "";
                            let categoryName = "";
                            if (category.includes("➤")) {
                                const parts = category.split("➤");
                                const leftPart = parts[0].trim();   // arrow ni left side
                                const rightPart = parts[1].trim();  // arrow ni right side
                                categoryName = `${leftPart} - ${rightPart}`;  // banne join kari ne print karva
                            } else {
                                categoryName = category.trim();  
                            }
                            // Replace WATR with WATER
                            if (categoryName.toUpperCase() === "WATR TANK") {
                                categoryName = "WATER TANK";
                            }
                            return(
                                <React.Fragment key={productName}>
                                    <tr key={idx} className="bg-gray-50 text-sm">
                                        <td className="px-1 py-0.5 border border-black text-center font-bold"></td>
                                        <td colSpan={5} className="px-1 py-0.5 border border-black font-bold text-gray-700">
                                            {productName.toUpperCase()} ({categoryName.toUpperCase()})
                                        </td>
                                    </tr>
                                    {items.map((item, subIdx) => {
                                        const basic = item.item.basic_data || {};
                                        const mm = basic.mm || "";
                                        const size = basic.size || "";
                                        const sizeMM = basic["Size(mm)"] || basic["size (mm)"] || "";
                                        const ltr = basic.ltr || "";
                                        const nos = item.quantity || "-";
                                        const fittingNos = item.number_of_pic || "-";
                                        const qty = item.quantity || "-";
                                        const smallBag = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
                                        const largeBag = item.large_bag_quantity === "0" ? "-" : item.large_bag_quantity || "-";
                                        const smallBagNos = basic.packing || "";
                                        const largeBagNos = basic.large_bag || "";

                                        let weight = 0;
                                        let weightLabel = "";
                                        if (type === "pipes") {
                                            if (basic.weight) {
                                                weight = Number(basic.weight);
                                            } else {
                                                for (const key in basic) {
                                                    if (!excludedKeys.includes(key) && !isNaN(Number(basic[key]))) {
                                                        weight = Number(basic[key]);
                                                        if (key.includes("Kgf / cm")) {
                                                            const match = key.match(/^(\d+(\.\d+)?)/);
                                                            const numberPart = match ? match[1] : "";
                                                            weightLabel = `${numberPart}KG`;
                                                        } else {
                                                            weightLabel = key.toUpperCase();
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        const rawTotal = Math.round(nos * weight);
                                        const totalWeight = isNaN(rawTotal) || rawTotal === 0 ? "-" : rawTotal;

                                        return (
                                            <tr key={subIdx} className="border-t border-black text-sm">
                                                <td className="px-1 py-0.5 border border-black text-center font-semibold">
                                                    {counter++}
                                                </td>
                                                <td className="flex px-1 py-0.5 text-left">
                                                    {mm && size ? (
                                                        <div>{mm}MM</div>
                                                    ) : sizeMM ? (
                                                        <div>{sizeMM}MM{weightLabel ? ` X ${weightLabel}` : ""}</div>
                                                    ) : size ? (
                                                        <div>{size} {!size.toLowerCase().includes("ml") && "Inch"}</div>
                                                    ) : ltr ? (
                                                        <div>{ltr} Ltr</div>
                                                    ) : null}

                                                    {type === "pipes" && nos !== "-" && (
                                                        <span className="font-medium">-{nos}Nos</span>
                                                    )}
                                                </td>
                                                {type === "fittings" && (
                                                    <td className="px-1 py-0.5 border border-black text-center w-50">
                                                        {largeBag && largeBag !== "-" ? `${largeBag} (${largeBagNos || ""})` : "-"}
                                                    </td>
                                                )}
                                                {type === "fittings" && (
                                                    <td className="px-1 py-0.5 border border-black text-center w-50">
                                                        {smallBag && smallBag !== "-" ? `${smallBag} (${smallBagNos || ""})` : "-"}
                                                    </td>
                                                )}
                                                {type === "fittings" && (
                                                    <td className="px-1 py-0.5 border border-black text-center w-50">{fittingNos}</td>
                                                )}
                                                {type === "fittings" && (
                                                    <td className="px-1 py-0.5 border border-black text-center w-50">{qty}</td>
                                                )}
                                                <td className="px-1 py-0.5 border border-black text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-3 h-3 border border-black" title="Plan A"></div>
                                                        <div className="w-3 h-3 border border-black" title="Plan B"></div>
                                                        <div className="w-3 h-3 border border-black" title="Plan C"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        });
                    })()}
                </tbody>
            </table>
        </>
    );
};

export default InvoiceTable;