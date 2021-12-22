import SortableList from "../../components/sortable-list";
import NotificationMessage from "../../components/notification";
import PageComponent from "../../utils/page";
import CategoryExpandPanel from "../../components/categories";

export default class CategoriesPage extends PageComponent {
  url = `${process.env.BACKEND_URL}api/rest/categories?_refs=subcategory`;
  categories = {};

  updateCategory = (event) => {
    const { detail: { sortNodeCollection } } = event;
    const updateCategoryList = this.sortableListToArrayPaylod(sortNodeCollection);
    this.updateReorderCategory(updateCategoryList);
  }

  async beforePageRender() {
    await this.loadData()
  }

  async updateReorderCategory(updateCategoryList) {
    try {
      await this.fetchJson(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateCategoryList)
      });

      this.handleShowNotyficationComponent({message: 'Category order saved', type: 'success'});

    } catch (error) {
      this.handleShowNotyficationComponent({message: 'Category order NOT saved', type: 'error'});
    }
  }

  handleShowNotyficationComponent({ message, type }) {
    const notification = new NotificationMessage(message, {
      type
    })

    notification.show(this.element);
  }

  get components() {
    return {
      sortableList: SortableList,
      categoryPanel: CategoryExpandPanel,
    }
  }

  get template() {
    return (
      `<div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-element="body">
        </div>
      </div>`
    )  
  }


  async loadData() {
    const data = await this.fetchJson(this.url);

    const categories = data.reduce((acc, { subcategories, id, title }) => {
      acc[id] = { subcategories, title }
      return acc;
    }, {})

    this.categories = categories;
  }

  initComponents() {
    const CategoryPanel = this.getComponentByName('categoryPanel');
    const SortableList = this.getComponentByName('sortableList');

    this.panels = {}
    this.sortableLists = {}

    for(let category of Object.keys(this.categories)) {
      const panel = new CategoryPanel({
        title: this.categories[category].title,
        id: category
      })

      const list = new SortableList({
        id: category,
        items: this.categories[category].subcategories
          .map(
            this.createSortableItemElement.bind(this)
          )
      });

      this.panels[category] = panel; 
      this.sortableLists[category] = list;  
    };
  }

  createSortableItemElement({ id, title, count, category, weight } = {}) {
    const template = (`
      <li 
        data-grab-handle="" 
        data-id="${id}" 
        data-count="${count}" 
        data-category="${category}"
        data-title="${title}"
        data-weight="${weight}"
        class="sortable-list__item"
      >
        <strong>${title}</strong>
        <span><b>${count}</b> products</span>
      </li>
    `);

    return this.createElement(template);
  }

  renderComponent() {
    const root = this.getChildElementByName('body');

    for(let panel in this.panels) {
      root.append(this.panels[panel].element);
      
      this.panels[panel].slot(
        this.sortableLists[panel].element
      );
    }
  }

  initEventListeners() {
    this.element.addEventListener('sortable-list-reorder', this.updateCategory);
  }

  removeEventListeners() {
    this.element.removeEventListener('sortable-list-reorder', this.updateCategory);
  }
 
  sortableListToArrayPaylod(sortCollection) {
    return sortCollection.map((it, index) => {
      const { id } = it.dataset;
      return { id, weight: index + 1 };
    });
  }

  destroy() {
    super.destroy();
    this.panels = null;
    this.sortableLists = null;
  }
}