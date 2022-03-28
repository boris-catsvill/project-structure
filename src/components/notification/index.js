export default class NotificationMessage {
  static activeNotification;
  
  element = {};
  timerId = 0;

  constructor(title, {duration = 1000, type = 'success'} = {}) {
    this.title = title;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate = () => {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.title}
        </div>
      </div>
    </div>
    `;
  };

  render = () => {
    const $wrapper = document.createElement('div');
    this.element = this.getTemplate();
    $wrapper.insertAdjacentHTML('beforeend', this.element);
    
    this.element = $wrapper.firstElementChild;
  };

  show = (el = document.body) => {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.element.remove();
    }

    el.append(this.element);
    NotificationMessage.activeNotification = this;
    this.timerId = setTimeout(this.remove, this.duration);
  };

  destroy = () => {
    this.element = null;
    NotificationMessage.activeNotification = null;
  };
  
  remove = () => {
    clearTimeout(this.timerId);
    if (this.element) {
      this.element.remove();
    }
  };
}

