import SortableTable from "../../components/sortable-table/index.js"
import RangePicker from "../../components/range-picker/index.js"

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  element;
  header =  [
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
        const options = {year: "numeric", month: "long", day: "numeric" }
        return date.toLocaleDateString("ru-RU", options);
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
  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper;
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - 1)

    this.rangePicker = new RangePicker({ from, to });

    this.url = new URL("api/rest/orders", BACKEND_URL);
    this.url.searchParams.set("createdAt_gte", from.toISOString());
    this.url.searchParams.set("createdAt_lte", to.toISOString());

    this.sortableTable = new SortableTable(this.header, {
      url: this.url, isSortLocally: false, start: 0, step: 30}, false);
    this.initEventListner();
    this.element.querySelector(".content__top-panel").append(this.rangePicker.element)
    this.element.querySelector("[data-element='ordersContainer']").append(this.sortableTable.element)

    return this.element;
  }

  get template() {
    return `
      <div class="sales full-height flex-column">
          <div class="content__top-panel">
              <h1 class="page-title">Продажи</h1>
          </div>
          <div class="full-height flex-column" data-element="ordersContainer"></div>
      </div>
        `
  }

  initEventListner() {
    document.addEventListener("date-select", async () => {
      const { from, to } = this.rangePicker.selected;
      const { id, order } = this.sortableTable.sorted;
      this.url.searchParams.set("createdAt_gte", from.toISOString());
      this.url.searchParams.set("createdAt_lte", to.toISOString());
      this.sortableTable.url = this.url;
      const data = await this.sortableTable.loadData(id, order);
      if (!data.length) {
        this.sortableTable.element.classList.add("sortable-table_empty");
      } else {
        this.sortableTable.element.classList.remove("sortable-table_empty");
      }
      this.sortableTable.addRows(data);
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.rangePicker.destroy();
    this.sortableTable.destroy();
  }
}
