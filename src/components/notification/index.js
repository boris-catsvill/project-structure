export default class NotificationMessage {
  constructor(message, {
    duration = 2000,
    type = 'success'
  } = {}) {
    if (NotificationMessage.instance) {
      NotificationMessage.instance.remove();
    }

    this.message = message;
    this.duration = duration;
    this.type = type;
    
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="notification notification_${this.type} show" style="--value:${this.duration / 1000}s">
        <div class="notification__content">${this.message}</div>
      </div>
    `;
    this.element = element.firstElementChild;
    NotificationMessage.instance = this;
  }

  show(container = document.body) {
    container.append(this.element);

    this.timer = setTimeout(this.remove.bind(this), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.instance = null;
    clearTimeout(this.timer);
  }

}
