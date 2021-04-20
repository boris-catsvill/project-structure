export default class NotificationMessage {
    static visible = false;

    constructor(message = 'Hello world!', { duration, type } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render();
    }

    getDurationInSec(duration) {
        return duration / 1000;
    }

    getTemplate() {
        return (
            `<div class="notification ${this.type}" style="--value:${this.getDurationInSec(this.duration)}s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                </div>
            </div>`
        );
    }

    render() {
        const element = document.createElement('div'); // (*)

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
    }

    show(renderingElement = document.body) {
        if (!NotificationMessage.visible) {
            NotificationMessage.visible = true;
            this.element.classList.add('show');
        }else{
            document.querySelector('.notification').remove();
        }
        
        renderingElement.append(this.element);

        setTimeout(() => {
            this.element.classList.remove('show');
            this.remove();
            NotificationMessage.visible = false;
        }, this.duration);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
