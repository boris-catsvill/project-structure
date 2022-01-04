export default () => {
  const sidebarToggler = document.querySelector('[data-sidebar-toggler]');
  sidebarToggler.addEventListener('click', () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  });
}
