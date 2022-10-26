import ProductForm from "../../components/ProductForm";

export default () => {
    const [id] = document.location.pathname.match(/([a-z0-9_-]+$)/i) ?? [];
    console.log(`${process.env.BACKEND_URL}${process.env.PRODUCTS_REST_URL}`)
    return [
        [
            ProductForm,
            'productForm',
            [
                id === 'add' ? null : id,
                {
                    imageURL: `${process.env.IMGUR_CLIENT_URL}`,
                    categoriesURL: `${process.env.BACKEND_URL}${process.env.CATEGORIES_REST_URL}`,
                    productURL: `${process.env.BACKEND_URL}${process.env.PRODUCTS_REST_URL}`,
                }
            ],
        ],
    ];
}
