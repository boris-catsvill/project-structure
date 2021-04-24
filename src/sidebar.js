export default function addSidebarEvents() {
  const sidebarTogglerBtn = document.querySelector('.sidebar__toggler');

  if (sidebarTogglerBtn) {
    sidebarTogglerBtn.addEventListener('pointerdown', () => {
      document.body.classList.toggle('is-collapsed-sidebar');
    });
  }
}
