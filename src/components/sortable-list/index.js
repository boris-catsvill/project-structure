export default class SortableList {
  element;
  elementPlaceholder;
  elementDragging;
  _props = {
    shiftDragging: {
      top: 0,
      left: 0,
    },
    posPlaceholder: {
      top: 0,
      left: 0,
    },
    posDragging: {
      top: 0,
      left: 0,
    },
    initialIndex: -1,
    activeIndex: -1,
    isScrolling: false,
    getTranslationDragging(dragging, placeholder) {
      const draggingBox = dragging.getBoundingClientRect();
      const placeholderBox = placeholder.getBoundingClientRect();
      const draggingElem = {
        top: document.documentElement.scrollTop + draggingBox.top,
        left: document.documentElement.scrollLeft + draggingBox.left,
      };
      const placeholderElem = {
        top: document.documentElement.scrollTop + placeholderBox.top,
        left: document.documentElement.scrollLeft + placeholderBox.left,
      };
      return `translate(${draggingElem.left - placeholderElem.left}px,${
        draggingElem.top - placeholderElem.top
      }px)`;
    },
  };

  scrollIfCloseToWindowEdge = () => {
    if (!this.elementDragging) return;
    const { top } = this._props.posDragging;
    const threshold = 15;
    const documentHeight = document.documentElement.clientHeight;
    const draggingHeight = this.elementDragging.offsetHeight;

    const topCondition = top < threshold;
    const belowCondition = documentHeight < top + draggingHeight + threshold;
    if (topCondition || belowCondition) {
      if (topCondition) window.scrollBy(0, -2);
      if (belowCondition) window.scrollBy(0, 2);
      this._props.isScrolling = true;
      requestAnimationFrame(this.scrollIfCloseToWindowEdge);
    } else if (this._props.isScrolling) {
      this._props.isScrolling = false;
    }
  };

  onDragStart = (event) => {
    if (this.elementDragging) return;
    if (event.target.closest("[data-grab-handle]")) {
      event.preventDefault();
      const target = event.target.closest("li");
      const {
        width: tWidth,
        height: tHeight,
        top: tTop,
        left: tLeft,
      } = target.getBoundingClientRect();

      this._props.shiftDragging = {
        top: event.clientY - tTop,
        left: event.clientX - tLeft,
      };

      /// placeholder element step
      this.elementPlaceholder.style.cssText = `
        width: ${tWidth}px;
        height: ${tHeight}px;
      `;
      this.elementDragging = target;
      target.replaceWith(this.elementPlaceholder);

      /// draggable element step
      this.elementDragging.classList.add("sortable-list__item_dragging");
      this.elementDragging.style.cssText = `
        user-select: none;
        top: ${tTop}px;
        left: ${tLeft}px;
        width: ${tWidth}px;
        height: ${tHeight}px;
      `;

      const { top: pTop, left: pLeft } =
        this.elementPlaceholder.getBoundingClientRect();

      this._props.posPlaceholder = {
        top: pTop,
        left: pLeft,
      };

      this.element.append(this.elementDragging);
      this._props.initialIndex = this.getIndex();
      this._props.activeIndex = this._props.initialIndex;
      document.addEventListener("pointermove", this.onDragMove);
      document.addEventListener("pointerup", this.onDragEnd);
    }
  };
  onDragEnd = () => {
    const transformValue = this._props.getTranslationDragging(
      this.elementDragging,
      this.elementPlaceholder
    );

    this.elementDragging.classList.remove("sortable-list__item_dragging");
    this.elementDragging.style.position = "relative";
    this.elementDragging.style.zIndex = 10000;
    this.elementDragging.style.top = "";
    this.elementDragging.style.left = "";
    this.elementDragging.style.transform = transformValue;
    this.elementDragging.style.transition = "transform 0.3s ease-in-out";
    this.elementPlaceholder.replaceWith(this.elementDragging);

    setTimeout(() => {
      this.elementDragging.style.transform = "";
      this._props.isScrolling = false;
      this.elementDragging = null;
    }, 0);

    document.removeEventListener("pointermove", this.onDragMove);
    document.removeEventListener("pointerup", this.onDragEnd);
    this.elementDragging.addEventListener(
      "transitionend",
      this.onTransitionEnd
    );

    const toggleEvent = new CustomEvent("toggle-event", {
      detail: {
        element: this.element,
        changed: this._props.initialIndex !== this._props.activeIndex,
      },
      bubbles: true,
    });
    this.elementDragging.dispatchEvent(toggleEvent);
  };
  onDragMove = (event) => {
    event.preventDefault();

    this.elementDragging.style.display = "none";

    const familiarContainer =
      document.elementFromPoint(event.clientX, event.clientY) &&
      document
        .elementFromPoint(event.clientX, event.clientY)
        .closest(".sortable-list") === this.element;

    const underElement = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    this.elementDragging.style.display = "";

    if (
      familiarContainer &&
      underElement &&
      underElement.classList.contains("sortable-list__item") &&
      this.elementPlaceholder !== underElement
    ) {
      let { top, left } = underElement.getBoundingClientRect();
      this._props.posPlaceholder = { top, left };
      if (
        this.elementPlaceholder.getBoundingClientRect().top - event.clientY <=
        0
      ) {
        underElement.after(this.elementPlaceholder);
      } else {
        underElement.before(this.elementPlaceholder);
      }
      this._props.activeIndex = this.getIndex();
    }

    this._props.posDragging = {
      top: event.clientY - this._props.shiftDragging.top,
      left: event.clientX - this._props.shiftDragging.left,
    };

    this.elementDragging.style.left = `${this._props.posDragging.left}px`;
    this.elementDragging.style.top = `${this._props.posDragging.top}px`;

    if (!this._props.isScrolling) this.scrollIfCloseToWindowEdge();
  };
  onTransitionEnd = (event) => {
    event.target.removeAttribute("style");
    event.target.removeEventListener("transitionend", this.onTransitionEnd);
  };
  onRemoveItem = (event) => {
    if (event.target.closest("[data-delete-handle]")) {
      event.target.closest("li").remove();
    }
  };

  getIndex = () => {
    return [...this.element.children].findIndex((item) => {
      return item === this.elementPlaceholder;
    });
  };

  constructor({ items } = {}) {
    this.items = items;
    this.render();
  }
  get template() {
    const sortList = this.createHTMLElement(`<ul class="sortable-list"></ul>`);
    this.items.forEach((item) => {
      item.classList.add("sortable-list__item");
      sortList.append(item);
    });
    return sortList;
  }
  get placeholder() {
    return this.createHTMLElement(
      `<li class="sortable-list__placeholder"></li>`
    );
  }
  render() {
    this.element = this.template;
    this.elementPlaceholder = this.placeholder;
    this.addEventListeners();
  }
  createHTMLElement(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    return wrapper.firstElementChild;
  }
  addEventListeners() {
    this.element.addEventListener("pointerup", this.onRemoveItem);
    this.element.addEventListener("pointerdown", this.onDragStart);
  }
  remove() {
    if (this.element) this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    this.elementPlaceholder = null;
    this.elementDragging = null;
    this._props = null;
  }
}
