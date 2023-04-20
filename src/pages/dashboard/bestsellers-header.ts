enum SortType {
  STRING = 'string',
  NUMBER = 'number'
}

interface BestsellersHeader {
  id: HeaderType;
  title: string;
  sortable: boolean;
  sortType?: SortType;
  template?: (data: any) => string;
}

interface Headers {
  images: BestsellersHeader;
  title: BestsellersHeader;
  quantity: BestsellersHeader;
  price: BestsellersHeader;
  status: BestsellersHeader;
}

type HeaderType = keyof Headers;

const header: BestsellersHeader[] = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class='sortable-table__cell'>
            <img class='sortable-table-image' alt='Image' src='${data[0].url}'>
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: SortType.STRING
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
