const menuItems = ['dashboard', 'products', 'categories', 'sales'];
const menuLocales = {
  dashboard: 'Панель управления',
  products: 'Товары',
  categories: 'Категории',
  sales: 'Продажи'
};

const URL_PATH = process.env.URL_PATH;

export default function renderMenu(path) {
  return menuItems
    .map(item => {
      const match = path.match(item);

      return `
        <li ${match ? 'class="active"' : ''}>
          <a href="/${URL_PATH}${item === 'dashboard' ? '' : item}" data-page="${item}">
            <i class="icon-${item}"></i>
            <span>${menuLocales[item]}</span>
          </a>
        </li>
      `;
    })
    .join(``);
}