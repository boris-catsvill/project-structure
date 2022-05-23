import NotificationMessage from "../components/notification";

export default async function (path, match) {
  const main = document.querySelector('main');

  main.classList.add('is-loading');

  const { default: Page } = await import(/* webpackChunkName: "[request]" */`../pages/${path}/index.js`);
  const page = new Page();
  const element = await page.render();

  main.classList.remove('is-loading');

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(element);

  const toogleSidebar = document.querySelector('.sidebar__toggler');
  toogleSidebar.addEventListener('click', () => document.body.classList.toggle('is-collapsed-sidebar'));

  document.addEventListener('notification-message', event => {
    const { message, status } = event.detail;
    console.log(`message: ${message}, status: ${status}`);
    const notification = new NotificationMessage(message, {
      duration: 500000,
      type: status,
    });

    notification.show();
  });



  return page;
}
