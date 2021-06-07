import NotificationMessage from '../components/notification/index.js';

function highlightLi(event, sidebarNav) {
  sidebarNav.forEach(element => {
    element.classList.remove('active');
  });

  const currentLi = event.target.closest('li');
  const path = window.location.pathname;
  const href = currentLi.children[0].getAttribute('href');
  if (path === href) {
    currentLi.classList.add('active');
  }
}

export const checkHighlightLi = () => {
  const path = window.location.pathname;
  const sidebarNav = document.querySelector('.sidebar__nav');
  const sidebarNavLi = sidebarNav.querySelectorAll('li');

  sidebarNavLi.forEach(element => {
    if (element.children[0].getAttribute('href') === path) {
      element.classList.add('active');
    }
    element.addEventListener('click', event => highlightLi(event, sidebarNavLi));
  });
};

export const toggleSideBar = () => {
  const body = document.querySelector('body');
  body.classList.toggle('is-collapsed-sidebar');
  checkHighlightLi();
}

export const showNotification = () => {
  const notificationWrapper = document.querySelector('div[data-element=categoriesContainer]');
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 80%;
    right: 10%;
  `;
  const notification = new NotificationMessage('Категория изменена', { duration: 2000 });
  notification.show(notificationWrapper);
};

export const showNotificationUpdate = () => {
  const notificationWrapper = document.querySelector('.content');
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 80%;
    right: 10%;
  `;
  const notification = new NotificationMessage('Категория изменена', { duration: 2000 });
  notification.show(notificationWrapper);
};