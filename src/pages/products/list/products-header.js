const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    template: data => {

     const element = document.createElement('div');
     element.classList.add("sortable-table__cell")

     const span = document.createElement('span');
     span.innerHTML = `${data.title}`
     span.dataset.tooltip = `<div class= "sortable-table-tooltip">
                              <span class="sortable-table-tooltip__category">${data.category.title}</span> /
                               <b class="sortable-table-tooltip__subcategory">${data.title}</b>
                            </div>`
     element.append(span);
     return element.outerHTML;
    
    }
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: value => {
      return `<div class="sortable-table__cell">${'$' + value}</div>`
      
    }
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;



              
      



