export default class SortableList {
    constructor(source = {}) { 
        this.items = source.items;
        this.render();
        this.initEventListeners();
    }

    render() { 
        const wrapper = document.createElement('ul');
        wrapper.className = 'sortable-list';

        this.items.forEach(item => {
            item.classList.add('sortable-list__item');
            item.setAttribute('data-grab-handle', '');
            wrapper.append(item);
        });

        this.element = wrapper;
        wrapper.remove();

        
    }

    initEventListeners() { 
        document.addEventListener('pointerdown', this.delete);
        document.addEventListener('pointerdown', this.pointerdown);
    }

    delete = (evt) => { 
        if (evt.target.hasAttribute('data-delete-handle')) evt.target.closest('li').remove();
    }

    pointerdown = (evt) => { 
        if (!evt.target.hasAttribute('data-grab-handle')) return;

        this.initActiveElement(evt.target);
        this.initNotActiveElements();
        this.initPlaceHolder();
        

        this.shiftX = evt.clientX - this.left;
        this.shiftY = evt.clientY - this.top;
        this.startY = evt.clientY;

        this.activeElement.replaceWith(this.placeHolder);
        this.element.append(this.activeElement);

        this.activeElement.ondragstart = () => false;
        
        document.addEventListener('pointerup', this.pointerup);
        document.addEventListener('pointermove', this.pointermove);
    }

    pointermove = (evt) => { 
        
        (this.startY - evt.clientY) > 0 ? this.direction = 'up' : this.direction = 'down';

        const left = evt.clientX - this.shiftX;
        const bottom = evt.clientY - this.shiftY + this.height;
        const top = evt.clientY - this.shiftY;

        switch (this.direction) {
            case 'down': 
                this.activeElement.style.display = 'none';
                this.elemBelow = document.elementFromPoint(evt.clientX, bottom);
                this.activeElement.style.display = "";

                if ([...this.items].includes(this.elemBelow)) this.elemBelow.after(this.placeHolder);

                break;
            
            case 'up':
                this.activeElement.style.display = 'none';
                this.elemBelow = document.elementFromPoint(evt.clientX, top);
                this.activeElement.style.display = "";

                if ([...this.items].includes(this.elemBelow)) this.elemBelow.before(this.placeHolder);
                
                break;
        }
        
        this.activeElement.style.top = top + 'px';
        this.activeElement.style.left = left + 'px';
        
        this.startY = evt.clientY;
    }

    pointerup = () => {
        this.placeHolder.replaceWith(this.activeElement);
        this.activeElement.classList.remove('sortable-list__item_dragging');
        this.activeElement.style.cssText = '';

        document.removeEventListener('pointermove', this.pointermove);
        document.removeEventListener('pointerup', this.pointerup);
    }

    initActiveElement(target) {
        this.activeElement = target.closest('li');

        const { height, left, top } = this.activeElement.getBoundingClientRect();
        const { width } = this.element.getBoundingClientRect();

        this.activeElement.classList.add('sortable-list__item_dragging');

        this.activeElement.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            left: ${left}px;
            top: ${top}px
        `;

        this.height = height;
        this.width = width;
        this.left = left;
        this.top = top;
    }

    initNotActiveElements() {
        this.notActiveElements = [];

        [...this.items].forEach(item => {
            if (item !== this.activeElement) this.notActiveElements.push(item); 
        });
    }

    initPlaceHolder() {
        this.placeHolder = document.createElement('div');
        this.placeHolder.className = 'sortable-list__placeholder';
        this.placeHolder.style.cssText = `
            width: ${this.width}px;
            height: ${this.height}px
        `;
    }

    destroy() {
        this.remove();
        document.removeEventListener('pointerdown', this.delete);
        document.removeEventListener('pointerdown', this.pointerdown);
    }

    remove() {
        this.element.remove();
        document.removeEventListener('pointerdown', this.delete);
        document.removeEventListener('pointerdown', this.pointerdown);
    }
}
