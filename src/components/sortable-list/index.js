export default class SortableList {
  element
  dragElement
  currentDroppable = null
  placeholderElement

  constructor ({items = []} = {}) {
    this.items = items;
    
    this.render();
  }

  renderList () {
    return `
      <ul class="sortable-list">
      ${this.items.map(elem => {
  elem.classList.add("sortable-list__item");

  return elem.outerHTML;
}).join('')}
      </ul>
      `;
  }

  handleDragStart = () => {
    return false;
  }

  handleMouseDown = (event) => {
    if (event.target.dataset.deleteHandle === '') {
      event.target.closest('.sortable-list__item').remove();
      return;
    }

    this.dragElement = event.target.closest('.sortable-list__item');

    if (!this.dragElement) {return;}

    this.dragElement = event.target.closest('.sortable-list__item');
    this.elementInitialIndex = [...this.element.children].indexOf(this.dragElement);

    const shiftX = event.clientX - (this.dragElement.getBoundingClientRect().left - this.element.getBoundingClientRect().left);
    const shiftY = window.scrollY + event.clientY - (this.dragElement.getBoundingClientRect().top - this.element.getBoundingClientRect().top);

    this.placeholderElement.style.width = `${this.dragElement.offsetWidth}px`;
    this.placeholderElement.style.height = `${this.dragElement.offsetHeight}px`;

    this.dragElement.before(this.placeholderElement);
    
    this.dragElement.style.width = `${this.dragElement.offsetWidth}px`;
    this.dragElement.style.height = `${this.dragElement.offsetHeight}px`;
    this.dragElement.style.left = `${event.pageX - shiftX}px`;
    this.dragElement.style.top = `${event.pageY - shiftY}px`;
    this.dragElement.style.zIndex = 1000;
    this.dragElement.style.position = 'absolute';
    this.dragElement.classList.add('sortable-list__item_dragging');
    this.element.append(this.dragElement);

    const eventFunction = (event) => this.handleMouseMove(event, shiftX, shiftY);
    
    document.addEventListener('pointermove', eventFunction);

    this.element.addEventListener('pointerup', (event) => {
      this.handleMouseUp(event);
      document.removeEventListener('pointermove', eventFunction);
      this.element.pointerup = null;
    });
  }

  handleMouseMove = (event, shiftX, shiftY) => {
    if (this.dragElement) {
      this.dragElement.style.left = `${event.pageX - shiftX}px`;
      this.dragElement.style.top = `${event.pageY - shiftY}px`;

      const tempDisplay = this.dragElement.style.display;
      this.dragElement.style.display = 'none';
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      this.dragElement.style.display = tempDisplay;

      if (!elemBelow) {return;}

      const droppableBelow = elemBelow.closest('.sortable-list__item');

      if (this.currentDroppable != droppableBelow) {
        this.currentDroppable = droppableBelow;
        if (this.currentDroppable) {
          this.enterDroppable(this.currentDroppable);
        }
      }
    }
  }

  handleMouseUp (event) {
    if (event.target.dataset.deleteHandle === '') {
      return;
    }
    
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

    this.dragElement.style = '';
    this.dragElement.classList.remove('sortable-list__item_dragging');
    
    this.placeholderElement.after(this.dragElement);
    this.placeholderElement.remove();

    if (placeholderIndex !== this.elementInitialIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: {
          from: this.elementInitialIndex,
          to: placeholderIndex
        }
      }));
    }
  }

  enterDroppable (elem) {
    if (this.dragElement.getBoundingClientRect().top > elem.getBoundingClientRect().top) {
      elem.before(this.placeholderElement);
    } else {
      elem.after(this.placeholderElement);
    }
  }

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderList();
    const element = wrapper.firstElementChild;
    this.element = element;

    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.innerHTML = '';
    this.placeholderElement = placeholder;

    this.element.addEventListener('pointerdown', this.handleMouseDown);
    this.element.addEventListener('ondragstart', this.handleDragStart);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
  
  destroy () {
    this.remove();
    this.element = null;
    this.dragElement = null;
    this.currentDroppable = null;
    this.placeholderElement = null;
  }
}
