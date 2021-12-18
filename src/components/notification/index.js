export default class NotificationMessage {
  static prevNotification;
  static timerID = null;

  constructor(message = 'DefaultMessage', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  getTemplate() {
    return `
    <div class="notification notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>
`}

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate()
    this.element = wrapper.firstElementChild;
  }

  show(node = document.body) {
    if (NotificationMessage.prevNotification) {
      NotificationMessage.prevNotification.remove();
    }
    this.element.style.position = 'fixed';
    const { clientHeight, clientWidth } = document.documentElement;
    const verticalShift = 100;
    const horizontalShift = 300;
    this.element.style.top = clientHeight - verticalShift + 'px';
    this.element.style.left = clientWidth - horizontalShift + 'px';
    node.append(this.element);
    NotificationMessage.timerID = setTimeout(() => {
      this.remove();
    }, this.duration)
    NotificationMessage.prevNotification = this;
  }

  remove() {
    this.element.remove();
    clearTimeout(NotificationMessage.timerID);
  }

  destroy() {
    this.remove();
    NotificationMessage.prevNotification = null;
  }
}
