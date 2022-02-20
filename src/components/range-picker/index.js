export default class RangePicker {

  isFromSelected = false

  onSelectorClick = (event) => {

    const leftArrow = event.target.closest('.rangepicker__selector-control-left');
    const rightArrow = event.target.closest('.rangepicker__selector-control-right');
    const calendarDay = event.target.closest('.rangepicker__cell');

    if (leftArrow || rightArrow) {
      if (leftArrow) {

        this.date1 = new Date(this.date1.getFullYear(), this.date1.getMonth() - 1, 1)
        this.date2 = new Date(this.date2.getFullYear(), this.date2.getMonth() - 1, 1)

      }
      if (rightArrow) {

        this.date1 = new Date(this.date1.getFullYear(), this.date1.getMonth() + 1, 1)
        this.date2 = new Date(this.date2.getFullYear(), this.date2.getMonth() + 1, 1)
      }

      this.subElements.calendar1.innerHTML = this.creatCalendar(this.date1);

      this.subElements.calendar2.innerHTML = this.creatCalendar(this.date2)

      this.subElements.month1.innerHTML = this.getMonth(this.date1)
      this.subElements.month2.innerHTML = this.getMonth(this.date2)

      this.subElements.month1.setAttribute('datetime', this.getMonth(this.date1, 'eng'))
      this.subElements.month2.setAttribute('datetime', this.getMonth(this.date2, 'eng'))
    }

    if (calendarDay) {

      if (this.isFromSelected) {

        if (Number(calendarDay.dataset.value) < Number(this.from)) {

          this.to = this.from
          this.from = new Date(Number(calendarDay.dataset.value))

        } else {

          this.to = new Date(Number(calendarDay.dataset.value))
        }

        const calendars = this.element.querySelectorAll('.rangepicker__cell');

        for (const day of calendars) {

          day.classList.remove('rangepicker__selected-to')
        }

        this.subElements.from.innerHTML = this.getFormatedDate(this.from)

        this.subElements.to.innerHTML = this.getFormatedDate(this.to)

        this.element.classList.remove('rangepicker_open')

        this.dispatchEvent()

        this.isFromSelected = false;

      } else {

        const calendars = this.element.querySelectorAll('.rangepicker__cell');

        for (const day of calendars) {
          day.classList.remove('rangepicker__selected-from')
          day.classList.remove('rangepicker__selected-to')
          day.classList.remove('rangepicker__selected-between')
        }

        this.from = new Date(Number(calendarDay.dataset.value))
        this.to = new Date(Number(calendarDay.dataset.value))

        this.isFromSelected = true;
      }
    }
    this.addRangeDays()
  }

  onOpenCalendarByClick = (event) => {

    const target = event.target.closest('.rangepicker');

    this.renderCalendarView()
    this.addRangeDays();

    target.classList.toggle('rangepicker_open')
  }

  onWindowClick = (event) => {

    const target = event.target.closest('.rangepicker');

    if (!target) {

      if (this.element.classList.contains('rangepicker_open')) {
        this.element.classList.remove('rangepicker_open')
      }
    }
  }

  constructor({ from, to } = {}) {

    this.from = from;
    this.to = to;

    this.date1 = from ? from : new Date();
    this.date2 = new Date(this.date1.getFullYear(), this.date1.getMonth() + 1, 1);

    this.render()
    this.initEventListeners()
  }

  getFormatedDate(date) {
    if (!date)
      return 'дд-мм-гггг'
    return date.toLocaleString('ru', { dateStyle: 'short' });
  }

  getMonth(date) {

    return date.toLocaleString('ru', { month: 'long' });
  }

  getDayOfWeek(date) {

    const dayOfWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    return dayOfWeek === 0 ? 7 : dayOfWeek;
  }

  getCalendar(date) {

    const firstDay = 1;
    const lastDay = this.getLastDayOfMonth(date.getFullYear(), date.getMonth())

    let result = [];

    for (let i = firstDay; i < lastDay + 1; i++) {
      result.push({
        day: i,
        value: Number(new Date(date.getFullYear(), date.getMonth(), i, 12)),
      })
    }
    return result;
  }

  creatCalendar(date) {

    const calendar = this.getCalendar(date);

    return calendar.map(({ day, value }) => `
         <button type="button" 
           class="rangepicker__cell"
           data-value="${value}"
           ${day === 1 ? `style="--start-from: ${this.getDayOfWeek(date)}"` : ''}>${day}</button>
      `
    ).join('')
  }

  getLastDayOfMonth(year, month) {
    const date = new Date(year, month + 1, 0);
    return date.getDate();
  }

  getMonth(date, lang = 'ru') {
    return date.toLocaleString(lang, {
      month: 'long',
    });
  }

  template() {

    return `
      <div class="rangepicker">
         <div class="rangepicker__input" data-element="input">
            <span data-element="from">${this.getFormatedDate(this.from)}</span> -
            <span data-element="to">${this.getFormatedDate(this.to)}</span>
         </div>
         <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild

    this.subElements = this.getSubElements(element);
  }

  getWeekDays() {

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return weekDays.map((day) =>
      `<div>${day}</div>`
    ).join('')
  }

  getCalendarPages(dates) {

    return dates.map((date, index) =>
      `
        <div class="rangepicker__calendar">
           <div class="rangepicker__month-indicator">
              <time datetime="${this.getMonth(date, 'eng')}" data-element="month${index + 1}">${this.getMonth(date)}</time>
           </div>
           <div class="rangepicker__day-of-week">
              ${this.getWeekDays()}
           </div>
           <div class="rangepicker__date-grid" data-element="calendar${index + 1}">
              ${this.creatCalendar(date)}
           </div>
        </div>`
    ).join('')
  }

  templateCalendarView() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendarPages([this.date1, this.date2])}
      `
  }

  addRangeDays() {

    if (!this.from && !this.to) return

    const calendars = this.element.querySelectorAll('.rangepicker__cell');

    for (const day of calendars) {

      if (Number(this.from) < Number(day.dataset.value) &&
        Number(day.dataset.value) < Number(this.to)) {

        day.classList.add('rangepicker__selected-between')
      }

      if (Number(day.dataset.value) === Number(this.from)) {
        day.classList.add('rangepicker__selected-from')
      }

      if (Number(day.dataset.value) === Number(this.to)) {
        day.classList.add('rangepicker__selected-to')
      }
    }
  }

  renderCalendarView() {

    this.subElements.selector.innerHTML = this.templateCalendarView();

    this.subElements = {
      ...this.subElements,
      ...this.getSubElements(this.subElements.selector)
    }
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  initEventListeners() {

    this.subElements.selector.addEventListener('click', this.onSelectorClick)
    this.subElements.input.addEventListener('click', this.onOpenCalendarByClick)
    document.addEventListener('click', this.onWindowClick, true)
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: {
        from: this.from,
        to: this.to
      },
    }));
  }

  remove() {
    this.element.remove();
    document.removeEventListener('click', this.onWindowClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
