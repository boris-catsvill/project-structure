import comma from "../../utils/comma.js";

const header = [
  {
    id: "id",
    title: "ID",
    sortable: true,
  },
  {
    id: "user",
    title: "Client",
    sortable: true,
    sortType: "string",
  },
  {
    id: "createdAt",
    title: "Date",
    sortable: true,
    sortType: "number",
    template: (date) => {
      return `<div class="sortable-table__cell">${new Date(date).toLocaleString(
        "default",
        { dateStyle: "medium" }
      )}</div>`;
    },
  },
  {
    id: "totalCost",
    title: "Price",
    sortable: true,
    sortType: "number",
    template: (price) => {
      return `<div class="sortable-table__cell">${comma(price)}$</div>`;
    },
  },
  {
    id: "delivery",
    title: "Status",
    sortable: true,
    sortType: "number",
  },
];

export default header;
