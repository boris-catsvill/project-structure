import categoriesData from './__mocks__/categories-data.js';
import CategoriesPage from "./index.js";

describe('tests categories page', () => {
  let categoriesPage;

  beforeEach(() => {
    fetchMock
      .once(JSON.stringify(categoriesData));

    categoriesPage = new CategoriesPage();

    const element = categoriesPage.render();

    document.body.append(element);
  });

  afterEach(() => {
    fetchMock.resetMocks();
    categoriesPage.destroy();
    categoriesPage = null;
  });

  it('should be rendered correctly', () => {
    expect(categoriesPage.element).toBeVisible();
    expect(categoriesPage.element).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    categoriesPage.remove();

    expect(categoriesPage.element).not.toBeInTheDocument();
  });

  it('should contains all categories', () => {
      const categories = categoriesPage.element.querySelectorAll('.category');
      expect(categories.length).toEqual(categoriesData.length);
    }
  );

  it('should contains all sortable list from SortableList component', () => {
    const querySelectorAll = categoriesPage.element.querySelectorAll('ul.sortable-list');
    expect(querySelectorAll.length).toEqual(categoriesData.length);
  });

  it('should render category list element', () => {
    const listItemData = categoriesData.at(0).subcategories.at(0);
    const element = categoriesPage.renderCategoryListElement(listItemData);
    expect(element).toHaveAttribute('data-id', listItemData.id);
  });

  it('category element should contains item list', () => {
    const ul = categoriesPage.element.querySelector('ul.sortable-list');
    const items = ul.querySelectorAll('li');
    expect(items).toHaveLength(categoriesData.at(0).subcategories.length);
  });

  it('should fetch when get data', () => {
    fetchMock.mockResponseOnce();
    expect(fetchMock.mock.calls.length).toEqual(1);
  });

  it('should close category after click on category', () => {
    const categoriesContainer = categoriesPage.subElements.categoriesContainer;
    const categoryElement = categoriesContainer.querySelector('.category');
    const pointerdown = new MouseEvent('pointerdown', {bubbles: true});
    expect(categoryElement).toHaveClass('category_open');

    categoryElement.dispatchEvent(pointerdown);

    expect(categoryElement).not.toHaveClass('category_open');
  });
});
