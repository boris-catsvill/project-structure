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
// export default class SortableList {
//   element;

//   onDocumentPointerMove = ({clientX, clientY}) => {
//     this.moveDraggingAt(clientX, clientY);

//     const {firstElementChild, children} = this.element;
//     const {top: firstElementTop} = firstElementChild.getBoundingClientRect();
//     const {bottom} = this.element.getBoundingClientRect();

//     if (clientY < firstElementTop) {
//       this.movePlaceholderAt(0);
//     } else if (clientY > bottom) {
//       this.movePlaceholderAt(children.length);
//     } else {
//       for (let i = 0; i < children.length; i++) {
//         const li = children[i];

//         // ignore to prevent bugs when dragging between elements
//         if (li !== this.draggingElem) {
//           const {top, bottom} = li.getBoundingClientRect();
//           const {offsetHeight: height} = li;

//           if (clientY > top && clientY < bottom) {
//             // inside the element (y-axis)
//             if (clientY < top + height / 2) {
//               // upper half of the element
//               this.movePlaceholderAt(i);
//               break;
//             } else {
//               // lower half of the element
//               this.movePlaceholderAt(i + 1);
//               break;
//             }
//           }
//         }
//       }
//     }

//     this.scrollIfCloseToWindowEdge(clientY);
//   };

//   onDocumentPointerUp = () => {
//     this.dragStop();
//   };

//   constructor({items = []} = {}) {
//     this.items = items;

//     this.render();
//   }

//   render() {
//     this.element = document.createElement('ul');
//     this.element.className = 'sortable-list';

//     this.addItems();
//     this.initEventListeners();
//   }

//   initEventListeners() {
//     this.element.addEventListener('pointerdown', event => this.onPointerDown(event));
//   }

//   addItems() {
//     // item is a DOM element
//     for (let item of this.items) {
//       item.classList.add('sortable-list__item');
//     }

//     this.element.append(...this.items);
//   }

//   onPointerDown(event) {
//     if (event.which !== 1) { // must be left-button
//       return false;
//     }

//     const itemElem = event.target.closest('.sortable-list__item');

//     if (itemElem) {
//       if (event.target.closest('[data-grab-handle]')) {
//         event.preventDefault();

//         this.dragStart(itemElem, event);
//       }

//       if (event.target.closest('[data-delete-handle]')) {
//         event.preventDefault();

//         itemElem.remove();
//       }
//     }
//   }

//   dragStart(itemElem, {clientX, clientY}) {
//     this.elementInitialIndex = [...this.element.children].indexOf(itemElem);

//     this.pointerInitialShift = {
//       x: clientX - itemElem.getBoundingClientRect().x,
//       y: clientY - itemElem.getBoundingClientRect().y
//     };

//     this.draggingElem = itemElem;

//     this.placeholderElem = document.createElement('li');
//     this.placeholderElem.className = 'sortable-list__placeholder';

//     // itemElem will get position:fixed
//     // so its width will be auto-set to fit the parent container
//     itemElem.style.width = `${itemElem.offsetWidth}px`;
//     itemElem.style.height = `${itemElem.offsetHeight}px`;

//     this.placeholderElem.style.width = itemElem.style.width;
//     this.placeholderElem.style.height = itemElem.style.height;

//     itemElem.classList.add('sortable-list__item_dragging');

//     itemElem.after(this.placeholderElem);

//     // move to the end, to be over other list elements
//     this.element.append(itemElem);

//     this.moveDraggingAt(clientX, clientY);

//     document.addEventListener('pointermove', this.onDocumentPointerMove);
//     document.addEventListener('pointerup', this.onDocumentPointerUp);
//   }

//   moveDraggingAt(clientX, clientY) {
//     this.draggingElem.style.left = clientX - this.pointerInitialShift.x + 'px';
//     this.draggingElem.style.top = clientY - this.pointerInitialShift.y + 'px';
//   }

//   scrollIfCloseToWindowEdge(clientY) {
//     const scrollingValue = 10;
//     const threshold = 20;

//     if (clientY < threshold) {
//       window.scrollBy(0, -scrollingValue);
//     } else if (clientY > document.documentElement.clientHeight - threshold) {
//       window.scrollBy(0, scrollingValue);
//     }
//   }

//   movePlaceholderAt(index) {
//     const currentElement = this.element.children[index];

//     if (currentElement !== this.placeholderElem) {
//       this.element.insertBefore(this.placeholderElem, currentElement);
//     }
//   }

//   dragStop() {
//     const placeholderIndex = [...this.element.children].indexOf(this.placeholderElem);

//     // drop element back
//     this.placeholderElem.replaceWith(this.draggingElem);
//     this.draggingElem.classList.remove('sortable-list__item_dragging');

//     this.draggingElem.style.left = '';
//     this.draggingElem.style.top = '';
//     this.draggingElem.style.width = '';
//     this.draggingElem.style.height = '';

//     document.removeEventListener('pointermove', this.onDocumentPointerMove);
//     document.removeEventListener('pointerup', this.onDocumentPointerUp);

//     this.draggingElem = null;

//     if (placeholderIndex !== this.elementInitialIndex) {
//       this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
//         bubbles: true,
//         details: {
//           from: this.elementInitialIndex,
//           to: placeholderIndex
//         }
//       }));
//     }
//   }

//   remove() {
//     this.element.remove();
//     document.removeEventListener('pointermove', this.onDocumentPointerMove);
//     document.removeEventListener('pointerup', this.onDocumentPointerUp);
//   }

//   destroy() {
//     this.remove();
//   }
// }
