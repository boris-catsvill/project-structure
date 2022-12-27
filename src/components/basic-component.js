/**
 * Базовый класс компонента
 */
export default class BasicComponent {

  /**
   * Корневой DOM элемент компонента
   * @type {?HTMLDivElement}
   */
  element;

  /**
   * Список DOM элементов компонента по имени
   * @type {Object<String, HTMLElement>}
   */
  subElements = {};

  constructor() {
    this.element = document.createElement('div');
  }

  /**
   * Создаёт элементы компонента
   * @return {Promise<HTMLDivElement>}
   */
  async render() {
    this.update();
    return this.element;
  }

  /**
   * Обновляет состояние DOM элементов в соответствии с хранимыми в компоненте данными
   */
  update() {
    // NO-OP
  }

  /**
   * Убирает компонент со страницы
   */
  remove() {
    this.element.remove();
  }

  /**
   * Уничтожает компонент и отменяет все обработчики
   */
  destroy() {
    if (this.element) {
      this.remove();
      this.element = null;
      this.subElements = {};
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

  /**
   * Фильтрует список CSS-классов по значению
   * @param {Object<String, boolean>} list Class names
   * @return {String[]}
   */
  static filterClassList(list) {
    return Object.entries(list)
      .filter(([clazz, enabled]) => enabled)
      .map(([clazz]) => clazz);
  }
}
