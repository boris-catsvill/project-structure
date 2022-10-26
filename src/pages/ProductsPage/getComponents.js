import header from "../../store/product-header";

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
                showingPage: 'ProductsPage',
                range
            }
        ]
    ],
];