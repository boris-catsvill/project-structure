export default class SortableList {
    constructor(obj = { items: [] }, readyElem = '') {
        this.items = obj.items
        this.readyElem = readyElem
        this.render()
        this.initEventListeners()
    }

    render() {
        if (this.readyElem === '') {
            this.element = this.createElement(`<ul class = "sortable-list" data-element="imageListContainer"></ul>`)
            for (const li of this.items) {
                li.classList.add('sortable-list__item')
                this.element.append(li)
            }
            for (const span of this.element.querySelectorAll('span')) {
                span.classList.add('sortable-list__item-title')
            }
        }
        else {
            this.element = this.readyElem
        }
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', this.addEventPointerDown)
        this.element.ondragstart = () => false;
        this.element.addEventListener('pointerup', this.addEventPointerUp)
    }

    addEventPointerDown = (event) => {
        if (event.target.dataset.deleteHandle != undefined) this.deleteElem(event)
        if (!event.target.closest('[data-grab-handle]')) return

        this.listItem = event.target.closest('.sortable-list__item')
        this.parentList = this.listItem.closest('.sortable-list')

        this.placeHolder = document.createElement('div') // создаем клон 
        this.placeHolder.style.height = this.listItem.offsetHeight + 'px'
        this.placeHolder.classList.add('sortable-list__placeholder')
        this.element.insertBefore(this.placeHolder, this.listItem) // вставляем клон


        this.listItem.classList.add('sortable-list__item_dragging')
        this.listItem.style.width = this.placeHolder.offsetWidth + 'px'

        const { left, top } = this.placeHolder.getBoundingClientRect();
        this.shiftX = event.clientX - left;;
        this.shiftY = event.clientY - top;

        this.move(event.clientX, event.clientY, this.listItem)

        document.addEventListener('pointermove', this.onPointerMove)
    }

    move = (clientX, clientY, node) => {
        node.style.left = clientX - this.shiftX + 'px';
        node.style.top = clientY - this.shiftY + 'px';
    }

    onPointerMove = event => {
        this.move(event.clientX, event.clientY, this.listItem);


        this.listItem.style.display = 'none';
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY)
        this.listItem.style.display = '';

        if (elemBelow && elemBelow.closest('.sortable-list__item') && elemBelow.parentNode === this.parentList) {

            const liBelow = elemBelow.closest('.sortable-list__item')
            const topLiBelow = liBelow.getBoundingClientRect().top
            const halfHeightLiBelow = liBelow.getBoundingClientRect().height / 2

            if (event.clientY >= (topLiBelow + halfHeightLiBelow)) {
                this.element.insertBefore(liBelow, this.placeHolder)
            } else {
                this.element.insertBefore(this.placeHolder, liBelow)
            }
        }
    }

    addEventPointerUp = event => {
        if (!event.target.closest('[data-grab-handle]')) return

        const li = event.target.closest('.sortable-list__item')


        if (this.element.querySelector('.sortable-list__placeholder')) {
            this.element.querySelector('.sortable-list__placeholder').remove()
        }

        li.classList.remove('sortable-list__item_dragging')

        li.style.display = 'none';
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY)
        li.style.display = '';

        li.style.left = 0
        li.style.top = 0

        if (elemBelow.closest('.sortable-list__item') && elemBelow.closest('.sortable-list') === this.parentList) {
            this.addСustomEvent()
            this.element.insertBefore(li, elemBelow.closest('.sortable-list__item'))

        }
        document.removeEventListener('pointermove', this.onPointerMove)
    }

    addСustomEvent() {
        setTimeout(() => {
            this.element.dispatchEvent(new CustomEvent("", {
                detail: { list: this.element.children }
            }))
        }, 100)
    }

    deleteElem = event => {
        const parentNode = event.target.closest('.sortable-list__item')
        parentNode.remove()
    }

    createElement(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }

    destroy() {
        this.remove();
        this.element = null;
    }

    remove() {
        this.element.remove();
    }
}