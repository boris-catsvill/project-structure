export default class NotificationMessage {
    static message = null;
    static timeout = null;

    constructor(message = '', {
        duration = 2000,
        type = 'success'
    } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.show();
    }

    get template() {
        return `<div class="notification show ${this.type}" style="--value:${this.durationInSeconds}">
            <div class="notification__content">
                ${this.message}
            </div>
        </div>`;
    }

    show(container = document.body) {
        this.destroy();
        this.remove();

        const element = document.createElement('div');

        element.innerHTML = this.template;
        NotificationMessage.message = element.firstElementChild;

        this.element = element.firstElementChild;

        container.append(this.element);

        NotificationMessage.timeout = setTimeout(this.destroy, this.duration);
    }

    remove() {
        this.element && this.element.remove();
    }

    destroy() {
        if (NotificationMessage.message) {
            NotificationMessage.message.remove();
            NotificationMessage.message = null;
            clearTimeout(NotificationMessage.timeout);
        }
    }
}