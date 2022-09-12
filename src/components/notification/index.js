export default class NotificationMessage {
  static #activeMsg;
  
  constructor(message = '', {duration = 2000, type = 'error'} = {}) {
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
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }
  
  show(parent = document.body) {
    if(NotificationMessage.#activeMsg) {
      NotificationMessage.#activeMsg.destroy();
    }
    parent.append(this.element);
    NotificationMessage.#activeMsg = this;
    this.timerId = setTimeout(() => this.destroy(), this.duration);
  }
  
  remove() {
    this.element.remove();
  }
      
  destroy() {
    clearTimeout(this.timerId);
    NotificationMessage.#activeMsg = null;
    this.remove();
  }
}