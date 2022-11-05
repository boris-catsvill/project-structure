
const header = [
	{
		id: "images",
		title: "Photo",
		sortable: false,
		template: data => {
			return `
				<div class="sortable-table__cell">
					<img class="sortable-table-image" alt="Image" src="${data.length ? data[0].url : ""}">
				</div>
			`;
		}
	},
	{
		id: "title",
		title: "Title",
		sortable: true,
		sortType: "string"
	},
	{
		id: "subcategory",
		title: "Categoty",
		sortable: false,
		template: data => {
			return `
				<div class="sortable-table__cell">
					<span data-tooltip="
					<div class=&quot;sortable-table-tooltip&quot;>
					<span class=&quot;sortable-table-tooltip__category&quot;>${data.category.title}</span> /
					<b class=&quot;sortable-table-tooltip__subcategory&quot;>${data.title}</b>
					</div>">${data.title}</span>
				</div>
			`;
		}
	},

	{
		id: "quantity",
		title: "Quantity",
		sortable: true,
		sortType: "number"
	},
	{
		id: "price",
		title: "Price",
		sortable: true,
		sortType: "number",
		template: data => {
			return `
				<div class="sortable-table__cell">
					$${new Intl.NumberFormat("ru-RU").format(data)}
				</div>
			`;
		}
	},
	{
		id: "status",
		title: "Status",
		sortable: true,
		sortType: "number",
		template: data => {
			return `<div class="sortable-table__cell">
				${data > 0 ? "Активен" : "Неактивен"}
			</div>`;
		}
	}
];

export default header;