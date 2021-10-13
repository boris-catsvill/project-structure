export default class NotificationMessage {
  element;
  static lastElementMessage;

  constructor(textMessage = '', {duration = 0, type = ''} = {}) {
    this.textMessage = textMessage;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  getMessage() {
    return (
      `<div class="notification ${this.type}" style="--value: ${this.duration}ms" >
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class = "notification-header">
            ${this.type}
          </div>
          <div class="notification-body">
              ${this.textMessage}
          </div>
        </div>
      </div>`
    );
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getMessage();
    this.element = element.firstElementChild;
  }

  show(element = document.body) {
    if (NotificationMessage.lastElementMessage) {
      NotificationMessage.lastElementMessage.remove();
    }
    NotificationMessage.lastElementMessage = this.element;

    element.append(this.element);
    setTimeout(
      () => {
        this.remove();
      },
      this.duration
    );
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
