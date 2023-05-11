class Tooltip {

  static onlyElem;
  element;
  shift = 10;

  constructor() {
    if (Tooltip.onlyElem) {
      return Tooltip.onlyElem;
    }

    Tooltip.onlyElem = this;
  }

  initialize () {
    document.body.addEventListener('pointerover', this.onPointerOver);
  }

  onPointerOver = (event) => {    
    const text = event.target.dataset.tooltip;
    if (text) {
      this.render(text);
      document.body.addEventListener('pointermove', this.onPointerMove);
      document.body.addEventListener('pointerout', this.onPointerOut);
    }
  };

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;
    document.body.append(this.element);
  }  

  onPointerOut = (event) => {
    if (event.target.dataset.tooltip) {
      this.remove();
      document.body.removeEventListener('pointermove', this.onPointerMove);
      document.body.removeEventListener('pointerout', this.onPointerOut);
    }
  };

  onPointerMove = (event) => {
    if (event.target.dataset.tooltip) {
      this.element.style.left = event.clientX + this.shift + 'px';
      this.element.style.top = event.clientY + this.shift + 'px';
    }
  }; 

  removeEventListeners() {
    document.body.removeEventListener('pointerover', this.onPointerOver);
    document.body.removeEventListener('pointerout', this.onPointerOut);
    document.body.removeEventListener('pointermove', this.onPointerMove);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
  }

}

const tooltip = new Tooltip();

export default tooltip;
