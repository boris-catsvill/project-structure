export default class SortableList {
  element = {};
  draggingElement = null;
  draggingShift = {
    x: 0,
    y: 0
  };
  items = [];

  constructor({items} = {}) {
    this.items = items;
    this.render();
    this.initHandlers();
  }

  render() {
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";
    this.element.innerHTML = this.items.join("\n");
  }

  placeHolderElement() {
    const placeholder = document.createElement("div");
    placeholder.innerHTML = '<li class="sortable-list__item sortable-list__placeholder"></li>';
    return placeholder.firstElementChild;
  }

  removePlaceHolder() {
    const existingPlaceholder = this.element.querySelector(".sortable-list__placeholder");
    if (existingPlaceholder) {
      existingPlaceholder.remove();
    }
  }

  putPlaceHolderAfter(element) {
    this.removePlaceHolder();
    element.after(this.placeHolderElement());
  }

  putPlaceHolderBefore(element) {
    this.removePlaceHolder();
    element.before(this.placeHolderElement());
  }

  initHandlers() {
    for (const item of this.element.querySelectorAll("[data-grab-handle]")) {
      item.addEventListener("pointerdown", this.startDragging);
    }
    for (const item of this.element.querySelectorAll("[data-delete-handle]")) {
      item.addEventListener("pointerdown", this.delete);
    }
    document.addEventListener("pointerup", this.stopDragging);
  }

  startDragging = (event) => {
    const target = event.target.closest("[data-grab-handle]");
    if (target) {
      this.draggingElement = target.closest("li");
      this.putPlaceHolderAfter(this.draggingElement);
      this.draggingElement.className = "products-edit__imagelist-item sortable-list__item sortable-list__item_dragging";
      this.draggingShift = {
        x: event.pageX - this.draggingElement.getBoundingClientRect().left,
        y: event.pageY - this.draggingElement.getBoundingClientRect().top
      };
      this.draggingElement.style.left = `${event.clientX - this.draggingShift.x}px`;
      this.draggingElement.style.top = `${event.clientY - this.draggingShift.y}px`;
      document.addEventListener("pointermove", this.dragging);
      document.addEventListener("pointermove", this.shifting);
    }
  };

  dragging = (event) => {
    this.draggingElement.style.left = `${event.clientX - this.draggingShift.x}px`;
    this.draggingElement.style.top = `${event.clientY - this.draggingShift.y}px`;
  };

  shifting = () => {
    const draggingTop = this.draggingElement.getBoundingClientRect().top;
    const listItems = [...this.element.querySelectorAll("[data-grab-handle]")].map(item => item.closest("li"));
    for (const item of listItems) {
      if (item.getBoundingClientRect().top < draggingTop && item.getBoundingClientRect().bottom > draggingTop) {
        this.putPlaceHolderAfter(item);
        return;
      }
    }
    const draggingBottom = this.draggingElement.getBoundingClientRect().bottom;
    for (const item of listItems) {
      if (item.getBoundingClientRect().top < draggingBottom && item.getBoundingClientRect().bottom > draggingBottom) {
        this.putPlaceHolderBefore(item);
        return;
      }
    }
  };

  stopDragging = () => {
    const placeHolder = this.element.querySelector(".sortable-list__placeholder");
    if (placeHolder) {
      placeHolder.after(this.draggingElement);
      placeHolder.remove();
    }
    if (this.draggingElement) {
      this.draggingElement.className = "products-edit__imagelist-item sortable-list__item";
      this.draggingElement.style.left = "";
      this.draggingElement.style.top = "";
      this.draggingElement = null;
      this.draggingShift = {x: 0, y: 0};
    }
    document.removeEventListener("pointermove", this.dragging);
    document.removeEventListener("pointermove", this.shifting);
  };

  registerItem(item) {
    item.querySelector("[data-grab-handle]").addEventListener("pointerdown", this.startDragging);
    item.querySelector("[data-delete-handle]").addEventListener("pointerdown", this.delete);
  }

  delete = (event) => {
    const target = event.target.closest("[data-delete-handle]");
    if (target) {
      target.removeEventListener("pointerdown", this.startDragging);
      target.removeEventListener("pointerdown", this.delete);
      const listElement = target.closest("li");
      listElement.remove();
    }
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
    document.removeEventListener("pointerup", this.stopDragging);
    document.removeEventListener("pointermove", this.dragging);
    document.removeEventListener("pointermove", this.shifting);
  }
}
