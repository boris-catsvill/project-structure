const header = [
	{
		id: 'id',
		title: 'ID',
		sortable: true,
		sortType: 'number'
	},
	{
		id: 'user',
		title: 'Клиент',
		sortable: true,
		sortType: 'string'
	},
	{
		id: 'createdAt',
		title: 'Дата',
		sortable: true,
		sortType: 'string',
		template: (data = '') => {
			const date = new Date(Date.parse(data));
			const day = date.getDate();
			const month = date.getMonth();
			const year = date.getFullYear();
			const monthsArr = {
				0: 'янв.',
				1: 'фев.',
				2: 'мар.',
				3: 'апр.',
				4: 'мая',
				5: 'июн.',
				6: 'июл.',
				7: 'авг.',
				8: 'сен.',
				9: 'окт.',
				10: 'ноя.',
				11: 'дек.'
			}
			
			return `
				<div class="sortable-table__cell">
					${day} ${monthsArr[month]} ${year} г.
				</div>
			`;
		}
	},
	{
		id: 'totalCost',
		title: 'Стоимость',
		sortable: true,
		sortType: 'number',
		template: (data = []) => {
			return `
				<div class="sortable-table__cell">
					$${data}
				</div>
			`;
		}
	},
	{
		id: 'delivery',
		title: 'Статус',
		sortable: true,
		sortType: 'string'
	}
];

export default header;