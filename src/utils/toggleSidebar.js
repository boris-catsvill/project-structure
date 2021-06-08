export default function toggleSidebar() {
  const documentBody = document.body;

  if (documentBody.classList.contains('is-collapsed-sidebar')) {
    documentBody.classList.remove('is-collapsed-sidebar');
  } else {
    documentBody.classList.add('is-collapsed-sidebar');
  }
}
