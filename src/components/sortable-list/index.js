import Component from "../../utils/component";

export default class SortableList extends Component {
  handleDeleteElement = (element) => {
    if (element) {
      element.remove();
    }
  }

  handlePointerUp = () => {
    this.dragStop();
  }
  
  handlePointerMove = (event) => {
    const { clientX, clientY } = event;

    this.handleDragAt({ clientX, clientY });

    const nextEl = this.placeholderElement.nextElementSibling;
    const prevEl = this.placeholderElement.previousElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (clientY < firstElementTop) {
      return firstElementChild.before(this.placeholderElement);
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.placeholderElement);
    }

    if (prevEl) {
      const { top, height } = prevEl.getBoundingClientRect();
      const middleElement = top + height / 2;

      if (clientY < middleElement) {
        return prevEl.before(this.placeholderElement);
      }
    }

    if (nextEl) {
      const { top, height } = nextEl.getBoundingClientRect();
      const middleElement = top + height / 2;

      if (clientY > middleElement) {
        return nextEl.after(this.placeholderElement);
      }
    }

    this.scrollIfCloseToWindowEdge();
  }

  handleGrabElement = (element, { clientX, clientY }) => {
    this.draggingElem = element;
    this.currentIndex = [...this.element.children].findIndex(el => el === element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetHeight, offsetWidth } = element;

    this.shift = {
      x: clientX - x,
      y: clientY - y
    };


    this.draggingElem.style.width = `${offsetWidth}px`;
    this.draggingElem.style.height = `${offsetHeight}px`;
    this.draggingElem.classList.add('sortable-list__item_dragging');
    
    this.placeholderElement = this.createPlaceholderElement({ width: offsetWidth, height: offsetHeight });
    this.draggingElem.after(this.placeholderElement);


    this.handleDragAt({ clientX, clientY });
    this.addDocumentEventListeners();
  }

  handlePointerDown = (event) => {
    event.preventDefault();

    const { dataset } = event.target;
    const [key] = Object.keys(dataset);

    if (key) {
      const li = event.target.closest('li');

      const handlersMap = {
        ['grabHandle']: this.handleGrabElement,
        ['deleteHandle']: this.handleDeleteElement,
      };
            
      return handlersMap[key](li, event);
    }
  }

  constructor({ items, id = '' } = {}) {
    super();

    this.items = items;
    this.id = id;
  }

  addDocumentEventListeners() {
    document.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('pointerup', this.handlePointerUp);
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  handleDragAt({clientX, clientY}) {
    this.draggingElem.style.top = `${clientY - this.shift.y}px`;
    this.draggingElem.style.left = `${clientX - this.shift.x}px`;
  }

  scrollIfCloseToWindowEdge(clientY) {
    const scrollingValue = 10;
    const threshold = 20;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }

  dragStop() {
    const dragElementIndex = [...this.element.children].findIndex(
      child => child === this.placeholderElement
    );
   
    this.draggingElem.style.cssText = '';
    this.draggingElem.classList.remove('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(this.draggingElem);
    this.draggingElem = null;

    this.removeDocumentEventListeners();

    if (dragElementIndex !== this.currentIndex) {
      this.emitEvent('sortable-list-reorder', {
        from: this.currentIndex,
        to: dragElementIndex,
        id: this.id,
        sortNodeCollection:[...this.element.children]
      }, true);
    }
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
  }

  removeEventListeners() {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
  }

  createPlaceholderElement({ width, height }) {
    const style = { width: `${width}px`, heigth: `${height}px`};

    const template = (
      `<li 
        class="sortable-list__placeholder" 
        style="width: ${style.width}; height: ${style.heigth}">
      </li>`
    );

    return this.createElement(template);
  }

  get template() {
    return (`<ul class='sortable-list'></ul>`);
  }

  render() {
    this.renderSortableListItems();
  }

  renderSortableListItems() {
    this.items.forEach(element => element.classList.add('sortable-list__item'));
    this.element.append(...this.items);
  }
}
