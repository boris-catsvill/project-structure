export default class SortableList {
    element;
    current;
    placeholder;
    shiftX = 10;
    shiftY = 10;
    xPosition = 0;

    onPointerDown = event => {
        let elem = event.target.closest('[data-delete-handle]');
        if (elem) {
            this.delete(elem);
            return;
        }

        elem = event.target.closest('[data-grab-handle]');
        if (elem) {

            this.xPosition = event.clientX;

            this.placeholder = document.createElement('div');
            this.placeholder.classList.add('sortable-list__placeholder');

            this.current = elem.closest('.sortable-list__item');

            const rect = this.current.getBoundingClientRect();
            this.placeholder.style.height = rect.height + 'px';

            this.shiftX = event.clientX - rect.left;
            this.shiftY = event.clientY - rect.top;

            this.current.before(this.placeholder);

            this.current.ondragstart = () => false;
            this.current.classList.add('sortable-list__item_dragging');
            this.current.style.width = rect.width + 'px';

            document.addEventListener('pointermove', this.onPointerMove);
            document.addEventListener('pointerup', this.onPointerUp, { once: true });
        }
    }

    onPointerMove = event => {  
        if (event.clientY <= 0) return;

        this.current.style.left = this.xPosition + 1 + 'px';
        this.current.style.top = event.clientY + 1 + 'px';
 
        const elem = document.elementFromPoint(this.xPosition, event.clientY).closest('.sortable-list__item');
        
        this.current.style.left = event.clientX - this.shiftX + 'px';
        this.current.style.top = event.clientY - this.shiftY + 'px';

        if (!elem) return;

        const rect = elem.getBoundingClientRect();
        if (event.clientY - rect.y > rect.height/2) {
            elem.after(this.placeholder);
        } else {
            elem.before(this.placeholder);
        }  

    }

    onPointerUp = event => {
        document.removeEventListener('pointermove', this.onPointerMove);
        this.current.classList.remove('sortable-list__item_dragging');

        this.placeholder.before(this.current);
        this.current.style = "";
        this.current = null;
        this.placeholder.remove();
        this.placeholder = null;
    }

    constructor({items}) {
        this.items = items;
        this.render();

        this.element.addEventListener('pointerdown', this.onPointerDown);
    }

    render() {
        const ul = document.createElement('ul');
        ul.classList.add('sortable-list');
        this.items.forEach(li => {
            li.classList.add('sortable-list__item');
            ul.append(li)            
        });
        this.element = ul;
    }

    delete(elem) {
        const li = elem.closest('.sortable-list__item')
        li.remove();
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
