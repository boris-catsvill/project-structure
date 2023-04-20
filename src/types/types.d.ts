export type PageType = 'dashboard' | 'products' | 'categories' | 'sales';

interface IBaseElement {
  element: Element | null;

  remove(): void;

  destroy(): void;

  render(): void;
}

export interface IComponent extends IBaseElement {
  subElements?: SubElementsType;

  getSubElements?(element: Element): SubElementsType;
}

export interface IPage extends IBaseElement {
  type: PageType;
  components?: ComponentsType;

  initComponents?(): void;

  renderComponents?(): void;
}

export type SubElementsType = {
  [element: string]: HTMLElement;
};
export type ComponentsType = {
  [element: string]: IComponent;
};
