export default class SortableList {
  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  initListeners() {
    document.addEventListener("pointerdown", this.onDragClick);
  }

  removeListeners() {
    document.removeEventListener("pointerdown", this.onDragClick);
    document.removeEventListener("pointermove", this.onMoveItem);
    document.removeEventListener("pointerup", this.onDropItem);
  }

  onDragClick = (event) => {
    const onDrag = event.target.closest("[data-grab-handle]");
    if (onDrag) {
      event.preventDefault();
      this.draggable = event.target.closest("li");
      this.onDragItem(event);
    }
  };

  onDragItem(event) {
    this.initialShift = {
      x: event.clientX - this.draggable.getBoundingClientRect().x,
      y: event.clientY - this.draggable.getBoundingClientRect().y
    };

    this.draggableCoords(event);

    this.draggable.classList.add("sortable-list__item_dragging");
    this.draggable.before(this.addPlaceholder());

    document.addEventListener("pointermove", this.onMoveItem);
    document.addEventListener("pointerup", this.onDropItem);
  }

  draggableCoords(event) {
    this.draggable.style.left = event.clientX - this.initialShift.x + "px";
    this.draggable.style.top = event.clientY - this.initialShift.y + "px";
  }

  addPlaceholder() {
    this.placeholder = document.createElement("li");
    this.placeholder.classList.add("sortable-list__placeholder");
    this.placeholder.classList.add("sortable-list__item");
    this.placeholder.style.background = "transparent";

    return this.placeholder;
  }

  onMoveItem = (event) => {
    this.draggableCoords(event);

    this.draggable.style.display = "none";
    this.droppedArea = document.elementFromPoint(event.clientX, event.clientY);
    this.draggable.style.display = "block";

    if (this.droppedArea.classList.contains("sortable-list__item")) {
      this.droppedArea.before(this.placeholder);
    } else {
      this.element.append(this.placeholder);
    }
  }

  onDropItem = () => {
    this.placeholder.replaceWith(this.draggable);

    this.draggable.classList.remove("sortable-list__item_dragging");
    this.draggable.style = "";

    this.placeholder.remove();
    document.removeEventListener("pointermove", this.onMoveItem);
    document.removeEventListener("pointerup", this.onDropItem);
  }

  renderDraggables() {
    this.items.forEach((item) => {
      item.classList.add("sortable-list__item");
      this.element.append(item);
    });
  }

  render() {
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";

    this.renderDraggables();
    this.initListeners();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.removeListeners();
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }
}