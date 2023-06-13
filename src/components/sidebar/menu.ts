import { IMenuItem, Pages } from '../../types';

export const Menu: Record<Pages, IMenuItem> = {
  dashboard: { page: 'dashboard', title: 'Dashboard', url: '/' },
  products: { page: 'products', title: 'Products', url: '/products' },
  categories: { page: 'categories', title: 'Categories', url: '/categories' },
  sales: { page: 'sales', title: 'Sales', url: '/sales' }
};

export const getPageLink = (page: Pages) => Menu[page].url;
