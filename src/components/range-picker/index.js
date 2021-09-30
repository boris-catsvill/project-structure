import setUTCMonthCorrectly from '../../utils/helpers.js';

const MONTHS_AT_ONE_TIME = 2;
const LAST_DAY_IN_A_WEEK = 7;

export default class RangePicker {
  element = null;
  subElements = {};
  selectingFrom = true;

  handleDatePick = event => {
    const target = event.target;

    if (!target.classList.contains('rangepicker__cell')) return;

    const dateValue = new Date(target.dataset.value);

    if (this.selectingFrom) {
      this.removeSelected();

      this.selectingFrom = false;
      this.selected = {
        from: dateValue,
        to: null
      };

      this.highlightDates(this.selected);
    } else {
      if (dateValue < this.selected.from) {
        this.selected.to = this.selected.from;
        this.selected.from = dateValue;
      } else {
        this.selected.to = dateValue;
      }

      this.selectingFrom = true;

      this.updateInput();
      this.highlightDates(this.selected);
      this.closeSelector();

      this.element.dispatchEvent(new CustomEvent('date-select', {
        bubbles: true,
        detail: {
          from: this.selected.from,
          to: this.selected.to
        }
      }));
    }
  }

  handleControlArrows = event => {
    const className = event.target.className;
    const direction = className.slice(className.lastIndexOf('-') + 1);
    let month = this.showDateFrom.getUTCMonth();

    if (direction === 'right') {
      month += 1;
    } else if (direction === 'left') {
      month -= 1;
    }

    setUTCMonthCorrectly(this.showDateFrom, month);
    this.renderSelector(this.showDateFrom);
  };

  toggleSelector = event => {
    const selector = this.subElements.selector;

    if (selector.innerHTML.trim() === '') {
      this.renderSelector(this.selected.from);
    }

    this.element.classList.toggle('rangepicker_open');
  }

  handleClickOutside = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isChildOfRangePicker = this.element.contains(event.target);

    if (isOpen && !isChildOfRangePicker) {
      this.closeSelector();
    }
  };

  constructor({
                from = new Date(),
                to = new Date()
              } = {}) {

    this.selected = {
      from: this.getUTCMidnight(from),
      to: this.getUTCMidnight(to)
    };
    this.showDateFrom = new Date(this.selected.from.getTime());

    this.render();
    this.initEventListeners();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.renderSkeleton(this.selected);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  initEventListeners() {
    const {selector, input} = this.subElements;

    input.addEventListener('click', this.toggleSelector);
    selector.addEventListener('click', this.handleDatePick);
    document.addEventListener('click', this.handleClickOutside, true);
  }

  closeSelector() {
    this.element.classList.remove('rangepicker_open');
  }

  updateInput() {
    this.subElements.from.innerHTML = this.formatDate(this.selected.from);
    this.subElements.to.innerHTML = this.formatDate(this.selected.to);
  }

  renderSelector(initialDate) {
    const selector = this.subElements.selector;

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>`;

    const arrowsClasses = '.rangepicker__selector-control-left, .rangepicker__selector-control-right';
    const controlArrows = Array.from(selector.querySelectorAll(arrowsClasses));

    if (controlArrows.length) {
      controlArrows.forEach(arrow => {
        arrow.addEventListener('click', this.handleControlArrows, true);
      });
    }

    selector.insertAdjacentHTML('beforeend', this.renderMonths(initialDate));

    this.highlightDates(this.selected);
  }

  highlightDates(selected) {
    const fromTS = selected.from.getTime();
    const toTS = selected.to ? selected.to.getTime() : null;
    const datesButtons = this.getDatesButtons();
    const firstButtonTS = Date.parse(datesButtons[0].dataset.value);
    const lastButtonTS = Date.parse(datesButtons[datesButtons.length - 1].dataset.value);

    if (selected.to) {
      if (toTS < firstButtonTS || fromTS > lastButtonTS) return;
    } else {
      if (fromTS < firstButtonTS || fromTS > lastButtonTS) return;
    }

    datesButtons.forEach(button => {
      let buttonDateTS = Date.parse(button.dataset.value);

      if (buttonDateTS === fromTS) {
        button.classList.add('rangepicker__selected-from');
      }

      if (!selected.to) return;

      if (buttonDateTS > fromTS && buttonDateTS < toTS) {
        button.classList.add('rangepicker__selected-between');
      } else if (buttonDateTS === toTS) {
        button.classList.add('rangepicker__selected-to');
      }
    });
  }

  getDatesButtons() {
    return Array.from(this.subElements.selector.querySelectorAll('.rangepicker__cell'));
  }

  renderMonths(firstMonthDate) {
    const months = [];
    const initTime = firstMonthDate.getTime();
    const month = firstMonthDate.getUTCMonth();

    for (let i = 0; i < MONTHS_AT_ONE_TIME; i++) {
      let date = new Date(initTime);

      setUTCMonthCorrectly(date, month + i);

      months.push(this.renderOneMoth(date));
    }

    return months.join('');
  }

  renderOneMoth(date) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${this.toDateTime(date)}">
            ${date.toLocaleDateString('ru', {month: 'long', timeZone: 'UTC'})}
          </time>
        </div>
        <div class="rangepicker__day-of-week">
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
            ${this.renderDatesButtons(date)}
        </div>
      </div>`;
  }

  renderDatesButtons(initialDate) {
    const date = new Date(initialDate.getTime());
    const boundaryValues = this.getBoundaryValues(date);
    const startFrom = boundaryValues.firstDayNumber === 0 ? LAST_DAY_IN_A_WEEK : boundaryValues.firstDayNumber;
    const dateButtons = [];

    for (let i = 1; i <= boundaryValues.lastDate; i++) {
      date.setUTCDate(i);

      dateButtons.push(`
            <button type="button"
                class="rangepicker__cell"
                data-value="${date.toISOString()}"
                style="${i === 1 ? '--start-from: ' + startFrom : ''}">
                ${i}
            </button>
        `);
    }

    return dateButtons.join('');
  }

  getBoundaryValues(initialDate) {
    const date = new Date(initialDate.getTime());

    date.setUTCDate(1);
    const firstDayNumber = date.getUTCDay();

    setUTCMonthCorrectly(date, (date.getUTCMonth() + 1));
    date.setUTCDate(0);
    const lastDate = date.getUTCDate();

    return {firstDayNumber, lastDate};
  }

  renderSkeleton(selected) {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.formatDate(selected.from)}</span> -
          <span data-element="to">${this.formatDate(selected.to)}</span>
        </div>
         <div class="rangepicker__selector" data-element="selector"></div>
      </div>`;
  }

  formatDate(dateToTransform) {
    return dateToTransform.toLocaleDateString('ru', {dateStyle: 'short', timeZone: 'UTC'});
  }

  toDateTime(date) {
    const month = date.getUTCMonth() + 1;

    return `${date.getUTCFullYear()}-${('0' + month).slice(-2)}`;
  }

  removeSelected() {
    const datesButtons = this.getDatesButtons();
    const selectedClasses = ['rangepicker__selected-from', 'rangepicker__selected-between', 'rangepicker__selected-to'];

    datesButtons.forEach(button => button.classList.remove.apply(button.classList, selectedClasses));
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return Array.from(subElements).reduce((result, el) => {
      result[el.dataset.element] = el;

      return result;
    }, {});
  }

  getUTCMidnight(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener('click', this.handleClickOutside, true);
  }
}
