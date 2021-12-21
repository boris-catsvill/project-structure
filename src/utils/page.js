import Component from "./component";

export default class PageComponent extends Component {
  _components = {}
  _instances = {}

  addComponents() {
    if(this.components) {
      const componentMap = Object.entries(this.components);
      this._components = componentMap.reduce((acc, [name, comp]) => ({...acc, [name]: comp }), this._components);
    };
  } 

  get instanceConponents() {
    return this._instances;
  }

  set instanceConponents(instances) {
    this._instances = instances;
  }

  getComponentByName(name) {
    try {
      const component = this._components[name];

      if (!component) {
        throw Error('has no component');
      }
      return component;


    } catch (error) {
      console.log(error);
    }
  }

  initComponents() {}

  renderComponent() {
    if(!Object.values(this.instanceConponents).length) {
      return;
    };

    Object.keys(this.subElements).forEach(key => {
      if (this.instanceComponent[key]) {
        const root = this.subElements[key];

        if(this.instanceComponent[key].element) {
          root.append(this.instanceComponent[key].element);
        }
      }
    });
  }

  async beforePageRender() {}

  beforeMountedPage() {}

  async render() {
    // тут колбеки 'жизненного цикла экрана'
    await this.beforePageRender();
    this.element = this.createElement(this.template);

    this.setChildren();
    this.addComponents();
    this.initComponents();

    this.beforeMountedPage();

    this.renderComponent();
    this.initEventListeners();
    
    return this.element;
  }
  
  destroy() {
    super.destroy();

    Object.keys(this._instances)
      .forEach(
        name => this._instances[name].destroy()
      );

    this._components = null;
    this._instances = null;
  }
}