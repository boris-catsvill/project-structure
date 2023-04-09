export default class NotificationMessage {
    static prevNotification;

    timer;

    constructor(message = '', { duration = 2000, type = 'success' } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render();
    }

    get template() {
        return `
        <div class="notification notification_${this.type}">
            <div class="notification__content">
            
                ${this.message}
            </div>
        </div>
        `;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        this.element = wrapper.firstElementChild;
    }

    show(container = document.body) {
        container.append(this.element);

        if (NotificationMessage.prevNotification) {
            NotificationMessage.prevNotification.destroy();
        }

        NotificationMessage.prevNotification = this;

        this.element.classList.add('show');

        this.timer = setTimeout(() => {
            this.remove();
        }, this.duration);
    }

    remove() {
        clearTimeout(this.timer);

        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.prevNotification = null;
    }
}
