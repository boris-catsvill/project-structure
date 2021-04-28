export default function sidebarEventsInit() {
  const sidebarTogglerBtn = document.querySelector('.sidebar__toggler');

  function getTemplate() {
    return `
      <ul class="sidebar__nav sidebar__nav_bottom">
        <li>
          <button type="button" class="sidebar__toggler">
            <i class="icon-toggle-sidebar"></i> <span>Toggle sidebar</span>
          </button>
        </li>
      </ul>
    `;
  }

  function addListenerForTogglerBtn(btn) {
    btn.addEventListener('pointerdown', () => {
      document.body.classList.toggle('is-collapsed-sidebar');
    });
  }

  if (!sidebarTogglerBtn) {
    const sidebarBottomElement = document.createElement('div');
    const sidebar = document.querySelector('.sidebar');

    sidebarBottomElement.insertAdjacentHTML('beforeend', getTemplate());
    sidebar.append(sidebarBottomElement.firstElementChild);

    const togglerBtn = sidebar.querySelector('.sidebar__toggler');
    addListenerForTogglerBtn(togglerBtn);
  } else {
    addListenerForTogglerBtn(sidebarTogglerBtn);
  }
}