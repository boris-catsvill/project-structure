export default class RangePicker {
  element = null;
  subElements = {};
  isSelected = false;
  selectedDate = {from: new Date(), to: new Date()}

  static formatDate(date) {
    return date.toLocaleDateString('ru', { dateStyle: 'short'});
  }

  constructor({
                from = new Date(),
                to = new Date()
              }
                = {}) {
    this.startFrom = new Date(from);
    this.selectedDate = {from, to};

    this.open = this.openCalendar.bind(this);
    this.rangeChoice = this.chooseRange.bind(this);
    this.render();
  }

  _getSubElements() {
    let elements = this.element.querySelectorAll('[data-element]');
    for (let element of elements) {
      this.subElements[element.dataset.element] = element;
    }

    return this.subElements;
  }


  _getTemplate() {
    let from = RangePicker.formatDate(this.selectedDate.from);
    let to = RangePicker.formatDate(this.selectedDate.to);

    return `<div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                  <span data-element="from">${from}</span> -
                  <span data-element="to">${to}</span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>`;
  }

  _getDaysInMonth(currentDate = this.startFrom) {
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    return new Date(currentYear, currentMonth, 0).getDate();
  }

  _getDayOfWeek(currentDate = this.startFrom) {
    let tmpDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    return tmpDate.getDay();
  }

  _getCurrentMonth(currentDate = this.startFrom) {
    return currentDate.toLocaleString('ru', {month: 'long'});
  }

  _highlightRange() {
    let buttonsRange = this.element.querySelectorAll('.rangepicker__cell');

    let fromRange = new Date(
      this.selectedDate.from.getFullYear(),
      this.selectedDate.from.getMonth(),
      this.selectedDate.from.getDate()).toISOString();
    let endRange;
    if (this.selectedDate.to !== null) {
      endRange = new Date(
        this.selectedDate.to.getFullYear(),
        this.selectedDate.to.getMonth(),
        this.selectedDate.to.getDate()).toISOString();
    }

    for (let button of buttonsRange) {
      let {value} = button.dataset;

      button.classList.remove('rangepicker__selected-from');
      button.classList.remove('rangepicker__selected-to');
      button.classList.remove('rangepicker__selected-between');
      if (fromRange === value) {
        button.classList.add('rangepicker__selected-from');
      } else if (endRange === value) {
        button.classList.add('rangepicker__selected-to');
      } else if (value >= fromRange && value <= endRange && fromRange) {
        button.classList.add('rangepicker__selected-between');
      }
    }
  }

  _dateRangeSelect(target) {
    if (target) {

      let data = target.dataset.value;
      data = new Date(data);

      if (!this.isSelected) {
        this.selectedDate.from = data;
        this.selectedDate.to = null;
        this.isSelected = true;
        this._highlightRange();
      } else {
        if (data > this.selectedDate.from) {
          this.selectedDate.to = data;
        } else {
          this.selectedDate.to = this.selectedDate.from;
          this.selectedDate.from = data;
        }
        this.isSelected = false;
        this._highlightRange();
      }

      if (this.selectedDate.from && this.selectedDate.to) {
        this.close();
        this.dispatchEvent();
        this.subElements.from.innerHTML = RangePicker.formatDate(this.selectedDate.from);
        this.subElements.to.innerHTML = RangePicker.formatDate(this.selectedDate.to);
      }

    }
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selectedDate
    }));
  }


  _drawMonth(daysMonth, dayWeek, currentDate) {
    let month = `
    <div class="rangepicker__date-grid">
        <button type="button"
        class="rangepicker__cell"
        data-value="${new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()}"
        style="--start-from: ${dayWeek + 1}">
            1
        </button>`;

    for (let i = 2; i <= daysMonth; i++) {
      month += `<button type="button"
                class="rangepicker__cell"
                data-value="${new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toISOString()}">
                    ${i}
                </button>`;
    }

    return month;
  }

  previousMonth() {
    this.startFrom.setMonth(this.startFrom.getMonth() - 1);
    this.renderRangePicker();
  }

  nextMonth() {
    this.startFrom.setMonth(this.startFrom.getMonth() + 1);
    this.renderRangePicker();
  }

  renderCalendar(startFrom = this.startFrom) {
    let daysMonth = this._getDaysInMonth(startFrom);
    let dayWeek = this._getDayOfWeek(startFrom);
    let monthName = this._getCurrentMonth(startFrom);

    let endTo = new Date(startFrom.getTime());
    endTo.setMonth(startFrom.getMonth() + 1);
    let daysMonthTo = this._getDaysInMonth(endTo);
    let dayWeekTo = this._getDayOfWeek(endTo);
    let monthNameTo = this._getCurrentMonth(endTo);

    return `
        <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
                <time datetime="${monthName}">${monthName}</time>
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
            ${this._drawMonth(daysMonth, dayWeek, startFrom)}
            </div>
        </div>
        <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
                <time datetime="${monthNameTo}">${monthNameTo}</time>
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
            ${this._drawMonth(daysMonthTo, dayWeekTo, endTo)}
            </div>
        </div>
    `;
  }

  renderRangePicker() {
    let {selector} = this.subElements;
    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar()}
    `;

    let controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    let controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.previousMonth());
    controlRight.addEventListener('click', () => this.nextMonth());

    this._highlightRange();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this._getTemplate();
    this.element = this.element.firstElementChild;
    this._getSubElements();
    this.addListeners();

    return this.element;

  }

  chooseRange(event) {
    if (event.target.classList.contains('rangepicker__cell')) {
      this._dateRangeSelect(event.target);
    }
  }

  openCalendar(event) {
    let isRangeClick = false;
    let isOpen = true;

    if (this.element.contains(event.target)) {
      isRangeClick = true;
    }

    if (this.element.classList.contains('rangepicker_open') &&
      (event.target.dataset.element === 'input' || event.target.closest('[data-element=input]'))) {
      isOpen = false;
    }

    if (isOpen && isRangeClick) {
      this.element.classList.add('rangepicker_open');
      this.renderRangePicker();
    } else {
      this.close();
    }
  }

  close() {
    this.element.classList.remove('rangepicker_open');

  }

  addListeners() {
    this.subElements.input.addEventListener('click', this.open);
    this.subElements.selector.addEventListener('click', this.rangeChoice);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.isSelected = true;
    this.selectedDate = {
      from: new Date(),
      to: new Date()
    };

    return this;
  }
}

