const toggleButton = document.querySelector('.sidebar__toggler');

if (toggleButton !== null) {
  toggleButton.addEventListener('pointerdown', () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  });
}

