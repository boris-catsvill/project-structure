export default class NotificationMessage {

    static existElement = {};

    constructor(messageText = '',{ duration = 0, type = ''} = {}) {
        this.messageText = messageText;
        this.duration = duration;
        this.type = type;
        this.render();
      }
    
    getTemplate() {
       return `
            <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                ${this.messageText}
                </div>
            </div>
            </div>
            `;
    }

    render(){

      const element = document.createElement("div");
      element.innerHTML = this.getTemplate(); 
      this.element = element.firstElementChild;
    }
    
    show(element = document.body){
        
        if(Object.keys(NotificationMessage.existElement).length)
            NotificationMessage.existElement.remove();
        element.append(this.element);
        NotificationMessage.existElement = this;
        setTimeout(this.remove,this.duration);    
    }

    
    remove = () => {
       if(this.element)
            this.element.remove();
        
        if(NotificationMessage.existElement === this) 
            NotificationMessage.existElement = {};
    }
        
    destroy = () => {
        this.remove();
    }
}
