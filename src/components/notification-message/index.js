export default class NotificationMessage {
    constructor(text) {
        this.text = text
    }
    render() {
        return this.createElement(`
        <div id="notification__message">
  <div id="success-box">
    <div class="face">
      <div class="eye"></div>
      <div class="eye right"></div>
      <div class="mouth happy"></div>
    </div>
    <div class="shadow scale"></div>
    <div class="message"><h1 class="alert">Success!</h1><p>${this.text}</p></div>
  </div>
</div>
`)
    }

    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }

}