export default function() {
  document.addEventListener('route', event => {
    const sidebarNav = document.querySelector('#sidebar-nav');
    const sidebarNavItems = sidebarNav.querySelectorAll('[data-page]');

    let match = event.detail.match[0];

    if (!match) {
      match = 'dashboard';
    }

    for (const item of sidebarNavItems) {
      item.parentElement.classList.toggle('active', match.startsWith(item.dataset.page));
    }
  });

  document.getElementById('sidebar-toggler').addEventListener('click', () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  });
}