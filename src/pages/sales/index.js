import SortableTable from "../../components/sortable-table/index.js"
import RangePicker from "../../components/range-picker/index.js"
import header  from "./sales-header.js";

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page{
    element;
    controller = new AbortController();

    initilize(){
        const now = new Date();
        const to = new Date();
        const from = new Date(now.setMonth(now.getMonth() - 1));

        this.rangePicker = new RangePicker({from,to});

        this.url = new URL("api/rest/orders", BACKEND_URL);
        this.url.searchParams.set("createdAt_gte", from.toISOString());
        this.url.searchParams.set("createdAt_lte", to.toISOString());

        this.sortableTable = new SortableTable(header, {
            url: this.url,
            isSortLocally: false,
            start: 0,
            step: 30
        }, false);

        document.addEventListener("date-select", async ()=>{
            const {from, to} = this.rangePicker.selected;

            const {id, order} = this.sortableTable.sorted;

            this.url.searchParams.set("createdAt_gte", from.toISOString());
            this.url.searchParams.set("createdAt_lte", to.toISOString());
            this.sortableTable.url = this.url;
            const data = await this.sortableTable.loadData(id, order);

            if (!data.length) {
                this.sortableTable.element.classList.add("sortable-table_empty");
            }else{
                this.sortableTable.element.classList.remove("sortable-table_empty"); 
            }
            
            this.sortableTable.addRows(data);           
            
        }, {signal: this.controller.signal});
        
    }

    get template(){
        return `
            <div class = "sales full-height flex-column">
                <div class = "content__top-panel">
                    <h1 class = "page-title">Sales</h1>
                </div>
                <div class = "full-height flex-column" data-element = "ordersContainer">

                </div>
            </div>
        `
    }

    render(){
        const wrapper = document.createElement("div");

        wrapper.innerHTML = this.template;

        this.element = wrapper;

        this.initilize();

        this.getRangePicker();
        this.getSortableTable();

        return this.element;
    }

    getRangePicker(){
        const topPanel = this.element.querySelector(".content__top-panel");

        topPanel.append(this.rangePicker.element);
    }

    getSortableTable(){
        const orderContainer = this.element.querySelector("[data-element = 'ordersContainer']");

        orderContainer.append(this.sortableTable.element);
    }

    remove(element = this.element){
        element.remove();
    }

    destroy(){
        this.remove();
        this.controller.abort();
        this.rangePicker.destroy();
        this.sortableTable.destroy();
    }
}