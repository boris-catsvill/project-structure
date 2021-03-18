export default class NotificationMessage {
    constructor(message = '', {duration = 2000, type = 'success'} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.durationInSeconds = duration / 1000;

        this.render();
    }

    static notification;

    getNotification() {
        const {duration, message, type, durationInSeconds} = this;

        return `
            <div class="notification ${type}" style="--value:${durationInSeconds}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">Notification</div>
                    <div class="notification-body">
                        ${message}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.getNotification();
    
        this.element = element.firstElementChild;
    }

    show(targetElement = document.body) {
        if (NotificationMessage.notification) NotificationMessage.notification.remove();

        targetElement.append(this.element);
        NotificationMessage.notification = this.element;

        setTimeout(() => this.remove(), this.duration);
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
    }
}
