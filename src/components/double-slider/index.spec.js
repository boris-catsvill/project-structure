import DoubleSlider from './index.js';

describe('events-practice/double-slider', () => {
  let doubleSlider;

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 1000,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      };
    });

    doubleSlider = new DoubleSlider({
      min: 100,
      max: 200,
      formatValue: value => '$' + value,
      selected: {
        from: 120,
        to: 150
      }
    });

    document.body.append(doubleSlider.element);
  });

  afterEach(() => {
    doubleSlider.destroy();
    doubleSlider = null;
  });

  it("should be rendered correctly", () => {
    expect(doubleSlider.element).toBeInTheDocument();
    expect(doubleSlider.element).toBeVisible();
  });

  it("should have ability to set slider boundaries", () => {
    doubleSlider = new DoubleSlider({
      min: 400,
      max: 600,
      formatValue: value => '$' + value,
    });

    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    expect(leftBoundary).toHaveTextContent("$400");
    expect(rightBoundary).toHaveTextContent("$600");
  });

  it('should have ability to set selected range', () => {
    doubleSlider = new DoubleSlider({
      min: 300,
      max: 800,
      selected: {
        from: 400,
        to: 600
      },
      formatValue: value => '$' + value,
    });

    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    expect(leftBoundary).toHaveTextContent("$400");
    expect(rightBoundary).toHaveTextContent("$600");
  });

  it('should have ability to move left slider to start boundary', () => {
    const leftSlider = doubleSlider.element.querySelector('.range-slider__thumb-left');
    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const move = new MouseEvent('pointermove', {
      clientX: 0,
      bubbles: true
    });

    leftSlider.dispatchEvent(down);
    leftSlider.dispatchEvent(move);

    expect(leftBoundary).toHaveTextContent(doubleSlider.min);
  });

  it('should have ability to move right slider to end boundary', () => {
    const rightSlider = doubleSlider.element.querySelector('.range-slider__thumb-right');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const move = new MouseEvent('pointermove', {
      clientX: 1000,
      bubbles: true
    });

    rightSlider.dispatchEvent(down);
    rightSlider.dispatchEvent(move);

    expect(rightBoundary).toHaveTextContent(doubleSlider.max);
  });

  it('should have ability to select all range', () => {
    const leftSlider = doubleSlider.element.querySelector('.range-slider__thumb-left');
    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');
    const rightSlider = doubleSlider.element.querySelector('.range-slider__thumb-right');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const moveRight = new MouseEvent('pointermove', {
      clientX: 1000,
      bubbles: true
    });

    const moveLeft = new MouseEvent('pointermove', {
      clientX: 0,
      bubbles: true
    });

    leftSlider.dispatchEvent(down);
    leftSlider.dispatchEvent(moveLeft);

    rightSlider.dispatchEvent(down);
    rightSlider.dispatchEvent(moveRight);

    expect(leftBoundary).toHaveTextContent(doubleSlider.min);
    expect(rightBoundary).toHaveTextContent(doubleSlider.max);
  });

  it('should have ability to select single value (when min and max range equal)', () => {
    const leftSlider = doubleSlider.element.querySelector('.range-slider__thumb-left');
    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const move = new MouseEvent('pointermove', {
      clientX: 500,
      bubbles: true
    });

    leftSlider.dispatchEvent(down);
    leftSlider.dispatchEvent(move);

    expect(leftBoundary.textContent.trim()).toEqual(rightBoundary.textContent.trim());
  });

  it('should have ability to set range value, for example: usd, eur, etc.', () => {
    doubleSlider = new DoubleSlider({
      min: 100,
      max: 200,
      formatValue: value => 'USD' + value
    });

    const leftBoundary = doubleSlider.element.querySelector('span[data-element="from"]');
    const rightBoundary = doubleSlider.element.querySelector('span[data-element="to"]');

    expect(leftBoundary.textContent.trim()).toContain('USD');
    expect(rightBoundary.textContent.trim()).toContain('USD');
  });

  it('should produce event "range-select"', () => {
    const spyDispatchEvent = jest.spyOn(doubleSlider.element, 'dispatchEvent');
    const leftSlider = doubleSlider.element.querySelector('.range-slider__thumb-left');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const move = new MouseEvent('pointermove', {
      clientX: 1000,
      bubbles: true
    });

    const up = new MouseEvent('pointerup', {
      bubbles: true
    });

    leftSlider.dispatchEvent(down);
    leftSlider.dispatchEvent(move);
    leftSlider.dispatchEvent(up);

    const [rangeSelectEvent] = spyDispatchEvent.mock.calls;

    expect(rangeSelectEvent[0].type).toEqual("range-select");
  });

  it('should have a new ranges in produced event', () => {
    const spyDispatchEvent = jest.spyOn(doubleSlider.element, 'dispatchEvent');
    const leftSlider = doubleSlider.element.querySelector('.range-slider__thumb-left');

    const down = new MouseEvent('pointerdown', {
      bubbles: true
    });

    const move = new MouseEvent('pointermove', {
      clientX: 300,
      bubbles: true
    });

    const up = new MouseEvent('pointerup', {
      bubbles: true
    });

    leftSlider.dispatchEvent(down);
    leftSlider.dispatchEvent(move);
    leftSlider.dispatchEvent(up);

    const customEvent = spyDispatchEvent.mock.calls[0][0];

    expect(spyDispatchEvent).toHaveBeenCalled();
    expect(customEvent.detail).toEqual({ from: 130, to: 150 });
  });

  it('should have ability to be destroyed', () => {
    doubleSlider.destroy();

    expect(doubleSlider.element).not.toBeInTheDocument();
  });
});
