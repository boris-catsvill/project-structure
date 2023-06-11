import { HeaderType, SortType } from '../../types';

type Headers = 'id' | 'user' | 'createdAt' | 'totalCost' | 'delivery';

const header: HeaderType<Headers>[] = [
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
    sortType: SortType.CUSTOM,
    template: ISOString => new Date(ISOString).toLocaleString('default', { dateStyle: 'medium' }),
    customSorting: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: SortType.NUMBER,
    template: data => `$${data.toLocaleString()}`
  },
  {
    id: 'delivery',
    title: 'State',
    sortable: true,
    sortType: SortType.STRING
  }
];

export default header;
