/* eslint-disable no-unused-vars */
import { View, Text, StyleSheet } from '@react-pdf/renderer';
const styles = StyleSheet.create({
    table: {
        display: 'table',
        width: '100%',
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderColor: '#000000',
        marginTop: 2,
        marginBottom: 4,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColSr: {
        width: '8%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        fontSize: 7,
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableColDesc: {
        width: '38%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableColDesc2: {
        width: '45%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableColCheck: {
        width: '18%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableColCheck2: {
        width: '55%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableColNos: {
        width: '12%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#000000',
        fontSize: 7,
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
    },
    tableCell: {
        fontSize: 7,
        textAlign: 'center',
        marginVertical: 0
    },
    tableColHeader: {
        backgroundColor: '#EEE',
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 1,
        paddingHorizontal: 1,
    },
    tableCol: {
        flex: 1,
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
        fontSize: 7,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableColLeft: {
        flex: 1,
        paddingVertical: 0.5,
        paddingHorizontal: 1, 
        fontSize: 7,
        textAlign: 'left',
    },
    productGroupTitle: {
        flexDirection: 'row',
        backgroundColor: '#fbf9fa',
        paddingVertical: 1,
        paddingHorizontal: 1,
    },
    productGroupText: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'left',
        flex: 11,
    },
    productGroupText1: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'left',
        flex: 14,
    },
    textCenter: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
});

    // const excludedKeys = ['id', 'code', 'size', 'mm', 'packing', 'large_bag', 'ltr', 'Size(mm)', 'Size (Mm)'];

    const excludedKeys = [
        "id", "Size(mm)", "size (mm)", "Size (Mm)", "Inch", "od min.", "od max.",
        "thickness min. (mm)", "thickness max. (mm)", "code", "size", "mm", "nos",
        "ltr", "height", "width"
    ];

const InvoiceTablePDF = ({ groupedItems, type }) => {
    return (
        <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
                <Text style={[styles.tableColSr, styles.tableColHeader]}>Sr.</Text>
                <Text style={[type === "pipes" ? styles.tableColDesc2 : styles.tableColDesc, styles.tableColHeader, { textAlign: "left" }]}>Description of Goods</Text>
                {type === "fittings" && (
                    <Text style={[styles.tableColNos, styles.tableColHeader]}>Large Pkt</Text>
                )}
                {type === "fittings" && (
                    <Text style={[styles.tableColNos, styles.tableColHeader]}>Small Pkt</Text>
                )}
                {type === "fittings" && (
                    <Text style={[styles.tableColNos, styles.tableColHeader]}>Nos</Text>
                )}
                {type === "fittings" && (
                    <Text style={[styles.tableColNos, styles.tableColHeader]}>Total Qty</Text>
                )}
                <Text style={[type === "pipes" ? styles.tableColCheck2 : styles.tableColCheck, styles.tableColHeader ]}>Check</Text>
            </View>

            {/* Table Rows */}
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
                        <View key={idx}>
                            {/* Product Group Header */}
                            <View style={styles.productGroupTitle}>
                                <Text style={styles.tableCol}></Text>
                                <Text style={[type === 'pipes' ? styles.productGroupText : styles.productGroupText1]}>
                                    {productName.toUpperCase()} ({categoryName.toUpperCase()})
                                </Text>
                            </View>
                        
                            {items.map((item, index) => {
                                const basic = item.item?.basic_data || {};
                                const mm = basic.mm || "";
                                const size = basic.size || "";
                                const sizeMM = basic["Size(mm)"] || basic["size (mm)"] || "";
                                const ltr = basic.ltr || "";
                                const nos = item.quantity || "-";
                                const fittingNos = item.number_of_pic || "-";
                                const qty = item.quantity || "-";
                                const packing = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
                                const smallBag = item.bag_quantity === "0" ? "-" : item.bag_quantity || "-";
                                const largeBag = item.large_bag_quantity === "0" ? "-" : item.large_bag_quantity || "-";
                                const smallBagNos = basic.packing || "";
                                const largeBagNos = basic.large_bag || "";

                                let weight = 0;
                                let weightLabel = "";

                                if (type === "pipes") {
                                    if (basic.weight) {
                                        weight = Number(basic.weight);
                                        weightLabel = `${weight}KG`;
                                    } else {
                                        for (const key in basic) {
                                            if (!excludedKeys.includes(key) && !isNaN(Number(basic[key]))) {
                                                weight = Number(basic[key]);
                                                // Case 1: Key contains "KGF / CM²" or "KGF/CM2"
                                                if (/(kgf)(\s*\/\s*cm(?:²|2))?/i.test(key)) {
                                                    // Extract numeric part, replace with KG
                                                    const match = key.match(/[\d.]+/);
                                                    const numberPart = match ? match[0] : "";
                                                    weightLabel = `${numberPart}KG`;
                                                } 
                                                // Case 2: Key just has some numeric value
                                                else {
                                                    const match = key.match(/[\d.]+/);
                                                    if (match) {
                                                        weightLabel = `${match[0]}KG`;
                                                    } else {
                                                        // Fallback → clean the key
                                                        weightLabel = key
                                                            .replace(/[_-]/g, " ")
                                                            .replace(/\s+/g, " ")
                                                            .toUpperCase();
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }

                                const rawTotal = Math.round(nos * weight);
                                const totalWeight = isNaN(rawTotal) || rawTotal === 0 ? "-" : `${rawTotal} KG`;

                                let description = "";
                                if (mm && mm!== "-" && size) {
                                    description = `${mm}MM`;
                                } else if (sizeMM) {
                                    description = `${sizeMM}MM${weightLabel ? ` X ${weightLabel}` : ""}`;
                                } else if (size) {
                                    description = `${size}${!size.toLowerCase().includes("ml") ? " Inch" : ""}`;
                                } else if (ltr) {
                                    description = `${ltr} ltr`;
                                }

                                return (
                                    <View style={styles.tableRow} key={index}>
                                        <View style={[styles.tableColSr, {alignItems: 'center'}]}>
                                            <Text style={styles.bold}>{counter++}</Text>
                                        </View>
                                        <View style={[type === "pipes" ? styles.tableColDesc2 : styles.tableColDesc, { padding: 0 }]}>
                                            <Text style={styles.tableColLeft}>
                                                {description} {type === "pipes" && nos !== "-" && (
                                                    <Text style={[styles.bold]}>-{nos}Nos</Text>
                                                )}
                                            </Text>
                                        </View>
                                        {type === "fittings" && (
                                            <View style={styles.tableColNos}>
                                                <Text style={styles.textCenter}>
                                                    {largeBag && largeBag !== "-" ? `${largeBag} (${largeBagNos || ""})` : "-"}
                                                </Text>
                                            </View>
                                        )}
                                        {type === "fittings" && (
                                            <View style={styles.tableColNos}>
                                                <Text style={styles.textCenter}>
                                                    {smallBag && smallBag !== "-" ? `${smallBag} (${smallBagNos || ""})` : "-"}
                                                </Text>
                                            </View>
                                        )}
                                        {type === "fittings" && (
                                            <View style={styles.tableColNos}>
                                                <Text style={styles.textCenter}>{fittingNos}</Text>
                                            </View>
                                        )}
                                        {type === "fittings" && (
                                            <View style={styles.tableColNos}>
                                                <Text style={styles.textCenter}>{qty}</Text>
                                            </View>
                                        )}
                                        <View style={[
                                            type === "pipes" ? styles.tableColCheck2 : styles.tableColCheck,
                                            {
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 10,}]
                                            }
                                        >
                                            <View style={{ width: 6, height: 6, border: '1px solid black' }} />
                                            <View style={{ width: 6, height: 6, border: '1px solid black' }} />
                                            <View style={{ width: 6, height: 6, border: '1px solid black' }} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                });
            })()}
        </View>
    );
};

export default InvoiceTablePDF;