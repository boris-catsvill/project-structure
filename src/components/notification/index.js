export default class NotificationMessage {
	static activeNotification;
	element;
	timer;

	constructor (string = '', {
		duration = 2000,
		type = 'success'
	} = {}) {
		this.string = string;
		this.duration = duration;
		this.type = type;

		this.render();
	}

	getTemplate() {
		return `
			<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
				<div class="timer"></div>
				<div class="inner-wrapper">
					<div class="notification-header">${this.type}</div>
					<div class="notification-body">
						${this.string}
					</div>
				</div>
			</div>
		`;
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.getTemplate();
		
		this.element = wrapper.firstElementChild;
	}

	show(target = document.body) {
		if (NotificationMessage.activeNotification) {
			NotificationMessage.activeNotification.remove();
		}

		target.append(this.element);

		this.timer = setTimeout(() => {
			this.remove();
		}, this.duration);

		NotificationMessage.activeNotification = this;
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
		NotificationMessage.activeNotification = null;
	}
}
