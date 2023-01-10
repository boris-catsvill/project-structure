export default class RangePicker {

  selected; // {from : new Date(), to : new Date()}
  isSelectorOpen = false;

  //rendering
  subElements = {};

  // events
  evntSignal; //AbortController.signal
  
  onInputClick = (event) => {
    if (!this.isSelectorOpen) {
      this.selected = this.range;   
      this.renderSelector(); 
      this.open();
      //event.wasProcessed = true;
    } else {
      this.close();
    }
  }

  onSelectorClick = (event) => {
    //if (!event.wasProcessed) {
    // eslint-disable-next-line no-unused-expressions
    event.target.classList.contains("rangepicker__cell") && 
      this.onRangePickerCellClick(event);
    //event.wasProcessed = true;
    //}
  }

  onDocumentClick = (event) => {
    if (this.isSelectorOpen && 
        !this.isTargetInput(event) &&
        !this.isTargetCell(event)) { //!event.wasProcessed) {
      this.close();
      //event.wasProcessed = true;
    }
  }

  onRangePickerCellClick(event) {
    let picked = event.target.dataset.value;
    let pickedDate = new Date(picked);
    if (!pickedDate) {
      return;
    }
    if (!!this.selected.from && !!this.selected.to) {
      // select first boundary
      this.selected = {};
      this.selected.from = pickedDate;
      this.renderSelection();  
    } else {
      // select second boundary
      if (+this.selected.from > +pickedDate) {
        this.selected.to = this.selected.from;
        this.selected.from = pickedDate;
      } else {
        this.selected.to = pickedDate;
      }
      this.renderSelection();  
      this.element.dispatchEvent(new CustomEvent("date-select", {
        bubbles: true,
        detail: this.selected
      }));
      this.setRange(this.selected);
      this.close();
    }
    //event.wasProcessed = true;
  }

  constructor({
    from = new Date(),
    to = new Date()} = {}) {
    this.range = { from, to };
    this.baseDate = from;

    this.render();
    this.initEventListeners();
  }

  onPrev(event) {
    // eslint-disable-next-line no-unused-expressions
    this.baseDate.setMonth(this.baseDate.getMonth() - 1),
    this.renderSelector();
    //event.wasProcessed = true;
  }

  onNext(event) {
    // eslint-disable-next-line no-unused-expressions
    this.baseDate.setMonth(this.baseDate.getMonth() + 1),
    this.renderSelector();
    //event.wasProcessed = true;
  }

  open() {
    this.element.classList.add("rangepicker_open");
    this.isSelectorOpen = true;
  }

  close() {
    if (this.element) {
      this.element.classList.remove("rangepicker_open");
    }
    this.isSelectorOpen = false;
  }

  isTargetCell(event) {
    const cell = event.target.closest('.rangepicker__selector');
    return !!cell;
  }

  isTargetInput(event) {
    const input = event.target.closest('.rangepicker__input');
    return !!input;
  }


  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();
  
    this.element = element.firstElementChild;
    this.subElements = this.getSubelements();
  }

  renderSelector() {
    this.subElements.selector.innerHTML = this.getTemplateSelector();
    // eslint-disable-next-line no-unused-expressions
    this.subElements.selector.querySelector(".rangepicker__selector-control-left").onclick = (event)=>this.onPrev(),
    this.subElements.selector.querySelector(".rangepicker__selector-control-right").onclick = (event)=>this.onNext();
    this.renderSelection();
  }

  renderSelection() {
    for (let calDate of this.subElements.selector.querySelectorAll(".rangepicker__cell")) {
      calDate.classList.remove("rangepicker__selected-from");
      calDate.classList.remove("rangepicker__selected-between");
      calDate.classList.remove("rangepicker__selected-to");
    
      let iterDate = new Date(calDate.dataset.value);

      if (this.selected.from && calDate.dataset.value === this.selected.from.toISOString()) {
        calDate.classList.add("rangepicker__selected-from");
      } else if (this.selected.to && calDate.dataset.value === this.selected.to.toISOString()) {
        calDate.classList.add("rangepicker__selected-to");
      } else if (this.selected.from && this.selected.to && iterDate
          >= this.selected.from && iterDate <= this.selected.to) {
        calDate.classList.add("rangepicker__selected-between");
      } 

      if (this.selected.from) {
        let elem = this.element.querySelector(`[data-value="${this.selected.from.toISOString()}"]`);
        // eslint-disable-next-line no-unused-expressions
        elem && elem.closest(".rangepicker__cell").classList.add("rangepicker__selected-from");
      }
      if (this.selected.to) {
        let elem = this.element.querySelector(`[data-value="${this.selected.to.toISOString()}"]`);
        // eslint-disable-next-line no-unused-expressions
        elem && elem.closest(".rangepicker__cell").classList.add("rangepicker__selected-to");
      }
    }
  }

  weekDayNames(locale) {
    var baseDate = new Date(Date.UTC(2023, 0, 2)); // any Monday
    var weekDays = [];
    for(i = 0; i < 7; i++)
    {       
        weekDays.push(baseDate.toLocaleDateString(locale, { weekday: 'short' }));
        baseDate.setDate(baseDate.getDate() + 1);       
    }
    return weekDays;
  }

  renderCalendar(calDate = new Date()) {
    let date = new Date(calDate);
    date.setDate(1);
    const monthName = date.toLocaleString("ru", { month: "long" });
    const firstDay = (date.getDay() === 0) ? 7 : date.getDay();
    const firstDate = date.toISOString();

    const daysArray = [];
    date.setDate(date.getDate() + 1);
    for (let i = 2; date.getMonth() === calDate.getMonth(); i++) {
        
      daysArray.push(`<button type="button" class="rangepicker__cell" 
            data-value="${date.toISOString()}">${date.getDate()}</button>`);
      date.setDate(date.getDate() + 1);
    }

    return `
    <div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime="${monthName}">${monthName}</time>
      </div>
      <div class="rangepicker__day-of-week">
      ${ this.weekDayNames("ru").map(
          (dayName)=>'<div>'+dayName+'</div>').join('')
      }
      </div>
      <div class="rangepicker__date-grid">
        <button type="button" class="rangepicker__cell" 
        data-value="${firstDate}" style="--start-from: ${firstDay}">1</button>
        ${daysArray.join('')}
      </div>
    </div>`;
  }

  getSubelements() {
    const result = {};
    const elems = this.element.querySelectorAll("[data-element]");

    for (const simpleElem of elems) {
      const name = simpleElem.dataset.element;

      result[name] = simpleElem;
    }

    return result;
  }

  getTemplate() {
    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${this.range.from.toLocaleString("ru", { dateStyle: "short" })}</span> -
        <span data-element="to">${this.range.to.toLocaleString("ru", { dateStyle: "short" })}</span>
      </div>
    <div class="rangepicker__selector" data-element="selector"></div>`;
  }

  getTemplateSelector() {
    const startDt = new Date(this.baseDate);
    const endDt = new Date(this.baseDate);
    endDt.setMonth(endDt.getMonth() + 1);

    return `<div class="rangepicker__selector-arrow"></div>
    <div class="rangepicker__selector-control-left"></div>
    <div class="rangepicker__selector-control-right"></div>
    ${this.renderCalendar(startDt)}
    ${this.renderCalendar(endDt)}
    </div>`;
  }
    
  setRange(dateRange = { from: new Date(), to: new Date() }) {
    this.range = dateRange;
    this.baseDate = dateRange.from;


    this.subElements.from.innerHTML = this.range.from.toLocaleString("ru", {
      dateStyle: "short"
    });
    this.subElements.to.innerHTML = this.range.to.toLocaleString("ru", {
      dateStyle: "short"
    });
  }

  initEventListeners() {
    this.evntSignal = new AbortController();
    const { signal } = this.evntSignal;

    // eslint-disable-next-line no-unused-expressions
    this.subElements.input.addEventListener("click", this.onInputClick, { signal }),
    this.subElements.selector.addEventListener("click", this.onSelectorClick, { signal }),
    document.addEventListener("click", this.onDocumentClick, { signal }); // , capture: true
  }
    
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
    
  destroy() {
    if (this.evntSignal) {
      this.evntSignal.abort();
    }        
    this.remove();
    this.element = null;
  }    
}
