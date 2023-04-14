export default class NotificationMessage {
    static currentNotification;

    constructor(
      notification,
      {duration = 1000, type = 'success'} = {}) {
      this.notification = notification;
      this.duration = duration;
      this.type = type;
      this.render();
    }

    get template() {
      return `
        <div class="notification ${this.type}" style="--value:${this.duration + 'ms'}">
          <div class="timer"></div>
          <div class="inner-wrapper">
              <div class="notification-header">${this.type}</div>
              <div class="notification-body">
                  ${this.notification}
              </div>
          </div>
        </div>
      `;
    }

    render() {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.template;
      this.element = wrapper.firstElementChild;
    }

    show(element = document.body) {
      if (NotificationMessage.currentNotification) {
        NotificationMessage.currentNotification.remove();
      }

      element.append(this.element);
      this.timerId = setTimeout(() => this.remove(), this.duration);

      NotificationMessage.currentNotification = this;
    }

    remove() {
      this.element.remove();
    }

    destroy() {
      this.remove();
      clearInterval(this.timerId);
    }
  }