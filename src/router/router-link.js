export const ROUTER_LINK = 'router-link';
export const EVENT_ROUTE_CHANGE = 'route-change';

export class RouterLink extends HTMLAnchorElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener(
      'click',
      e => {
        e.preventDefault();
        e.stopPropagation();
        const event = new CustomEvent(EVENT_ROUTE_CHANGE, {
          /*composed: true,*/
          bubbles: true,
          detail: { link: this }
        });

        this.dispatchEvent(event);
      },
      true
    );
  }
}
