export default class DoubleSlider {

    element;
    subElements = {};
  
    constructor({min = 100, max = 200, formatValue = value => '$' + value,  selected = {from: min, to: max}} = {}) {
      this.min = min;
      this.max = max;
      this.formatValue = formatValue;
      this.selected = selected;
  
      this.switchElem = '';
      this.sliderWidth = 0;
      this.sliderLeftPos = 0;
           
      this.render();
    }  
  
    render() {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getHTML();
      this.element = wrapper.firstElementChild;
  
      this.subElements = this.getSubElements();
      this.subElements.inner.addEventListener('pointerdown', this.onPointerDown);
    }
  
    getHTML() { 
      
      const leftPos = (this.selected.from - this.min) / (this.max - this.min) * 100;
      const rightPos = (this.selected.to - this.min) / (this.max - this.min) * 100;
        
      return `      
      <div class="range-slider" data-element="rangeSlider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
          <div data-element="inner" class="range-slider__inner">
            <span data-element="progress" class="range-slider__progress" style="left: ${leftPos}%; right: ${100 - rightPos}%"></span>
            <span data-element="left-thumb" class="range-slider__thumb-left" style="left: ${leftPos}%"></span>
            <span data-element="right-thumb" class="range-slider__thumb-right" style="right: ${100 - rightPos}%"></span>
          </div>
          <span data-element="to">${this.formatValue(this.selected.to)}</span>
        </div>`;
  
    }
  
    getSubElements() {
      const result = {};
      const elements = this.element.querySelectorAll("[data-element]");
  
      for (const subElement of elements) {
        const name = subElement.dataset.element;
        result[name] = subElement;
      }
  
      return result;
    }
    
    onPointerMove = (event) => {
  
      let leftMarginProcent = 0;
      if (event.clientX > this.sliderLeftPos + this.sliderWidth) {
        leftMarginProcent = 100;
      } else if  (event.clientX > this.sliderLeftPos) {
        leftMarginProcent = Math.floor((event.clientX - this.sliderLeftPos) / this.sliderWidth * 100);
      }   
       
      const sideValues = {'left-thumb': {'side' : 'left', 'elemName': 'from', 'progressPositionValue' : leftMarginProcent + '%'},
                        'right-thumb': {'side' : 'right', 'elemName': 'to', 'progressPositionValue' : (100 - leftMarginProcent) + '%'}};
      const currentElem = sideValues[this.switchElem];
  
      this.subElements[this.switchElem].style.left = `${leftMarginProcent}%`;    
      this.subElements.progress.style[currentElem.side] = `${currentElem.progressPositionValue}`; 
      this.selected[currentElem.elemName] = this.min + ((this.max - this.min) * leftMarginProcent / 100);
      this.subElements[currentElem.elemName].textContent = this.formatValue(this.selected[currentElem.elemName]);
          
    }
  
    onPointerUp = () => {
  
      document.removeEventListener('pointerup', this.onPointerUp);
      document.removeEventListener('pointermove', this.onPointerMove);
  
      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail: {from: this.selected.from, to: this.selected.to},
        bubbles: true
      }));
  
    }
  
    onPointerDown = (event) => {
      
      this.switchElem = event.target.dataset.element;
      this.sliderWidth = this.subElements.inner.getBoundingClientRect().width - this.subElements.inner.clientLeft;
      this.sliderLeftPos = this.subElements.inner.getBoundingClientRect().left;
  
      document.addEventListener('pointermove', this.onPointerMove);
      document.addEventListener('pointerup', this.onPointerUp);
    }
  
    remove() {
      if (this.element) {
        this.element.remove();
      }
    }
    
    destroy() {
      this.element.removeEventListener('pointerdown', this.onPointerDown);
      this.remove();
    }
  
  }