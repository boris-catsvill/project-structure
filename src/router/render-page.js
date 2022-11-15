export default async function(path, match) {
  const main = document.querySelector('main');

  main.classList.add('is-loading');

  const { default: Page } = await import(/* webpackChunkName: "[request]" */`../pages/${path}/index.js`);
  const page = new Page(match);
  const element = await page.render();

  main.classList.remove('is-loading');

  const elems = main.querySelector('.sidebar__nav').children;
  const pathname = path.split('/')[0];
 
      for(let i=0; i<elems.length; i++){
        if (elems[i].firstElementChild.getAttribute('data-page') === pathname) {
          elems[i].classList.add("active");
        } else {
          elems[i].classList.remove("active");
        }        
      } 

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(element);

  return page;
}
