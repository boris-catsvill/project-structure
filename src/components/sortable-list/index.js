export default class SortableList {
  items;
  subElements = {};
  droppableBelow = null;
  movingElement = null;
  placeHolder = null;
  boundingClientRect = {};
  shiftX = 0;
  shiftY = 0;

  onPointerDown = event => {
    if (event.target.dataset.grabHandle === '') {
      this.movingElement = event.target.closest('.sortable-list__item')
          || event.target.parentElement.closest('.sortable-list__item');

      if (!this.movingElement) {
        return false;
      }

      this.boundingClientRect = this.movingElement.getBoundingClientRect();

      this.createPlaceHolder(this.boundingClientRect);
      this.movingElement.before(this.placeHolder);

      this.shiftX = event.clientX - this.boundingClientRect.left;
      this.shiftY = event.clientY - this.boundingClientRect.top;
      const width = this.boundingClientRect.width;
      this.movingElement.classList.add('sortable-list__item_dragging');
      this.movingElement.style.width = width + 'px';
      this.element.append(this.movingElement);

      this.moveAt(event.clientX, event.clientY);

      this.addEvents();
    }
  }

  addEvents = () => {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeEvents = () => {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  createPlaceHolder = boundingClientRect => {
    this.placeHolder = document.createElement('div');
    this.placeHolder.className = 'sortable-list__placeholder';
    this.placeHolder.style.width = boundingClientRect.width + 'px';
    this.placeHolder.style.height = boundingClientRect.height + 'px';
    this.placeHolder.style.top = boundingClientRect.top + 'px';
    this.placeHolder.style.left = boundingClientRect.left + 'px';
    return this.placeHolder;
  }

  moveAt = (pageX, pageY) => {
    this.movingElement.style.left = pageX - this.shiftX + 'px';
    this.movingElement.style.top = pageY - this.shiftY + 'px';
  };

  onPointerMove = event => {
    this.moveAt(event.clientX, event.clientY);

    this.movingElement.style.display = 'none';
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.movingElement.style.display = 'flex';

    if (!elemBelow) {
      return;
    }

    this.droppableBelow = elemBelow.closest('.sortable-list__item');
    if (this.droppableBelow) {
      this.enterDroppable(this.droppableBelow);
    }
  };

  onPointerUp = () => {
    this.removeEvents();
    if (this.placeHolder) {
      this.placeHolder.before(this.movingElement);
      this.movingElement.classList.remove('sortable-list__item_dragging');
      this.movingElement.style = '';

      this.placeHolder.remove();
      this.placeHolder = null;
    }
  };

  enterDroppable = elem => {
    if (elem.getBoundingClientRect().top > this.placeHolder.getBoundingClientRect().top) {
      elem.after(this.placeHolder);
    } else {
      elem.before(this.placeHolder);
    }
  };

  onItemDeleteClick = event => {
    if (event.target.dataset.deleteHandle === '') {
      const deletingElement = event.target.closest('li')
        || event.target.parentElement.closest('.li');
      if (deletingElement) {
        deletingElement.remove();
      }
    }
  };

  constructor({
    items = []
  }) {
    this.items = items;

    this.render();
  }

  get template() {
    return `${this.items.map(elem => {
      elem.classList.add('sortable-list__item');
      return elem.outerHTML;
    }).join('')}`;
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.element.innerHTML = this.template;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('.sortable-list__item');
    let i = 1;
    for (const subElement of elements) {
      result['item' + i++] = subElement;
    }

    return result;
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onItemDeleteClick);
    document.ondragstart = () => false;
    document.addEventListener('pointerdown', this.onPointerDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onItemDeleteClick);
    document.removeEventListener('pointerdown', this.onPointerDown);
  }
}
