export default class NotificationMessage {
	static active;

	element;
	timerId;

	constructor(message = '', { duration = 2000, type = 'error', ...rest } = {}) {
		this.message = message;
		this.duration = duration;
		this.type = type;
		this.rest = rest;
		this.render();
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
		NotificationMessage.active = null;
	}

	show(parent = document.body) {
		if (NotificationMessage.active) {
			NotificationMessage.active.remove();
		}

		parent.append(this.element);

		this.timerId = setTimeout(() => {
			this.remove();
		}, this.duration);

		NotificationMessage.active = this;
	}

	get template() {
		return `
		<div class="notification notification_${this.type} show">
   		<div class="notification__content">${this.message}</div>
		</div>
		`;
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template;

		this.element = wrapper.firstElementChild;
	}

}
