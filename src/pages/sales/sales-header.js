const header =  [
        {
            id: "id",
            title: "ID",
            sortable: true,
            sortType: "number"
          },
          {
            id: "user",
            title: "Client",
            sortable: true,
            sortType: "string"
          },
          {
            id: "createdAt",
            title: "Data",
            sortable: true,
            sortType: "date",
            template: (data) =>{
                const date = new Date(Date.parse(data));
                const options = {year: "numeric", month: "long", day: "numeric" }

                return date.toLocaleDateString("ru-RU", options);
                
            }
          },
          {
            id: "totalCost",
            title: "Cost",
            sortable: true,
            sortType: "number",
          },
          {
            id: "delivery",
            title: "Status",
            sortable: true,
            sortType: "string",
          },
    ]
export default header;