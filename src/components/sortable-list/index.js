export default class SortableList {
  static reorderedEventName = 'sortable-list-reordered';
  static removedItemEventName = 'sortable-list-item-removed';

  nodeClass = {
    dragging: 'sortable-list__item_dragging'
  }

  element;
  activeNode;
  placeholderNode;

  siblings = {
    previous: {
      node: null,
      y: 0
    },
    next: {
      node: null,
      y: 0
    }
  }

  nodeStyle = {
    width: 0,
    height: 48
  };

  dragOffset = {
    x: 0,
    y: 0
  };

  movementIndex = {
    from: null,
    to: null
  }

  onPointerMove = ({ clientX, clientY }) => {
    this.activeNode.style.left = `${clientX - this.dragOffset.x}px`;
    this.activeNode.style.top = `${clientY - this.dragOffset.y}px`;

    if (this.siblings.previous.node && clientY < this.siblings.previous.y) {
      this.siblings.previous.node.before(this.placeholderNode);

      this.setNewSiblingNodes();
    }

    if (this.siblings.next.node && this.siblings.next.node !== this.activeNode && clientY > this.siblings.next.y) {
      this.siblings.next.node.after(this.placeholderNode);

      this.setNewSiblingNodes();
    }

    this.scrollIfCloseToWindowEdge(clientY);
  }

  onPointerUp = () => {
    this.placeholderNode.replaceWith(this.activeNode);

    this.movementIndex.to = this.getNodeIndex(this.activeNode);

    this.activeNode.removeAttribute('style');
    this.activeNode.classList.remove(this.nodeClass.dragging);

    this.activeNode = null;
    this.siblings = {
      previous: {},
      next: {}
    };
    this.dragOffset = {};

    this.removeDocumentEventListeners();

    if (this.movementIndex.from !== this.movementIndex.to) {
      this.element.dispatchEvent(new CustomEvent(SortableList.reorderedEventName, { bubbles: true, detail: this.movementIndex }));
    }
  };

  onPointerDown = event => {
    this.nodeStyle.width = this.element.getBoundingClientRect().width;
    this.activeNode = event.target.closest('.sortable-list__item');

    if (event.target.closest('[data-grab-handle]')) {
      event.preventDefault();

      this.movementIndex.from = this.getNodeIndex(this.activeNode);

      const nodeRect = this.activeNode.getBoundingClientRect();
      this.activeNode.classList.add(this.nodeClass.dragging);
      this.activeNode.style = `width: ${this.nodeStyle.width}px; height: ${this.nodeStyle.height}px; left: ${nodeRect.left}px; top: ${nodeRect.top}px;`;

      this.dragOffset = {
        x: event.clientX - nodeRect.left,
        y: event.clientY - nodeRect.top
      };

      this.placeholderNode = this.getPlaceholderNode();
      this.activeNode.before(this.placeholderNode);
      this.element.append(this.activeNode);

      this.setNewSiblingNodes();

      this.addDocumentEventListeners();
    }

    if (event.target.closest('[data-delete-handle]')) {
      event.preventDefault();

      this.element.dispatchEvent(new CustomEvent(SortableList.removedItemEventName, { bubbles: true, detail: this.getNodeIndex(this.activeNode) }));
      this.activeNode.remove();
    }
  };

  constructor({ items } = { items: [] }) {
    this.render(items);
    this.initEventListeners();
  }

  setNewSiblingNodes() {
    this.siblings.previous.node = this.placeholderNode.previousSibling;
    this.siblings.next.node = this.placeholderNode.nextSibling;

    this.siblings.previous.y = this.calculateMiddleOfNodeHeight(this.siblings.previous.node);
    this.siblings.next.y = this.calculateMiddleOfNodeHeight(this.siblings.next.node);
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

  calculateMiddleOfNodeHeight(node) {
    return node ? node.getBoundingClientRect().top + this.nodeStyle.height / 2 : 0;
  }

  getNodeIndex(node) {
    return [...this.element.children].indexOf(node);
  }

  render(items) {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    if (items.length) {
      for (const item of items) {
        item.classList.add('sortable-list__item');
        this.element.append(item);
      }
    }
  }

  getPlaceholderNode() {
    const element = document.createElement('div');
    element.className = 'sortable-list__placeholder';
    element.style.width = `${this.nodeStyle.width}px`;
    element.style.height = `${this.nodeStyle.height}px`;

    return element;
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  addDocumentEventListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeDocumentEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeDocumentEventListeners();
    this.element = null;
  }
}
