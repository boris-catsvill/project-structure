export default class SortableList {
  constShift = 5;
  
  constructor({items} = {}){

      this.items = items;
      this.render();
      this.addEventListeners();
  }

  render(){

      this.element = document.createElement('ul');
      this.element.classList.add('sorttable-list');
      this.appendListElement();
  }

  appendListElement(){
      this.items.map(item =>{
          item.classList.add('sortable-list__item');
          this.element.append(item);
      });

  }

  addEventListeners(){

      this.element.addEventListener('pointerdown',this.onPointerDown);
  }

  onPointerDown = (event) =>{

     this.draggingElement = event.target.closest('.sortable-list__item');

     if(this.draggingElement){
      
      if(event.target.closest('[data-delete-handle]'))
      {   
          event.preventDefault();
          this.draggingElement.remove();
      }
      if(event.target.closest('[data-grab-handle]')){
          
          event.preventDefault();
          this.xCord = event.clientX;

          this.shiftX = event.clientX - this.draggingElement.getBoundingClientRect().left;
          this.shiftY = event.clientY - this.draggingElement.getBoundingClientRect().top;
          
          this.draggingElement.style.left = event.clientX - this.shiftX +'px';
          this.draggingElement.style.top = event.clientY - this.shiftY + 'px';
          
          this.dragElement();
      }
    }       
  }

  dragElement(){

      this.placeholder = document.createElement('div');
      this.placeholder.classList.add('sortable-list__placeholder');
      
      const rect = this.draggingElement.getBoundingClientRect();

      this.placeholder.style.height = rect.height +'px';
      this.placeholder.style.width = rect.width +'px';

      this.draggingElement.after(this.placeholder);
      this.draggingElement.classList.add('sortable-list__item_dragging');

      this.draggingElement.style.width = rect.width + 'px';
      
      document.addEventListener('pointermove', this.onPointerMove);
      document.addEventListener('pointerup', this.onPointerUp,{once:true});

  }

  onPointerMove = (event) => {

      this.draggingElement.style.left = event.clientX  + this.constShift +'px';
      this.draggingElement.style.top = event.clientY  + this.constShift + 'px';

      if(event.clientY > 0 && event.clientY < document.documentElement.clientHeight)
          this.current = document.elementFromPoint(this.xCord,event.clientY).closest('li');

      this.draggingElement.style.left = event.clientX - this.shiftX +'px';
      this.draggingElement.style.top = event.clientY - this.shiftY + 'px';

      
      if(this.current){
          
          const currentRect = this.current.getBoundingClientRect()
          
          if(event.clientY > currentRect.top - currentRect.height/2)
              this.current.after(this.placeholder);
          if(event.clientY < currentRect.top + currentRect.height/2)
              this.current.before(this.placeholder);
      }
  }

  onPointerUp = () =>{
      
      document.removeEventListener('pointermove', this.onPointerMove);
      this.placeholder.replaceWith(this.draggingElement);

      this.draggingElement.classList.remove('sortable-list__item_dragging');
      this.draggingElement.style.top = '';
      this.draggingElement.style.left = '';

      this.placeholder.remove();  

  }

  remove () {

      if(this.element)
          this.element.remove();

      document.removeEventListener('pointermove', this.onDocumentPointerMove);
      document.removeEventListener('pointerup', this.onDocumentPointerUp);
    }
  
   destroy () {
      this.remove();
      this.element = null;
    }
}
