import { WEEKDAYS, MONTHS, LOCALE } from '../../constants';

export default class RangePicker {
  element;
  subElements;
  selectedRange;
  selection;

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

    if (this.selection.to) {
      // start new selection
      this.selection.from = selectedDate;
      this.selection.to = null;

      this.clearSelection();
      button.classList.add('rangepicker__selected-from');
      return;
    }

    // finish selection
    // NB! the assignment order "to" -> "from" is important,
    // otherwise "from" date may be overwritten before "to" date is determined
    this.selection.to = new Date(Math.max(this.selection.from.getTime(), selectedDate.getTime()));
    this.selection.from = new Date(Math.min(this.selection.from.getTime(), selectedDate.getTime()));

    // need to clear previous selection in case first selected date > second selected date
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
    this.selectedRange = {from: from, to: to};
    this.selection = {from: from, to: to};
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
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="rangepicker">
            <div class="rangepicker__input" data-element="input">
                <span data-element="from">${new Intl.DateTimeFormat(LOCALE).format(this.selectedRange.from)}</span> -
                <span data-element="to">${new Intl.DateTimeFormat(LOCALE).format(this.selectedRange.to)}</span>
            </div>
            <div class="rangepicker__selector" data-element="selector"></div>
        </div>
    `;
    this.element = wrapper.firstElementChild;
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
        ${this.getDaysOfWeek()}
        ${this.getDaysOfMonth(date)}
    `;
  }

  getDaysOfWeek() {
    return `
        <div class="rangepicker__day-of-week">
            ${WEEKDAYS.map(day => `<div>${day}</div>`).join('')}
        </div>
    `;
  }

  getDaysOfMonth(date) {
    const result = [];

    let current = date;
    while (current < this.addMonth(date)) {
      result.push(this.getDate(current));
      current = this.addDay(current);
    }

    return `
        <div class="rangepicker__date-grid">
            ${result.join('')}
        </div>
      `;
  }

  getDate(date) {
    const style = date.getDate() === 1 ? `style="--start-from: ${this.getWeekday(date)}"` : '';
    return `
        <button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" ${style}>
            ${date.getDate()}
        </button>
  `;
  }

  getWeekday(date) {
    // get day of week starting from a Sunday and transform it to the one starting from a Monday, i.e.:
    // Sunday: from 0 to 6
    // Monday - Saturday: from 1 - 6 to 0 - 5
    return (date.getDay() + WEEKDAYS.length - 1) % WEEKDAYS.length;
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
    this.selectedRange.from = this.selection.from;
    this.selectedRange.to = this.selection.to;

    this.subElements.from.textContent = new Intl.DateTimeFormat(LOCALE).format(this.selectedRange.from);
    this.subElements.to.textContent = new Intl.DateTimeFormat(LOCALE).format(this.selectedRange.to);

    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: {
        from: this.selectedRange.from,
        to: this.selectedRange.to
      }
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
    const from = this.selection.from;
    const to = this.selection.to;

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
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('click', this.onExternalClick, {capture: true});
  }
}
