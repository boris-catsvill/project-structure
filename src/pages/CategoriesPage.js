import CategoriesList from "../components/CategoriesList.js";
import NotificationMessage from "../components/Notification.js";

import errorHandler from "../store/errorHandler.js";

export default class CategoriesPage {
  constructor({mainClass, url}) {
    const [[categoriesPath, subcategoriesPath], backendURL] = url;
    this.mainClass = mainClass;
    this.categoriesURL = [categoriesPath, backendURL];
    this.subcategoriesURL = new URL(subcategoriesPath, backendURL);
    this.render();
  }

  get categoriesElement() {
    const wrapper = document.createElement('div');
    const categories = `
        <div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        </div>`;
    wrapper.innerHTML = categories;
    return wrapper.firstElementChild; 
  }

  async fetchNewPositions(items) {
    try {
      const response = await fetch(this.subcategoriesURL.toString(), {
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
      errorHandler(error);
      throw new Error(error.message);
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
    const categoriesList = new CategoriesList(this.categoriesURL);
    const childElement = await categoriesList.render();
    this.element.append(childElement);
  }

  render() {
    this.element = this.categoriesElement;
    this.element.addEventListener('position-changed', this.changedPositionOfSortableListHandler);
    this.update();
    return this.element;
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }

}