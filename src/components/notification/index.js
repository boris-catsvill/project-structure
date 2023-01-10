export default class NotificationMessage {
    static lastNotif;

    timerId;
    constructor( message = '', {
        duration = 2000,
        type  = 'success'
        } = {} ) {

        this.message = message;
        this.duration = duration;
        this._timeDur = (duration / 1000).toFixed(0);
        this.type = type;
        
        this.render();
    }
    
    getTemplate() {
        return `<div class="notification ${this.type}"
            style="--value:${this._timeDur}s">
            <div class="notification__content"> 
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">Notification</div>
            <div class="notification-body">
                ${this.message}
            </div>
          </div>
          </div>
        </div>
        `;
    }
    
    render() {
        const element = document.createElement("div");
    
        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;
    }

    show(parentElement = document.body) {
        if(NotificationMessage.lastNotif) {
            NotificationMessage.lastNotif.remove( );
        }

        parentElement.append(this.element);        
        
        this.timerId = setTimeout( ()=> {
            this.remove();
        }, this.duration );

        NotificationMessage.lastNotif = this;
    }

    remove(){
        clearTimeout( this.timerId );
        if ( this.element ){
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        NotificationMessage.lastNotif = null;
    } 
}
