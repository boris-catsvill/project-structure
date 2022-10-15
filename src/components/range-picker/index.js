export default class RangePicker {
  element = null;
  subElements = {};

  isChooseDateFrom = true;
  initDateFrom = new Date();

  constructor({
    from = new Date(),
    to = new Date()
  } = {}) {
    this.from = from;
    this.to = to;

    this.initDateFrom = new Date(from);
    this.language = 'ru-RU';
    this.days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    this.render();
  }

  dispatchEvent() {
    const from = this.from;
    const to = this.to;

    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: { from, to },
    }));
  }

  addEventListeners() {
    this.subElements.input.addEventListener('click', this.closeOrOpen);
    this.subElements.selector.addEventListener('click', this.onClickCell);

    document.addEventListener('click', this.onClickOutside, true);
  }

  closeOrOpen = () => {
    this.element.classList.toggle('rangepicker_open');
    this.getFullCalendar();
  }

  onClickCell = ({target}) => {
    if (target.classList.contains('rangepicker__cell')) {

      if (target.dataset.value) {
        const value = new Date(target.dataset.value);

        if (this.isChooseDateFrom) {
          this.from = value;
          this.to = null;

          this.isChooseDateFrom = false;
          this.initSelectedRange();
        } else {

          if (value > this.from) {
            this.to = value;
          } else {
            this.to = this.from;
            this.from = value;
          }

          this.isChooseDateFrom = true;
          this.initSelectedRange();
        }

        if (this.from && this.to) {
          this.dispatchEvent();
          this.closeFullCalendar();

          this.subElements.from.innerHTML = RangePicker.localeDate(this.from);
          this.subElements.to.innerHTML = RangePicker.localeDate(this.to);
        }
      }
    }
  }

  onClickOutside = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.closeFullCalendar();
    }
  }

  closeFullCalendar() {
    this.element.classList.remove('rangepicker_open');
  }

  getFullCalendar() {
    const leftDate = new Date(this.initDateFrom);
    
    const rightDate = new Date(this.initDateFrom);
    rightDate.setMonth(rightDate.getMonth() + 1);

    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getMonthCalendar(leftDate)}
      ${this.getMonthCalendar(rightDate)}
    `;

    const prevButton = this.subElements.selector.querySelector('.rangepicker__selector-control-left');
    const nextButton = this.subElements.selector.querySelector('.rangepicker__selector-control-right');

    this.initSelectedRange();

    prevButton.addEventListener('click', () => {
      this.initDateFrom.setMonth(this.initDateFrom.getMonth() - 1);
      this.getFullCalendar();
    })

    nextButton.addEventListener('click', () => {
      this.initDateFrom.setMonth(this.initDateFrom.getMonth() + 1);
      this.getFullCalendar();
    })
  }

  getMonthCalendar(currentDate) {
    const date = new Date(currentDate);

    date.setDate(1);
    const currentMonth = date.toLocaleString(this.language, {month: 'long'});

    let table = `
    <div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime=${currentMonth}>${currentMonth}</time>
      </div>
      <div class="rangepicker__day-of-week">
      ${this.days.map(day => {
        return `<div>${day}</div>`
      }).join('')}
      </div>
      <div class="rangepicker__date-grid">
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}"
          style="--start-from: ${date.getDay() === 0 ? 7 : date.getDay()}">
            ${date.getDate()}
        </button>
    `;

    date.setDate(2);
    while (date.getMonth() === currentDate.getMonth()) {
      table += `
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}">
            ${date.getDate()}
        </button>
      `;
      date.setDate(date.getDate() + 1);
    }

    table += '</div></div>';
    return table;
  }

  initSelectedRange() {
    for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');
      
      const date = new Date(cell.dataset.value);

      if (this.from && cell.dataset.value === this.from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (this.to && cell.dataset.value === this.to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (this.from && this.to && date >= this.from && date <= this.to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (this.from) {
      const elemFrom = this.element.querySelector(`[data-value="${this.from.toISOString()}"]`);
      if (elemFrom) {
        elemFrom.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (this.to) {
      const elemTo = this.element.querySelector(`[data-value="${this.to.toISOString()}"]`);
      if (elemTo) {
        elemTo.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  static localeDate(date) {
    return date.toLocaleString(this.language, {dateStyle: 'short'});
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.addEventListeners();
  }

  getTemplate() {
    const localefrom = RangePicker.localeDate(this.from);
    const localeto = RangePicker.localeDate(this.to);

    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${localefrom}</span> -
        <span data-element="to">${localeto}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
    document.removeEventListener('click', this.onClickOutside, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    this.isChooseDateFrom = true;
    this.initDateFrom = new Date();
  }
}
