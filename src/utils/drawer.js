const listenChangeRoute = () => {
  const navBarElement = document.querySelector('.sidebar__nav');
  const li = [...navBarElement.querySelectorAll('[data-page]')];

  document.addEventListener('route', ({ detail }) => {
    const { path } = detail;

    li.forEach(link => link.style.color = '');

    const currentRoute = li.find(link => link.dataset.page === path);

    if(currentRoute) {
      currentRoute.style.color = '#109cf1';
    }
  });
};


const toggleDrawer = () => {
  const button = document.querySelector('.sidebar__toggler');

  const toggleStyle = () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  button.addEventListener('pointerdown', toggleStyle);

  return () => {
    button.removeEventListener('pointerdown', toggleStyle);
  }
};

export {listenChangeRoute, toggleDrawer};