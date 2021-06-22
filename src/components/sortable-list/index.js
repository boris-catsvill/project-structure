function getRandomColor() {
  return `hsl(${ 360 * Math.random() },
             ${ 70 + 70 * Math.random() }%,
             ${ 85 + 10 * Math.random() }%)`;
}

export default class SortableList {
  currentItem = null;
  placeholder = null;
  potentialEl = null;

  onStartMove = (ev) => {
    if (this.currentItem) {
      return false;
    }


    const target = ev.target.closest('.sortable-list__item');
    this.parent = target.parentNode;
    target.addEventListener('mouseup', this.onMouseUp);
    const width = target.offsetWidth;

    this.placeholder = this.createPlaceholder(width, target.offsetHeight);
    this.currentItem = this.element.replaceChild(this.placeholder, target);
    this.element.append(this.currentItem);

    this.currentItem.classList.add('sortable-list__item_dragging');
    this.currentItem.style.width = `${ width }px`;
    this.moveTarget(ev.clientX, ev.clientY);

    document.addEventListener('mousemove', this.onMouseMove);
  };

  onMouseMove = (ev) => {
    this.moveTarget(ev.clientX, ev.clientY);
    const firstItem = this.element.firstElementChild;

    this.currentItem.hidden = true;
    const closestEl = document.elementFromPoint(ev.clientX, ev.clientY);
    let closestListItem = closestEl.closest('.sortable-list__item');
    const isPlaceholderAbove = closestEl.classList.contains('sortable-list__placeholder');

    const hasPotentialSwapTarget = isPlaceholderAbove || !!closestListItem;

    if (!hasPotentialSwapTarget) {
      // проверяем, не ущли ли мы в самый верх списка
      if (ev.clientY < this.element.firstElementChild.getBoundingClientRect().top) {
        this.element.insertBefore(this.placeholder, firstItem);
      }

      return;
    }

    this.currentItem.hidden = false;
    if (closestListItem && closestListItem.dataset.id !== this.currentItem.dataset.id) {
      this.currentItem.hidden = false;

      if (!this.potentialEl || closestListItem.dataset.id !== this.potentialEl.dataset.id) {
        this.potentialEl = closestListItem;

        this.element.insertBefore(this.placeholder, closestListItem.nextSibling);
      }
    }
  };

  onMouseUp = (ev) => {
    this.currentItem.classList.remove('sortable-list__item_dragging');
    this.currentItem.style.left = `unset`;
    this.currentItem.style.top = `unset`;
    this.element.insertBefore(this.currentItem, this.placeholder);
    this.placeholder.style.display = 'none';

    this.placeholder.remove();

    this.currentItem = null;
    this.potentialEl = null;
    document.removeEventListener('mousemove', this.onMouseMove);

    const newItems = this.element.querySelectorAll('li');
    this.onOrderChanded(newItems);
  };

  onDeleteClick = (ev) => {
    ev.stopPropagation();
    const targetItem = ev.target.closest('.sortable-list__item');
    if (targetItem) {
      const itemId = targetItem.dataset.id;
      targetItem.remove();
      this.element.dispatchEvent(new CustomEvent('itemDeleted', {
        deletedItemId: itemId
      }));
    }
  };

  constructor({ items, onOrderChanged }) {
    this.listItems = items;
    this.onOrderChanded = onOrderChanged;

    this.render();
  }

  createPlaceholder(width = 0, height = 0) {
    const placeholder = document.createElement('div');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = `${ width }px`;
    placeholder.style.height = `${ height }px`;

    return placeholder;
  }

  moveTarget(x, y) {
    this.currentItem.style.left = `${ x }px`;
    this.currentItem.style.top = `${ y }px`;
  }

  render() {
    const container = document.createElement('div');
    container.innerHTML = '<ul class="sortable-list"></ul>';
    this.element = container.firstElementChild;

    this.listItems.forEach((node, index) => {
      node.classList.add('sortable-list__item', 'data-grab-handle');
      node.dataset.id = index + 1;
      const deleteBtn = node.querySelector('[data-delete-handle]');
      if (deleteBtn) {
        deleteBtn.addEventListener('pointerdown', this.onDeleteClick);
        deleteBtn.addEventListener('mouseup', (ev) => {
          ev.stopPropagation();
        });
      }

      const moveBtn = node.querySelector('[data-grab-handle]');
      if (moveBtn) {
        moveBtn.addEventListener('pointerdown', this.onStartMove);
      }

      node.style.background = getRandomColor();

      node.addEventListener('dragstart', () => {
        return false;
      });

      node.addEventListener('dragend', () => {
        return false;
      });

      this.element.append(node);
    });
  }

  remove() {
    this.element.remove();
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    this.remove();
  }
}
