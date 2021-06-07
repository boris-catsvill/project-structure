export default class RangePicker {
  openedRangePickerClass = 'rangepicker_open';
  rangePickerCellClass = 'rangepicker__cell';
  rangePickerFromCellClass = 'rangepicker__selected-from';

  onInputClick = () => {
    if (!this.isOpened) {
      if (!this.hasSelectionByUser) {
        this.subElements['selector'].innerHTML = this.selectorTemplate;
        this.hasSelectionByUser = true;
      }

      this.expandDatePicker();
    } else {
      this.collapseDatePicker();
    }
  };

  onSelectorClick = event => {
    const element = event.target;
    const classList = element.classList;

    if (classList.contains('rangepicker__selector-control-left')) {
      this.firstMonthDay.setMonth(this.firstMonthDay.getMonth() - 1);
      this.updateCalendars();
    }

    if (classList.contains('rangepicker__selector-control-right')) {
      this.firstMonthDay.setMonth(this.firstMonthDay.getMonth() + 1);
      this.updateCalendars();
    }

    if (classList.contains(this.rangePickerCellClass)) {
      if (this.selected.to) {
        this.selected.from = null;
        this.selected.to = null;

        this.subElements['selector'].querySelectorAll(`.${this.rangePickerCellClass}`)
          .forEach(date => date.className = this.rangePickerCellClass);
      }

      if (!this.selected.from) {
        this.selected.from = new Date(element.dataset.value);
        event.target.classList.add(this.rangePickerFromCellClass);
      } else {
        this.selected.to = new Date(element.dataset.value);
        this.selected.to.setHours(23, 59, 59);

        if (this.selected.from.valueOf() > this.selected.to.valueOf()) {
          [this.selected.to, this.selected.from] = [this.selected.from, this.selected.to];
        }

        this.selection = this.getDatesFromRange(this.selected.from, this.selected.to);
        this.dispatchEvent();
        this.updateInput();
        this.collapseDatePicker();
        this.updateCalendars();
      }
    }

  };

  onDocumentClick = event => {
    const isOpen = this.element.classList.contains(this.openedRangePickerClass);
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.collapseDatePicker();
    }
  };

  constructor({ from, to } = {}) {
    this.selected = { from, to };
    this.selection = this.getDatesFromRange(from, to);

    this.firstMonthDay = new Date(this.selected.from.getFullYear(), this.selected.from.getMonth(), 1);

    this.isOpened = false;
    this.hasSelectionByUser = false;

    this.render();
  }

  expandDatePicker() {
    this.element.classList.add(this.openedRangePickerClass);
    this.isOpened = !this.isOpened;
  }

  collapseDatePicker() {
    this.element.classList.remove(this.openedRangePickerClass);
    this.isOpened = !this.isOpened;
  }

  getDatesFromRange(startDate, endDate) {
    const dates = [];
    const theDate = new Date(startDate.toDateString());

    while (theDate <= endDate) {
      dates.push(new Date(theDate));
      theDate.setDate(theDate.getDate() + 1);
    }

    return dates;
  }

  getMonthLocaleString(date, locale) {
    return date.toLocaleString(locale, { month: 'long' });
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  get selectorTemplate() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendarTemplate(this.firstMonthDay)}
      ${this.getCalendarTemplate(new Date(this.firstMonthDay.getFullYear(), this.firstMonthDay.getMonth() + 1, 1))}
    `;
  }

  get template() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">${this.inputTemplate}</div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  getDateGridTemplate(date) {
    const month = this.getDatesFromRange(new Date(date.getFullYear(), date.getMonth(), 1, 12), new Date(date.getFullYear(), date.getMonth() + 1, 0));

    const firstSelectionDayStamp = this.selected.from ? this.selected.from.setHours(0, 0, 0, 0) : null;
    const lastSelectionDayStamp = this.selected.to ? this.selected.to.setHours(0, 0, 0, 0) : null;

    return month.map(day => {
      const timestamp = day.valueOf();
      const date = day.getDate();

      let extraClass = '';
      let extraStyle = '';

      if (date === 1) {
        extraStyle = `style="--start-from: ${day.getDay()}"`;
      }

      if (timestamp === firstSelectionDayStamp) {
        extraClass = ` ${this.rangePickerFromCellClass}`;
      }

      if (lastSelectionDayStamp && timestamp === lastSelectionDayStamp) {
        extraClass += ' rangepicker__selected-to';
      }

      if (day > this.selected.from && day < this.selected.to) {
        extraClass = ' rangepicker__selected-between';
      }

      const dataValue = day.toISOString();

      return `<button type="button" data-value="${dataValue}" class="${this.rangePickerCellClass}${extraClass}" ${extraStyle}>${date}</button>`;
    }).join('');
  }

  get inputTemplate() {
    return `
      <span data-element="from">${this.selected.from.toLocaleDateString('ru')}</span> -
      <span data-element="to">${this.selected.to.toLocaleDateString('ru')}</span>
    `;
  }

  getCalendarTemplate(date) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthLocaleString(date, 'default')}">${this.getMonthLocaleString(date, 'ru')}</time>
        </div>
        <div class="rangepicker__day-of-week">${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `<div>${day}</div>`).join('')}</div>
        <div class="rangepicker__date-grid">${this.getDateGridTemplate(date)}</div>
      </div>
    `;
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  render() {
    this.element = this.getElementFromTemplate(this.template);
    this.subElements = this.getSubElements();

    document.body.append(this.element);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements['input'].addEventListener('click', this.onInputClick);
    this.subElements['selector'].addEventListener('click', this.onSelectorClick);

    document.addEventListener('click', this.onDocumentClick, true);
  }

  // have to use remove + append of calendars instead of simple replacement of innerHTML due to unit tests (links to selector-controls elements (left|right) become extinct)
  // initial solution was this.subElements['selector'].innerHTML = this.selectorTemplate;
  updateCalendars() {
    const selector = this.subElements['selector'];
    selector.querySelectorAll('.rangepicker__calendar').forEach(cal => cal.remove());

    selector.append(
      this.getElementFromTemplate(this.getCalendarTemplate(this.firstMonthDay))
    );
    selector.append(
      this.getElementFromTemplate(this.getCalendarTemplate(new Date(this.firstMonthDay.getFullYear(), this.firstMonthDay.getMonth() + 1, 1)))
    );
  }

  updateInput() {
    this.subElements['input'].innerHTML = this.inputTemplate;
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', { bubbles: true, detail: this.selected }));
  }

  remove() {
    this.element.remove();

    document.removeEventListener('click', this.onDocumentClick, true);
  }

  destroy() {
    this.remove();

    this.element = null;
    this.subElements = {};

    this.selected = {};
    this.selection = [];
  }
}
