import header from "../../store/product-header";

import RangePicker from "../../components/RangePicker";
import SortableTable from "../../components/SortableTable";
import ColumnChart from "../../components/ColumnChart";

export default (range) => [
    [
        RangePicker,
        'rangePicker',
        [range]
    ],
    [
        SortableTable,
        'sortableTable',
        [
            header,
            {
                url: `${process.env.BACKEND_URL}/api/dashboard/bestsellers`,
                isSortLocally: true,
                showingPage: 'DashboardPage',
                range
            }
        ]
    ],
    [
        ColumnChart,
        'ordersChart',
        [
            {
                url: `${process.env.BACKEND_URL}/api/dashboard/orders`,
                label: 'orders',
                range,
                link: '#'
            }
        ]
    ],
    [
        ColumnChart,
        'salesChart',
        [
            {
                url: `${process.env.BACKEND_URL}/api/dashboard/sales`,
                label: 'sales',
                range,
                link: '/sales',
                formatHeading: item => {
                    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(item);
                }
            }
        ]
    ],
    [
        ColumnChart,
        'customersChart',
        [
            {
                url: `${process.env.BACKEND_URL}/api/dashboard/customers`,
                label: 'customers',
                range,
                link: '#'
            }
        ]
    ]
];