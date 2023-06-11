class NotificationMessage {
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

  get isActive() {
    return NotificationMessage.activeNotification === this;
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
    if (this.isActive) {
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

export const successNotice = (msg = '', params = {}) => {
  const type = 'success';
  notification(msg, { ...params, type });
};

export const errorNotice = (msg = '', params = {}) => {
  const type = 'error';
  notification(msg, { ...params, type });
};

export const notification = (msg = '', { parent = document.body, ...params } = {}) => {
  const notification = new NotificationMessage(msg, params);
  notification.show(parent);
};
