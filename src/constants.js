export const salesTableHeader = [
  {
    id: "id",
    title: "ID",
    sortable: true,
    sortType: "number"
  },
  {
    id: "user",
    title: "Клиент",
    sortable: true,
    sortType: "string"
  },
  {
    id: "createdAt",
    title: "Дата",
    sortable: true,
    sortType: "number",
    template: data => {
      return `
        <div class="sortable-table__cell">
            ${new Date(data).toLocaleString("default", {dateStyle: "medium"})}
        </div>
      `;
    }
  },
  {
    id: "totalCost",
    title: "Стоимость",
    sortable: true,
    sortType: "number",
    template: data => `<div class="sortable-table__cell">$${data}</div>`
  },
  {
    id: "delivery",
    title: "Статус",
    sortable: true,
    sortType: "string"
  },
];
