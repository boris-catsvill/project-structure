export default class SortableList {
  handelDragElement = event => {
    event.preventDefault();

    const dataGrabHandle = event.target.closest('[data-grab-handle]');

    if (!dataGrabHandle) {
      return;
    }

    const vue = this;

    const target = dataGrabHandle.closest('.sortable-list__item');

    const targetHeight = target.offsetHeight;
    const targetWidth = target.offsetWidth;
    const shiftX = event.clientX - target.getBoundingClientRect().left;
    const shiftY = event.clientY - target.getBoundingClientRect().top;

    // Создаем placeholder
    const placeholder = this.renderSortableListPlaceholder(targetHeight, targetWidth);
    target.replaceWith(placeholder);

    // Устанавливаем параметры для drag-элемента
    target.style.height = `${targetHeight}px`;
    target.style.width = `${targetWidth}px`;
    target.classList.add('sortable-list__item_dragging');
    this.element.append(target);

    moveAt(event.clientX, event.clientY);

    // Переносим элемент на координаты (pageX, pageY)
    // учитывая изначальный сдвиг относительно указателя мыши
    function moveAt(pageX, pageY) {
      target.style.left = `${pageX - shiftX}px`;
      target.style.top = `${pageY - shiftY}px`;
    }

    function getMiddleElement(siblingElement, typeElement) {
      const siblingElementTop = siblingElement[typeElement].getBoundingClientRect().top;
      const siblingElementHeight = siblingElement[typeElement].getBoundingClientRect().height;

      return siblingElementTop + siblingElementHeight / 2;
    }

    function onPointerMove(event) {
      moveAt(event.clientX, event.clientY);

      const siblingElement = {
        prev: placeholder.previousElementSibling,
        next: placeholder.nextElementSibling,
      };

      if (siblingElement.prev) {
        const middlePrevElem = getMiddleElement(siblingElement, 'prev');

        if (event.clientY < middlePrevElem) {
          return siblingElement.prev.before(placeholder);
        }
      }

      if (siblingElement.next) {
        const middleNextElem = getMiddleElement(siblingElement, 'next');

        if (event.clientY > middleNextElem) {
          return siblingElement.next.after(placeholder);
        }
      }
    }

    // Передвигаем элементы при событии pointermove
    document.addEventListener('pointermove', onPointerMove);

    // Удаляем обработчики при событии onpointerup
    target.onpointerup = function() {
      target.style = null;
      target.classList.remove('sortable-list__item_dragging');

      placeholder.replaceWith(target);

      document.removeEventListener('pointermove', onPointerMove);
      target.onpointerup = null;

      vue.dispatchEvent();
    };
  };

  handelDeleteElement = event => {
    const dataDeleteHandle = event.target.closest('[data-delete-handle]');

    if (!dataDeleteHandle) {
      return;
    }

    const target = dataDeleteHandle.closest('.sortable-list__item');

    target.remove();
  };

  handelDragStart = () => {
    return false;
  };

  constructor({
                items = []
              } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = '<ul class="sortable-list"></ul>';
    this.element = element.firstElementChild;

    this.renderSortableListItem();

    this.addEventListeners();
  }

  renderSortableListItem() {
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
      this.element.append(item);
    }
  }

  renderSortableListPlaceholder(height, width) {
    const element = document.createElement('div');
    element.innerHTML = '<li class="sortable-list__placeholder"></li>';

    const placeholder = element.firstElementChild;
    placeholder.style.height = `${height}px`;
    placeholder.style.width = `${width}px`;

    return placeholder;
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.handelDragElement);
    this.element.addEventListener('pointerdown', this.handelDeleteElement);
    this.element.addEventListener('dragstart', this.handelDragStart);
  }

  dispatchEvent() {
    const event = new CustomEvent('drag-event');

    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.handelDragElement);
    this.remove();
  }
}
