import ProductForm from "../../components/ProductForm";

export default () => {
    const [estimatedId] = document.location.pathname.match(/([a-z0-9_-]+$)/i) ?? [];

    return [
        [
            ProductForm,
            'productForm',
            [
                estimatedId === 'add' ? null : estimatedId,
                {
                    imageURL: `${process.env.IMGUR_CLIENT_URL}`,
                    categoriesURL: `${process.env.BACKEND_URL}${process.env.CATEGORIES_REST_URL}`,
                    productURL: `${process.env.BACKEND_URL}${process.env.PRODUCTS_REST_URL}`,
                }
            ],
        ],
    ];
}
