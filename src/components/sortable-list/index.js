// export default class SortableList {
//     element;
//     currentDroppable = null;
//     movingElement = null;
//     placeHolder = null;
//     shiftX = null;
//     shiftY = null;

//     constructor( elements = { items: [] } = {} ) {
//         this.items = elements.items;

//         this.render();
//     }

//     render() {
//         const element = document.createElement("ul");
//         element.classList.add("sortable-list");

//         element.innerHTML = this.template;

//         this.element = element;

//         this.initEventListeners();
//     }


//     get template() {
//         return this.items.map(item => {
//             item.classList.add("sortable-list__item");
//             return item.outerHTML;
//         })
//         .join("");
//     }

//     initEventListeners() {
//         this.controller = new AbortController();
//         this.element.addEventListener('pointerdown', this.onPointerdownHandler, { signal: this.controller.signal });
//     }

//     onPointerdownHandler = event => {
//         this.checkIfDeleteElement(event);
//         this.checkIfGrabElement(event);
//     }

//     checkIfDeleteElement(event) {
//         const item = event.target.closest('[data-delete-handle]');
//         if (item) {
//             event.preventDefault();
//             item.closest('.sortable-list__item').remove();
//         }
//     }

//     checkIfGrabElement(event) {
//         const item = event.target.closest('[data-grab-handle]');
//         if (item) {
//             event.preventDefault();
//             this.renderMovingElement(event);

//             document.addEventListener("pointermove", this.onElementMovement, { signal: this.controller.signal });
//             document.addEventListener("pointerup", this.onPoinerUp, { signal: this.controller.signal });
//         }
//     }

//     renderMovingElement(event) {
//         const element = event.target.closest('.sortable-list__item');
//         this.elementInitialIndex = [...this.element.children].indexOf(element);

//         const content = element.outerHTML;

//         this.renderPlaceHolder(element);

//         const movingElement = document.createElement("div");
//         movingElement.innerHTML = content;
//         this.movingElement = movingElement.firstElementChild;

//         // this.movingElement.classList.add("sortable-list__item");
//         this.movingElement.classList.add("sortable-list__item_dragging");

//         // this.movingElement.style.width = `${element.offsetWidth}px`;
//         // this.movingElement.style.height = `${element.offsetHeight}px`;

//         const sortableList = document.querySelector('.sortable-list');
//         sortableList.append(this.movingElement);

//         // this.saveMouseCoordinates(event, element);

//         this.moveElement(event.clientX, event.clientY);
//     }

//     saveMouseCoordinates(event, element) {

//         // this.shiftX = event.clientX - element.getBoundingClientRect().left;
//         // this.shiftY = event.clientY - element.getBoundingClientRect().top;
//     }

//     renderPlaceHolder(element) {
//         // element.innerHTML = "";
//         // element.classList.add("sortable-list__placeholder");
//         // this.placeHolder = element;
//     }

//     onPoinerUp = () => {
//         // const placeholderIndex = [...this.element.children].indexOf(this.placeHolder);

//         // this.placeHolder.innerHTML = this.movingElement.innerHTML;
//         // this.placeHolder.classList.remove("sortable-list__placeholder");
//         // this.movingElement.classList.remove("sortable-list__item_dragging");

//         // document.removeEventListener("pointermove", this.onElementMovement);
//         // document.removeEventListener("pointerup", this.onPoinerUp);
//         // this.movingElement.outerHTML = null;

//         // this.shiftX = null;
//         // this.shiftY = null;
//         // this.bounding = null
//         // this.currentDroppable = null;
//         // this.placeHolder = null;
//         // this.movingElement = null;

//         // if (placeholderIndex !== this.elementInitialIndex) {
//         //     this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
//         //       bubbles: true,
//         //       details: {
//         //         from: this.elementInitialIndex,
//         //         to: placeholderIndex
//         //       }
//         //     }));
//         //   }
//     }

//     onElementMovement = event => {

//         this.moveElement(event.clientX, event.clientY);

//         // this.movingElement.style.display = "none";
//         // let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
//         // this.movingElement.style.display = "";

//         // if (!elemBelow) return;

//         // let droppableBelow = elemBelow.closest('.sortable-list__item');

//         // if (this.currentDroppable !== droppableBelow) {
//         //   this.currentDroppable = droppableBelow;

//         //   if (this.currentDroppable && this.currentDroppable.parentNode === this.placeHolder.parentNode ) {
//         //     this.enterDroppable();
//         //   }

//         // }
//     }

//     enterDroppable() {
//         // const buffer = this.currentDroppable.dataset.id;
//         // this.currentDroppable.dataset.id = this.placeHolder.dataset.id;
//         // this.placeHolder.dataset.id = buffer;

//         // this.placeHolder.innerHTML = this.currentDroppable.innerHTML;
//         // this.placeHolder.classList.remove("sortable-list__placeholder");
//         // this.renderPlaceHolder(this.currentDroppable);
//     }

//     moveElement(pageX, pageY) {
//         console.log("here");
//         const left = pageX - this.shiftX;
//         const top = pageY - this.shiftY;
//         this.movingElement.style.left = left +'px';
//         this.movingElement.style.top = top + 'px';
//     }

//     // remove() {
//     //     if(this.element) {
//     //         this.element.remove();
//     //     }
//     // }

//     // destroy() {
//     //     this.remove();
//     //     this.element = null;
//     //     this.controller.abort();
//     //     this.shiftX = null;
//     //     this.shiftY = null;
//     //     this.currentDroppable =  null;
//     //     this.placeHolder = null;
//     //     this.movingElement = null;
//     // }
// }
