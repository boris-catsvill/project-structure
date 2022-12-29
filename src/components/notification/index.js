export default class NotificationMessage {
    static currentElement;

    constructor(
        textMessage = '',
        {
            duration = 0,
            type = 'success',
        } = {}
    ) {
        this.textMessage = textMessage;
        this.duration = duration;
        this.durationSec = (this.duration / 1000).toFixed(0)
        this.type = type;

        this.render();
    }

    getTemplate() {
        return `
        <div class="notification ${this.type}" style="--value:${this.durationSec}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
              ${this.textMessage}
            </div>
          </div>
        </div>
        `
    }

    render() {
        const element = document.createElement("div");

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
    }

    show(element = document.body) {
        if (NotificationMessage.currentElement) {
            NotificationMessage.currentElement.remove();
        }

        NotificationMessage.currentElement = this;

        element.append(this.element);

        setTimeout(() => this.remove(), this.duration);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}
