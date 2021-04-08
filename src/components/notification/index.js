export default class NotificationMessage {
    static prevElem;

    constructor(message, { duration, type } = {}) { 
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.render();
    }

    render() { 
        const notification = document.createElement('div');
        notification.className = `notification ${this.type}`;
        notification.style.cssText = `--value:${this.duration / 1000}s`;
        notification.innerHTML = `
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        `

        this.element = notification;
    }

    show(targetRenderElement = document.body) { 

        if (NotificationMessage.prevElem) return;
        
        targetRenderElement.append(this.element);
        NotificationMessage.prevElem = this.element;

        setTimeout(() => {
            this.remove();
            NotificationMessage.prevElem = null;
        }, this.duration);
    }

    remove() { 
        this.element.remove();
    }

    destroy() { 
        this.remove();
    }
}
