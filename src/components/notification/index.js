export default class NotificationMessage {
  /** @type {?NotificationMessage} */
  static activeInstance;

  /**
   * @param {string} message
   * @param {number} duration
   * @param {string} type
   */
  constructor(message = '', {
    duration = 8000,
    type = ''
  } = {}) {
    this.duration = duration;
    this.element = document.createElement('div');
    this.element.className = 'notification ' + type;
    this.element.innerHTML = this.getTemplate(type, message);
  }

  /**
   * @param {string} type
   * @param {string} message
   * @return {string}
   */
  getTemplate(type, message) {
    return `<div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${type}</div>
      <div class="notification-body">${message}</div>
    </div>`;
  }

  /**
   * @param {HTMLElement} container
   */
  show(container = document.body) {
    if (NotificationMessage.activeInstance) {
      NotificationMessage.activeInstance.destroy();
    }

    container.appendChild(this.element);

    this.element.style.setProperty('--value', this.duration + 'ms');
    this.timeoutId = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeInstance = this;
  }

  remove() {
    if (this.element) {
      clearTimeout(this.timeoutId);
      this.element.remove();
      NotificationMessage.activeInstance = null;
    }
  }

  destroy() {
    if (this.element) {
      this.remove();
      this.element = null;
    }
  }
}
