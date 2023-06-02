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
  type: string;
  components?: IComponents;

  initComponents?(): void;

  renderComponents?(): void;
}

export type SubElementsType<T extends keyof any = string> = {
  [P in T]: HTMLElement;
};
//TODO Change this type
export type ComponentsType<T extends keyof any = string> = {
  [P in T]: IComponent | object;
};

export interface INodeListOfSubElements extends NodeListOf<HTMLDatasetElement<SubElementsType>> {}

export interface IComponents {
  [element: string]: IComponent | object;
}

export interface HTMLDatasetElement<T = string> extends HTMLElement {
  dataset: {
    element: `${string & keyof T}`;
  };
}

export enum SortType {
  STRING = 'string',
  NUMBER = 'number'
}

export interface HeaderType<T> {
  id: keyof T;
  title: string;
  sortable: boolean;
  sortType?: SortType;
  template?: (data: any) => string;
}

export type RangeType = {
  from: Date;
  to: Date;
};

export interface DateSelectEvent extends CustomEvent<RangeType> {}
