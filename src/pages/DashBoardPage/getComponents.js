import header from "../../utils/product-header";

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
                url: `${process.env.BACKEND_URL}${process.env.BESTSELLERS_DASHBOARD_URL}`,
                isSortLocally: true,
                pagination: false,
                range,
                searchParams: {
                    from: new Date(range.from),
                    to: new Date(range.to),
                    '_start': 0,
                    '_end': 30,
                },
            }
        ]
    ],
    [
        ColumnChart,
        'ordersChart',
        [
            {
                url: `${process.env.BACKEND_URL}${process.env.ORDERS_DASHBOARD_URL}`,
                label: 'Заказы',
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
                url: `${process.env.BACKEND_URL}${process.env.SALES_DASHBOARD_URL}`,
                label: 'Продажи',
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
                url: `${process.env.BACKEND_URL}${process.env.CUSTOMERS_DASHBOARD_URL}`,
                label: 'Клиенты',
                range,
                link: '#'
            }
        ]
    ]
];