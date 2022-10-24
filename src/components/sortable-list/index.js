export default class SortableList {
    element;

    constructor({items = []} = {}){
        this.items = items;

        this.render();
    }

    getListItems(){
        this.items.forEach(item => {
            item.classList.add("sortable-list__item");
        });

        this.element.append(...this.items);

    }

    render(){
        this.element = document.createElement("ul");
        this.element.classList.add("sortable-list");

        this.getListItems();


        this.initEventListeners();

    }

    initEventListeners(){
        this.element.addEventListener("pointerdown", event => {
            this.onPointerDown(event);
        });
    }

    onPointerDown(event){
        const element = event.target.closest(".sortable-list__item");

        if (element) {
            if (event.target.closest("[data-grab-handle]")) {
                event.preventDefault();
                
                this.onDraggStart(element, event);
            }

            if (event.target.closest("[data-delete-handle]")) {
                event.preventDefault();
                
                element.remove();
            }
        }

    }
    onDraggStart(element, {clientX, clientY}){
        this.currentElement = element;
        this.elementNumber = [...this.element.children].indexOf(element);

        const {x,y} = element.getBoundingClientRect();
        const {offsetWidth, offsetHeight} = element;

        this.shift = {
            x: clientX - x,
            y: clientY - y
        };

        this.currentElement.style.width = offsetWidth + "px";
        this.currentElement.style.height = offsetHeight + "px";
        this.currentElement.classList.add("sortable-list__item_dragging");

        this.placeholder = this.createPlaceholder(offsetWidth,offsetHeight);

        this.currentElement.after(this.placeholder);
        this.element.append(this.currentElement);
        this.dragover(clientX,clientY);

        this.addDocumentEvents();
    }

    addDocumentEvents(){
        document.addEventListener("pointermove", this.onPointerMove);
        document.addEventListener("pointerup", this.onPointerUp);
    }

    removeDocumentEvents(){
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
    }

    dragover(clientX, clientY){
        this.currentElement.style.left = clientX - this.shift.x + "px";
        this.currentElement.style.top = clientY - this.shift.y + "px";
    }

    createPlaceholder(width, height){
        const placeHolder = document.createElement("li");
        placeHolder.classList.add("sortable-list__placeholder");
        placeHolder.style.width = width + "px";
        placeHolder.style.height = height + "px";

        return placeHolder;
    }

    onPointerUp = () => {
        this.dragEnd();
    }

    dragEnd(){
        const placeHolderNumber = [...this.element.children].indexOf(this.placeholder);

        this.currentElement.style.cssText = "";
        this.currentElement.classList.remove("sortable-list__item_dragging");
        this.placeholder.replaceWith(this.currentElement);
        this.currentElement = null;

        this.removeDocumentEvents();

        if (placeHolderNumber !== this.elementNumber) {
            this.dispatchEvent("sortable-list-reorder", {
                from: this.elementNumber, 
                to: placeHolderNumber
            });
        }
    }

    dispatchEvent(event, details){
        this.element.dispatchEvent(new CustomEvent(event, {
            bubbles: true,
            detail: details
        }))
    }

    onPointerMove = ({clientX, clientY}) => {
        this.dragover(clientX, clientY);

        const prevElment = this.placeholder.previousElementSibling;
        const nextElement = this.placeholder.nextElementSibling;

        const {firstElementChild, lastElementChild} = this.element;
        const {top : firstElementTop} = firstElementChild.getBoundingClientRect();
        const {bottom} = this.element.getBoundingClientRect();

        if (clientY < firstElementTop) {
            return firstElementChild.before(this.placeholder);
        }

        if (clientY > bottom) {
            return lastElementChild.after(this.placeholder);
        }

        if (prevElment) {
            const {top, height} = prevElment.getBoundingClientRect();
            const centralElement = top + height / 2;
            
            if (clientY < centralElement) {
                return prevElment.before(this.placeholder);
            }
        }

        if (nextElement) {
            const {top, height} = nextElement.getBoundingClientRect();
            const centralElement = top + height / 2;
            
            if (clientY > centralElement) {
                return nextElement.after(this.placeholder);
            } 
        }
    }

    remove(element = this.element){
        element.remove();
    }

    destroy(){
        this.remove();
        this.removeDocumentEvents();
    }
}
