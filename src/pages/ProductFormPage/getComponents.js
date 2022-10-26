import ProductForm from "../../components/ProductForm";

export default () => [
    [
        ProductForm,
        'productForm',
        [
            (document.location.pathname.match(/([a-z0-9_-]+$)/i) ?? [])[0],
            {
                imageURL: new URL(`${process.env.IMGUR_CLIENT}`),
                categoriesURL: new URL(`${process.env.BACKEND_URL}${process.env.CATEGORIES_URL}`),
                productURL: new URL(`${process.env.BACKEND_URL}${process.env.PRODUCTS_URL}`),
            }
        ],
    ],
];
