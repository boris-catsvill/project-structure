export default class SortableList {
  element = null;
  draggable = null;
  placeholder = null;
  pointerShift = {};
  defaultTopShift = 5;

  pointerdownHandler = event => {
    const element = event.target.closest('.sortable-list__item');
    const grabHandle = event.target.closest('[data-grab-handle]');
    const deleteHandle = event.target.closest('[data-delete-handle]');

    if (grabHandle) {
      event.preventDefault();

      this.grabListItem(element, event);
    }

    if (deleteHandle) {
      element.remove();
    }
  };

  pointermoveHandler = ({clientX, clientY}) => {
    this.move(this.draggable, clientX, clientY);

    const {bottom: draggableBottom} = this.draggable.getBoundingClientRect();

    const prev = this.placeholder.previousElementSibling;
    const next = this.placeholder.nextElementSibling;

    if (prev) {
      if (prev.getBoundingClientRect().bottom + this.defaultTopShift > draggableBottom) {
        prev.before(this.placeholder);
      }
    }

    if (next && next !== this.draggable) {
      if (next.getBoundingClientRect().bottom - this.defaultTopShift < draggableBottom) {
        next.after(this.placeholder);
      }
    }

    this.scrollWhenNearWindowBorder(clientY);
  };

  pointerupHandler = event => {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholder);

    this.removeDocumentListeners();

    this.placeholder.replaceWith(this.draggable);

    this.draggable.style = '';
    this.draggable.classList.remove('sortable-list__item_dragging');

    this.draggable = null;
    this.placeholder = null;
    this.pointerShift = {};

    if (placeholderIndex !== this.elementInitialIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementInitialIndex,
        to: placeholderIndex
      });
    }
  };

  constructor({items = []} = {}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list' ;
    this.element.innerHTML = this.items.map(item => {
      item.classList.add('sortable-list__item');

      return item.outerHTML;
    }).join('');
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.pointerdownHandler, true);
  }

  addDocumentListeners() {
    document.addEventListener('pointermove', this.pointermoveHandler, true);
    document.addEventListener('pointerup', this.pointerupHandler, true);
  }

  removeDocumentListeners() {
    document.removeEventListener('pointermove', this.pointermoveHandler, true);
    document.removeEventListener('pointerup', this.pointerupHandler, true);
  }

  scrollWhenNearWindowBorder(clientY) {
    const windowHeight = document.documentElement.clientHeight;
    const step = 10;
    const indentFromWindowBorder = 20;

    if (clientY >= windowHeight - indentFromWindowBorder) {
      window.scrollBy(0, step);
    }
    if (clientY <= indentFromWindowBorder) {
      window.scrollBy(0, -step);
    }
  }

  grabListItem(element, {clientX, clientY}) {
    const placeholder = document.createElement('li');
    const necessaryStyles = ['height', 'width'];
    const draggableStyles = getComputedStyle(element);

    this.elementInitialIndex = [...this.element.children].indexOf(element);

    necessaryStyles.forEach(styleName => {
      placeholder['style'][styleName] = draggableStyles[styleName];
      element['style'][styleName] = draggableStyles[styleName];
    });

    this.pointerShift = this.getPointerShift(element, clientX, clientY);

    element.classList.add('sortable-list__item_dragging');
    placeholder.className = 'sortable-list__placeholder';

    element.before(placeholder);
    this.element.append(element);

    element.ondragstart = () => false;

    this.move(element, clientX, clientY);

    this.draggable = element;
    this.placeholder = placeholder;

    this.addDocumentListeners();
  }

  getPointerShift(draggable, clientX, clientY) {
    const {left, top} = draggable.getBoundingClientRect();

    return {
      x: clientX - left,
      y: clientY - top
    };
  }

  move(element, clientX, clientY) {
    element.style.left = clientX - this.pointerShift.x + 'px';
    element.style.top = clientY - this.pointerShift.y + this.defaultTopShift + 'px';
  }

  dispatchEvent(type, detail) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      detail
    }));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.removeDocumentListeners();
  }
}
