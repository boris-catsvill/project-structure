export default class NotificationMessage {
    static shownNotification = null;
    duration = 0;
    message = "";
    type = "";
    element = null;
    
    constructor (message, { duration = 1000, type = "success" } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        
        this.render();
    }

    get template() {
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
        this.element = document.createElement("div");
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
    }

    show(target) {
        if (NotificationMessage.shownNotification) {
            NotificationMessage.shownNotification.remove();
        }
        NotificationMessage.shownNotification = this.element;
        if (target) {
            target.append(this.element);
        }
        else {
            document.body.append(this.element);
        }
        setTimeout(() => this.remove(), this.duration);
    }

    remove() {
        if (this.element)
            this.element.remove();
    }

    destroy() {
        this.remove();
        this.element = null;
    }
}
