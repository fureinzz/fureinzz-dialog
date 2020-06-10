import {LitElement, html} from 'lit-element'
import '@fureinzz/fureinzz-backdrop'

class DialogElement extends LitElement {
    constructor() {
        super()

        this.opened = false
        this.noBackdrop = false
        this.closeOnEsc = false
        this.closeOnOutsideClick = false
    }
    static get properties() {
        return {
            opened: {type: Boolean,  attribute: 'opened', reflect: true},
            noBackdrop: {type: Boolean,  attribute: 'no-backdrop', reflect: true},
            closeOnEsc: {type: Boolean,  attribute: 'close-on-esc', reflect: true},
            closeOnOutsideClick: {type: Boolean,  attribute: 'close-on-outside-click', reflect: true},
        }
    }
}

customElements.define('fureinzz-dialog', DialogElement)