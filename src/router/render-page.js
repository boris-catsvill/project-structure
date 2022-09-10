export default async function(path) {
  const main = document.querySelector('main');

  main.classList.add('is-loading');

  const { default: Page } = await import(/* webpackChunkName: "[request]" */`../pages/${path}/index.js`);
  const page = new Page();
  await page.render();

  main.classList.remove('is-loading');

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(page.element);

  return page;
}
