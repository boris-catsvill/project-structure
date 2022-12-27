import BasicPage from '../basic-page';

export default class extends BasicPage {

  async render() {
    this.element.className = 'error-404';
    this.element.innerHTML = `<h1 class='page-title'>Страница не найдена</h1>
        <p>Извините, страница не существует</p>`;

    return super.render();
  }
}
