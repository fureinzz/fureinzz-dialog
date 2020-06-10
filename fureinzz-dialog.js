import {LitElement, html} from 'lit-element'
import '@fureinzz/fureinzz-backdrop'

class DialogElement extends LitElement {
    constructor() {
        super()

        this.opened = false
        this.noBackdrop = false
        this.closeOnEsc = false
        this.closeOnOutsideClick = false
        this._hasAnimation = null
        this._canceled = null
        this._indexOfTab = -1
        this._backdrop = document.createElement('fureinzz-backdrop')
    }
    static get properties() {
        return {
            _hasAnimation: {type: Boolean},
            _canceled: {type: Boolean},
            _indexOfTab: {type: Number},
            _backdrop: {type: HTMLElement},
            opened: {type: Boolean,  attribute: 'opened', reflect: true},
            noBackdrop: {type: Boolean,  attribute: 'no-backdrop', reflect: true},
            closeOnEsc: {type: Boolean,  attribute: 'close-on-esc', reflect: true},
            closeOnOutsideClick: {type: Boolean,  attribute: 'close-on-outside-click', reflect: true},
        }
    }
    render() {
        return html`
            <style>
                :host{
                    background-color: #fff;
                    display: block;
                    z-index: 1000; 
                    position: fixed;
                    top: 50%; left: 50%; 
                    transform: translate(-50%, -50%)
                }
            </style>
            <slot></slot>`
    }
    open() { 
        this.opened = true 
    }
    close() { 
        this.opened = false
    }

    _openBackdrop() {
        document.body.appendChild(this._backdrop)
        this._backdrop.open()
    }
    _closeBackdrop() {
        this._backdrop.close()
    }
    updated(changedProperties) {
        changedProperties.forEach((oldValue, property) => {
            switch (property) {
                case 'opened':
                    this.openedChanged()
                    break;
                case 'noBackdrop':
                    this.noBackdropChanged()
                    break;
            }
        });
    }
}

customElements.define('fureinzz-dialog', DialogElement)