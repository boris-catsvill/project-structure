export const headers = [
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
    sortType: "date",
    template: data => {
      const date = new Date(Date.parse(data));
      const options = {year: "numeric", month: "long", day: "numeric" };
      return `<div class="sortable-table__cell">${date.toLocaleDateString("ru-RU", options)}</div>`;
    }
  },
  {
    id: "totalCost",
    title: "Стоимость",
    sortable: true,
    sortType: "number",
  },
  {
    id: "delivery",
    title: "Статус",
    sortable: true,
    sortType: "string",
  },
]
