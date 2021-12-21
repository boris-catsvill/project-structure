import Component from "../../utils/component";

export default class NotificationMessage extends Component {
  static instance = null;
  constructor(message, { duration = 2000, type = 'success', hasHeader = false } = {}) {
    super();
    this.message = message;
    this.duration = duration;
    this.type = type;

    hasHeader = this.hasHeader;

    this.timeoutId = null;
  }

  get template() {
    return (`
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          ${this.hasHeader ? '<div class="notification-header">success</div>' : ''}
          <div class="notification-body notification__content">
            ${this.message}
          </div>
        </div>
      </div>
    `);
  }

  destroy() {
    super.destroy();
    this.remove();
    NotificationMessage.instance = null;
  }

  remove() {
    super.remove();
    clearTimeout(this.timeoutId);
  }

  show(wrap = document.body) {
    if (NotificationMessage.instance) {
      NotificationMessage.instance.remove();
    }

    wrap.append(this.element);

    this.timeoutId = setTimeout(() => {
      this.destroy();
    }, this.duration);

    NotificationMessage.instance = this;
  }
}
