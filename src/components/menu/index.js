const menuItems = ['dashboard', 'products', 'categories', 'sales'];

export default function renderMenu(path) {
  return menuItems
    .map(item => {
      const match = path.match(item);

      return `
        <li ${match ? 'class="active"' : ''}>
          <a href="/${item === 'dashboard' ? '' : item}" data-page="${item}">
            <i class="icon-${item}"></i>
            <span>${item}</span>
          </a>
        </li>
      `;
    })
    .join(``);
}