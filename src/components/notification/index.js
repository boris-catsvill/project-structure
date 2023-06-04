export class NotificationMessage {
  static activeNotification;

  constructor(msg = '', { duration = 1500, type = 'success' } = {}) {
    this.message = msg;
    this.durationMs = duration;
    this.type = type;
    this.render();
  }

  get durationSeconds() {
    return this.durationMs / 1000;
  }

  get template() {
    return `<div class='notification ${this.type}' style='--value:${this.durationSeconds}s'>
                <div class='timer'></div>
                <div class='inner-wrapper'>
                    <div class='notification-header'>${this.type}</div>
                    <div class='notification-body'>
                        ${this.message}
                    </div>
                </div>
            </div>`;
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild;
    this.show();
  }

  show(parent = document.body) {
    this.clearActive();
    NotificationMessage.activeNotification = this;
    parent.append(this.element);
    setTimeout(() => this.remove(), this.durationMs);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }
  }

  clearActive() {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
      NotificationMessage.activeNotification = null;
    }
  }

  destroy() {
    this.remove();
    this.clearActive();
  }
}
