export default class RangePicker {
  element;
  subElements = {};
  selectedButtonCalendarGrid = null;

  static getNameMonth(numberMonth) {
    const months = new Array(12).fill(0).map((item, index) =>
      new Date(new Date().setMonth(index)).toLocaleString('ru', {
        month: 'long'
      })
    );

    return months[numberMonth];
  }

  constructor({ from = new Date(), to = new Date(from.getDate() + 7) } = {}) {
    this.range = {
      from: new Date(
        from.toLocaleString('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
      ),
      to: new Date(to.toLocaleString('en', { year: 'numeric', month: '2-digit', day: '2-digit' }))
    };
    this.currentDateShow = new Date(from);
    this.render();
  }

  getDaysOfWeek() {
    const tempDate = new Date();
    tempDate.setDate(tempDate.getDate() - tempDate.getDay() + 1);

    const daysOfWeek = new Array(7).fill(0).map((item, index) => {
      tempDate.setDate(tempDate.getDate() + index);
      const weekday = tempDate.toLocaleString('ru', {
        weekday: 'short'
      });
      return weekday[0].toUpperCase() + weekday.slice(1);
    });

    return daysOfWeek.map(item => `<div>${item}</div>`).join('');
  }

  getDateGridRangepicker(date) {
    const { fullYear, month } = {
      fullYear: date.getFullYear(),
      month: date.getMonth()
    };
    const daysInMonth = new Date(fullYear, month + 1, 0).getDate();
    const startFrom = new Date(fullYear, month, 1).getDay();

    return new Array(daysInMonth)
      .fill(0)
      .map((item, index) => {
        const dataValue = new Date(fullYear, month, index + 1).toISOString();

        return `<button
            type="button"
            class="rangepicker__cell"
            data-value="${dataValue}"
            style="--start-from: ${startFrom ? startFrom : 7}"
          >${index + 1}</button>`;
      })
      .join('');
  }

  getTemplateSelectorCalendar(date) {
    const nameCurrentMonth = RangePicker.getNameMonth(date.getMonth());

    return `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime="${nameCurrentMonth}">${nameCurrentMonth}</time>
      </div>
      <div class="rangepicker__day-of-week">
        ${this.getDaysOfWeek()}
      </div>
      <div class="rangepicker__date-grid">
        ${this.getDateGridRangepicker(date)}
      </div>
    </div>`;
  }

  get templateSelector() {
    const dateSecond = new Date(this.currentDateShow);
    dateSecond.setMonth(dateSecond.getMonth() + 1);

    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getTemplateSelectorCalendar(this.currentDateShow)}
      ${this.getTemplateSelectorCalendar(dateSecond)}`;
  }

  get templateHTML() {
    return `<div class="rangepicker" data-element="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from"></span> -
        <span data-element="to"></span>
      </div>
      <div class="rangepicker__selector" data-element="selector">
        ${this.templateSelector}
      </div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.templateHTML;
    this.element = wrapper.firstElementChild;

    this.getSubElements();
    this.setInputRangepicker();
    this.selectRange();

    this.initEventListners();
  }

  setInputRangepicker() {
    const { from, to } = this.subElements;

    from.innerHTML = this.range.from.toLocaleDateString('ru');
    to.innerHTML = this.range.to.toLocaleDateString('ru');
  }

  selectRange() {
    const { selector } = this.subElements;
    const calendars = selector.querySelectorAll('.rangepicker__calendar');

    for (const calendar of calendars) {
      this.clearCalendarGrid(calendar);
      this.renderCalendarGrid(calendar);
    }
  }

  clearCalendarGrid(calendar) {
    const calendarButtons = calendar.querySelectorAll('[data-value]');

    for (const button of calendarButtons) {
      button.classList.remove('rangepicker__selected-from');
      button.classList.remove('rangepicker__selected-between');
      button.classList.remove('rangepicker__selected-to');
    }
  }

  renderCalendarGrid(calendar) {
    if (!this.selectedButtonCalendarGrid) {
      const selectedDate = new Date(this.range.from);

      while (selectedDate <= this.range.to) {
        const selectedCell = calendar.querySelector(`[data-value="${selectedDate.toISOString()}"]`);

        if (selectedDate.toISOString() === this.range.from.toISOString()) {
          selectedCell?.classList.add('rangepicker__selected-from');
        }

        if (selectedDate > this.range.from && selectedDate < this.range.to) {
          selectedCell?.classList.add('rangepicker__selected-between');
        }

        if (selectedDate.toISOString() === this.range.to.toISOString()) {
          selectedCell?.classList.add('rangepicker__selected-to');
        }

        selectedDate.setDate(selectedDate.getDate() + 1);
      }
    }
  }

  initEventListners() {
    document.body.addEventListener('pointerdown', this.onDocumentPointerdownHandler);
    this.subElements.input.addEventListener('click', this.onInputPointerdownHandler);
    this.subElements.selector.addEventListener('click', this.onSelectorPointerdownHandler);
  }

  onDocumentPointerdownHandler = event => {
    if (!event.target.closest("[data-element='rangepicker']")) {
      this.element.classList.remove('rangepicker_open');
    }
  };

  onInputPointerdownHandler = event => {
    this.element.classList.toggle('rangepicker_open');
  };

  onSelectorPointerdownHandler = event => {
    const { selector } = this.subElements;
    const leftArrowControl = selector.querySelector('.rangepicker__selector-control-left');
    const rightArrowControl = selector.querySelector('.rangepicker__selector-control-right');
    const calendars = selector.querySelectorAll('.rangepicker__calendar');
    const dateGrids = selector.querySelectorAll('.rangepicker__date-grid');

    if (leftArrowControl.contains(event.target)) {
      this.changeCalendars('left', calendars);
    }
    if (rightArrowControl.contains(event.target)) {
      this.changeCalendars('right', calendars);
    }
    for (const elementDateGrid of dateGrids) {
      if (elementDateGrid.contains(event.target)) {
        this.setRange(event, calendars);
      }
    }
  };

  changeCalendars(currentDirection, calendars) {
    const directions = {
      left: -1,
      right: 1
    };

    this.currentDateShow.setMonth(this.currentDateShow.getMonth() + directions[currentDirection]);

    if (currentDirection === 'left') {
      calendars[1].innerHTML = calendars[0].innerHTML;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTemplateSelectorCalendar(this.currentDateShow);
      calendars[0].innerHTML = wrapper.firstElementChild.innerHTML;

      this.renderCalendarGrid(calendars[0]);
    }

    if (currentDirection === 'right') {
      calendars[0].innerHTML = calendars[1].innerHTML;

      const fixedDate = new Date(this.currentDateShow);
      fixedDate.setMonth(fixedDate.getMonth() + 1);

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTemplateSelectorCalendar(fixedDate);
      calendars[1].innerHTML = wrapper.firstElementChild.innerHTML;

      this.renderCalendarGrid(calendars[1]);
    }
  }

  setRange(event, calendars) {
    const buttonCalendarGrid = event.target.closest('[data-value]');

    if (!buttonCalendarGrid) return;

    if (!this.selectedButtonCalendarGrid) {
      for (const calendar of calendars) {
        this.clearCalendarGrid(calendar);
      }

      this.selectedButtonCalendarGrid = buttonCalendarGrid;
    } else {
      const dateFrom = new Date(this.selectedButtonCalendarGrid.dataset.value);
      const dateTo = new Date(buttonCalendarGrid.dataset.value);

      if (dateTo < dateFrom) {
        this.range.from = new Date(buttonCalendarGrid.dataset.value);
        this.range.to = new Date(this.selectedButtonCalendarGrid.dataset.value);
      } else {
        this.range.from = new Date(this.selectedButtonCalendarGrid.dataset.value);
        this.range.to = new Date(buttonCalendarGrid.dataset.value);
      }

      this.selectedButtonCalendarGrid = null;

      this.setInputRangepicker();
      this.selectRange();

      this.element.classList.remove('rangepicker_open');

      this.element.dispatchEvent(
        new CustomEvent('date-select', {
          bubbles: true,
          detail: this.range
        })
      );
    }
  }

  getSubElements() {
    const elementsDOM = this.element.querySelectorAll('[data-element]');

    for (const subElement of elementsDOM) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    document.body.removeEventListener('pointerdown', this.onDocumentPointerdownHandler);

    this.remove();
    this.element = null;
    this.subElements = {};
    this.range = {};
    this.selectedButtonCalendarGrid = null;
  }
}
