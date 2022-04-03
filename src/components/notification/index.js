export default class NotificationMessage {
    static currNotification
    
    timerRef
    element

    constructor (message = 'message', {type = 'success', duration = 1000} = {}) {
      this.message = message;
      this.type = type;
      this.duration = duration;

      this.render();
    }

    renderElement () {
      return `
      <div class="notification ${this.type}" style="--value:${Math.round(this.duration / 1000)}s">
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

    render () {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.renderElement();

      this.element = wrapper.firstElementChild;
    }

    show (parent = document.body) {
      if (NotificationMessage.currNotification) {
        NotificationMessage.currNotification.remove();
      }

      parent.append(this.element);

      NotificationMessage.currNotification = this;

      this.timerRef = setTimeout(() => {
        this.remove();
      }, this.duration);
    }

    remove () {
      clearTimeout(this.timerRef);
        
      if (this.element) {
        this.element.remove();
      }
    }

    destroy () {
      this.remove();
    }
}
