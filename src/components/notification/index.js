export default class NotificationMessage {
  static activeMessage;
  timerId;

  constructor(message = '', {duration = 2000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
  
    this.render();
  }
    
  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }
  
  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }
  
  show(parent = document.body) {
    if (NotificationMessage.activeMessage) {
      NotificationMessage.activeMessage.remove();
    }
    
    parent.append(this.element);
    
    this.timerId = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeMessage = this.element;
  }
  
  remove() {
    this.element.remove();
  }
      
  destroy() {
    clearTimeout(this.timerId);
    NotificationMessage.activeMessage = null;
    this.remove();
  }
}
