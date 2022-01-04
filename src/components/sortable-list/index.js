export default class SortableList {
  element;
  draggingElement;
  constructor({ items }) {
    this.items = items;
    this.render();
  }

  onPointerDown = (event) => {
    if (!event.target.closest('.sortable-list__item')) return;

    if (event.target.dataset.deleteHandle !== undefined) {
      event.target.closest('.sortable-list__item').remove();
    }

    if ((event.target.dataset.grabHandle !== undefined
      || event.target.closest('.sortable-list__item').dataset.grabHandle !== undefined)) {
      const target = event.target.closest('.sortable-list__item');
      const elementWidth = target.offsetWidth;
      const elementHeight = target.offsetHeight;
      this.draggingElement = target;

      const elementIndex = [...this.element.children].indexOf(this.draggingElement);

      const placeholder = this.getPlaceholder(this.draggingElement.offsetHeight);
      this.draggingElement.after(placeholder);

      const shiftY = event.clientY - this.draggingElement.getBoundingClientRect().top;
      const shiftX = event.clientX - this.draggingElement.getBoundingClientRect().left;

      this.draggingElement.classList.add('sortable-list__item_dragging');
      this.draggingElement.style.width = elementWidth + 'px';
      this.draggingElement.style.height = elementHeight + 'px';
      this.draggingElement.style.top = event.clientY - shiftY + 'px';
      this.draggingElement.style.left = event.clientX - shiftX + 'px';

      this.element.append(this.draggingElement);

      const onPointerMove = (event) => {
        const clientX = event.clientX - shiftX;
        const clientY = event.clientY - shiftY;
        this.draggingElement.style.top = clientY + 'px';
        this.draggingElement.style.left = clientX + 'px';

        const prevElem = placeholder.previousElementSibling;
        const nextElem = placeholder.nextElementSibling;

        const { firstElementChild, lastElementChild } = this.element;
        const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
        const { bottom } = this.element.getBoundingClientRect();

        if (clientY < firstElementTop) {
          return firstElementChild.before(placeholder);
        }

        if (clientY > bottom) {
          return lastElementChild.after(placeholder);
        }

        if (prevElem) {
          const { top, height } = prevElem.getBoundingClientRect();
          const middlePrevElem = top + height / 2;

          if (clientY < middlePrevElem) {
            return prevElem.before(placeholder);
          }
        }

        if (nextElem) {
          const { top } = nextElem.getBoundingClientRect();

          if (clientY > top) {
            return nextElem.after(placeholder);
          }
        }

        const scrollingValue = 10;
        const threshold = 20;

        if (clientY < threshold) {
          window.scrollBy(0, -scrollingValue);
        } else if (clientY > document.documentElement.clientHeight - threshold) {
          window.scrollBy(0, scrollingValue);
        }
      };

      const onPointerUp = () => {
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        const placeholderIndex = [...this.element.children].indexOf(placeholder);
        this.draggingElement.style.cssText = '';
        this.draggingElement.classList.remove('sortable-list__item_dragging');
        placeholder.replaceWith(this.draggingElement);
        this.draggingElement = null;

        if (placeholderIndex !== elementIndex) {
          this.dispatchEvent('sortable-list-reorder', {
            from: elementIndex,
            to: placeholderIndex,
          });
        }
      };

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }
  }

  dispatchEvent (type, details) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      details
    }));
  }

  getPlaceholder(height) {
    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.height = height + 'px';
    return placeholder;
  }

  addEventListeners() {
    document.ondragstart = () => false;
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');
    if (this.items) {
      this.items.forEach((item) => {
        item.classList.add('sortable-list__item');
        this.element.append(item);
      });
    }

    this.addEventListeners();
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    document.removeEventListener('pointerdown', this.onPointerDown);
    this.element = null;
  }
}
