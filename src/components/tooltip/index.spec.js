import Tooltip from './index.js';

describe('events-practice/tooltip', () => {
  const tooltip = new Tooltip();

  beforeEach(() => {
    const container = document.createElement('div');

    container.innerHTML = `<div id="container" data-tooltip="bar-bar-bar">
      Aperiam consectetur dignissimos dolores ex mollitia.
    </div>`;

    document.body.append(container);
    tooltip.initialize();
  });

  afterEach(() => {
    tooltip.destroy();
  });

  it('should be rendered correctly', () => {
    tooltip.render('');

    expect(tooltip.element).toBeVisible();
    expect(tooltip.element).toBeInTheDocument();
  });

  it('should be shown when moving over the element with data-tooltip attribute', () => {
    const pointerover = new MouseEvent('pointerover', {
      bubbles: true
    });

    const container = document.getElementById('container');

    container.dispatchEvent(pointerover);

    expect(tooltip.element).toBeVisible();
    expect(tooltip.element).toBeInTheDocument();
    expect(tooltip.element).toHaveTextContent('bar-bar-bar');
  });

  it('should be hidden when moving out from the element with data-tooltip attribute', () => {
    const pointermove = new MouseEvent('pointerout', {
      bubbles: true
    });

    const container = document.getElementById('container');

    container.dispatchEvent(pointermove);

    expect(tooltip.element).not.toBeInTheDocument();
  });

  it('should be constructed via singleton pattern', () => {
    const tooltip1 = new Tooltip();
    const tooltip2 = new Tooltip();

    expect(tooltip1 === tooltip2).toBeTruthy();
  });

  it('should have ability to be destroyed', () => {
    tooltip.destroy();

    expect(tooltip.element).not.toBeInTheDocument();
  });
});
