
import NotificationMessage from "../../components/Notification.js";

import errorHandler from "../../store/errorHandler.js";
import getComponents from "./getComponents.js";

export default class CategoriesPage {

  subcategoriesURL = `${process.env.BACKEND_URL}/api/rest/subcategories`
  getComponents = getComponents
  childrenComponents = []
  subElements = []

  get elementDOM() {
    const wrapper = document.createElement('div');
    const categories = `
        <div class="categories" >
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
            <div data-element="categoriesList"></div>
        </div>`;
    wrapper.innerHTML = categories;
    return wrapper.firstElementChild; 
  }

  async fetchNewPositions(items) {
    try {
      const response = await fetch(this.subcategoriesURL, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(items)
      });
      if (!response.ok) {throw new Error('Ошибка сети/сервера');}

      const notification = new NotificationMessage({
        message: 'Порядок категорий сохранен',
        wrapperOfElement: document.body,
        duration: 3000,
        type: 'success'
      });

      notification.show();

    } catch (error) {
      //errorHandler(error);
      //throw new Error(error.message);
    }
  }

  changedPositionOfSortableListHandler = (event) => {
    const { detail: {
      startPositions,
      endPositions
    } } = event;
    const itemsWithCHangedPositions = startPositions.filter((item, index) => {
      return item !== endPositions[index];
    });
    if (itemsWithCHangedPositions.length !== 0) {
      const requestData = endPositions.map((element, index) => {
        return {id: element.dataset.id, weight: index + 1};
      });
      this.fetchNewPositions(requestData);
    }
  }

  async update() {
    this.childrenComponents.forEach((component) => component.element?.remove());
    
    this.childrenComponents = this.getComponents(this.range).map(([ComponentChild, containerName, inputData]) => {
      const component = new ComponentChild(...inputData);
      component?.render();
      console.log(containerName, this.subElements)
      console.log(this.subElements[containerName]);
      this.subElements[containerName].append(component.element);
      return component
    });

    const updateComponents = this.childrenComponents.map(componentChild => componentChild?.update())
    await Promise.all(updateComponents)
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  addEventListeners() {
    this.element.addEventListener('position-changed', this.changedPositionOfSortableListHandler);
  }

  render() {
    this.element = this.elementDOM;
    this.setSubElements();
    this.addEventListeners();
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.childrenComponents.forEach((component) => component?.destroy())
    this.remove();
  }

}