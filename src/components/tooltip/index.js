class Tooltip {
  static #onlyInstance = null;
  targetElem = null;
  constructor(){
      if(!Tooltip.#onlyInstance){
        Tooltip.#onlyInstance = this;
      } else {
          return Tooltip.#onlyInstance;
      }
  }

  initialize () {
    document.body.addEventListener('pointerover',this.onPointerOver)
  }

  onPointerOver = (event) =>{
    

   
    this.targetElem = event.target.closest('[data-tooltip]')

    if(!this.targetElem) return;

    this.render();
    this.element.innerHTML = event.target.closest('[data-tooltip]').dataset.tooltip
    this.targetElem.addEventListener('pointermove',this.onPointerMove);
    this.targetElem.addEventListener('pointerout',this.onPointerOut,{once:true});
    this.element.hidden = false;
  }

  onPointerOut = () =>{

    this.targetElem.removeEventListener('pointermove',this.onPointerMove);
    this.targetElem = null;
    this.element.remove();
  }

  onPointerMove = (event) =>{
    
    const left = event.clientX + 10;
    const top = event.clientY + 10;
    
    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
    
  }

  render(tooltipText = ''){
    this.element = document.createElement('div');
    this.element.innerHTML = tooltipText;
    this.element.classList.add('tooltip');
    document.body.appendChild(this.element);
    this.element.hidden;
  }

  destroy(){
    
    Tooltip.#onlyInstance = null;
    
    if(this.targetElem){
      this.targetElem.removeEventListener('pointermove',this.onPointerMove);
      this.targetElem.removeEventListener('pointerout',this.onPointerOut);
      this.targetElem = null;
    }
    if(this.element){
      this.element.remove();
      this.element = null;
    }
  }
}


const tooltip = new Tooltip();

export default tooltip;
