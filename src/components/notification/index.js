export default class NotificationMessage {
  static activeNotification = null;
  _element = null;

  constructor(msg = "", { duration = 0, type = "" } = {}) {
    this._msg = msg;
    this._duration = duration;
    this._type = type;

    this.render();
  }

  get element() {
    return this._element;
  }
  get duration() {
    return this._duration;
  }

  render() {
    const wrap = document.createElement("div");
    wrap.innerHTML = this._getTemplate();
    this._element = wrap.firstElementChild;
  }

  show(div = document.body) {
    if (NotificationMessage.activeNotification)
      NotificationMessage.activeNotification.remove();

    div.append(this.element);

    NotificationMessage.activeNotification = this;

    setTimeout(() => {
      this.remove();
    }, this._duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this._element = null;
  }

  _getTemplate() {
    return `
      <div class="notification ${
        this._type
      }" style="--value:${this._getSeconds()}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this._type}</div>
          <div class="notification-body">${this._msg}</div>
        </div>
      </div>
    `;
  }

  _getSeconds() {
    return Math.round(this._duration / 1000);
  }
}

// git pull upstream master
