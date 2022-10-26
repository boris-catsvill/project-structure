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
                url: `${process.env.BACKEND_URL}/api/rest/orders`,
                isSortLocally: false,
                showingPage: 'SalesPage',
                range
            }
        ]
    ],
];