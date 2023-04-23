export class RangePicker {
  firstSelectedDate;
  element;
  from;
  to;
  subElements;

  constructor({ from = new Date(), to = new Date() } = {}) {
    this.from = from;
    this.to = to;
    this.initMonths();
    this.render();
  }

  get classNames() {
    return {
      open: 'rangepicker_open',
      left: 'rangepicker__selector-control-left',
      right: 'rangepicker__selector-control-right',
      from: 'rangepicker__selected-from',
      to: 'rangepicker__selected-to',
      between: 'rangepicker__selected-between'
    };
  }

  get template() {
    return `<div class='rangepicker'>
                <div class='rangepicker__input' data-element='input'>
                    <span data-element='from'>${RangePicker.formatDate(this.from)}</span> -
                    <span data-element='to'>${RangePicker.formatDate(this.to)}</span>
                </div>
                <div class='rangepicker__selector' data-element='selector'></div>
            </div>`;
  }

  static formatDate(date) {
    return date.toLocaleString('ru-RU', { dateStyle: 'short' });
  }

  onClickSelector = e => {
    const element = e.target;
    if (element.classList.contains('rangepicker__cell')) {
      element.blur();
      this.selectDate(element);
    }
  };
  onTogglePicker = () => {
    this.element.classList.toggle(this.classNames.open);
    this.updateSelector();
  };
  onClosePicker = ({ target }) => {
    const isOpen = this.element.classList.contains(this.classNames.open);
    const isPicker = this.element.contains(target);
    if (isOpen && !isPicker) {
      this.element.classList.remove(this.classNames.open);
    }
  };

  selectDate(element) {
    if (this.firstSelectedDate) {
      this.setRange(element);
    } else {
      this.selectFirstData(element);
    }
  }

  selectFirstData(dateSelectElement) {
    const { selector } = this.subElements;
    const { value: ISOString } = dateSelectElement.dataset;
    this.firstSelectedDate = new Date(Date.parse(ISOString));
    this.from = null;
    this.to = null;

    for (const cellDate of selector.querySelectorAll('.rangepicker__cell')) {
      cellDate.className = 'rangepicker__cell';
    }
    dateSelectElement.classList.add(this.classNames.from);
  }

  setRange(dateSelectElement) {
    const { value: ISOString } = dateSelectElement.dataset;
    const firstSelectedDate = this.firstSelectedDate;
    const secondSelectedDate = new Date(Date.parse(ISOString));
    this.firstSelectedDate = null;

    if (firstSelectedDate.getTime() >= secondSelectedDate.getTime()) {
      this.from = secondSelectedDate;
      this.to = firstSelectedDate;
    } else {
      this.from = firstSelectedDate;
      this.to = secondSelectedDate;
    }
    if (this.from && this.to) {
      const { from, to } = this.subElements;
      this.highlightRange();
      from.innerHTML = RangePicker.formatDate(this.from);
      to.innerHTML = RangePicker.formatDate(this.to);
      this.dispatchSelectDate(this.from, this.to);
      this.close();
    }
  }

  highlightRange() {
    const { selector } = this.subElements;
    for (const cellDate of selector.querySelectorAll('.rangepicker__cell')) {
      const { value } = cellDate.dataset;
      const date = new Date(Date.parse(value));
      const classRange = this.getRangeClass(date);
      if (classRange) {
        cellDate.classList.add(classRange);
      }
    }
  }

  close() {
    this.element.classList.remove(this.classNames.open);
  }

  dispatchSelectDate(from, to) {
    this.element.dispatchEvent(new CustomEvent('date-select', { detail: { from, to } }));
  }

  shiftMonthLeft = () => {
    this.secondMonth.setFullYear(this.firstMonth.getFullYear());
    this.secondMonth.setMonth(this.firstMonth.getMonth());
    this.firstMonth.setMonth(this.firstMonth.getMonth() - 1);
    this.updateSelector();
  };

  shiftMonthRight = () => {
    this.firstMonth.setFullYear(this.secondMonth.getFullYear());
    this.firstMonth.setMonth(this.secondMonth.getMonth());
    this.secondMonth.setMonth(this.firstMonth.getMonth() + 1);
    this.updateSelector();
  };

  updateSelector() {
    const { selector } = this.subElements;
    selector.innerHTML = this.getSelector();
    selector
      .querySelector(`.${this.classNames.left}`)
      .addEventListener('click', this.shiftMonthLeft);
    selector
      .querySelector(`.${this.classNames.right}`)
      .addEventListener('click', this.shiftMonthRight);
  }

  initMonths() {
    const year = this.from.getFullYear();
    const fromMonth = this.from.getMonth();
    const toMonth = this.to.getMonth();

    const firstMonth = fromMonth === toMonth ? fromMonth - 1 : fromMonth;
    this.firstMonth = new Date(year, firstMonth, 1);
    this.secondMonth = new Date(year, firstMonth + 1, 1);
  }

  initListeners() {
    const { input, selector } = this.subElements;

    input.addEventListener('pointerdown', this.onTogglePicker);
    document.addEventListener('pointerdown', this.onClosePicker, true);
    selector.addEventListener('pointerdown', this.onClickSelector);
  }

  removeListeners() {
    document.removeEventListener('click', this.onClosePicker, true);
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initListeners();
  }

  getSubElements(element) {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const el of elements) {
      result[el.dataset.element] = el;
    }
    return result;
  }

  getSelector() {
    return `<div class='rangepicker__selector-arrow'></div>
            <div class='${this.classNames.left}'></div>
            <div class='${this.classNames.right}'></div>
            ${this.getCalendarMonth(this.firstMonth)}
            ${this.getCalendarMonth(this.secondMonth)}`;
  }

  getCalendarMonth(date) {
    const month = date.toLocaleString('ru-Ru', { month: 'long' });
    const monthEN = date.toLocaleString('en-En', { month: 'long' });

    return `<div class='rangepicker__calendar'>
        <div class='rangepicker__month-indicator'>
            <time datetime='${monthEN}'>${month}</time>
        </div>
        <div class='rangepicker__day-of-week'>
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class='rangepicker__date-grid'>${this.getMonthGrid(date)}</div>
      </div>`;
  }

  getMonthGrid(date) {
    const month = new Date(date.getFullYear(), date.getMonth(), 1);
    const [startMonthDay, daysInMonth] = this.getMonthData(month);
    const dates = [];
    let indexDay = 1;
    while (indexDay <= daysInMonth) {
      const firstStep = month.getDate() === 1 ? `style="--start-from: ${startMonthDay + 1}"` : ``;

      dates.push(`<button
                  type='button'
                  class='rangepicker__cell ${this.getRangeClass(month)}'
                  data-value='${month.toISOString()}'
                  ${firstStep}
                  >
                    ${month.getDate()}
                  </button>`);
      indexDay++;
      month.setDate(indexDay);
    }
    return dates.join('');
  }

  getRangeClass(date) {
    let rangeClass = '';

    const isSelectedDate = this.firstSelectedDate?.getTime() === date?.getTime();
    const isFrom = this.from?.getTime() === date?.getTime() || isSelectedDate;
    const isTo = this.to?.getTime() === date?.getTime();
    const isBetween =
      date?.getTime() > this.from?.getTime() && date?.getTime() < this.to?.getTime();

    rangeClass = isFrom ? this.classNames.from : rangeClass;
    rangeClass = isTo ? this.classNames.to : rangeClass;
    rangeClass = isBetween ? this.classNames.between : rangeClass;

    return rangeClass;
  }

  getMonthData(month) {
    const startDay = !month.getDay() ? 6 : month.getDay() - 1;
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0); //day before of next month  === last day of current month
    return [startDay, nextMonth.getDate()];
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
    this.subElements = null;
    this.firstSelectedDate = 0;
  }
}
