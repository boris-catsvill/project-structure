import header from "../../utils/product-header";

import SortableTable from "../../components/SortableTable";

export default (range) => [
    [
        SortableTable,
        'sortableTable',
        [
            header,
            {
                url: `${process.env.BACKEND_URL}${process.env.PRODUCTS_REST_URL}`,
                isSortLocally: false,
                range,
                searchParams: {
                    '_embed': 'subcategory.category',
                    '_start': 0,
                    '_end': 30,
                },
            }
        ]
    ],
];