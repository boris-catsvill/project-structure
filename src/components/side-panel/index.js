class SidePanel {
  element;
  subElements;
  prevLink;

  onToggle = event => {
    const target = event.target.closest('.sidebar__nav_bottom');
    if (target) {
      document.body.classList.toggle('is-collapsed-sidebar');
    }
  };
  onRoute = () => {
    Object.values(this.subElements).some(element => {
      if (
        location.pathname === element.getAttribute('href') ||
        (element.getAttribute('href').length > 1 &&
          location.pathname.includes(element.getAttribute('href')))
      ) {
        const closest = element.closest('li');

        if (this.prevLink) this.prevLink.classList.remove('active');
        closest.classList.add('active');

        this.prevLink = closest;

        return true;
      }
    });
  };
  constructor(title = '', list = [], toggleBtnName = 'Toggle sidebar') {
    this.title = title;
    this.list = list;
    this.toggleBtnName = toggleBtnName;

    this.render();
  }
  get template() {
    return `
			<aside class="sidebar">
				<h2 class="sidebar__title">
					<a href="/">${this.title}</a>
				</h2>
				<ul class="sidebar__nav">
					${this.list
            .map(({ path, id, text }) => {
              return `
								<li>
									<a href="/${path}" data-page="${id}">
										<i class="icon-${id}"></i>
										<span>${text}</span>
									</a>
								</li>
							`;
            })
            .join('')}
				</ul>
				<ul class="sidebar__nav sidebar__nav_bottom">
        	<li>
        	  <button type="button" class="sidebar__toggler">
        	    <i class="icon-toggle-sidebar"></i> 
							<span>${this.toggleBtnName}</span>
        	  </button>
        	</li>
      	</ul>
			</aside>
		`;
  }
  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.events('add');
  }
  events(type) {
    this.element[`${type}EventListener`]('pointerup', this.onToggle);
    document[`${type}EventListener`]('route', this.onRoute);
  }
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-page]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.page] = subElement;

      return acc;
    }, {});
  }
  remove() {
    if (this.element) this.element.remove();
  }
  destroy() {
    this.remove();
    this.events('remove');
    this.element = null;
    this.subElements = null;
  }
}

export default SidePanel;
