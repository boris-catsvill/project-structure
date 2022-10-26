import getComponents from "./getComponents"

export default class SalesPage {

  subElements = {}
  wrappersOfElementHTML = []

  getComponents = getComponents
  childrenComponents = []

  mainClass = null
  range = {
    from: null,
    to: null
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    const dashbord = `
        <div class="sales full-height flex-column">
            <div class="content__top-panel">
                <h1 class="page-title">Продажи</h1>
                <div data-element="rangePicker"></div>
            </div>
      <div data-element="sortableTable" class="full-height flex-column"></div>
      </div>`;
    wrapper.innerHTML = dashbord;
    return wrapper.firstElementChild;
  }

  async update() {
    this.childrenComponents.forEach((component) => component.element?.remove());
    
    this.childrenComponents = this.getComponents(this.range).map(([ComponentChild, containerName, inputData]) => {
      const component = new ComponentChild(...inputData);
      component.render();
      this.subElements[containerName].append(component.element);
      return component
    });

    const updateComponents = this.childrenComponents.map(componentChild => componentChild?.update())
    await Promise.all(updateComponents)
  }


  updateRange(newRange) {
    const { from, to } = newRange;

    this.range.from = new Date(from);
    this.range.to = new Date(to);

    this.mainClass.range.from = new Date(from);
    this.mainClass.range.to = new Date(to);
  }

  changeRangeHandler = (event) => {
    this.updateRange(event.detail);

    this.wrappersOfElementHTML.forEach(wrapper => { wrapper.destroy(); });
    this.elements = [];

    this.update();
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  addEventListeners() {
    this.element.addEventListener('date-select', this.changeRangeHandler);
  }

  render(mainClass, range) {
    this.mainClass = mainClass;
    this.range = {
      from: new Date(range.from),
      to: new Date(range.to)
    };

    this.element = this.elementDOM;

    this.setSubElements();
    this.addEventListeners();

  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.childrenComponents.forEach((component) => component?.destroy())
    this.remove();
  }
}

