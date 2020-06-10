import {LitElement, html} from 'lit-element'
import {focusManager} from './dialog-focus-manager'
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

        this._captureKey = this._captureKey.bind(this)
        this._captureClick = this._captureClick.bind(this)
        this._captureFocus = this._captureFocus.bind(this)
        this._captureBlur = this._captureBlur.bind(this)
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
    confirm() {
        this._canceled = false
        this.close()
        
        this.dispatchEvent( new CustomEvent('state-changed', {detail: {canceled: this._canceled}}))
    }
    cancel() {
        this._canceled = true
        this.close()

        this.dispatchEvent( new CustomEvent('state-changed', {detail: {canceled: this._canceled}}))
    }
    _checkAnimation() {
        const {animationDuration} = this.style
        
        if(animationDuration == '') {
            const {animationDuration} = getComputedStyle(this)
            
            if(animationDuration !== '0s') return true
        }

        return false
    }
    _animationEnd() {
        if(this.opened === false) this.style.display = 'none'
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
    _captureClick(event) {
        const {target} = event

        // Close overlay when a click occurs outside the dialog 
        if(this.contains(target) === false) {
            if(this.closeOnOutsideClick) this.cancel()
        } 
        else this._searchButton(target) 
        
    }  
    _captureKey(event) {
        const {key} = event
        
        switch(key) {
            case 'Escape':
                this._onEsc()
                break;
            case 'Tab':
                this._onTab(event)
                break;
        }
    }
    _captureFocus(event) {
        const {target} = event

        // tabbableNodes = [{element: HTMLElement, tabindex: Number}, ...] => [element, ...]
        const tabbableNodes = focusManager.getTabbableNodes(this).map(item => item.element)
        this._indexOfTab = tabbableNodes.indexOf(target)
    }
    _captureBlur(event) {
        const {relatedTarget} = event

        // Reset focus if the user clicked outside of the focused element
        if(relatedTarget === null) this._indexOfTab = -1
    }
    noBackdropChanged() {
        if(this.opened) {
            this.noBackdrop ? this._closeBackdrop() : this._openBackdrop()
        }
    }
    connectedCallback(){
        super.connectedCallback()
        
        this.setAttribute('role', 'dialog')
        this.addEventListener('animationend', this._animationEnd)
    }
}

customElements.define('fureinzz-dialog', DialogElement)