import Component from "../../utils/component";

export default class RangePicker extends Component {
  constructor({ 
    from = new Date(), 
    to = new Date() 
  } = {}) {
    super();

    this.dateFrom = new Date(from);
    this.selectedCell = true;

    this.selected = { from, to };
  }

  handleSelectorClick = ({target}) => {
    if (target.classList.contains('rangepicker__cell')) {
      this.handleSelectRange(target);
    }
  }

  handleClickDocument = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.close();
    }
  }

  toggleVisibleState = () => {
    this.element.classList.toggle('rangepicker_open');
    this.renderDatePicker();
  }

  initEventListeners() {
    const input = this.getChildElementByName('input');
    const selector = this.getChildElementByName('selector');

    input.addEventListener('click', this.toggleVisibleState);
    selector.addEventListener('click', this.handleSelectorClick);
    document.addEventListener('click', this.handleClickDocument, true);
  }

  removeEventListeners() {
    const input = this.getChildElementByName('input');
    const selector = this.getChildElementByName('selector');

    input.removeEventListener('click', this.toggleVisibleState);
    selector.removeEventListener('click', this.handleSelectorClick);
    document.removeEventListener('click', this.handleClickDocument, true);
  }

  formatDate(data) {
    return data.toLocaleString('ru', {dateStyle: 'short'});
  }

  getTemplateDatePicker({showDate, nextDate = new Date()}) {
    return (`
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
        <div style="display: flex">
          ${this.renderCalendar(showDate)}
        </div>
        <div>
          ${this.renderCalendar(nextDate)}
        </div>
    `);
  }

  renderDatePicker() {
    const showDate = new Date(this.dateFrom);
    const nextDate = new Date(this.dateFrom);

    nextDate.setMonth(nextDate.getMonth() + 1);

    const container = this.getChildElementByName('selector');
    container.innerHTML = this.getTemplateDatePicker({ showDate, nextDate });

    this.subscribesOnEventsChangeMounth();
    this.renderHighlight();
  }

  subscribesOnEventsChangeMounth() {
    const selector = this.getChildElementByName('selector');
    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.prev());
    controlRight.addEventListener('click', () => this.next());
  }

  prev() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() - 1);
    this.renderDatePicker();
  }

  next() {
    this.dateFrom.setMonth(this.dateFrom.getMonth() + 1);
    this.renderDatePicker();
  }

  handleSelectRange(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectedCell) {
        this.selected = {
          from: dateValue,
          to: null
        };

        this.selectedCell = false;
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
        } else {
          this.selected.to = this.selected.from;
          this.selected.to = dateValue;
        }

        this.selectedCell = true;
      }
      if (this.selected.from && this.selected.to) {
        this.close();

        this.subElements.from.innerHTML = this.formatDate(this.selected.from);
        this.subElements.to.innerHTML = this.formatDate(this.selected.to);

        this.dispatchEvent();
      }
    }

    this.renderHighlight();
  }

  dispatchEvent() {
    const detail = this.selected;

    const from = new Date(this.selected.from).getDate();
    const to = new Date(this.selected.to).getDate();

    if(from > to) {
      detail.to = detail.from;
    };

    this.emitEvent('date-select', detail, true);
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  renderHighlight() {
    const { from, to } = this.selected;
    const cells = Array.from(this.element.querySelectorAll('.rangepicker__cell'));
  
    cells
      .forEach((cell) => {
        const { dataset: { value }} = cell;
        const date = new Date(value);

        cell.classList.remove('rangepicker__selected-from');
        cell.classList.remove('rangepicker__selected-between');
        cell.classList.remove('rangepicker__selected-to');

        if (from && from === date) {
          cell.classList.add('rangepicker__selected-from');
        } else if (to && to === date) {
          cell.classList.add('rangepicker__selected-from');
        } else if (to && from && date > from && date < to) {
          cell.classList.add('rangepicker__selected-between');
        } else if (to && from && date < from && date > to) {
          cell.classList.add('rangepicker__selected-between');
        }
      });
    
    if (from) {
      const currentFormCell = cells.find(cell => cell.dataset.value === from.toISOString());

      if (currentFormCell) {
        currentFormCell.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const currentToCell = cells.find(cell => cell.dataset.value === to.toISOString());

      if (currentToCell) {
        currentToCell.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  get template() {
    const { to, from } = this.selected;

    return (`
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.formatDate(from)}</span> -
          <span data-element="to">${this.formatDate(to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `);
  }

  renderCalendar(showDate) {
    const date = new Date(showDate);

    const getDaysCount = (month, year) => new Date(year, month, 0).getDate();
    
    const getDays = (year, month) => {
      const qtyDays = getDaysCount(year, month);
    
      return Array(qtyDays)
        .fill(null)
        .map((_, i) => new Date(year, month - 1, i + 1))
        .filter((date) => date.getMonth() === month - 1);
    };
  
    const getGridStartIndex = dayIndex => {
      const index = dayIndex === 0 ? 6 : (dayIndex - 1);
      return index + 1;
    };

    const renderCalendarButton = (date, index) => {
      return index === 0 ?
        `<button type="button"
            class="rangepicker__cell"
            data-value="${date.toISOString()}"
            date-debug="${date.getDate()}"
            style="--start-from: ${getGridStartIndex(date.getDay() + 1)}">
              ${date.getDate()}
          </button>`
        : `<button type="button" class="rangepicker__cell" data-value="${date.toISOString()}">
              ${date.getDate()}
          </button>`;
    };


    const monthStr = date.toLocaleString('ru', {month: 'long'});
    const dateCollection = getDays(date.getFullYear(), date.getMonth() + 1).map(renderCalendarButton).join('');

    return (
      `<div class="rangepicker__calendar">

        <div class="rangepicker__month-indicator">
          <time datetime=${monthStr}>${monthStr}</time>
        </div>

        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>

        <div class="rangepicker__date-grid">
          ${dateCollection}
        </dvi>
      </div>
    `);
  }
}

