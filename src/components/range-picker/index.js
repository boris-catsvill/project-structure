export default class RangePicker {
  subElements = {};
  isOpen = false;
  isFirstSelected = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  onClickInput = () => {
    if (!this.isOpen) {
      this.openRangepicker();
    } else {
      this.closeRangepicker();
    }
  };

  onClickControlLeft = () => {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
    this.renderCalendars();
  };

  onClickControlRight = () => {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
    this.renderCalendars();
  };

  onClickCell = event => {
    const { value } = event.target.dataset;

    if (!value) {
      return;
    }

    const dateValue = new Date(value);

    if (this.isFirstSelected) {
      this.selected.from = dateValue;
      this.selected.to = null;

      this.isFirstSelected = false;
      this.renderHighlight();
    } else {
      if (dateValue > this.selected.from) {
        this.selected.to = dateValue;
      } else {
        this.selected.to = this.selected.from;
        this.selected.from = dateValue;
      }

      this.isFirstSelected = true;
      this.renderHighlight();
    }

    if (this.selected.from && this.selected.to) {
      const toLocaleOptions = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      };

      this.subElements.from.innerHTML = new Date(this.selected.from).toLocaleDateString('ru', toLocaleOptions);
      this.subElements.to.innerHTML = new Date(this.selected.to).toLocaleDateString('ru', toLocaleOptions);

      this.dispatchEvent();
      this.closeRangepicker();
    }
  };

  onClickDocument = event => {
    const isRangepicker = this.element.contains(event.target);

    if (this.isOpen && !isRangepicker) {
      this.closeRangepicker();
    }
  };

  constructor({
                from = new Date(),
                to = new Date()
              } = {}) {
    this.selected = { from, to };
    this.showDateFrom = new Date(from);

    this.render();
  }

  addEventListeners() {
    const { input } = this.subElements;

    input.addEventListener('click', this.onClickInput);
    document.addEventListener('click', this.onClickDocument, true);
  }

  dispatchEvent() {
    const event = new CustomEvent('date-select', { detail: this.selected });

    this.element.dispatchEvent(event);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.addEventListeners();
  }

  renderCalendars() {
    const dateOne = new Date(this.showDateFrom);
    const dateTwo = new Date(this.showDateFrom);

    dateTwo.setMonth(dateTwo.getMonth() + 1);

    const monthOne = dateOne.toLocaleString('ru', { month: 'long' });
    const monthTwo = dateTwo.toLocaleString('ru', { month: 'long' });

    const { selector } = this.subElements;
    selector.innerHTML = this.getTemplateRangepickerSelector();

    const [timeOne, timeTwo] = selector.querySelectorAll('time');
    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');
    const [calendarOne, calendarTwo] = selector.querySelectorAll('.rangepicker__date-grid');

    timeOne.innerHTML = monthOne;
    timeOne.dateTime = monthOne;
    timeTwo.innerHTML = monthTwo;
    timeTwo.dateTime = monthTwo;

    calendarOne.innerHTML = this.getTemplateRangepickerDateGrid(dateOne);
    calendarTwo.innerHTML = this.getTemplateRangepickerDateGrid(dateTwo);

    controlLeft.addEventListener('click', this.onClickControlLeft);
    controlRight.addEventListener('click', this.onClickControlRight);
    calendarOne.addEventListener('click', this.onClickCell);
    calendarTwo.addEventListener('click', this.onClickCell);

    this.renderHighlight();
  }

  renderHighlight() {
    const { from, to } = this.selected;
    const cells = this.element.querySelectorAll('.rangepicker__cell');

    for (const cell of cells) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }
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

  getTemplate() {
    const { from, to } = this.selected;
    const toLocaleOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    };
    const dateFrom = new Date(from).toLocaleDateString('ru', toLocaleOptions);
    const dateTo = new Date(to).toLocaleDateString('ru', toLocaleOptions);

    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${dateFrom}</span>
          <span>-</span>
          <span data-element="to">${dateTo}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  getTemplateRangepickerSelector() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="November">November</time>
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
        <div class="rangepicker__date-grid"></div>
      </div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="November">November</time>
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
        <div class="rangepicker__date-grid"></div>
      </div>
    `;
  }

  getTemplateRangepickerDateGrid(showDate) {
    const iterationDate = new Date(showDate);
    let template = '';

    iterationDate.setDate(1);

    template += this.getTemplateRangepickerCell(iterationDate, iterationDate.getDay());

    iterationDate.setDate(2);

    while (iterationDate.getMonth() === showDate.getMonth()) {
      template += this.getTemplateRangepickerCell(iterationDate);

      iterationDate.setDate(iterationDate.getDate() + 1);
    }

    return template;
  }

  getTemplateRangepickerCell(date, startFrom) {
    const styleStartFrom = startFrom ? `--start-from: ${startFrom}` : '';

    return `<button
      type="button"
      class="rangepicker__cell"
      style="${styleStartFrom}"
      data-value="${date.toISOString()}">${date.getDate()}</button>`;
  }

  openRangepicker() {
    this.renderCalendars();
    this.isOpen = true;
    this.element.classList.add('rangepicker_open');
  }

  closeRangepicker() {
    this.isOpen = false;
    this.element.classList.remove('rangepicker_open');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this.isOpen = false;
    this.isFirstSelected = true;
    this.remove();
    this.selected = {
      from: new Date(),
      to: new Date()
    };
  }
}
