export default class NotificationMessage {
  static currentShownNotification = null;

  element = null;
  hideTimeout = null;

  constructor(message = '', { type = '', duration = 0 } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.createNodes();
  }

  get template() {
    return `<div class='notification ${ this.type }' style='--value:${ `${ this.duration / 1000 }s` }'>
    <div class='timer'></div>
    <div class='inner-wrapper'>
      <div class='notification-header'></div>
      <div class='notification-body'>
        ${ this.message }
      </div>
    </div>
  </div>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }

  destroy() {
    this.remove();
  }

  createNodes() {
    const container = document.createElement('div');
    container.innerHTML = this.template;
    this.element = container.firstElementChild;
  }

  show(rootNode) {
    if (NotificationMessage.currentShownNotification) {
      NotificationMessage.currentShownNotification.remove();
    }

    (rootNode || document.body).append(this.element);
    NotificationMessage.currentShownNotification = this;

    this.hideTimeout = setTimeout(() => {
      this.remove();
      NotificationMessage.currentShownNotification = null;
    }, this.duration);
  }
}
