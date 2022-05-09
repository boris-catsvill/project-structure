export default class NotificationMessage {
  static instance = null
  static defaultElement

  constructor(message = 'Hello world', options = {}) {
    ({duration: this.duration = 4000, type: this.type = 'success', } = options);
    this.message = message;
    if (!NotificationMessage.defaultElement) {NotificationMessage.defaultElement = document.body;}
    if (NotificationMessage.instance) {
      NotificationMessage.instance.destroy();
    }

    this._render();

  }

  getTemplate () {
    return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
    `;
  }

  _render () {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    NotificationMessage.instance = this;
  }

  show (element = NotificationMessage.defaultElement) {
    element.append(this.element);
    setTimeout(this._setTimerForDestroy.bind(this), this.duration);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
  }

  _setTimerForDestroy () {
    this.destroy();
  }

}
