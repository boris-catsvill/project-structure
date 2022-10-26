import CategoriesList from "../../components/CategoriesList";

export default () => [
    [
        CategoriesList,
        'categoriesList',
        [`${process.env.BACKEND_URL}/api/rest/categories`],
    ],
];