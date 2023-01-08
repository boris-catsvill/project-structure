import { getSubElements } from '../../utils/helpers';

export default class RangePicker {
  element = null;
  subElements = {};
  dateRange = {
    from: new Date(),
    to: new Date()
  };
  firstClick = true;
  startDate = null

  constructor({from = new Date(), to = new Date()} = {}) {
    this.dateRange = {from, to};
    this.startDate = new Date(from);
    this.render();
  }

  render() {
    const elem = document.createElement('div');
    elem.innerHTML = this.template;
    this.element = elem.firstElementChild;
    this.subElements = getSubElements(this.element)
    this.initEventListeners();
  }

  get template() {
    const from = this.dateRange.from.toLocaleString('ru', {dateStyle: 'short'});
    const to = this.dateRange.to.toLocaleString('ru', {dateStyle: 'short'});

    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${from}</span> -
        <span data-element="to">${to}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  initEventListeners() {
    const {selector, input} = this.subElements;
    document.addEventListener('click', this.closePicker, true);
    input.addEventListener('click', () => this.toggle());
    selector.addEventListener('click', event => this.buttonClick(event));
  }

  closePicker = event => {
    const open = this.element.classList.contains('rangepicker_open');
    const isTarget = this.element.contains(event.target);
    if (open && !isTarget) {
      this.close();
    }
  };

  toggle() {
    this.element.classList.toggle('rangepicker_open');
    this.renderPicker();
  }

  buttonClick({target}) {
    if (target.classList.contains('rangepicker__cell')) {
      let val = target.dataset.value;
      if (val) {
        const date = new Date(val);
        if (this.firstClick) {
          this.dateRange = {
            from: date,
            to: null
          };
          this.firstClick = false;
        } else {
          if (date > this.dateRange.from) {
            this.dateRange.to = date;
          } else {
            this.dateRange.to = this.dateRange.from;
            this.dateRange.from = date;
          }
          this.firstClick = true;
        }
        this.toggleClasses();
        if (this.dateRange.from && this.dateRange.to) {
          this.close();
          this.dispatchEvent();
          this.subElements.from.innerHTML = this.dateRange.from.toLocaleString('ru', {dateStyle: 'short'});
          this.subElements.to.innerHTML = this.dateRange.to.toLocaleString('ru', {dateStyle: 'short'});
        }
      }
    }
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  renderPicker() {
    let leftDate = new Date(this.startDate);
    let rightDate = new Date(this.startDate);
    const { selector } = this.subElements;

    rightDate.setMonth(rightDate.getMonth() + 1);

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(leftDate)}
      ${this.renderCalendar(rightDate)}
    `;

    const leftButton = selector.querySelector('.rangepicker__selector-control-left');
    const rightButton = selector.querySelector('.rangepicker__selector-control-right');

    leftButton.addEventListener('click', () => this.subMonth());
    rightButton.addEventListener('click', () => this.addMonth());

    this.toggleClasses();
  }

  subMonth() {
    this.startDate.setMonth(this.startDate.getMonth() - 1);
    this.renderPicker();
  }

  addMonth() {
    this.startDate.setMonth(this.startDate.getMonth() + 1);
    this.renderPicker();
  }

  toggleClasses() {
    const { from, to } = this.dateRange;
    for (const button of this.element.querySelectorAll('.rangepicker__cell')) {
      const { value } = button.dataset;
      const date = new Date(value);

      button.classList.remove('rangepicker__selected-from', 'rangepicker__selected-to', 'rangepicker__selected-between');

      if (from && value === from.toISOString()) {
        button.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        button.classList.add('rangepicker__selected-to');
      } else if (from && to && date >= from && date <= to) {
        button.classList.add('rangepicker__selected-between');
      }
    }
  }

  renderCalendar(month) {
    const date = new Date(month);
    date.setDate(1);
    const currentMonth = date.toLocaleString('ru', {month: 'long'});

    let calendar = `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime=${currentMonth}>${currentMonth}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
    `;

    calendar += this.getButton(date, true);
    date.setDate(2);
    while (date.getMonth() === month.getMonth()) {
      calendar += this.getButton(date);
      date.setDate(date.getDate() + 1);
    }
    calendar += '</div></div>';
    return calendar;
  }

  getButton(date, style = null) {
    const startFrom = day => day === 0 ? 7 : day;
    return `<button type="button"
              class="rangepicker__cell"
              data-value="${date.toISOString()}"
              ${ style ? `style="--start-from: ${startFrom(date.getDay())}"` : ''}
            >${date.getDate()}</button>`;
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.dateRange,
    }));
  }

  remove() {
    this.element?.remove();
    document.removeEventListener('click', this.closePicker, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.dateRange = {
      from: new Date(),
      to: new Date()
    };
    this.firstClick = true;
  }
}
