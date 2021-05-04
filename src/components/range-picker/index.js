export default class RangePicker {
  isVisible = false;

  constructor({ from = new Data(), to = new Data() }) {
    this.from = from;
    this.to = to;

    this.currentFrom = new Date(from);
    this.currentTo = new Date(to);

    this.currentPickFrom = new Date(from);
    this.currentPickTo = new Date(to);

    this.currentMonthFrom = new Date(from);
    this.currentMonthTo = new Date(to);

    this.render();
    this.initEventListeners();
  }

  getRangeTime(from = this.currentFrom, to = this.currentTo) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

    return `
          <span data-element="from">${from.toLocaleString('ru', options)}</span> -
          <span data-element="to">${to.toLocaleString('ru', options)}</span>
      `;
  }

  getDayButton(currentDate, firstDayInMonthIndex = -1) {
    const wrapper = document.createElement('div');

    wrapper.insertAdjacentHTML('beforeend',
      `<button type="button" 
              class="rangepicker__cell ${this.getRangeClass(currentDate)}"
              style="${firstDayInMonthIndex !== -1 ? `--start-from: ${firstDayInMonthIndex + 2}` : ""}" 
              data-value="${new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString()}">${currentDate.getDate()}</button>`
    );

    return wrapper.firstElementChild;
  }

  getRangeClass(date, minRange = this.currentPickFrom, maxRange = this.currentPickTo) {
    const minDate = new Date(minRange.getFullYear(), minRange.getMonth(), minRange.getDate());
    const maxDate = new Date(maxRange.getFullYear(), maxRange.getMonth(), maxRange.getDate());

    if (minDate < date && date < maxDate) {
      return "rangepicker__selected-between";
    } else if ((date.getTime() === minDate.getTime()) ||
      (minDate.getTime() === date.getTime() &&
        date.getTime() === maxDate.getTime())) {
      return "rangepicker__selected-from";
    } else if (date.getTime() === maxDate.getTime()) {
      return "rangepicker__selected-to";
    } else
      return "";
  }

  getDaysButtons(date) {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = 33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate();
    const firstDayInMonthIndex = new Date(`${date.getYear()}-${date.getMonth() + 1}-01`).getDay();

    const daysTemplate = document.createElement('div');

    daysTemplate.append(this.getDayButton(startDate, firstDayInMonthIndex));

    for (let dayIndex = 2; dayIndex <= daysInMonth; dayIndex++) {
      daysTemplate.append(this.getDayButton(new Date(date.getFullYear(), date.getMonth(), dayIndex)));
    }

    return daysTemplate.innerHTML;
  }

  getWeekTemplate() {
    return `
          <div class="rangepicker__day-of-week">
              <div>Пн</div>
              <div>Вт</div>
              <div>Ср</div>
              <div>Чт</div>
              <div>Пт</div>
              <div>Сб</div>
              <div>Вс</div>
          </div>
      `;
  }

  getMonthTime(date) {
    return `
          <time datetime="${date.toLocaleString('default', { month: 'long' })}">
              ${date.toLocaleString('ru', { month: 'long' })}
          </time>
      `;
  }

  getTemplate() {
    return `
          <div class="rangepicker">
              <div class="rangepicker__input" data-element="input">
                  ${this.getRangeTime()}
              </div>
              <div class="rangepicker__selector" data-element="selector"></div>
          </div>
      `;
  }

  getSelector() {
    return `
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left"></div>
          <div class="rangepicker__selector-control-right"></div>
          <div class="rangepicker__calendar">
              <div data-element="frommonth" class="rangepicker__month-indicator">
                  ${this.getMonthTime(this.from)}
              </div>
              ${this.getWeekTemplate()}
              <div data-element="fromrange" class="rangepicker__date-grid">
                  ${this.getDaysButtons(this.from)}
              </div>
          </div>
          <div class="rangepicker__calendar">
              <div data-element="tomonth" class="rangepicker__month-indicator">
                  ${this.getMonthTime(this.to)}
              </div>
              ${this.getWeekTemplate()}
              <div data-element="torange" class="rangepicker__date-grid">
                  ${this.getDaysButtons(this.to)}
              </div>
          </div>
      `;
  }

  updateCalendar(dateFrom = this.from, dateTo = this.to) {
    this.subElements.frommonth.innerHTML = this.getMonthTime(dateFrom);
    this.subElements.fromrange.innerHTML = this.getDaysButtons(dateFrom);
    this.subElements.tomonth.innerHTML = this.getMonthTime(dateTo);
    this.subElements.torange.innerHTML = this.getDaysButtons(dateTo);

    this.addDaysButtonsListeners();
  }

  updatePicker(from = this.from, to = this.to, isUpdateRange = false) {
    if (isUpdateRange) {
      if (this.pickTwo) {
        this.subElements.input.innerHTML = this.getRangeTime(from, to);

        this.currentFrom = from;
        this.currentTo = to;

        this.dispatchEvent();

        this.pickOne = this.pickTwo = undefined;
      }

      this.currentPickFrom = new Date(from);
      this.currentPickTo = new Date(to);

      this.updateCalendar(this.currentMonthFrom, this.currentMonthTo);
    } else {
      this.updateCalendar(from, to);
    }
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: { from: this.currentFrom, to: this.currentTo }
    }));
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  onSelectorMonthClick(event) {
    if (event.target.className.includes('left')) {
      this.currentMonthFrom.setMonth(this.currentMonthFrom.getMonth() - 1);
      this.currentMonthTo.setMonth(this.currentMonthTo.getMonth() - 1);

      this.updatePicker(this.currentMonthFrom, this.currentMonthTo);
    } else {
      this.currentMonthFrom.setMonth(this.currentMonthFrom.getMonth() + 1);
      this.currentMonthTo.setMonth(this.currentMonthTo.getMonth() + 1);

      this.updatePicker(this.currentMonthFrom, this.currentMonthTo);
    }
  }

  removeSelected() {
    const dateButtons = this.element.querySelectorAll('[class*="rangepicker__cell"]');

    dateButtons.forEach(button => {
      button.classList.remove('rangepicker__selected-to');
      button.classList.remove('rangepicker__selected-between');
      button.classList.remove('rangepicker__selected-from');
    });
  }

  onDateButtonClick(event) {
    if (this.pickOne) {
      this.pickTwo = new Date(event.target.dataset.value);

      if (this.pickOne > this.pickTwo) {
        this.updatePicker(this.pickTwo, this.pickOne, true);
      } else if (this.pickOne < this.pickTwo) {
        this.updatePicker(this.pickOne, this.pickTwo, true);
      } else if (this.pickOne.getTime() === this.pickTwo.getTime()) {
        this.updatePicker(this.pickOne, this.pickTwo, true);
      } else {
        this.updatePicker(this.from, this.to);
      }

      this.onShowDatePicker();
    } else {
      this.pickOne = new Date(event.target.dataset.value);

      this.updatePicker(this.pickOne, this.pickOne, true);
    }
  }

  resetRange() {
    this.currentPickFrom = this.currentFrom;
    this.currentPickTo = this.currentTo;

    this.currentMonthFrom = new Date(this.from);
    this.currentMonthTo = new Date(this.to);
  }

  createSelector() {
    this.subElements.selector.innerHTML = "";
    this.subElements.selector.insertAdjacentHTML('beforeend', this.getSelector());
    this.subElements = this.getSubElements(this.element);

    this.addMonthsButtonsListeners();
    this.addDaysButtonsListeners();
  }

  onShowDatePicker() {
    if (!this.isVisible) {
      this.isVisible = true;

      this.createSelector();

      this.element.classList.add('rangepicker_open');
    } else {
      this.isVisible = false;

      this.element.classList.remove('rangepicker_open');
      this.resetRange();
    }
  }

  addMonthsButtonsListeners() {
    const selectorControl = this.element.querySelectorAll('[class*="selector-control"]');

    selectorControl.forEach(selector => {
      selector.addEventListener('click', this.onSelectorMonthClick.bind(this));
    });
  }

  addDaysButtonsListeners() {
    const buttons = this.element.querySelectorAll('[class*="rangepicker__cell"]');

    buttons.forEach(button => {
      button.addEventListener('click', this.onDateButtonClick.bind(this));
    })
  }

  initEventListeners() {
    const pickerInput = this.element.querySelector('.rangepicker__input');

    pickerInput.addEventListener('click', this.onShowDatePicker.bind(this));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
    this.subElements = {};
  }
}