export default class NotificationMessage {
    static activeNotifivation;
    
    element;

    constructor(message, {
        duration = 1000,
        type = "success",
    } = {}){
        this.duration = duration;
        this.message = message;
        this.type = type;

        if (this.type !== "success") {
            this.type = "error";
        }

        this.render();
    }

    get temmplate(){
        return `
            <div class="timer"></div>
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">${this.message}</div>
        `
    }
    render(){
        const notification = document.createElement('div')
        notification.className = `notification ${this.type}`;
        notification.setAttribute("style", `--value:${this.duration / 1000}s`);
        notification.innerHTML = this.temmplate;


        this.element = notification;
    }

    show(parent = document.body){
        if (NotificationMessage.activeNotifivation){
            NotificationMessage.activeNotifivation.remove();
        }

        parent.append(this.element)
        setTimeout(() => this.remove(), this.duration);

        NotificationMessage.activeNotifivation = this;
    }
    remove(element = this.element){
        element.remove();
    }
    destroy(){
        this.remove();
    }

}
