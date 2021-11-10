export default class SortableList {
  onPointerDown = (event) => {
    const item = event.target.closest('.sortable-list__item');
    if (!item) return;
    event.preventDefault();
    const handleGrab = event.target.closest('[data-grab-handle]');
    const handleDelete = event.target.closest('[data-delete-handle]');

    if (handleGrab) {
      this.dragstart(item, event);
    } else if (handleDelete) {
      item.remove();
    }
  }

  onPointerUp = (event) => {
    event.preventDefault();
    this.dragend();
  }

  onPointerMove = (event) => {
    event.preventDefault();
    this.setStyles(this.dragged, {
      left: `${event.x - this.shiftX}px`,
      top: `${event.y - this.shiftY}px`,
    });

    this.dragged.style.visibility = 'hidden';
    const elementBellow = document.elementFromPoint(event.x, event.y);
    this.dragged.style.visibility = '';

    // Если курсор вышел за пределы окна, то бросаем перетаскиваемый элемент
    if (!elementBellow) {
      this.dragend();
      return;
    }

    // Элемент над которым находится курсор в данный момент перетаскивания
    const droppable = elementBellow.closest('.sortable-list__item');

    // Если в этот элемент нельзя сбросить, то завершаем функцию
    if (!droppable || droppable === this.currentDroppable) {
      this.currentDroppable = null;
      return;
    }

    const coordY = droppable.getBoundingClientRect().top;

    // Узнаем направление движения курсора
    const moveDirection = this.getMoveDirection(this.pageY, event.pageY);
    this.pageY = event.pageY;

    // Если курсор зашел на элемент доступный для сбрасывания на него, то перемещаем плейсхолдер на его место
    if (event.pageY > coordY) {
      const element = (moveDirection === 'down') ? droppable.nextSibling : droppable;
      this.insertPlaceholder(element);
    }

    this.currentDroppable = droppable;
  }

  constructor({items} = {}) {
    this.elements = items;
    this.render();
    this.addEventListeners();
  }

  render() {
    const list = document.createElement('ul');
    list.classList.add('sortable-list');
    const elements = this.elements.map((element) => this.getListItem(element));
    list.append(...elements);
    this.placeholder = this.getPlaceholder();
    this.element = list;
  }

  getListItem(elem) {
    const element = typeof elem === 'object' ? elem : this.toHTML(elem); // Добавил поддержку строк, а не только DOM элеиментов
    element.classList.add('sortable-list__item');
    return element;
  }

  getPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');
    return placeholder;
  }

  addEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  removeEventListeners() {
    this.element.removeEventListener('pointerdown', this.onPointerDown);
  }

  setStyles(element, props) {
    for (const prop in props) {
      element.style[prop] = props[prop];
    }
  }

  dragstart(dragged, event) {
    this.dragged = dragged;
    this.element.addEventListener('pointerup', this.onPointerUp);

    const draggedRect = this.dragged.getBoundingClientRect();
    this.shiftX = event.clientX - draggedRect.left;
    this.shiftY = event.clientY - draggedRect.top;

    this.draggedHeight = this.dragged.clientHeight;
    this.draggedWidth = this.dragged.clientWidth;

    this.setStyles(this.dragged, {
      width: `${this.draggedWidth}px`,
      left: `${event.x - this.shiftX}px`,
      top: `${event.y - this.shiftY}px`,
    });
    this.setStyles(this.placeholder, {
      height: `${this.draggedHeight}px`
    });

    this.insertPlaceholder(this.dragged);
    this.dragged.classList.add('sortable-list__item_dragging');

    this.element.addEventListener('pointermove', this.onPointerMove);
  }

  dragend() {
    this.element.insertBefore(this.dragged, this.placeholder);
    this.placeholder.remove();
    this.setStyles(this.dragged, {
      width: '',
      left: '',
      top: '',
    });

    this.dragged.classList.remove('sortable-list__item_dragging');
    this.dragged = null;

    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerup', this.onPointerUp);
    this.element.dispatchEvent(new CustomEvent('dragend'));
  }

  getMoveDirection(oldY, newY) {
    if (oldY < newY) {
      return 'down';
    } else if (oldY > newY) {
      return 'up';
    }
  }

  insertPlaceholder(element) {
    this.element.insertBefore(this.placeholder, element);
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
    this.removeEventListeners();
  }

  destroy() {
    this.remove();
  }
}
