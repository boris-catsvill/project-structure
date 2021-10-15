import { LOCALE } from '../../constants/index.js';

const getWeekday = date => (date.getDay() + 7 - 1) % 7;

const WEEKDAYS = new Array(7)
  .fill(1)
  .map((_, index) => new Date(new Date().setDate(index)))
  .sort((d1, d2) => getWeekday(d1) - getWeekday(d2))
  .map(date => date.toLocaleDateString(LOCALE, { weekday: 'short' }));

const MONTHS = new Array(12)
  .fill(1)
  .map((_, index) => new Date(new Date().setMonth(index)).toLocaleDateString(LOCALE, { month: 'long'}))

export default class RangePicker {
  element;
  subElements = {};

  onInputClick = () => {
    if (!this.element.classList.contains('rangepicker_open')) {
      this.openSelector();
    } else {
      this.closeSelector();
    }
  }

  onSelectorClick = event => {
    const button = event.target.closest('.rangepicker__cell');

    if (!button) {
      return;
    }

    const selectedDate = new Date(button.dataset.value);

    if (!this.selectionStarted) {
      // start new selection
      this.selectionStarted = true;
      this.selectionFrom = selectedDate;

      this.clearSelection();
      button.classList.add('rangepicker__selected-from');
      return;
    }

    // finish selection
    this.selectionStarted = false;

    const getSelection = type => new Date(Math[type](this.selectionFrom.getTime(), selectedDate.getTime()));

    this.selectedRange.from = getSelection('min');
    this.selectedRange.to = getSelection('max');

    // clear previous selection in case first selected date > second selected date
    this.clearSelection(['rangepicker__selected-from']);
    this.doSelection();
    this.updateInput();
    this.closeSelector();
  }

  onExternalClick = event => {
    const target = event.target.closest('.rangepicker');
    if (!target) {
      this.closeSelector();
    }
  }

  moveBackward = () => {
    this.calendarVisibleFrom = this.addMonth(this.calendarVisibleFrom, -1);
    this.updateCalendar(this.calendarVisibleFrom);
  }

  moveForward = () => {
    this.calendarVisibleFrom = this.addMonth(this.calendarVisibleFrom);
    this.updateCalendar(this.calendarVisibleFrom);
  }

  constructor({
                from = new Date(),
                to = new Date()
              }) {
    this.selectedRange = {from, to};
    this.calendarVisibleFrom = this.firstDayOfMonth(from);

    this.render();
    this.initEventListeners();
  }

  firstDayOfMonth(date) {
    const newDate = new Date(date);
    newDate.setDate(1);
    return newDate;
  }

  addMonth(date, numberOfMonthsToAdd = 1) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + numberOfMonthsToAdd);
    return newDate;
  }

  addDay(date, numberOfDaysToAdd = 1) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numberOfDaysToAdd);
    return newDate;
  }

  render() {
    const {from, to} = this.selectedRange;

    this.element = document.createElement('div');
    this.element.innerHTML = `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${new Intl.DateTimeFormat(LOCALE).format(from)}</span> -
          <span data-element="to">${new Intl.DateTimeFormat(LOCALE).format(to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  buildSelector(dateFrom) {
    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        ${this.getCalendarMonth(this.firstDayOfMonth(dateFrom))}
      </div>
      <div class="rangepicker__calendar">
        ${this.getCalendarMonth(this.firstDayOfMonth(this.addMonth(dateFrom)))}
      </div>
    `;

    this.doSelection();

    this.getLeft().addEventListener('click', this.moveBackward);
    this.getRight().addEventListener('click', this.moveForward);
  }

  updateCalendar(dateFrom) {
    let date = this.firstDayOfMonth(dateFrom);

    this.subElements.selector.querySelectorAll('.rangepicker__calendar')
      .forEach(value => {
        value.innerHTML = this.getCalendarMonth(date);
        date = this.addMonth(date);
      });

    this.doSelection();
  }

  getCalendarMonth(date) {
    return `
      <div class="rangepicker__month-indicator">
        <time dateTime="${MONTHS[date.getMonth()]}">${MONTHS[date.getMonth()]}</time>
      </div>
      <div class="rangepicker__day-of-week">
        ${WEEKDAYS.map(value => `<div>${value}</div>`).join('')}
      </div>
      <div class="rangepicker__date-grid">
        ${this.getDates(date).map(value => this.renderDate(value)).join('')}
      </div>
    `;
  }

  getDates(fromDate) {
    const dates = [];

    let current = fromDate;
    while (current < this.addMonth(fromDate)) {
      dates.push(current);
      current = this.addDay(current);
    }

    return dates;
  }

  renderDate(date) {
    const style = date.getDate() === 1 ? `style="--start-from: ${getWeekday(date)}"` : '';
    return `
      <button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" ${style}>
        ${date.getDate()}
      </button>
    `;
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.onInputClick);
    this.subElements.selector.addEventListener('click', this.onSelectorClick);
    document.addEventListener('click', this.onExternalClick, {capture: true});
  }

  openSelector() {
    if (!this.subElements.selector.childElementCount) {
      this.buildSelector(this.selectedRange.from);
    }
    this.element.classList.add('rangepicker_open');
  }

  closeSelector() {
    this.element.classList.remove('rangepicker_open');
  }

  updateInput() {
    const {from, to} = this.selectedRange;

    this.subElements.from.textContent = new Intl.DateTimeFormat(LOCALE).format(from);
    this.subElements.to.textContent = new Intl.DateTimeFormat(LOCALE).format(to);

    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: {from, to}
    }));
  }

  getLeft() {
    return this.subElements.selector.querySelector('.rangepicker__selector-control-left');
  }

  getRight() {
    return this.subElements.selector.querySelector('.rangepicker__selector-control-right');
  }

  clearSelection(tokens = ['rangepicker__selected-from', 'rangepicker__selected-to', 'rangepicker__selected-between']) {
    const selectors = tokens.map(value => `.${value}`).join(', ');
    this.subElements.selector.querySelectorAll(selectors)
      .forEach(value => value.classList.remove(...tokens));
  }

  doSelection() {
    const {from, to} = this.selectedRange;

    this.subElements.selector.querySelectorAll('.rangepicker__cell')
      .forEach(value => {
        const date = new Date(value.dataset.value);

        if (date.getTime() === from.getTime()) {
          value.classList.add('rangepicker__selected-from');

        } else if (to && date.getTime() === to.getTime()) {
          value.classList.add('rangepicker__selected-to');

        } else if (to && date > from && date < to) {
          value.classList.add('rangepicker__selected-between');
        }
      });
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    document.removeEventListener('click', this.onExternalClick, { capture: true });

    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
