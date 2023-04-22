/* eslint-disable no-mixed-spaces-and-tabs */
class Tooltip {
	element = '';
	tooltipName;
	
	static instance;
	
	constructor() {
	  if (Tooltip.instance) {
	    return Tooltip.instance;
	  }
		
	  Tooltip.instance = this;
	}
	
	initialize () {
	  document.addEventListener("pointerover", this.onOverHandler);
	  document.addEventListener("pointerout", this.onOutHandler);
	}
	
	
	// pointerover target div
	onOverHandler = (event) => {
	  const tooltipAttr = event.target.dataset.tooltip;
	  if (tooltipAttr) {
	    this.tooltipName = tooltipAttr;
	    this.render();
	    document.addEventListener("pointermove", this.onMoveHandler);				    
	  }
	}
	
	// pointerout target div
	onOutHandler = (event) => {
	  const tooltipAttr = event.target.dataset.tooltip;
	  if (tooltipAttr) {
	    this.tooltip = tooltipAttr;
		 	this.remove();
	    document.removeEventListener("pointermove", this.onMoveHandler);
	  }
	}

	onMoveHandler = (event) => {
	  const shift = 10;
	  let left = shift + event.clientX + 'px';
	  let top = shift + event.clientY + 'px';
		
	  this.element.style.left = left;
	  this.element.style.top = top;
	}
	
	get template() {
	  return `<div class="tooltip">${this.tooltipName}</div>	`;
	}
	
	render() {
	  const wrapper = document.createElement('div');
	  wrapper.innerHTML = this.template;
	  this.element = wrapper.firstElementChild;
	  document.body.append(this.element);
	}
	
	
	remove() {
	  if (this.element) {
	    this.element.remove();
	  }
	}

	destroy() {
	  document.removeEventListener("pointermove", this.onMoveHandler);
	  document.removeEventListener("pointerover", this.onOverHandler);
	  document.removeEventListener("pointerout", this.onOutHandler);

	  this.remove();
	  this.element = null;
	}

	
}

const tooltip = new Tooltip();


export default tooltip;
