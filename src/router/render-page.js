export default async function (path, match) {
  const main = document.querySelector('main');
  const [, id] = match;

  main.classList.add('is-loading');

  const { default: Page } = await import(
    /* webpackChunkName: "[request]" */ `../pages/${path}/index.js`
  );
  const page = id ? new Page(id) : new Page();
  const element = await page.render();

  main.classList.remove('is-loading');

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(element);

  return page;
}
