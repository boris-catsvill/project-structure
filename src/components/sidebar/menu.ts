import { PageType } from '../../types/types';

type PagePathType = `/${string}`;

export interface IMenuItem {
  page: PageType;
  title: Capitalize<string>;
  href: PagePathType;
}

type MenuType = Record<PageType, IMenuItem>;

const menu: MenuType = {
  dashboard: { page: 'dashboard', title: 'Dashboard', href: '/' },
  products: { page: 'products', title: 'Products', href: '/products' },
  categories: { page: 'categories', title: 'Categories', href: '/categories' },
  sales: { page: 'sales', title: 'Sales', href: '/sales' }
};

export default menu;
