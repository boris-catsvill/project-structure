/**
 * Базовый компонент страницы
 */
export default class BasicPage {

  /**
   * Корневой DOM элемент страницы
   * @type {HTMLDivElement}
   */
  element;

  /**
   * Список DOM элементов по имени на странице
   * @type {Object<String, HTMLElement>}
   */
  subElements = {};

  /**
   * Список компонентов на странице
   * @type {Object<String, BasicComponent>}
   */
  components = {};

  constructor() {
    this.element = document.createElement('div');
  }

  initComponents() {
    // NO-OP
  }

  async renderComponents() {
    return await Promise.all(
      [...Object.values(this.components)].map(c => c.render())
    );
  }

  /**
   * Создаёт элементы на странице. Вызывается единожды при загрузке страницы.
   * @return {Promise<HTMLDivElement>}
   */
  async render() {
    this.element.innerHTML = this.getTemplate();
    this.element = this.element.firstElementChild;
    this.subElements = BasicPage.findSubElements(this.element);

    this.initComponents();
    await this.renderComponents();

    // Вставка компонентов на страницу
    for (const [name, component] of Object.entries(this.components)) {
      this.subElements[name].append(component.element);
    }

    return this.element;
  }

  /**
   * Возвращает шаблон страницы
   * @return {string}
   */
  getTemplate() {
    return '';
  }

  /**
   * Выгружает страницу и все компоненты на ней
   */
  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  /**
   * Ищет элементы компонента по атрибуту <b>data-element</b>
   * @param {HTMLElement} root Корневой элемент
   * @return {Object<String,HTMLElement>}
   */
  static findSubElements(root) {
    return Object.fromEntries(
      [...root.querySelectorAll('[data-element]')]
        .map(el => [el.dataset.element, el])
    );
  }
}
