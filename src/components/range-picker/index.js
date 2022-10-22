export default class RangePicker {
  abortController = new AbortController();

  constructor({from = new Date(), to = new Date()}) {
    this.selected = {
      from: new Date(from.getTime()),
      to: new Date(to.getTime())
    };
    this.firstMonth = new Date(this.selected.from.getTime());
    this.monthCnt = 2;
    this.render();
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();
    this.addEventListeners();
    this.updateFromToRange();
  }

  addEventListeners() {
    const {input, selector} = this.subElements;

    document.addEventListener('click',
      this.onDocumentClick,
      true
    );

    input.addEventListener(
      'click',
      this.onRangePickerClick,
      this.abortController.signal
    );

    selector.addEventListener(
      'click',
      this.onDayClick,
      this.abortController.signal
    );

    selector.addEventListener(
      'click',
      this.onCoupleArrowClick,
      this.abortController.signal
    );
  }

  onRangePickerClick = _event => {
    this.onRangePickerClickHandler();
  };

  onDayClick = event => {
    this.onDayClickHandler(event);
  };

  onCoupleArrowClick = event => {
    this.onCoupleArrowClickHandler(event);
  };

  onRangePickerClickHandler() {
    const {selector} = this.subElements;

    if (!selector.querySelector('.rangepicker__calendar')) {
      selector.append(this.getSelectorArrow());
      selector.append(this.getSelectorControl('right'));
      selector.append(this.getSelectorControl('left'));
      this.updateCalendars();
      this.highlightDateRange();
    }

    const rangepickerOpenClass = 'rangepicker_open';
    if (this.element.classList.contains(rangepickerOpenClass)) {
      if (this.selected.from && this.selected.to) {
        this.updateFromToRange();
      }
    } else {
      this.highlightDateRange();
    }
    this.element.classList.toggle(rangepickerOpenClass);
  }

  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.onRangePickerClickHandler();
    }
  };

  updateFromToRange() {
    let {from, to} = this.subElements;
    from.textContent = this.convertDateToString(this.selected.from);
    to.textContent = this.convertDateToString(this.selected.to);
    const event = new CustomEvent("date-select",
      {
        detail: this.selected,
        bubbles: true
      }
    );
    this.element.dispatchEvent(event);
  }

  onCoupleArrowClickHandler(event) {
    let shift;
    if (event.target.closest('.rangepicker__selector-control-right')) {
      shift = 1;
    } else if (event.target.closest('.rangepicker__selector-control-left')) {
      shift = -1;
    } else {
      return;
    }
    this.firstMonth.setMonth(this.firstMonth.getMonth() + shift);
    this.updateCalendars();
    this.highlightDateRange();
  }

  onDayClickHandler(event) {
    const target = event.target.closest('.rangepicker__cell');
    if (!target) {
      return;
    }

    if (this.selected.from && this.selected.to) {
      this.selected.from = new Date(target.dataset.value);
      this.selected.to = null;
    } else {
      this.selected.to = new Date(target.dataset.value);
      if (this.selected.from.getTime() > this.selected.to.getTime()) {
        [this.selected.from, this.selected.to] = [this.selected.to, this.selected.from];
      }
    }
    this.highlightDateRange();
    if (this.selected.from && this.selected.to) {
      this.onRangePickerClickHandler();
    }
  }

  getSelectorArrow() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="rangepicker__selector-arrow"></div>
      `;
    return div.firstElementChild;
  }

  getSelectorControl(side) {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="rangepicker__selector-control-${side}"></div>
      `;
    return div.firstElementChild;
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.convertDateToString(this.selected.from)}</span> -
          <span data-element="to">${this.convertDateToString(this.selected.to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  updateCalendars() {
    const localStartDate = new Date(this.firstMonth.getTime());
    const {selector} = this.subElements;
    selector.querySelectorAll('.rangepicker__calendar').forEach(
      calendar => calendar.remove()
    );
    const calendarCnt = this.monthCnt;
    for (let num = 0; num < calendarCnt; num++) {
      const calendarDate = new Date(localStartDate.setMonth(localStartDate.getMonth() + num));
      const calendarElement = this.makeCalendarElement(calendarDate.getFullYear(), calendarDate.getMonth());
      selector.append(calendarElement);
    }
  }

  highlightDateRange() {
    const {from, to} = this.selected;
    const {selector} = this.subElements;
    const cells = selector.querySelectorAll('.rangepicker__cell');
    for (const cell of cells) {
      cell.className = 'rangepicker__cell';
      const cellDate = new Date(cell.dataset.value);
      if (from && from.getTime() === cellDate.getTime()) {
        cell.classList.add('rangepicker__selected-from');
      }
      if (from && to
        && (cellDate.getTime() > from.getTime())
        && (cellDate.getTime() < to.getTime())
      ) {
        cell.classList.add('rangepicker__selected-between');
      }
      if (to && to.getTime() === cellDate.getTime()) {
        cell.classList.add('rangepicker__selected-to');
      }
    }
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  makeCalendarElement(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthObj = {};
    for (let i = 1; i <= daysInMonth; i++) {
      monthObj[i] = new Date(year, month, i).toLocaleDateString();
    }

    const dateHtml =
      Object.entries(monthObj).map(([text, value]) => `
          <button type="button" class="rangepicker__cell" data-value="${value}">${text}</button>
    `).join(" ");

    const monthStr = new Date(year, month).toLocaleString('ru', {month: 'long'});

    const calendarHtml = `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthStr}">${monthStr}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div> <div>Вт</div> <div>Ср</div> <div>Чт</div> <div>Пт</div> <div>Сб</div> <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${dateHtml}
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = calendarHtml;
    const calendarElement = div.firstElementChild;

    const dayOfWeek = new Date(year, month, 1).getDay();
    const firstDayElement = calendarElement.querySelector('.rangepicker__cell');
    firstDayElement.style = `--start-from: ${dayOfWeek}`;

    return calendarElement;
  }

  convertDateToString(date) {
    return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.abortController.abort();
    document.removeEventListener('click', this.onDocumentClick, true);
  }

}
