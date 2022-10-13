function createLocalyMounth () {
  let monthsLocaly = [];

  for (let i = 0; i < 12; i++)
  monthsLocaly.push(new Date(2000, i, 1).toLocaleDateString(undefined, { "month": "short" }));

  return monthsLocaly;
}

const mounthAll = createLocalyMounth();

const header = [
    {
      id: 'id',
      title: 'ID',
      sortable: true,
      sortType: 'number'
    },
    {
      id: 'user',
      title: 'Сlient',
      sortable: true,
      sortType: 'string'
    },
    {
      id: 'createdAt',
      title: 'Date',
      sortable: true,
      sortType: 'string',
      template: data => {
        const split = data.split('-')

        let number = split[2].slice(0, 2);
        if (number[0] === '0') number = number[1]

        let mounth = split[1][0] === '0' ? split[1][1] : split[1];
        const monthStr = mounthAll[+mounth - 1];

        let year = split[0] + ' ' + 'г.'

        return `<div class="sortable-table__cell">
          ${number + ' ' + monthStr+ year}
        </div>`
      }
    },
    {
      id: 'totalCost',
      title: 'Price',
      sortable: true,
      sortType: 'number',
      template: data => {
        return `<div class="sortable-table__cell">
          $${data}
        </div>`
      }
    },
    {
      id: 'delivery',
      title: 'Status',
      sortable: true,
      sortType: 'string'
    }
  ];
  
  export default header;