/* eslint-disable no-unused-expressions */
const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'string',
    template: data => {
      return `<div class="sortable-table__cell">
				${ new Date(data).toLocaleString("default", {
  			  dateStyle: "medium"}
 				 )}				
			</div>`;				
    }
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
