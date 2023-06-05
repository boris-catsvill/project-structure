export type Pages = 'dashboard' | 'products' | 'categories' | 'sales';
type PagePathType = `/${string}`;

export interface IMenuItem {
  page: Pages;
  title: Capitalize<string>;
  url: PagePathType;
}

export const menu: Record<Pages, IMenuItem> = {
  dashboard: { page: 'dashboard', title: 'Dashboard', url: '/' },
  products: { page: 'products', title: 'Products', url: '/products' },
  categories: { page: 'categories', title: 'Categories', url: '/categories' },
  sales: { page: 'sales', title: 'Sales', url: '/sales' }
};

export const getPageLink = (page: Pages) => menu[page].url;
