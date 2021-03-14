export default class DoubleSlider {
    constructor({ min, max, formatValue, selected = {} } = {}) { 
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.selected = selected;
        this.from = selected.from;
        this.to = selected.to;

        this.render();
    }

    render() { 
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();
        this.element = wrapper.firstElementChild;
        wrapper.remove();

        this.initialization();
    }

    getTemplate() { 
        return `
            <div class="range-slider">
                <span data-element='from'>${this.formatValue(this.min)}</span>
                    <div class="range-slider__inner">
                        <span class="range-slider__progress"></span>
                        <span class="range-slider__thumb-left"></span>
                        <span class="range-slider__thumb-right"></span>
                    </div>
                <span data-element='to'>$${this.formatValue(this.max)}</span>
            </div>
        `
    }

    initialization() { 
        this.leftThumb = this.element.querySelector('.range-slider__thumb-left');
        this.leftBoundry = this.element.querySelector('span[data-element="from"]')

        this.rightThumb = this.element.querySelector('.range-slider__thumb-right');
        this.rightBoundry = this.element.querySelector('span[data-element="to"]');

        this.sliderLine = this.element.querySelector('.range-slider__inner');
        this.progressLine = this.element.querySelector('.range-slider__progress');

        this.scaleRange = this.max - this.min;

        this.initStartElements(this.from, this.to);
        
        this.element.addEventListener('pointerdown', this.pointerDown);
    }

    pointerDown = (evt) => {

        if (evt.target !== this.leftThumb && evt.target !== this.rightThumb) return;
        
        this.initSliderLine();

        this.initThumb(evt);
    }

    initStartElements(from = this.min, to = this.max) { 
        this.leftBoundry.textContent = this.formatValue(from);
        this.rightBoundry.textContent = this.formatValue(to);

        this.progressLine.style.left = (from - this.min) / this.scaleRange * 100 + '%';
        this.leftThumb.style.left = this.progressLine.style.left;

        this.progressLine.style.right = (this.max - to) / this.scaleRange * 100 + '%';
        this.rightThumb.style.right = this.progressLine.style.right;
    };

    initSliderLine() { 
        const { width, left, right } = this.sliderLine.getBoundingClientRect();

        this.sliderLine.width = width;
        this.sliderLine.leftX = left;
        this.sliderLine.rightX = right;
    }

    initThumb(evt) {

        let activeThumb;
        
        (evt.target === this.leftThumb) ? activeThumb = this.leftThumb : activeThumb = this.rightThumb;
       
        let { left, right } = activeThumb.getBoundingClientRect();
        
        activeThumb.leftX = left;
        activeThumb.rightX = right;

        (activeThumb === this.leftThumb) ? activeThumb.positionStart = left : activeThumb.positionStart = right;

        activeThumb.shiftX = evt.clientX - activeThumb.positionStart;

        activeThumb.ondragstart = () => false;

        this.activeThumb = activeThumb;
        document.addEventListener('pointermove', this.moveThumb);
    }       
    
    moveThumb = (evt) => {  

        this.activeThumb.style.cssText = 'z-index: 10000';

        (this.activeThumb === this.leftThumb) ? this.moveLeftThumb(evt) : this.moveRightThumb(evt);

        document.addEventListener('pointerup', this.pointerUp);
    }

    moveLeftThumb(evt) { 

        if (evt.clientX <= this.sliderLine.leftX) {
            this.leftThumb.style.left = `0%`;
            this.from = this.min
        } else { 
            this.leftThumb.style.left = (evt.clientX + this.leftThumb.shiftX - this.sliderLine.leftX) / this.sliderLine.width * 100 + '%';
            
            this.from = Math.round(
                this.min + this.scaleRange * (evt.clientX - this.sliderLine.leftX) / this.sliderLine.width
            );
        }
        
        if (this.leftThumb.getBoundingClientRect().right > this.rightThumb.getBoundingClientRect().left) { 
            this.leftThumb.style.left = 100 - parseFloat(this.rightThumb.style.right) + '%';
            
            this.from = Math.round(
                parseFloat(this.leftThumb.style.left) / 100 * this.scaleRange + this.min
            );
        }

        this.leftBoundry.textContent = this.formatValue(this.from);
        this.progressLine.style.left = `${parseFloat(this.leftThumb.style.left)}%`;
    }

    moveRightThumb(evt) { 

        if (evt.clientX >= this.sliderLine.rightX) {
            this.rightThumb.style.right = '0%';
            this.to = this.max;
        } else { 
            this.rightThumb.style.right = (this.sliderLine.rightX - this.rightThumb.shiftX - evt.clientX) / this.sliderLine.width * 100 + `%`;

            this.to = Math.round(
                this.max + this.scaleRange * (evt.clientX - this.sliderLine.rightX) / this.sliderLine.width
            );
        }
        
        if (this.leftThumb.getBoundingClientRect().right > this.rightThumb.getBoundingClientRect().left) { 

            this.rightThumb.style.right = 100 - parseFloat(this.leftThumb.style.left) +`%`;

            this.to = Math.round(
                this.max - parseFloat(this.rightThumb.style.right) / 100 * this.scaleRange
            );
        }
        
        this.rightBoundry.textContent = this.formatValue(this.to);
        this.progressLine.style.right = `${parseFloat(this.rightThumb.style.right)}%`;
    }
    
    pointerUp = () => { 

        const evtRangeSelect = new CustomEvent('range-select', {
            bubles: true,
            detail: {
                from: this.from,
                to: this.to
            }
        });

        this.element.dispatchEvent(evtRangeSelect);

        document.removeEventListener('pointermove', this.moveThumb);
        document.removeEventListener('pointerup', this.pointerUp);
    }

    destroy() { 
        this.element.remove();
    }
};
