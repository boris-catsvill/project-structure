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
  components?: IComponents;

  initComponents?(): void;

  renderComponents?(): void;
}

export type SubElementsType<T extends keyof any = string> = {
  [P in T]: HTMLElement;
};
export type ComponentsType<T extends keyof any = string> = {
  [P in T]: IComponent | object;
};

export interface IComponents {
  [element: string]: IComponent | object;
}

export interface HTMLDatasetElement<T = string> extends HTMLElement {
  dataset: {
    element: `${string & keyof T}`;
  };
}
