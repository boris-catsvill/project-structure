export default class NotificationMessage {
	static notification;

	constructor(message = '', {
      duration = 0,
      type = ''
    } = {}) {
		this.message = message;
		this.duration = duration;
		this.type = type;

		this.render();
	}

  render() {
    const notificationWrapper = document.createElement('div');
    notificationWrapper.innerHTML = this.getNotificationHtml;
    this.element = notificationWrapper.firstElementChild;
  }

  /**
   * @returns {string} получение уведомления в формате html
   */
  get getNotificationHtml() {
    return `
		<div class="notification notification_${this.type} show">
   		<div class="notification__content">
        ${this.message}
      </div>
		</div>`;
  }

  /**
   * Отображение сообщения в окне приложения c заданной продолжительностью
   * @param place объект документа, после которого будет отображено сообщение
   */
  show(place = document.body) {
    if (NotificationMessage.notification) {
      NotificationMessage.notification.remove();
    }
    place.append(this.element);
    this.timerNotificationId = setTimeout(() => this.remove(), this.duration);
    NotificationMessage.notification = this;
  }

  /**
   * Удаление сообщения из окна приложения
   */
  remove() {
    clearTimeout(this.timerNotificationId);
    if (this.element) {
      this.element.remove();
    }
  }

  /**
   * Полное удаление сообщения из окна приложения
   */
  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.notification = null;
  }
}
