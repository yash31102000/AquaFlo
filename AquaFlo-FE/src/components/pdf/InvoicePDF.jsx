import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import InvoiceTablePDF from './pdfInvoiceTable/InvoiceTablePDF';

// Custom Fonts
Font.register({
    family: 'NotoSans',
    fonts: [
        { src: '/aquaflo/fonts/NotoSans-Regular.ttf', fontWeight: 'normal' },
        { src: '/aquaflo/fonts/NotoSans-Bold.ttf', fontWeight: 'bold' },
    ],
});

Font.register({
    family: 'DejaVuSans',
    fonts: [{ src: '/aquaflo/fonts/ttf/DejaVuSans.ttf', fontWeight: 'normal' }],
});

const styles = StyleSheet.create({
    page: {
        padding: 12, // ↓ smaller padding
        fontSize: 8, // ↓ smaller font size overall
        fontFamily: 'NotoSans',
    },
    heading: {
        fontSize: 12, // ↓ from 16 → 12
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subHeading: {
        fontSize: 9,
        color: '#1e2939',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 6, // ↓ less spacing
    },
    sectionTitle: {
        fontSize: 9,
        color: '#364153',
        fontWeight: 'bold',
        marginBottom: 2,
        textDecoration: 'underline',
    },
    bold: { fontWeight: 'bold' },
    semiBold: { fontWeight: 600 },
    medium: { fontWeight: 500 },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000000',
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        borderBottomStyle: 'solid',
        padding: 6, // ↓ from 12 → 6
    },
    body: {
        padding: 6, // ↓ from 12 → 6
    },
});

const InvoicePDF = ({ invoice }) => {
    const { invoice_number, issue_date, order = {} } = invoice;

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, '');
    const isPipeOrTank = (category) => {
        const normalized = normalize(category);
        return normalized.includes('pipe') || normalized.includes('watrtank');
    };

    const orderItems = invoice?.order?.order_items || [];

    // Filter Pipes & Water Tank items
    const pipeAndTankItems =
        orderItems?.filter((orderItem) => orderItem.item && isPipeOrTank(orderItem.item.category)) || [];

    const otherItems =
        orderItems?.filter((orderItem) => orderItem.item && !isPipeOrTank(orderItem.item.category)) || [];

    const groupByProductName = (items) => {
        const groups = {};
        items.forEach((item) => {
            const name = item.item?.name || 'Unnamed';
            if (!groups[name]) groups[name] = [];
            groups[name].push(item);
        });
        return groups;
    };

    const groupedPipes = groupByProductName(pipeAndTankItems);
    const groupedOthers = groupByProductName(otherItems);

    //Heading For different categories
    const getPipeTankHeading = () => {
        const pipeTankCats = pipeAndTankItems.map((i) => i.item.category?.toLowerCase() || '');
        const hasPipe = pipeTankCats.some((cat) => cat.includes('pipe'));
        const hasTank = pipeTankCats.some((cat) => cat.includes('tank') || cat.includes('watr tank'));

        if (hasPipe && hasTank) return 'Pipes & Tank Items';
        if (hasPipe) return 'Pipe Items';
        return 'Tank Items';
    };

    const heading = getPipeTankHeading();

    const user = order.user || {};
    const address = order.address || {};

    return (
        <Document>
            <Page size="A5" style={styles.page}>
                <View style={styles.table}>
                    {/* Header */}
                    <View style={[styles.header, { paddingBottom: 3 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.heading}>
                                Invoice-{invoice_number?.toString().padStart(6, '0')}
                            </Text>
                            <View style={{ flexDirection: 'row', fontSize: 8 }}>
                                <Text style={[styles.bold, { marginRight: 3 }]}>Date:</Text>
                                <Text style={styles.medium}>
                                    {new Date(issue_date).toLocaleDateString('en-GB')}
                                </Text>
                            </View>
                        </View>

                        {/* Billed To */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 4, }}>
                            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                                <Text style={[styles.subHeading, { marginRight: 3 }]}>Billed To:</Text>
                                <Text style={[styles.semiBold, { color: '#1e2939' }]}>
                                    {user.first_name} {user.last_name} ({user.phone_number}), {address.street},{' '}
                                    {address.city}, {address.state}, {address.zip}
                                </Text>
                            </View>

                            <View style={{ width: '22%', borderWidth: 1, borderColor: '#000', padding: 10 }} />
                        </View>
                    </View>

                    {/* Body */}
                    <View style={[styles.body, { paddingTop: 3 }]}>
                        {Object.keys(groupedPipes).length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>{heading}</Text>
                                <InvoiceTablePDF 
                                    groupedItems={groupedPipes} 
                                    type="pipes" 
                                />
                            </>
                        )}

                        {Object.keys(groupedPipes).length > 0 && Object.keys(groupedOthers).length > 0 && (
                            <View break />
                        )}

                        {Object.keys(groupedOthers).length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Fittings Items</Text>
                                <InvoiceTablePDF 
                                    groupedItems={groupedOthers} 
                                    type="fittings" 
                                />
                            </>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;