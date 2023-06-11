import { BaseComponent } from '../../base-component';
import { CUSTOM_EVENTS } from '../../constants';

export class RangePicker extends BaseComponent {
  selectedFrom;
  selectedTo;
  from;
  to;
  subElements;

  constructor({ from = new Date(), to = new Date() } = {}) {
    super();
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

  get rangeDate() {
    return { from: this.from, to: this.to };
  }

  static formatDate(date) {
    return date.toLocaleString('ru-RU', { dateStyle: 'short' });
  }

  onClosePicker = ({ target }) => {
    const isOpen = this.element.classList.contains(this.classNames.open);
    const isPicker = this.element.contains(target);
    if (isOpen && !isPicker) {
      this.element.classList.remove(this.classNames.open);
    }
  };

  selectDate(e) {
    e.preventDefault();
    const element = e.target;
    if (!element.closest('.rangepicker__cell')) {
      return true;
    }
    element.blur();
    const { value: ISOString } = element.dataset;

    this.selectedTo = this.selectedFrom ? new Date(ISOString) : null;
    this.selectedFrom = this.selectedFrom || new Date(ISOString);

    if (this.selectedFrom && this.selectedTo) {
      this.setRange(this.selectedFrom, this.selectedTo);
    } else {
      this.removeHighlightedRange();
      element.classList.add(this.classNames.from);
      this.from = null;
      this.to = null;
    }
  }

  setRange(from, to) {
    const { from: elementFrom, to: elementTo } = this.subElements;
    this.from = from >= to ? to : from;
    this.to = from >= to ? from : to;
    this.highlightRange();

    elementFrom.innerHTML = RangePicker.formatDate(this.from);
    elementTo.innerHTML = RangePicker.formatDate(this.to);

    this.selectedFrom = null;
    this.selectedTo = null;
    this.dispatchSelectDate(this.from, this.to);
    this.close();
  }

  highlightRange() {
    const { selector } = this.subElements;
    const elementDates = selector.querySelectorAll('.rangepicker__cell');
    for (const element of elementDates) {
      const { value } = element.dataset;
      const date = new Date(value);
      const className = this.getClassName(date);
      element.classList.add(className);
    }
  }

  removeHighlightedRange() {
    const { selector } = this.subElements;
    const highlightedDates = selector.querySelectorAll('[class*=rangepicker__selected]');
    for (const element of highlightedDates) {
      element.className = 'rangepicker__cell';
    }
  }

  close() {
    this.element.classList.remove(this.classNames.open);
  }

  dispatchSelectDate(from, to) {
    const range = { from, to };
    this.element.dispatchEvent(new CustomEvent(CUSTOM_EVENTS.DateSelect, { detail: range }));
  }

  renderSelector() {
    const { selector } = this.subElements;
    selector.innerHTML = this.getSelector();

    selector
      .querySelector(`.${this.classNames.left}`)
      .addEventListener('pointerdown', () => this.previousMonth());

    selector
      .querySelector(`.${this.classNames.right}`)
      .addEventListener('pointerdown', () => this.nextMonth());
  }

  initMonths() {
    const dateDiff = this.to - this.from;
    this.monthA = dateDiff > 0 ? new Date(this.from) : new Date(this.to);
    this.monthB = dateDiff > 0 ? new Date(this.to) : new Date(this.from);
  }

  previousMonth() {
    this.monthB = new Date(this.monthA);
    this.monthA.setMonth(this.monthA.getMonth() - 1);

    const { selector } = this.subElements;
    const [elementMonthA, elementMonthB] = [...selector.querySelectorAll('.rangepicker__calendar')];

    elementMonthB.remove();
    elementMonthA.insertAdjacentHTML('beforebegin', this.getMonth(this.monthA));
  }

  nextMonth() {
    this.monthA = new Date(this.monthB);
    this.monthB.setMonth(this.monthB.getMonth() + 1);

    const { selector } = this.subElements;
    const [elementMonthA, elementMonthB] = [...selector.querySelectorAll('.rangepicker__calendar')];

    elementMonthA.remove();
    elementMonthB.insertAdjacentHTML('afterend', this.getMonth(this.monthB));
  }

  render() {
    super.render();
    this.initListeners();
    return this.element;
  }

  removeListeners() {
    document.removeEventListener('pointerdown', this.onClosePicker, true);
  }

  initListeners() {
    const { input, selector } = this.subElements;
    input.addEventListener('pointerdown', e => this.togglePicker(e));
    selector.addEventListener('pointerdown', e => this.selectDate(e));
    document.addEventListener('pointerdown', this.onClosePicker, true);
  }

  togglePicker(e) {
    e.preventDefault();
    const { selector } = this.subElements;
    !selector.innerHTML ? this.renderSelector() : '';
    this.element.classList.toggle(this.classNames.open);
  }

  getSelector() {
    return `<div class='rangepicker__selector-arrow'></div>
            <div class='${this.classNames.left}'></div>
            <div class='${this.classNames.right}'></div>
            ${this.getMonth(this.monthA)}
            ${this.getMonth(this.monthB)}`;
  }

  getMonth(date) {
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
    const month = new Date(date);
    const dates = [];
    let numberOfDay = 1;
    month.setDate(numberOfDay);
    const dayOfWeek = date => (!date.getDay() ? 7 : date.getDay());

    while (date.getMonth() === month.getMonth()) {
      const isFirstDayOfMonth = numberOfDay === 1;
      const day = `<button
                            type='button'
                            class='rangepicker__cell ${this.getClassName(month)}'
                            data-value='${month.toISOString()}'
                            ${isFirstDayOfMonth ? `style="--start-from: ${dayOfWeek(month)}"` : ''}>
                                ${month.getDate()}
                            </button>`;
      dates.push(day);
      numberOfDay++;
      month.setDate(numberOfDay);
    }

    return dates.join('');
  }

  getClassName(date) {
    let className = 'rangepicker__cell';

    const isSelectedDate = this.selectedFrom?.getTime() === date.getTime();
    const isFrom = date.getTime() === this.from?.getTime();
    const isTo = date.getTime() === this.to?.getTime();
    const isBetween = date > this.from && date < this.to;

    className = isFrom || isSelectedDate ? this.classNames.from : className;
    className = isTo ? this.classNames.to : className;
    className = isBetween ? this.classNames.between : className;

    return className;
  }

  destroy() {
    super.remove();
    this.removeListeners();
    this.element = null;
    this.subElements = null;
    this.selectedFrom = 0;
  }
}
