export default class NotificationMessage {
    static isActive;
    timerId;
    element;

    constructor(message = '', {duration = 2000, type = 'success'} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render()
    }

    getTemplate() {
        return `
            <div class="notification ${this.type}" style="--value: ${this.duration}ms">
               <div class="timer"></div>
               <div class="inner-wrapper">
                   <div class="notification-header">${this.type}</div>
                   <div class="notification-body">${this.message}</div> 
               </div>
            </div>
        `
    }

    render() {
        const element = document.createElement("div");

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
    }

    show(parent = document.body) {
        if(NotificationMessage.isActive) {
            NotificationMessage.isActive.remove()
        }

        parent.append(this.element);

        const timerId = setTimeout(() => {
            this.remove();
        }, this.duration);

        NotificationMessage.isActive = this;
    }

    remove() {
        clearTimeout(this.timerId);

        if(this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.isActive = null;
    }
}