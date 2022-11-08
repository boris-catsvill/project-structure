export default class RangePicker {
  element;
  subElements = {};

  constructor({ from, to } = {}) {
    this.from = from;
    this.to = to;

    this.rangeArr = [];
    this.clickCount = 2;

    this.year = from.getFullYear();
    this.actualYear = new Date().getFullYear();

    this.monthFrom = from.getMonth();
    this.monthFromName = this.getMonthName(this.monthFrom);
    this.monthTo = to.getMonth();
    this.monthToName = this.getMonthName(this.monthTo);

    this.render();
    this.initEventListeners();
    this.getSubElements();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  selectHandler(target) {
    switch (target) {
      case this.subElements.arrowR:
        this.monthFrom++;
        this.monthTo++;
        if (this.monthFrom > 11) this.monthFrom = 0;
        if (this.monthTo > 11) this.monthTo = 0;

        this.setInterface(this.monthFrom);
        break;
      case this.subElements.arrowL:
        this.monthFrom--;
        this.monthTo--;
        if (this.monthFrom < 0) this.monthFrom = 11;
        if (this.monthTo < 0) this.monthTo = 11;
        this.setInterface(this.monthFrom);
        break;
      default:
        break;
    }
    if (target.classList[0] === 'rangepicker__cell') {
      this.setRange(target);
    }
  }

  setInterface(prevMonth) {
    let nextMonth = prevMonth + 1;
    if (nextMonth > 11) nextMonth = 0;

    this.subElements.monthElems[0].innerHTML = this.getMonthName(prevMonth);
    this.subElements.monthElems[0].dateTime = this.getMonthName(prevMonth);
    this.subElements.monthElems[1].innerHTML = this.getMonthName(nextMonth);
    this.subElements.monthElems[1].dateTime = this.getMonthName(nextMonth);

    this.subElements.daysGrid[0].innerHTML = this.daysTemplate(prevMonth);
    this.subElements.daysGrid[1].innerHTML = this.daysTemplate(nextMonth);

    this.getCalendarElements();

    this.setStyleRange({ from: this.from.toDateString(), to: this.to.toDateString() });
  }

  setRange(target) {
    if (this.clickCount === 0) {
      this.rangeArr.push(target.dataset.value);
      target.classList.add('rangepicker__selected-from');
    }
    if (this.clickCount === 1) {
      this.rangeArr.push(target.dataset.value);

      this.from = new Date(this.rangeArr[0]);
      this.to = new Date(this.rangeArr[1]);

      this.subElements.inputFrom.innerHTML = this.from.toLocaleDateString();
      this.subElements.inputTo.innerHTML = this.to.toLocaleDateString();

      this.setStyleRange({ from: this.rangeArr[0], to: this.rangeArr[1] });
      this.subElements.rangePicker.classList.remove('rangepicker_open');

      this.element.dispatchEvent(
        new CustomEvent('date-select', {
          detail: {
            from: this.from,
            to: this.to
          }
        })
      );
    }
    if (this.clickCount === 2) {
      this.setStyleRange({ clear: true });
      target.classList.add('rangepicker__selected-from');

      this.clickCount = 0;
      this.rangeArr = [];
      this.rangeArr.push(target.dataset.value);
    }

    this.clickCount++;
  }

  setStyleRange({ from, to, clear = false }) {
    if (clear) {
      for (const item of this.subElements.daysAll) {
        item.classList.remove('rangepicker__selected-from');
        item.classList.remove('rangepicker__selected-between');
        item.classList.remove('rangepicker__selected-to');
      }
      return;
    }
    const fromStr = from ? from : '';
    const toStr = to ? to : '';

    const fromInRange =
      from.split(' ')[1] === this.subElements.monthElems[0].dateTime.slice(0, 3)
        ? true
        : from.split(' ')[1] === this.subElements.monthElems[1].dateTime.slice(0, 3)
        ? true
        : false;

    const toInRange =
      to.split(' ')[1] === this.subElements.monthElems[0].dateTime.slice(0, 3)
        ? true
        : to.split(' ')[1] === this.subElements.monthElems[1].dateTime.slice(0, 3)
        ? true
        : false;

    let isFullMonths = false;

    if (
      this.getMonthName(this.subElements.monthElems[0].dateTime) > this.from.getMonth() &&
      this.getMonthName(this.subElements.monthElems[1].dateTime) < this.to.getMonth()
    ) {
      isFullMonths = true;
    }

    let isBetween = !fromInRange ? (!toInRange ? isFullMonths : true) : false;

    for (const day of this.subElements.daysAll) {
      if (day.dataset.value === fromStr) {
        isBetween = true;
        day.classList.add('rangepicker__selected-from');
        continue;
      }
      if (day.dataset.value === toStr) {
        isBetween = false;
        day.classList.add('rangepicker__selected-to');
      }
      if (isBetween) {
        day.classList.add('rangepicker__selected-between');
      }
    }
  }

  getMonthName(month) {
    if (typeof month === 'number') {
      const monthName = new Intl.DateTimeFormat('en-EN', { month: 'long' }).format(
        new Date(this.actualYear, month, 1)
      );
      return monthName;
    } else if (typeof month === 'string') {
      const monthNumber = new Date(this.actualYear, month, 1);
      return monthNumber.getMonth();
    }
  }

  getMonthDays(month) {
    const obj = {};
    obj.allDays = new Date(this.year, month, 0).getDate();
    obj.firstDay = new Date(this.year, month, 1).getDay();
    return obj;
  }

  weeksTemplate() {
    const weekArr = [];
    for (let i = 0; i < 7; i++) {
      const weekName = new Intl.DateTimeFormat('en-EN', { weekday: 'short' }).format(
        new Date(this.actualYear, 7, i + 1)
      );
      weekArr.push(weekName);
    }
    return weekArr;
  }

  setCustomRange(from, to) {
    this.from = from;
    this.to = to;

    this.subElements.inputFrom.textContent = this.from.toLocaleDateString();
    this.subElements.inputTo.textContent = this.to.toLocaleDateString();
  }

  getCalendarElements() {
    this.subElements.daysAll = [];
    for (const item of this.subElements.daysGrid[0].children) this.subElements.daysAll.push(item);
    for (const item of this.subElements.daysGrid[1].children) this.subElements.daysAll.push(item);
  }

  inputHandler = event => {
    const target = event.target;

    const targetInput = target.closest('[data-element="input"]');
    const targetSelector = target.closest('[data-element="selector"]');

    if (targetInput === this.subElements.input) {
      if (this.subElements.rangePicker.classList[1] === 'rangepicker_open') {
        this.subElements.rangePicker.classList.remove('rangepicker_open');
      } else {
        this.subElements.rangePicker.classList.add('rangepicker_open');
        this.setInterface(this.monthFrom);
      }
    } else if (targetSelector === this.subElements.selector) {
      this.selectHandler(target);
    } else {
      this.subElements.rangePicker.classList.remove('rangepicker_open');
    }
  };

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }

    this.subElements.monthElems = this.element.querySelectorAll('time');
    this.subElements.daysGrid = this.element.querySelectorAll('.rangepicker__date-grid');
  }

  initEventListeners() {
    document.addEventListener('click', this.inputHandler);
  }

  daysTemplate(month) {
    const template = document.createElement('div');
    const monthDays = this.getMonthDays(month);
    let str = '';

    for (let i = 1; i <= monthDays.allDays; i++) {
      const date = new Date(`${this.year}-${month + 1}-${i}`).toDateString();
      str += `<button type="button" class="rangepicker__cell" data-value="${date}">${i}</button>`;
    }
    template.innerHTML = str;
    template.children[0].style.setProperty('--start-from', monthDays.firstDay);

    return template.innerHTML;
  }

  get template() {
    return ` 
    <div class="container">
      <div class="rangepicker" data-element="rangePicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="inputFrom">${this.from.toLocaleDateString()}</span> -
          <span data-element="inputTo">${this.to.toLocaleDateString()}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector">
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left" data-element="arrowL"></div>
          <div class="rangepicker__selector-control-right" data-element="arrowR"></div>
          <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
              <time datetime="${this.monthFromName}">
                ${this.monthFromName}
              </time>
            </div>
            <div class="rangepicker__day-of-week">
              ${this.weeksTemplate()
                .map(item => `<div>${item}</div>`)
                .join('')}
            </div>
            <div class="rangepicker__date-grid">
            </div>
          </div>
          <div class="rangepicker__calendar">
            <div class="rangepicker__month-indicator">
              <time datetime="${this.getMonthName(this.monthFrom + 1)}">
                ${this.getMonthName(this.monthFrom + 1)}
              </time>
            </div>
            <div class="rangepicker__day-of-week">
              ${this.weeksTemplate()
                .map(item => `<div>${item}</div>`)
                .join('')}
            </div>
            <div class="rangepicker__date-grid">
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('click', this.inputHandler);
  }
}
