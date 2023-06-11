import { BaseComponent } from '../base-component';
import { Pages } from './index';

export interface NodeListOfSubElements<T = string> extends NodeListOf<HTMLDatasetElement<T>> {}

interface HTMLDatasetElement<T> extends HTMLElement {
  dataset: {
    element: `${string & keyof T}`;
  };
}

export type TypeSubElements<T> = {
  [K in keyof T]: HTMLElement;
};

export type TypeComponents<T> = {
  [K in keyof T]: T[K] extends BaseComponent ? T[K] : never;
};
export type TypeBaseComponents = TypeComponents<Record<string, BaseComponent>>;
export type TypeBaseSubElements = TypeSubElements<TypeBaseComponents>;

export interface IBase {
  element: Element;
  subElements?: TypeBaseSubElements;
  components?: TypeBaseComponents;
  template: string;

  render(): void | Element | Promise<Element> | Promise<void>;

  remove(): void;

  destroy(): void;

  getSubElements?(element: Element): TypeBaseSubElements;
}

export interface IPage extends IBase {
  type: Pages;

  render(): Promise<Element>;

  initComponents?(): void;

  renderComponents?(): void;
}
