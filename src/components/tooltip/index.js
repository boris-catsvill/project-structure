class Tooltip {
    

    static instance;
    element;

    handlerMove = (event) => {
        this.moveAt(event);
    }

     handlerOut = (event) => {
        this.remove();
        document.body.removeEventListener('mousemove', this.handlerMove);
    }

    handlerOver = (event) => {
        let element; 
        if (event.target.dataset.tooltip) {
            element = event.target
        } else {
            element = event.target.closest('data-tooltip');
        }
        
        if (element) {
            this.render(element.dataset.tooltip);
            document.body.addEventListener('mousemove', this.handlerMove);
        }
    }

    //tooltip - cинглтон (некоторый инстанс, который всегда возвращает один и тот же объект)
    //при каждом new Tooltip будет возвращаться предыдущий объект
    constructor() {
       if (Tooltip.instance) {
            return Tooltip.instance;
        }

        Tooltip.instance= this;
    }

    initialize() {
        this.initEventListeners();
     }

     initEventListeners() {
        document.body.addEventListener('pointerover', this.handlerOver);  //pointerout
        document.body.addEventListener('pointerout', this.handlerOut);  
     }

     render(html) {
          const hint = document.createElement('div'); // (*)
          hint.innerHTML = `<div> ${html} </div>`;
          const element = hint;  //hint.firstElementChild;
          this.element = hint;  //element;
//          this.element.ondragstart = function() {
//              return false;
//          };
          this.element.classList.add('tooltip');
          document.body.append(this.element);
     }

    moveAt (event) {

         const shift = 10;
         const left = event.clientX + shift;
         const top = event.clientY + shift;
       
         this.element.style.left = `${left}px`;
         this.element.style.top = `${top}px`;
   }

   remove() {
      if(this.element) {
          this.element.remove();
      }
   }

    destroy() {
      document.body.removeEventListener('pointerover', this.handlerOut);
      document.body.removeEventListener('pointerout', this.handlerOut);
      document.removeEventListener('mousemove', this.handlerMove);
      this.remove();
      this.element = null;
   }
   
}

export default Tooltip;
