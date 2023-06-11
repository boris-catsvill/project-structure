export const DEFAULT_LIMIT = 30;

export enum CUSTOM_EVENTS {
  RouteChange = 'route-change',
  Route = 'route',
  SelectRange = 'range-select',
  ChangedOrder = 'changed-order',
  DateSelect = 'date-select',
  UpdateProduct = 'update-product',
  AddProduct = 'add-product'
}

export enum API_ROUTES {
  PRODUCT = 'api/rest/products',
  SUB_CATEGORY = 'api/rest/subcategories',
  CATEGORIES = 'api/rest/categories?_sort=weight&_refs=subcategory',
  ORDER = 'api/rest/orders',
  BESTSELLERS = `api/dashboard/bestsellers?_start=0&_end=${DEFAULT_LIMIT}&_sort=title&_order=asc`
}
