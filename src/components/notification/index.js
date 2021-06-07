export default class NotificationMessage {
  static alert
  constructor(text = "", {duration = 1000, type = "success"} = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;
  }

  get templateAlert() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.text}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.templateAlert;
    NotificationMessage.alert = this.element;
    return NotificationMessage.alert;
  }

  show(wrapper = document.body) {
    if (NotificationMessage.alert) NotificationMessage.alert.remove();
    wrapper.append(this.render());
    setTimeout(() => this.remove(), this.duration)
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}