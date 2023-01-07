class SidePanel {
  static instance;
  
  element;
  // events
  evntSignal = new AbortController();
  
  constructor() {
    if (SidePanel.instance) {
      return SidePanel.instance;
    }
    SidePanel.instance = this;
  }
  
  initialize() {
    this.initEventListeners();
  }
  
  initEventListeners() {
    const { signal } = this.evntSignal;    
    const sidePanel = document.querySelector('.sidebar__toggler');
    if (sidePanel){
      this.sidePanel = sidePanel;
      sidePanel.addEventListener('click', () => document.body.classList.toggle("is-collapsed-sidebar") , { signal });
    }
    
  }
  
  render() {
    // memo: compartibility method
    this.element = document.createElement('div');
  }
  
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  
  destroy() {
    this.remove();
    if (this.evntSignal) {
      this.evntSignal.abort();
    }       
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.element = null;
  }
}
  
export default SidePanel;