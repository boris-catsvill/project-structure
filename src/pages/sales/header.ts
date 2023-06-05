import { HeaderType, SortType } from '../../types';

type headers = 'id' | 'user' | 'createdAt' | 'totalCost' | 'delivery';

type SaleHeader = HeaderType<headers>;

const header: SaleHeader[] = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: SortType.NUMBER
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true,
    sortType: SortType.STRING
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: SortType.NUMBER,
    template: ISOString =>
      new Date(Date.parse(ISOString)).toLocaleString('default', { dateStyle: 'medium' })
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: SortType.NUMBER,
    template: data => `$${data}`
  },
  {
    id: 'delivery',
    title: 'State',
    sortable: true,
    sortType: SortType.STRING
  }
];

export default header;
