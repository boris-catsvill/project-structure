export default () => {
  const sidebarToggler = document.querySelector('[data-sidebar-toggler]');
  sidebarToggler.addEventListener('click', (e) => {
    if (document.body.classList.contains('is-collapsed-sidebar')) {
      document.body.classList.remove('is-collapsed-sidebar');
    } else {
      document.body.classList.add('is-collapsed-sidebar');
    }
  });
}
