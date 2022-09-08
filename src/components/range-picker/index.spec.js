import RangePicker from './index.js';

const getDaysBetweenDates = (from, to) => {
  const millisecondsToDays = ms => ms / (24 * 60 * 60 * 1000);
  const milliseconds = Math.abs(new Date(to).setHours(24) - new Date(from));

  return millisecondsToDays(milliseconds);
};

describe('forms-fetch-api-part-2/range-picker', () => {
  let rangePicker;

  beforeEach(() => {
    rangePicker = new RangePicker({
      from: new Date(2019, 9, 2),
      to: new Date(2019, 10, 5)
    });

    document.body.append(rangePicker.element);
  });

  afterEach(() => {
    rangePicker.destroy();
    rangePicker = null;
  });

  it('should be rendered correctly', () => {
    expect(rangePicker.element).toBeVisible();
    expect(rangePicker.element).toBeInTheDocument();
  });

  it('should initially show only input', () => {
    const selector = rangePicker.element.querySelector('.rangepicker__selector');
    const input = rangePicker.element.querySelector('.rangepicker__input');

    expect(input).toBeInstanceOf(HTMLElement);
    expect(selector.innerHTML).toEqual('');
  });

  it('should be opened on click', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(rangePicker.element.classList).toContain('rangepicker_open');
  });

  it('should be closed on second click', function() {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(rangePicker.element.classList).not.toContain('rangepicker_open');
  });

  it('should show selected dates \'dateFrom-dateTo\' in input', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(dateFrom).toMatch('02.10.2019');
    expect(dateTo).toMatch('05.11.2019');
  });

  it('should highlight selected \'from\' and \'to\' dates in calendar', () => {
    const rangePicker = new RangePicker({
      from: new Date(2019, 9, 12),
      to: new Date(2019, 10, 25)
    });

    const input = rangePicker.element.querySelector('.rangepicker__input');

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const from = rangePicker.element.querySelector('.rangepicker__selected-from');
    const to = rangePicker.element.querySelector('.rangepicker__selected-to');

    expect(from.textContent.trim()).toMatch('12');
    expect(to.textContent.trim()).toMatch('25');
  });

  it('should highlight selected dates range in calendar', () => {
    const from = new Date(2020, 5, 8);
    const to = new Date(2020, 6, 13);
    const totalDays = getDaysBetweenDates(from, to);
    const RANGE_BORDERS_COUNT = 2;
    const rangePicker = new RangePicker({from, to});
    const input = rangePicker.element.querySelector('.rangepicker__input');

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const selectedBetween = rangePicker.element.querySelectorAll('.rangepicker__selected-between');

    expect(selectedBetween.length).toEqual(totalDays - RANGE_BORDERS_COUNT);
  });

  it('should clear highlighting of previous selection', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const from = rangePicker.element.querySelector('.rangepicker__selected-from');
    const prevDate = from.previousElementSibling;

    prevDate.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    const selectedBetween = rangePicker.element.querySelectorAll('.rangepicker__selected-between');

    expect(selectedBetween.length).toEqual(0);
  });

  it('should keep selected dates range after reopening', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    let from = rangePicker.element.querySelector('.rangepicker__selected-from');
    const prevDate = from.previousElementSibling;
    const nextDate = from.nextElementSibling;

    prevDate.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    nextDate.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    from = rangePicker.element.querySelector('.rangepicker__selected-from');
    const to = rangePicker.element.querySelector('.rangepicker__selected-to');

    expect(from.textContent.trim()).toEqual('1');
    expect(to.textContent.trim()).toEqual('3');
  });

  it('should show correct initial months in calendar', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [first, second] = rangePicker.element.querySelectorAll('.rangepicker__month-indicator');

    expect(first.textContent.trim()).toEqual('октябрь');
    expect(second.textContent.trim()).toEqual('ноябрь');
  });

  it('should have ability to switch to the next couple of months', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const rightNavigation = rangePicker.element.querySelector('.rangepicker__selector-control-right');

    rightNavigation.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [first, second] = rangePicker.element.querySelectorAll('.rangepicker__month-indicator');

    expect(first.textContent.trim()).toEqual('ноябрь');
    expect(second.textContent.trim()).toEqual('декабрь');
  });

  it('should have ability to switch to the previous couple of months', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const rightNavigation = rangePicker.element.querySelector('.rangepicker__selector-control-left');

    rightNavigation.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [first, second] = rangePicker.element.querySelectorAll('.rangepicker__month-indicator');

    expect(first.textContent.trim()).toEqual('сентябрь');
    expect(second.textContent.trim()).toEqual('октябрь');
  });

  it('should have ability to select all dates in two visible months', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar, secondCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const secondDateGrid = secondCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;
    const lastDate = secondDateGrid.lastElementChild;

    // change "from" and "to" dates
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    lastDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    let from = rangePicker.element.querySelector('.rangepicker__selected-from');
    let to = rangePicker.element.querySelector('.rangepicker__selected-to');

    // check dates selection in calendar
    expect(from.textContent.trim()).toEqual('1');
    expect(to.textContent.trim()).toEqual('30');

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    from = rangePicker.element.querySelector('.rangepicker__selected-from');
    to = rangePicker.element.querySelector('.rangepicker__selected-to');

    // check selection after second opening
    expect(from.textContent.trim()).toEqual('1');
    expect(to.textContent.trim()).toEqual('30');
  });

  it('should have ability to select dates range bigger than two months', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;

    // change "from" date
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const rightNavigation = rangePicker.element.querySelector('.rangepicker__selector-control-right');

    // got to the next couple of months
    rightNavigation.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [_, secondCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const secondDateGrid = secondCalendar.querySelector('.rangepicker__date-grid');
    const lastDate = secondDateGrid.lastElementChild;

    // change "to" date
    lastDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    expect(dateFrom).toMatch('01.10.2019');
    expect(dateTo).toMatch('31.12.2019');
  });

  it('should not change dates \'from\' and \'to\' inside input element if selected only one date', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;

    // change "from" date
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    expect(dateFrom).toMatch('02.10.2019');
    expect(dateTo).toMatch('05.11.2019');
  });

  it('should have ability to select minimal dates range equal two days', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;
    const nexDate = firstDate.nextElementSibling;

    // change "from" date to "01.10.2019"
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // change "to" date to "02.10.2019"
    nexDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    expect(dateFrom).toMatch('01.10.2019');
    expect(dateTo).toMatch('02.10.2019');
  });

  // TODO: maybe we need fix this behaviour in DateRange component?
  it('should have ability to select minimal dates range equal one day', () => {
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;

    // change "from" date to "01.10.2019"
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // change "to" date to "01.10.2019"
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
       bubbles: true
    }));

    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    expect(dateFrom).toMatch('01.10.2019');
    expect(dateTo).toMatch('01.10.2019');
  });

  it('should have ability select more than 1 year dates range', () => {
    const MONTHS_COUNT = 12;
    const input = rangePicker.element.querySelector('.rangepicker__input');
    const selector = rangePicker.element.querySelector('.rangepicker__selector');

    // open date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const [firstCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const firstDateGrid = firstCalendar.querySelector('.rangepicker__date-grid');
    const firstDate = firstDateGrid.firstElementChild;

    // change "from" date to "01.10.2019"
    firstDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const rightNavigation = rangePicker.element.querySelector('.rangepicker__selector-control-right');

    for (let i = 0; i < MONTHS_COUNT; i++) {
      rightNavigation.dispatchEvent(new MouseEvent('click', {
        bubbles: true
      }));
    }

    const [_, secondCalendar] = selector.querySelectorAll('.rangepicker__calendar');
    const secondDateGrid = secondCalendar.querySelector('.rangepicker__date-grid');
    const lastDate = secondDateGrid.firstElementChild;

    // change "to" date "01.11.2020"
    lastDate.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // close date picker
    input.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    const dateFrom = input.firstElementChild.innerHTML;
    const dateTo = input.lastElementChild.innerHTML;

    expect(dateFrom).toMatch('01.10.2019');
    expect(dateTo).toMatch('01.11.2020');
  });

  it('should have ability to be removed', () => {
    rangePicker.remove();

    expect(rangePicker.element).not.toBeInTheDocument();
  });
});
