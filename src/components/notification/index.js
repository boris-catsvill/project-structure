export default class NotificationMessage {
  element = document.createElement('div');
  timer;
  static notificationDiv = document.getElementsByClassName('notification');
  static canShow = true;

  static checkDiv() {
    return this.notificationDiv.length === 0 ?
      this.canShow = true :
      this.canShow = false;
  }

  constructor(text,
              {
                duration = 2000,
                type = 'success',
              } = {}) {

    this.text = text;
    this.duration = duration;
    this.type = type;

    this._render(this.element);
  }

  _getTemplate() {
    return `
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
          ${this.text}
         </div>
        </div>
    `;
  }

  _getParentBlock() {
    this.element.classList.add('notification', this.type);
    this.element.style.setProperty(`--value`, `${this.duration / 1000}s`);
    return this.element;
  }

  show(targetElem = document.body) {
    NotificationMessage.checkDiv();

    let message = this._render();


    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    NotificationMessage.activeNotification = this;
    targetElem.append(message);

    this.timer = setTimeout(() => {
      this.remove();
    }, this.duration);

  }

  _render() {
    this.element = this._getParentBlock();
    this.element.innerHTML = this._getTemplate();
    return this.element;
  }

  remove() {
    this.element.remove();
    clearTimeout(this.timer);
  }

  destroy() {
    this.remove();
  }
}
