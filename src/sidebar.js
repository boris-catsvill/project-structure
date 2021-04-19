export default function addSidebarEvents() {
  const sidebarTogglerBtn = document.querySelector('.sidebar__toggler');
  const sidebarNav = document.querySelector('.sidebar__nav');

  if (sidebarTogglerBtn) {
    sidebarTogglerBtn.addEventListener('pointerdown', () => {
      document.body.classList.toggle('is-collapsed-sidebar');
    });
  }

  document.addEventListener('route', () => {
    const path = location.pathname.replace(/^\//, '');
    
    if (sidebarNav) {
      const activeMenuLink = sidebarNav
        .querySelector('li.active');
      
      if (activeMenuLink) {
        activeMenuLink.classList.remove('active');
      }

      switch (path) {
        case '':
          sidebarNav
            .querySelector(`[data-page="dashboard"]`)
            .closest('li')
            .classList
            .add('active');

          break;

        default:
          const menuLink = sidebarNav
            .querySelector(`[data-page="${path}"]`);

          if (menuLink) {
            menuLink.closest('li')
              .classList
              .add('active');
          }

          break;
      }
    }
  });
}
