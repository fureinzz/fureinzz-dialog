import {LitElement, html} from 'lit-element'
import {focusManager} from './dialog-focus-manager'

export class DialogElement extends LitElement {
    constructor() {
        super()

        this.role = 'dialog'
        this.opened = false
        this.noBackdrop = false
        this.closeOnEsc = false
        this.closeOnOutsideClick = false
        this._hasAnimation = null
        this._canceled = null
        this._indexOfTab = -1
        
        this._captureKey = this._captureKey.bind(this)
        this._captureClick = this._captureClick.bind(this)
        this._captureFocus = this._captureFocus.bind(this)
        this._captureBlur = this._captureBlur.bind(this)
    }
    static get properties() {
        return {
            /** 
            * The `dialog` role is used to mark up an HTML based application dialog or window that separates content or UI from the rest of the web application or page.
            * @type {!string}
            * @public 
            */ 
            role: {type: String, reflect: true},

            /** 
            * Set opened to true to show the dialog component and to false to hide it.
            * @type {!boolean}
            * @public
            */ 
            opened: {type: Boolean,  attribute: 'opened', reflect: true},

            /** 
            * If true, the `backdrop` element will not be added to the DOM when the dialog opens 
            * @type {!boolean}
            * @public
            */ 
            noBackdrop: {type: Boolean,  attribute: 'no-backdrop', reflect: true},
            
            /** 
            * If true the dialog will be closed when you press `Esc`
            * @type {!boolean}
            * @public
            */ 
            closeOnEsc: {type: Boolean,  attribute: 'close-on-esc', reflect: true},
            
            /** 
            * If true the dialog will be closed when you click outside the element
            * @type {!boolean}
            * @public
            */ 
            closeOnOutsideClick: {type: Boolean,  attribute: 'close-on-outside-click', reflect: true},
            
            /** 
            * Does the component have animation or not
            * @type {?boolean}
            * @private
            */
            _hasAnimation: {type: Boolean},
            
            /** 
            * Reason for closing the dialog
            * @type {?boolean}
            * @private
            */ 
            _canceled: {type: Boolean},
            
            /** 
            * Index of the element that is located in the dialog and has `tabindex` > 0 
            * @type {number}
            * @private
            */ 
            _indexOfTab: {type: Number},
        }
    }
    render() {
        return html`
            <style>
                :host{
                    position: fixed;
                    display: flex; align-items: center; justify-content: center;
                    top: 0; left: 0; right: 0; bottom: 0;
                    height: 100%; width: 100%;
                }

                #dialog {
                    position: relative; 
                    z-index: 1000;

                    animation: var(--dialog-animation);
                    background: var(--dialog-background, #fff);
                    padding: var(--dialog-padding, 12px);
                    margin: var(--dialog-margin, 0);
                    width: var(--dialog-width, 520px);
                    height: var(--dialog-height, auto);
                    box-shadow: var(--dialog-boxShadow);
                    border-radius: var(--dialog-borderRadius, 5px);
                    max-height: var(--dialog-maxHeight);
                    max-width: var(--dialog-maxWidth);
                }
                #backdrop {
                    position: fixed;
                    z-index: 999;
                    top: 0; left: 0; right: 0; bottom: 0;
                    width: 100%; height: 100%;
                    background: var(--backdrop-background, #000);
                    opacity: var(--backdrop-opacity, .5)
                }

            </style>

            <div id="backdrop" part="backdrop"></div>
            <div id="dialog">
                <slot></slot>
            </div>
        `
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

    /** 
     * Focus-trap opens if the `Tab` or `Tab + Shift` key is pressed
     * @protected
     * @param   {!Event} event
     * @returns {void}
     **/ 
    _onTab(event) {
        event.preventDefault()
        
        const {shiftKey} = event

        //  All elements that have `tabindex` >= 0
        //  tabbableNodes = [{element: HTMLElement, tabIndex: Number}, ...]
        const tabbableNodes = focusManager.getTabbableNodes(this)

        // Tab + Shift
        if(shiftKey){
            this._indexOfTab--
            if(this._indexOfTab < 0) this._indexOfTab = tabbableNodes.length - 1
        } 
        // Tab
        else {
            this._indexOfTab++
            if(this._indexOfTab >= tabbableNodes.length) this._indexOfTab = 0
        }

        tabbableNodes[this._indexOfTab].element.focus()
    }

    /** 
     * Close the dialog when the `Esc` key is pressed
     * @protected 
     **/ 
    _onEsc() {
        if(this.closeOnEsc) {
            this.cancel()
        }
    }

    /** 
     * If true then dialog have a animation
     * @protected 
     * @returns {boolean}
     **/ 
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

    _captureClick(event) {
        const {path} = event

        // Close overlay when a click occurs outside the dialog 
        if(path[0].getAttribute('id') === 'backdrop' || path[0] === this) {
            if(this.closeOnOutsideClick) {
                this.cancel()
            }
        } else {
            for(let i = 0; i < path.length; i++) {
                if(path[i].hasAttribute('cancel-button') || path[i].hasAttribute('confirm-button')) {
                    path[i].hasAttribute('cancel-button') ? this.cancel() : this.confirm()
                    break;
                } else if(path[i].getAttribute('id') === 'dialog') break;
            }
        }
        
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
    
    // Backdrop

        /** 
         * Show the backdrop
         * @protected
         **/ 
        _openBackdrop(backdrop) {
            backdrop.removeAttribute('hidden')
        }

        /** 
         * Removing dackdrop
         * @protected 
         **/ 
        _closeBackdrop(backdrop) {
            backdrop.setAttribute('hidden', '')
        }

    // Observer's of properties 
        openedChanged() {
            this._hasAnimation = this._checkAnimation()

            if(this.opened) {
                this.style.display = ''
                this.initEventListeners()
            } else {
                if(!this._hasAnimation) this.style.display = 'none'
                this.removeEventListeners()
            }

            document.documentElement.style.overflow = this.opened ? 'hidden' : ''
            this.setAttribute('aria-hidden', !this.opened)
        }
        noBackdropChanged() {
            const backdrop = this.shadowRoot.querySelector('#backdrop')
            
            this.noBackdrop 
                ? this._closeBackdrop(backdrop) 
                : this._openBackdrop(backdrop)
        }

    // Lifecycle methods
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
        connectedCallback(){
            super.connectedCallback()
            
            this.addEventListener('animationend', this._animationEnd)
        }
        disconnectedCallback() {
            super.disconnectedCallback()

            // To remove all event listeners when the component is removed
                this.removeEventListener('animationend', this._animationEnd)
                this.removeEventListeners()
        }
        initEventListeners() {
            this.addEventListener('blur', this._captureBlur, true)
            this.addEventListener('focus', this._captureFocus, true)
            this.addEventListener('click', this._captureClick, true)
            document.addEventListener('keydown', this._captureKey, true)
        }
        removeEventListeners() {
            this.removeEventListener('blur', this._captureBlur, true)
            this.removeEventListener('focus', this._captureFocus, true)
            this.removeEventListener('click', this._captureClick, true)
            document.removeEventListener('keydown', this._captureKey, true)
        }
}

customElements.define('fureinzz-dialog', DialogElement)