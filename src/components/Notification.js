export default class NotificationMessage {
  static globalNotifictionElement = null

  constructor({message = '', wrapperOfElement = document.body, duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.durationStart = duration;
    this.wrapperOfElement = wrapperOfElement;
    this.type = type;
  }

  createElement() {
    const element = document.createElement('div');
    const bodyElement = `
      <div class="notification notification_${this.type} show">
        <div class="notification__content">${this.message}</div>
      </div>
    `;
    element.innerHTML = bodyElement;
    return element.firstElementChild;
  }

  render() {
    this.constructor.globalNotifictionElement = this.createElement();
  }

  createTimer() {
    this.constructor.timeoutID = setTimeout(() => {this.destroy();}, this.duration);
  }

  removeTimer() {
    clearTimeout(this.constructor.timeoutID);
    this.constructor.timeoutID = null;
  }

  remove() {
      this.constructor.globalNotifictionElement?.remove();
      this.constructor.globalNotifictionElement = null;
  }

  destroy() {
    this.element = null;
    this.remove();
    this.removeTimer();
  }

  show() {
    this.destroy();
    if (!this.constructor.globalNotifictionElement) {this.render();}
    this.duration = this.durationStart;
    this.createTimer();
    this.wrapperOfElement.append(this.constructor.globalNotifictionElement);
  }
}
