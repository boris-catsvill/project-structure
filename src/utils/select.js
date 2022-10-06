export default function() {
    const aside = document.body.querySelector('aside');
    const asideNav = aside.querySelector('ul');
    const active = asideNav.querySelector('.active');
    
    if (active) {
        active.classList.remove('active');
    }

    let pathname = document.location.pathname;
    const r = pathname.indexOf('/', 1)

    if (r !== -1) {
        pathname = pathname.slice(0, r);
    }
    
    const a = asideNav.querySelector(`a[href="${pathname}"]`);
    a.parentElement.classList.add('active');

    const asideToggle = aside.lastElementChild.querySelector('button');
    
    asideToggle.addEventListener('mouseup', () => {
        if (document.body.className === '') {
            document.body.classList.add('is-collapsed-sidebar')
        } else document.body.classList.remove('is-collapsed-sidebar');
    })
}