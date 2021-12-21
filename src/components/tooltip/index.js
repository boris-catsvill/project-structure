import Component from "../../utils/component";

class Tooltip extends Component {
  static instance;

  handlePointerMove = (evt) => {
    const { clientX, clientY } = evt;
    const leftPos = clientX + 5;
    const topPos = clientY + 5;

    this.element.style.left = `${leftPos}px`;
    this.element.style.top = `${topPos}px`;
  }

  handlePointerOver = (evt) => {
    const tooltipTemplate = evt.target.closest('[data-tooltip]');

    if (tooltipTemplate) {
      const {tooltip} = tooltipTemplate.dataset;

      this.render(tooltip);
      document.addEventListener('pointermove', this.handlePointerMove);
    }
  }

  handlePoiterOut = () => {
    if (this.element) {
      this.remove();
      document.removeEventListener('pointermove', this.handlePointerMove);
    }
  }

  constructor() {
    super();
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  get template() {
    return (
      `<div class="tooltip"></div>`
    );
  }

  render(template) {
    this.element.innerHTML = template;
    document.body.append(this.element);
  }

  initEventListeners() {
    document.addEventListener('pointerout', this.handlePoiterOut);
    document.addEventListener('pointerover', this.handlePointerOver);
  }

  initialize() {
    this.initEventListeners();
  }

  destroy() {
    super.remove();
    document.removeEventListener('pointerout', this.handlePoiterOut);
    document.removeEventListener('pointerover', this.handlePointerOver);    
    document.removeEventListener('pointermove', this.handlePointerMove);
  }
}

const tooltip = new Tooltip();
export default tooltip;