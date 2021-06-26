const header = [
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
        template: createdAt => {
            return `
                <div class="sortable-table__cell">
                    ${new Date(createdAt).toLocaleString("default", {
                        dateStyle: "medium"
                    })}
                </div>
            `;
        }
    },
    {
        id: "totalCost",
        title: "Стоимость",
        sortable: true,
        sortType: "number",
        template: totalCost => {
            return `
                <div class="sortable-table__cell">
                    $${totalCost}
                </div>
            `;
        }
    },
    {
        id: "delivery",
        title: "Статус",
        sortable: true,
        sortType: "string"
    },
];

export default header;
