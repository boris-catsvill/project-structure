import comma from "../../../utils/comma.js";

const header = [
  {
    id: "images",
    title: "Image",
    sortable: false,
    template: (data = []) => {
      return `
        <div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="${data[0] && data[0].url}">
        </div>
      `;
    },
  },
  {
    id: "title",
    title: "Name",
    sortable: true,
    sortType: "string",
  },
  {
    id: "subcategory",
    title: "Category",
    sortable: false,
    template: ({ category: { title: catTitle }, title } = {}) => {
      const template = `
        <div class='sortable-table-tooltip'>
          <span class='sortable-table-tooltip__category'>${catTitle}</span> /
          <b class='sortable-table-tooltip__subcategory'>${title}</b>
        </div>
      `;
      return `
        <div class="sortable-table__cell">
          <span data-tooltip="${template}">${title}</span>
        </div>
      `;
    },
  },
  {
    id: "quantity",
    title: "Quantity",
    sortable: true,
    sortType: "number",
  },
  {
    id: "price",
    title: "Price",
    sortable: true,
    sortType: "number",
    template: (price) => {
      return `<div class="sortable-table__cell">${comma(price)}$</div>`;
    },
  },
  {
    id: "status",
    title: "Status",
    sortable: true,
    sortType: "number",
    template: (data) => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? "Active" : "Inactive"}
        </div>`;
    },
  },
];

export default header;
