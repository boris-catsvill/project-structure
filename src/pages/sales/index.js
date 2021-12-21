import RangePicker from "../../components/range-picker";
import SortableTable from "../../components/sortable-table";
import fetchJson from "../../utils/fetch-json";
import PageComponent from "../../utils/page";
import header from "./sales-header";

export default class SalesPage extends PageComponent {
  url = new URL(`${process.env.BACKEND_URL}api/rest/orders`);

  handleClearFilter = async () => {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const filter = { detail: { from, to }};

    await this.updateComponents(filter); 
  }

  get components() {
    return {
      rangePicker: RangePicker,
      sortableTable: SortableTable,
    };
  }

  get template() {
    return (
      `<div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div class="rangepicker" data-element="rangePicker"></div>
        </div>
        
        <div data-element="sortableTable" class="full-height flex-column"></div>
      </div>
      `
    );
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const RangePicker = this.getComponentByName('rangePicker');
    const SortableTable = this.getComponentByName('sortableTable');

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `/api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`,
      hasInfinityScroll: true
    });

    this.instanceComponent = {
      rangePicker,
      sortableTable
    };

    this.instanceConponents = this.instanceComponent;
  }

  updateComponents = async ({ detail }) => {
    const data = await this.loadData(detail);
    this.instanceComponent.sortableTable.update(data);
  }

  initEventListeners() {
    const rangePicker = this.instanceComponent['rangePicker'];
    rangePicker.element.addEventListener('date-select', this.updateComponents);
    this.element.addEventListener('clear-filter', this.handleClearFilter);
  }

  loadData ({from, to}) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '30');
    this.url.searchParams.set('_sort', 'createdAt');
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());

    return fetchJson(this.url);
  }
}