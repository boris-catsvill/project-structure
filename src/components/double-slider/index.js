export default class DoubleSlider {

    progressWidth = 0;
    progressLeft = 0;

    constructor({min = 100, max = 200,formatValue = value => value,selected = {}}={}) {

        this.min = min;
        this.max = max;
        this.selected = {...selected};
        this.selected.from = this.selected.min ? this.selected.min : min;
        this.selected.to = this.selected.max ? this.selected.max : max;
        this.formatValue = formatValue;
        this.render();
        this.subElements = this.getSubElements();
        this.element.addEventListener('pointerdown', this.onPointerDown);
        
    }
    
    getTemplate() {
        return `
        <div class="range-slider">
            <span data-element = 'from'>${this.selected.from ? this.formatValue(this.selected.from): this.formatValue(this.min)}</span>
            <div class="range-slider__inner" data-element = 'slider'>
                <span class="range-slider__progress" data-element = 'progress' style="left: ${this.getPercentValue(this.selected.from-this.min)}%; right: ${this.getPercentValue(this.selected.to - this.min)}%"></span>
                <span class="range-slider__thumb-left" data-element = 'leftThumb' style="left: ${this.getPercentValue(this.selected.from-this.min)}%"></span>
                <span class="range-slider__thumb-right" data-element = 'rightThumb' style="right: ${this.getPercentValue(100 - this.selected.from - this.min)}%"></span>
            </div>
            <span data-element = 'to'>${this.selected.to ? this.formatValue(this.selected.to): this.formatValue(this.max)}</span>
        </div>
        `;
    }

    getPercentValue(value){

        if(!value) return 0;
        return ((value * 100)/(this.max -this.min));
    }

    getNumValue(value){

        if(!value || this.progressWidth === 0) return 0;
        return  Math.round(value * (this.max-this.min)/this.progressWidth);
    }

    onPointerDown = (event) =>{

        if(!this.progressWidth)
            this.progressWidth = this.subElements.slider.getBoundingClientRect().width;
        if(!this.progressLeft)
             this.progressLeft = this.subElements.slider.getBoundingClientRect().left; 

        if(event.target.closest('.range-slider__thumb-left') || event.target.closest('.range-slider__thumb-right')){
            
            document.addEventListener('pointermove',this.onPointerMove); 
            document.addEventListener('pointerup',this.onPointerUp,{once:true});
            this.targetThumb = event.target
        }
    }

    onPointerMove = (event) =>{
        
        const thumb = this.targetThumb.dataset.element

        let currentPos = 0;
        let numberValue = 0;
        const to = this.selected.to;
        const from = this.selected.from;
        const percentValueFrom = parseInt(this.subElements.leftThumb.style.left);
        const percentValueTo = parseInt(this.subElements.rightThumb.style.right);
        
        currentPos = event.clientX - this.progressLeft ;
        numberValue = this.getNumValue(currentPos) ;
        
        if(thumb === 'leftThumb')
        {    
            if (currentPos < 1)
                this.setCoords(this.min,0);

            else if (numberValue + this.min >= to )
                this.setCoords(to,100 - percentValueTo);
            else
                this.setCoords(numberValue+this.min,this.getPercentValue(numberValue)); 
        }
        else{   
           
            if(currentPos >= this.progressWidth)
                this.setCoords(this.max,0)
            else if (numberValue + this.min <= from)
                this.setCoords(from,100-percentValueFrom);
            else
                this.setCoords(numberValue+this.min,100-this.getPercentValue(numberValue));
        }
        
    }

    setCoords(numberValue,percentValue){  
        
        if(this.targetThumb.dataset.element === 'leftThumb'){

            this.targetThumb.style.left = percentValue +'%';
            this.subElements.from.innerHTML = this.formatValue(numberValue) ;
            this.subElements.progress.style.left = percentValue +'%'
            this.selected.from = numberValue;
        }
        else {
            this.targetThumb.style.right = percentValue +'%';
            this.subElements.to.innerHTML = this.formatValue(numberValue) ;
            this.subElements.progress.style.right = percentValue +'%';
            this.selected.to = numberValue;
        }   
    }

    onPointerUp = () =>{
        
        document.removeEventListener('pointermove',this.onPointerMove);
        const rangeSelect = new CustomEvent('range-select', {
            detail: this.selected,
            bubbles: true
          });
          this.element.dispatchEvent(rangeSelect);
          this.targetThumb = null;
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

    render(){

      const element = document.createElement("div");
      element.innerHTML = this.getTemplate(); 
      this.element = element.firstElementChild;
      this.subElements = this.getSubElements();  
    }
    
    remove = () => {
        
       this.element.removeEventListener('pointerdown', this.onPointerDown);
       if(this.element)
            this.element.remove();
    }
        
    destroy = () => {
        this.remove();

    }
}
