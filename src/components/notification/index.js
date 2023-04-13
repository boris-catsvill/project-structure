export default class NotificationMessage {
	
	static activeNotification;
	timerId;
	
	constructor(msg = '', {
	  duration = 2000,
	  type = 'success'	
	} = {}) {
	  this.msg = msg;
	  this.duration = duration;
	  this.type = type;
		
	  this.render();
		
	}

	get durationInSeconds() {	
	  return this.duration / 1000 + 's';
	}
	
	get template() {
	  return `
		<div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
			<div class="timer"></div>
			<div class="inner-wrapper">
			<div class="notification-header">success</div>
				<div class="notification-body">
					${this.msg}
				</div>
			</div>
  	</div>
    `;
	}

	render() {
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = this.template;
	  this.element = wrapper.firstElementChild;
	}


	
	
	show(popupContainer = document.body) {
		
		if (NotificationMessage.activeNotification) {
			NotificationMessage.activeNotification.remove();
		}
		
		popupContainer.append(this.element);
		
		this.timerId = setTimeout(() => {
			this.remove();
		}, this.duration);
		
		NotificationMessage.activeNotification = this;
		
	}
	


	remove() {		
		clearTimeout(this.timerId);
	  if (this.element) {
	    this.element.remove();
	  }
		
	}

	destroy() {
	  this.remove();
	  this.element = null;
	}
}
