import { HeaderType, SortType } from '../../types';

interface SaleHeader {
  id: SaleHeaderType;
  user: SaleHeaderType;
  createdAt: SaleHeaderType;
  totalCost: SaleHeaderType;
  delivery: SaleHeaderType;
}

type SaleHeaderType = HeaderType<SaleHeader>;

const header: SaleHeaderType[] = [
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
    template: data => {
      const date = new Date(Date.parse(data));
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      //@ts-ignore
      return date.toLocaleString('en-US', options);
    }
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
