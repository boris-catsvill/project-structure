import { ProductSortableTable } from '../../../components/product-sortable-table';
import DoubleSlider from '../../../components/double-slider';
import { TypeSubElements } from '../../../types/base';
import { RangeType } from '../../../types';

export enum ComponentsEnum {
  Products = 'products',
  Slider = 'slider',
  FilterName = 'filterName',
  FilterStatus = 'filterStatus'
}

export type ProductsComponents = {
  [ComponentsEnum.Products]: ProductSortableTable;
  [ComponentsEnum.Slider]: DoubleSlider;
};

export type ProductsSubElements = {
  [ComponentsEnum.FilterName]: HTMLInputElement;
  [ComponentsEnum.FilterStatus]: HTMLSelectElement;
} & TypeSubElements<ProductsComponents>;

export type PriceRangeType = RangeType<number>;

export interface PriceRangeEvent extends CustomEvent<PriceRangeType> {}
