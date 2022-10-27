import header from "../../store/sales-header";

import SortableTable from "../../components/SortableTable";
import RangePicker from "../../components/RangePicker";

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
                url: `${process.env.BACKEND_URL}${process.env.SALES_REST_URL}`,
                isSortLocally: false,
                clickableRows: false,
                range,
                searchParams: {
                    '_sort': 'createdAt',
                    'createdAt_gte': new Date(range.from),
                    'createdAt_lte': new Date(range.to),
                    '_start': 0,
                    '_end': 30,
                },
            }
        ]
    ],
];