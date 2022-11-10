export default class NotificationMessage {
  constructor(msg = '', { duration = 0, type = 'error' } = {}) {
    this.msg = msg;
    this.duration = duration;
    this.type = type;

    this.createElement();
  }

  get HTMLTemplate() {
    return `
          <div 
              class="notification ${this.type}"
              style="--value:${this.duration / 1000}s; --top:${window.scrollY}px"
          >
              <div class="timer"></div>
                  <div class="inner-wrapper">
                  <div class="notification-header">${this.type}</div>
                  <div class="notification-body">
                      ${this.msg}
                  </div>
              </div>
          </div>
      `;
  }

  removeTimeout() {
    if (NotificationMessage.timeout) {
      clearTimeout(NotificationMessage.timeout);
    }
  }

  checkNotification() {
    if (NotificationMessage.element) {
      this.removeGlobal();
    }
    this.removeTimeout();
  }

  createElement() {
    this.checkNotification();

    const element = document.createElement('div');
    element.innerHTML = this.HTMLTemplate;
    NotificationMessage.element = element.firstElementChild;
    this.element = element.firstElementChild;

    this.initEventListeners()
  }

  show(element = document.body) {
    element.append(NotificationMessage.element);

    NotificationMessage.timeout = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  moveNotification = () => {
    this.element.style.setProperty('--top', `${window.scrollY}px`)
  }

  initEventListeners() {
    document.addEventListener('scroll', this.moveNotification)
  }

  removeEventListeners() {
    document.removeEventListener('scroll', this.moveNotification)
  }

  removeGlobal() {
    NotificationMessage.element?.remove();
  }

  remove() {
    this.element?.remove();
    this.removeTimeout();
    this.removeEventListeners()
  }

  destroy() {
    this.remove();
    this.removeEventListeners()
  }
}
