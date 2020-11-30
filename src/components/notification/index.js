let lastNotification = null

export default class NotificationMessage {
  element = null

  constructor({message = '', duration = 3000, type = 'success'} = {}) {
    this.message = message
    this.duration = duration
    this.type = type
    this.render()
  }

  removeLastNotification() {
    if (lastNotification) {
      lastNotification.destroy()
    }
   }

  render() {
    const element = document.createElement('div')
    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${this.duration}ms;">
        <div class="timer" style="--value:${this.duration}ms;"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Notification</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `
    this.element = element.firstElementChild
  }

  show(parentElement = document.querySelector('body')) {
    this.removeLastNotification()
    parentElement.appendChild(this.element)
    lastNotification = this
    setTimeout(() => {
      this.remove()
    }, this.duration)
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.element.remove()
  }
}
