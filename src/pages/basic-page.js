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
   * @type {Map<String, Component>}
   */
  components = new Map();

  constructor() {
    this.element = document.createElement('div');
  }

  initComponents() {
    // NO-OP
  }

  async renderComponents() {
    const elements = await Promise.all(
      [...this.components.values()].map(c => c.render())
    );

    this.element.append(...elements);
  }

  /**
   * Создаёт элементы на странице. Вызывается единожды при загрузке страницы.
   * @return {Promise<HTMLDivElement>}
   */
  async render() {
    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  /**
   * Выгружает страницу и все компоненты на ней
   */
  destroy() {
    for (const component of this.components.values()) {
      component.destroy();
    }
  }
}
