export default class NotificationMessage {
  static activeComponent = {
    timeoutId: null,
    component: null,
  }; 

  constructor(message = '', {
    duration = 2000,
    type = 'success',
  } = {}) {
    const types = {
      success: 'success',
      error: 'error',
    };
    this.type = types[type];
    if (!this.type) throw new Error('Invalid type specified');

    this.message = message;
    this.duration = duration;

    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${(this.duration / 1000).toFixed(0)}s">
        <div class="inner-wrapper">
          <div class="notification-body">${this.message}</div>
        </div>
        <div class="timer"></div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    const current = this.constructor.activeComponent;
    clearTimeout(current.timeoutId);
    current.component?.remove();
    current.component = target.append(this.element);
    current.timeoutId = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
