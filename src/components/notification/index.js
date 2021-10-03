export default class NotificationMessage {
  constructor(text, params) {

    this.text = text;
    Object.assign(this, {duration: 1000, type: 'success'}, params);
    this.render();
  }

  render() {
    const element = document.createElement('div'); // (*)

    element.innerHTML = `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.text}
      </div>
    </div>
  </div>
    `;

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
  }

  show(div) {
    if (window.notifications && window.notifications.length) {
      window.notifications.forEach(item => item.destroy());
    }
    window.notifications = [this];
    const target = div || document.body;
    target.append(this.element);
    this.initEventListeners();
  }

  initEventListeners () {
    this.timer = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
