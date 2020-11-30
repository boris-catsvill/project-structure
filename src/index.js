import Router from './router/index.js'
import tooltip from './components/tooltip/index.js'
import NotificationMessage from "./components/notification"

tooltip.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, 'dashboard')
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();

document.addEventListener('product-saved', (e) => {
  const notification = new NotificationMessage({
    message: 'Товар добавлен',
    duration: 3000,
    tape: 'success'
  })
  console.log(notification)

  notification.show()
})

document.addEventListener('product-updated', (e) => {
  const notification = new NotificationMessage({
    message: 'Товар сохранен',
    duration: 3000,
    tape: 'success'
  })
  console.log(notification)
  notification.show()
})

const sidebarToggler = document.querySelector('.sidebar__toggler')
const body = document.querySelector('body')
sidebarToggler.addEventListener('pointerdown', (e) => {
  body.classList.toggle('is-collapsed-sidebar')
})
