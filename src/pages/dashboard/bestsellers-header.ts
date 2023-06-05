import { HeaderType, SortType } from '../../types';

type headers = 'images' | 'title' | 'subcategory' | 'quantity' | 'price' | 'status';

type BestsellersHeaderType = HeaderType<headers>;

const header: BestsellersHeaderType[] = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => `<img class='sortable-table-image' alt='Image' src='${data[0].url}'>`
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: SortType.STRING
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    template: data => data.title
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: SortType.NUMBER
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: SortType.NUMBER
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: SortType.NUMBER,
    template: data => {
      return `<div class='sortable-table__cell'>
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  }
];

export default header;
