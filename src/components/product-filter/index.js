import DoubleSlider from "../double-slider/index.js";
import debounce from "../../utils/debounce.js";

export default class ProductFilter {
	
	element = {};
	subElements = {};
	sliderContainer = {};
	filterNameContainer = {};
	filterStatusContainer = {};
	filterForm = {};
	
	
  constructor() {
		this.slider = new DoubleSlider(); 
    this.render();
		
  }
	
	
  get template() {
    return `
			<form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
            <label class="form-label">Цена:</label>		
					</div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
		`;
  }
	
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

   
		this.initSlider();
		this.subElements = this.getSubElements(element);
		
    this.initEventListeners();
		
		
		// price from slider
		this.from = this.element.querySelector('[data-element="from"]').innerHTML.substring(1)
		this.to = this.element.querySelector('[data-element="to"]').innerHTML.substring(1)
		
    return this.element;

  }

  initEventListeners = () => {
		this.sliderContainer = this.subElements.sliderContainer;	
		this.filterNameContainer = this.subElements.filterName;
		this.filterStatusContainer = this.subElements.filterStatus;
				
		this.sliderContainer.addEventListener('pointerup', this.onPriceHandler);
		this.filterNameContainer.addEventListener('keyup', this.onFilterNameHandler);
		this.filterStatusContainer.addEventListener('change', this.onFilterStatusHandler);
		
  }

	
	initSlider() {			
		const sliderContainer  = this.element.querySelector('[data-element="sliderContainer"]');		
		sliderContainer.append(this.slider.element)
		
	}
	
	
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
	

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }
	
	// обработка double-slider и передача объекта с диапазоном цен в родительский компонент
	onPriceHandler = debounce((event) => {
		
		this.filterFormHandler();
		this.dispatchEvent("rangeSelected");
		
	});
	

	
	// обработка поиска по названию
	onFilterNameHandler = debounce ((event) => {
		this.filterFormHandler();
		this.dispatchEvent("filterName");			
		}, 350); 
	
	//обработка селекта со статусом
	onFilterStatusHandler = (event) => {
		this.filterFormHandler();
		this.dispatchEvent("filterStatus");
	}
	
	
	
	// передача данных в родительский компонент
	dispatchEvent(type) {		
		if (type === "rangeSelected") {
			this.element.dispatchEvent(new CustomEvent('price-select', {
				bubbles: true,
				detail: this.filterForm
			}));
		} else if (type === "filterName") {
			this.element.dispatchEvent(new CustomEvent('filter-name', {
				bubbles: true,
				detail: this.filterForm
			}));
		} else if (type === "filterStatus") {
			this.element.dispatchEvent(new CustomEvent('filter-status', {
				bubbles: true,
				detail: this.filterForm
			}));
		}		
  }
	
	filterFormHandler() {
		for (const [key, value] of Object.entries(this.subElements)) {
			switch (key) {
				case 'filterName':
					this.filterForm.filterName = value.value;
					break;
				case 'from':
					this.filterForm.from = value.innerText.substring(1);
					break;
				case 'to':
					this.filterForm.to = value.innerText.substring(1);
					break;
				case 'filterStatus':
					this.filterForm.filterStatus = value.value;
					break;
				default:
					break;				
			}
		} 
		
		return this.filterForm
	}

  remove() {
    this.element.remove();
  }

  destroy() {
		this.sliderContainer.removeEventListener('pointerup', this.onPriceHandler())
    this.remove();  
  }
}