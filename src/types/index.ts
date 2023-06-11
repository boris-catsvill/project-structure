export type Pages = 'dashboard' | 'products' | 'categories' | 'sales';

export interface IMenuItem {
  page: Pages;
  title: Capitalize<string>;
  url: `/${string}`;
}

export enum SortType {
  STRING = 'string',
  NUMBER = 'number',
  CUSTOM = 'custom'
}

export interface HeaderType<T> {
  id: T;
  title: string;
  sortable: boolean;
  sortType?: SortType;
  template?: (data: any) => string;
  customSorting?: (a: any, b: any) => number | boolean;
}

export type RangeType<T> = {
  from: T;
  to: T;
};

export type DateRangeType = RangeType<Date>;
