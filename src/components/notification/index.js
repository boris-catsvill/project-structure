export default class NotificationMessage {
    static activeElement = null;

    constructor(message = '', {duration = 0, type = ''} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.render();
    }

    render() {
        let element = document.createElement('div');
        element.innerHTML = `
        <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
        `;

        this.element = element.firstElementChild;
    }

    destroy() {
        this.remove();

        //--ВОПРОС--//
        //При установки данного значения, падает тест "should have ability to be destroyed"
        //this.element = {};
    }

    remove() {
        if (NotificationMessage.activeElement === this) {
           NotificationMessage.activeElement = null; 
        };
        this.element.remove();
    }

    show(root = document.body) {
        if (NotificationMessage.activeElement) {
            this.destroy.call(NotificationMessage.activeElement);
        }        
        root.append(this.element);
        NotificationMessage.activeElement = this;
        setTimeout(() => this.remove(), this.duration);
    }

}
