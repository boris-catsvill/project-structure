export default class SortableList {
  element;

  constructor(items) {
    this.items = [...items];
    this.clientHeight = document.documentElement.clientHeight;
    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');

    for (const item of this.items) {
      const elem = document.createElement('div');
      elem.innerHTML = item;
      element.append(elem.firstElementChild);
    }

    this.element = element;
  }

  createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.style.width = '100%';
    placeholder.style.height = `${this.itemHeight}px`;
    placeholder.classList.add('sortable-list__placeholder');
    this.placeholder = placeholder;
  }

  handleDelete = event => {
    const target = event.target.closest('[data-delete-handle]');
    if (target === null) return;

    target.closest('li').remove();
  };

  handleDrag = event => {
    const target = event.target.closest('[data-grab-handle]');
    if (target === null) return;

    this.item = target.closest('li');
    this.itemHeight = this.item.clientHeight;
    this.itemWidth = this.item.clientWidth;
    this.index = Array.from(this.element.children).indexOf(this.item);

    this.containerTop = this.element.getBoundingClientRect().top;
    this.containerBottom = this.element.getBoundingClientRect().bottom;

    this.shiftX = event.pageX - this.item.getBoundingClientRect().left;
    this.shiftY = event.pageY - this.item.getBoundingClientRect().top;

    this.createPlaceholder();

    this.item.classList.add('sortable-list__item_dragging');
    this.item.style.width = this.itemWidth + 'px';
    this.element.append(this.item);
    this.element.children[this.index].before(this.placeholder);

    this.scroll = window.pageYOffset;

    this.moveOn(event, this.shiftX, this.shiftY);

    this.indexArr = [0, 0];

    document.addEventListener('mousemove', this.onMouseMove);

    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = event => {
    const shiftY = this.shiftY - (this.scroll - window.pageYOffset);
    const coordinateY = event.clientY;

    if (event.clientY < this.itemHeight / 2) {
      scrollBy(0, -10);
    } else if (event.clientY > this.clientHeight - this.itemHeight / 2) {
      scrollBy(0, 10);
    }

    this.moveOn(event, this.shiftX, shiftY);

    if (coordinateY < this.containerTop + this.itemHeight / 2) {
      this.element.prepend(this.placeholder);
    } else if (coordinateY > this.containerBottom - this.itemHeight / 2) {
      this.element.append(this.placeholder);
    } else {
      for (let i = this.containerTop; i < this.containerBottom; i += this.itemHeight) {
        if (coordinateY > i && coordinateY < i + this.itemHeight) {
          this.indexArr.push(i);
          this.indexArr.shift();
          if (this.indexArr[0] - this.indexArr[1] === this.itemHeight) {
            this.index--;
          } else if (this.indexArr[0] - this.indexArr[1] === -this.itemHeight) {
            this.index++;
          }
          if (this.index < 1 || this.index > this.items.length - 1) return;
          this.element.children[this.index].before(this.placeholder);
        }
      }
    }
  };

  moveOn(event, shiftX, shiftY) {
    this.item.style.left = event.pageX - shiftX + 'px';
    this.item.style.top = event.pageY - shiftY + 'px';
  }

  onMouseUp = event => {
    this.placeholder.replaceWith(this.item);
    this.item.onmouseup = null;
    this.item.classList.remove('sortable-list__item_dragging');
    this.item.style = null;

    if (this.indexArr[0] + this.indexArr[1] !== 0) {
      this.dispatchCustomEvent();
    }

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  dispatchCustomEvent = () => {
    const elements = this.element.querySelectorAll('[data-id]');
    const elementsId = [];
    for (const element of elements) {
      elementsId.push(element.dataset.id);
    }

    document.dispatchEvent(
      new CustomEvent('order-change', {
        detail: { elementsId }
      })
    );
  };

  initEventListeners() {
    this.element.addEventListener('mousedown', this.handleDrag);
    this.element.addEventListener('click', this.handleDelete);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
