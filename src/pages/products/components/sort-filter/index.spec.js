import SortFilter from "./index";

describe('tests sort-filter component', () => {
  let sortFilter;
  const initFilterName = 'qwerty';
  const statusList = ["Любой", "Активный", "Неактивный"];

  beforeEach(async () => {

    sortFilter = new SortFilter({
      filterName: initFilterName,
      statusList
    });
    const element = sortFilter.render();
    document.body.append(element);
  });

  afterEach(() => {
    sortFilter.destroy();
    sortFilter = null;
  });

  it('should be rendered correctly', () => {
    expect(sortFilter.element).toBeVisible();
    expect(sortFilter.element).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    sortFilter.remove();

    expect(sortFilter.element).not.toBeInTheDocument();
  });

  it('should contains all statuses', () => {
    const {filterStatus} = sortFilter.subElements;
    const options = filterStatus.querySelectorAll("option");
    expect(options).toHaveLength(statusList.length);
  });

  it('slider component should be in document', () => {
    const {sliderContainer} = sortFilter.components;
    expect(sliderContainer.element).toBeInTheDocument();
  });

  it('should send change condition event when filter text changed', () => {
    const {filterName} = sortFilter.subElements;
    const value = 'test';
    filterName.value = value;
    const inputEvent = new Event('input');
    const spy = jest.spyOn(sortFilter, 'onChangeConditions');

    filterName.dispatchEvent(inputEvent);

    expect(spy).toHaveBeenCalled();
    expect(sortFilter.sortParam.filterNameValue).toBe(value);
  });

  it('should set change conditions when price changed', () => {
    const {sliderContainer} = sortFilter.subElements;
    const detail = {from: 10, to: 1000};
    const event = new CustomEvent('range-select', {
      detail: detail
    });
    const spy = jest.spyOn(sortFilter, 'onChangeConditions');

    sliderContainer.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
    expect(sortFilter.sortParam.priceFilter).toEqual(detail);
  });

  it('should set change condition when status changed', () => {
    const {filterStatus} = sortFilter.subElements;
    const value = '1';
    filterStatus.value = value;
    const inputEvent = new Event('change');
    const spy = jest.spyOn(sortFilter, 'onChangeConditions');

    filterStatus.dispatchEvent(inputEvent);

    expect(spy).toHaveBeenCalled();
    expect(sortFilter.sortParam.filterStatus).toBe(value);

  });

  it('should reset to initial state', () => {
    sortFilter.subElements.filterName = "not initial value";

    sortFilter.reset();
    const {filterName} = sortFilter.subElements;

    expect(filterName.value).toBe(initFilterName);
  });
});
