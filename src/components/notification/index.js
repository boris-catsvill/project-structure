export default class NotificationMessage {

    static openedNotify;
    timeoutId;

    constructor(message = '', {type = 'success', duration = 2000} = {})
        {
        this.message = message;
        this.type = type;
        this.duration = duration;
        
        this.createNotification();
        }

    createNotification(){

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getHTML();
        this.element = wrapper.firstElementChild;

    }

    getHTML() {  
        
        return `
        <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
            <div class="timer"></div> 
            <div class="inner-wrapper">
                <div class="notification-header">Notification</div>
                <div class="notification-body">${this.message}</div>
            </div>             
        </div>`;

    }

    show(parent = document.body){

        if (NotificationMessage.openedNotify) {
            NotificationMessage.openedNotify.remove();
        }

        parent.append(this.element);

        this.timeoutId = setTimeout(this.destroy.bind(this), this.duration);
        NotificationMessage.openedNotify = this;

    }

    remove() {
        clearTimeout(this.timeoutId);

        if (this.element) {
            this.element.remove();
        }
    }
      
    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.openedNotify = null;
    }
}