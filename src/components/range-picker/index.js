export default class RangePicker {
  onInputClick = () => {
    const copiedDate = new Date(this.dateMonth.getTime());
    const rangePicker = document.querySelector('.rangepicker');
    if (!rangePicker.classList.contains('rangepicker_open')) {
      this.renderCalendar(copiedDate);
    }
    rangePicker.classList.toggle('rangepicker_open');
  }
  insideClick = (event) => {
    const rangePicker = document.querySelector('.rangepicker');
    const isRangePicker = event.target.closest('.rangepicker');
    if (rangePicker.classList.contains('rangepicker_open') && (isRangePicker === null)) {
      rangePicker.classList.remove('rangepicker_open');
    }
  }
  onRangePickerClick = (event) => {
    if (event.target.classList.contains('rangepicker__cell')) {
      const date = new Date(event.target.getAttribute('data-value'));
      if (this.from !== this.to) {
        this.from = date;
        this.to = date;
      }
      if (this.from === this.to && date < this.from) {
        this.from = date;
      }
      if (this.from === this.to && date > this.from) {
        this.to = date;
      }
      const input = this.subElements.input;
      input.innerHTML = this.getInput();

      this.dateMonth = new Date(this.from.getTime());
      const copiedDate = new Date(this.dateMonth.getTime());

      this.renderCalendar(copiedDate);
      this.dispatchEventDateSelect();
    }
  }
  prevMonthClick = () => {
    const copiedDate = new Date(this.dateMonth.getTime());
    copiedDate.setMonth(copiedDate.getMonth() - 1);

    this.renderCalendar(copiedDate);
    this.dateMonth.setMonth(this.dateMonth.getMonth() - 1);
  }
  nextMonthClick = () => {
    const copiedDate = new Date(this.dateMonth.getTime());
    copiedDate.setMonth(copiedDate.getMonth() + 1);

    this.renderCalendar(copiedDate);
    this.dateMonth.setMonth(this.dateMonth.getMonth() + 1);
  }
  dispatchEventDateSelect() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: {
        from: this.from,
        to: this.to
      },
    }));
  }
  constructor ({
                 from = new Date(),
                 to = new Date()
               } = {}) {
    this.from = from;
    this.to = to;

    this.dateMonth = new Date(this.from.getTime());

    this.render();
    this.initEventListeners();
  }
  render() {
    const element = document.createElement("div"); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    const input = this.subElements.input;
    input.innerHTML = this.getInput();
  }
  renderCalendar(date) {
    const selector = this.subElements.selector;
    selector.innerHTML = this.getCalendar(date);

    const previousMonth = selector.querySelector('.rangepicker__selector-control-left');
    const nextMonth = selector.querySelector('.rangepicker__selector-control-right');
    previousMonth.addEventListener('click', () => this.prevMonthClick());
    nextMonth.addEventListener('click', () => this.nextMonthClick());
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input"></div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }
  getInput() {
    return `
        <span data-element="from">${this.from.toLocaleDateString('ru-RU')}</span> -
        <span data-element="to">${this.to.toLocaleDateString('ru-RU')}</span>
    `;
  }
  getCalendar(date) {
    const dateClone = new Date(date.getTime());

    const start = new Date(dateClone.setMonth(dateClone.getMonth()));
    const end = new Date(dateClone.setMonth(dateClone.getMonth() + 1));
    return `
      ${this.getArrowsControl()}
      <div class="rangepicker__calendar">
        ${this.getMonthIndicator(start)}
        ${this.getDaysOfWeek()}
        <div class="rangepicker__date-grid">
          ${this.getDateGrid(start)}
        </div>
      </div>
      <div class="rangepicker__calendar">
        ${this.getMonthIndicator(end)}
        ${this.getDaysOfWeek()}
        <div class="rangepicker__date-grid">
          ${this.getDateGrid(end)}
        </div>
      </div>
    `;
  }
  getDateGrid(date) {
    date.setDate(1);
    const daysNumber = this.getDaysNumberInMonth(date);
    const dayOfWeekDigit = date.getDay() === 0 ? 7 : date.getDay();

    let result = '';
    for (let i = 0; i < daysNumber; i++) {
      result +=
        `<button type="button"
               class="rangepicker__cell
                      ${this.datesIsEqual(this.from, this.addDays(date, i)) ? 'rangepicker__selected-from' : ''}
                      ${this.datesIsEqual(this.to, this.addDays(date, i)) ? 'rangepicker__selected-to' : ''}
                      ${this.dateBetween(this.addDays(date, i), this.from, this.to) ? 'rangepicker__selected-between' : ''}"
               data-value="${this.addDays(date, i)}"
               style="${i === 0 ? '--start-from:' + dayOfWeekDigit : ''}">${i + 1}</button>`;
    }
    return result;
  }
  getMonthIndicator(date) {
    return `
    <div class="rangepicker__month-indicator">
       <time datetime="${this.getMonthString(date)}">${this.getMonthString(date)}</time>
    </div>
    `;
  }
  getArrowsControl() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
    `;
  }
  getDaysOfWeek() {
    return `
      <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>`;
  }

  getDaysNumberInMonth (data) {
    const currentYear = data.getFullYear();
    const currentMonth = data.getMonth() + 1;
    return new Date(currentYear, currentMonth, 0).getDate();
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.onInputClick);
    document.addEventListener('click', this.insideClick, true);
    document.addEventListener('click', this.onRangePickerClick);
  }

  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getMonthString(date) {
    return date.toLocaleString('ru', { month: 'long'});
  }
  datesIsEqual(date1, date2) {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }
  dateBetween(date, start, end) {
    return (date > start && date < end);
  }
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.subElements.input.removeEventListener('click', this.onInputClick);
    document.removeEventListener('click', this.insideClick, true);
    document.removeEventListener('click', this.onRangePickerClick);
  }
}
