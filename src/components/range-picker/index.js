export default class RangePicker {
    element;
    subElements;
    months = [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ];

    leftMonth;
    rightMonth;

    handleSelect = event => {
        this.onSelect(event);
    }

    handleChangeMonth = event => {
        this.onChangeMonth(event);
    }

    handleOutsideClick = event => {
        if (event.target.closest('.rangepicker')) return;
        this.hide();
    }

    constructor({ from, to }) {
        this.from = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        this.to = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        this.temp = {
            from: this.from,
            to: this.to
        };

        this.leftMonth = new Date(this.from.getFullYear(), this.from.getMonth()).getTime();
        this.rightMonth = new Date(this.from.getFullYear(), this.from.getMonth() + 1).getTime();

        this.render();
        this.initEventListener();
    }

    initEventListener() {
        this.subElements.selector.addEventListener('click', this.handleSelect);
        this.subElements.selector.addEventListener('click', this.handleChangeMonth);

        this.subElements.input.addEventListener('click', event => {
            this.toggle();
        });

        document.addEventListener('click', this.handleOutsideClick, true);
    }

    onSelect(event) {
        if (!event.target.closest('.rangepicker__cell')) return;

        const date = new Date(event.target.dataset.value);
        const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (this.to || newDate.getTime() < this.from.getTime()) {
            this.from = newDate;
            this.to = null;
        } else {
            this.to = newDate;
            this.temp = {
                from: this.from,
                to: this.to
            };

            this.subElements.from.innerText = this.getFormattedDate(this.from);
            this.subElements.to.innerText = this.getFormattedDate(this.to);

            this.toggle();

            this.element.dispatchEvent(new CustomEvent('date-select', {
                detail: {
                    from: this.from,
                    to: this.to
                },
                bubbles: true
            }));
        }

        this.subElements.selector.innerHTML = '';
        this.renderCalendar();
    }

    onChangeMonth(event) {
        if (event.target.closest('.rangepicker__selector-control-left')) {
            const left = new Date(this.leftMonth);

            this.rightMonth = this.leftMonth;
            this.leftMonth = new Date(left.getFullYear(), left.getMonth() - 1);
        }

        if (event.target.closest('.rangepicker__selector-control-right')) {
            const right = new Date(this.rightMonth);

            this.leftMonth = this.rightMonth;
            this.rightMonth = new Date(right.getFullYear(), right.getMonth() + 1);
        }

        this.subElements.selector.innerHTML = '';
        this.renderCalendar();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();
    }

    getSubElements() {
        const subElements = {};

        for (const elem of this.element.querySelectorAll('[data-element]')) {
            subElements[elem.dataset.element] = elem;
        }

        return subElements;
    }

    renderCalendar() {
        const left = new Date(this.leftMonth);
        const right = new Date(this.rightMonth);

        this.renderMonth(left.getFullYear(), left.getMonth());
        this.renderMonth(right.getFullYear(), right.getMonth());
    }

    renderMonth(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const getDateFromDay = day => new Date(Date.UTC(year, month, day));

        const fromStamp = this.from.getTime();
        const toStamp = this.to ? this.to.getTime() : 0;

        const days = [ ...new Array(daysInMonth).keys() ].map(item => {
            const day = item + 1;
            const value = getDateFromDay(day).toISOString();
            const dateStamp = new Date(year, month, day).getTime();

            const from = () => {
                return fromStamp === dateStamp ? ' rangepicker__selected-from' : '';
            };
            const to = () => {
                return toStamp === dateStamp ? ' rangepicker__selected-to' : '';
            };
            const between = () => {
                return fromStamp < dateStamp && dateStamp < toStamp ? ' rangepicker__selected-between' : '';
            };

            return `
                <button type="button" 
                        class="rangepicker__cell${from()}${between()}${to()}" 
                        data-value="${value}"
                        ${day === 1 ? 'style="--start-from:' + firstDayOfMonth + '"' : ''}
                >${day}</button>
            `;
        }).join('');

        this.subElements.selector.insertAdjacentHTML('beforeend', `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>
            <div class="rangepicker__calendar">
                <div class="rangepicker__month-indicator">
                    <time datetime="">${this.months[month]}</time>
                </div>
                <div class="rangepicker__day-of-week">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                </div>
                <div class="rangepicker__date-grid">
                    ${days}
                </div>
            </div>
        `);
    }

    getTemplate() {
        return `
            <div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                    <span data-element="from">${this.getFormattedDate(this.temp.from)}</span> 
                    - <span data-element="to">${this.getFormattedDate(this.temp.to)}</span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>
        `;
    }

    getFormattedDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    toggle() {
        if (!this.subElements.selector.innerHTML) {
            this.renderCalendar();
        }
        this.element.classList.toggle('rangepicker_open');
    }

    hide() {
        this.element.classList.remove('rangepicker_open');
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = null;
        document.removeEventListener('click', this.handleOutsideClick, true);
    }
}
