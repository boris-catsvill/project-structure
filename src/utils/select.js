export default function() {
    const aside = document.body.querySelector('aside');
    const asideNav = aside.querySelector('ul');
    const active = asideNav.querySelector('.active');
    
    if (active) {
        active.classList.remove('active');
    }

    let pathname = document.location.pathname;
    const link = pathname.indexOf('/', 1)

    if (link !== -1) {
        pathname = pathname.slice(0, link);
    }
    
    const linkActive = asideNav.querySelector(`a[href="${pathname}"]`);
    linkActive.parentElement.classList.add('active');
}