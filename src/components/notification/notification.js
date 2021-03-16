export default class NotificationMessage {
    static activeNotification;
  
    constructor(message, {
      duration = 2000,
      type = 'success',
    } = {}) {
  
      if (NotificationMessage.activeNotification) {
        NotificationMessage.activeNotification.remove();
      }
  
      this.message = message;
      this.durationInSeconds = (duration / 1000) + 's';
      this.type = type;
      this.duration = duration;
  
      this.render();
    }
  
    get template() {
      return `<div class="notification notification_${this.type} show" style="--value:${this.duration / 1000}s">
      <div class="notification__content">
        ${this.message}
      </div>
    </div>`;
    }
  
    render() {
      const element = document.createElement('div');
  
      element.innerHTML = this.template;
  
      this.element = element.firstElementChild;
  
      NotificationMessage.activeNotification = this.element;
    }
  
    show(parent = document.body) {
      parent.append(this.element);
      console.log(this.duration);
      setTimeout(() => {
        this.remove();
      }, this.duration);
    }
  
    remove() {
      this.element.remove();
    }
  
    destroy() {
      this.remove();
      //NotificationMessage.activeNotification = null;
    }
}