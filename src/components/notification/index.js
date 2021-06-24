
export default class NotificationMessage {
    static activeNotification = null;
    element = null;

    constructor (message = '', {duration = 0, type = ''} = {})  {
            this.duration = duration;
            this.type = type;
            this.message = message;
            
            this.render();
    }

    get template () {
        return  ` <div class="notification success" style="--value:${this.duration*0.001}s">
          <div class="timer"></div>
            <div class="inner-wrapper">
              <div class="notification-header">${this.type}</div>
              <div class="notification-body">
                ${this.message}
              </div>
            </div>
          </div> `
    }

    show() {
        if(NotificationMessage.activeNotification != null) {
            NotificationMessage.activeNotification.remove();
        }
        document.body.append(this.element);
        NotificationMessage.activeNotification = this.element;
        setTimeout(() => this.remove(), this.duration);
    }

    render() {
        this.element = document.createElement('div'); // (*)
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
    }
      
    remove() {
        if(this.element != null)  {
            this.element.remove();
        }
    }

    destroy() {

            this.remove();
            this.element = null;
            NotificationMessage.activeNotification = null;
    }
}

