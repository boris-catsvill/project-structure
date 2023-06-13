import { CUSTOM_EVENTS } from '../constants';

export const ROUTER_LINK = 'router-link';

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
        const event = new CustomEvent(CUSTOM_EVENTS.RouteChange, {
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
