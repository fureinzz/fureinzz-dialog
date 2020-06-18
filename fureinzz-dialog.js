import {LitElement} from 'lit-element'
import {focusManager} from './src/focus-manager'
import {template} from './src/template'

export class DialogElement extends LitElement {
    constructor() {
        super()
        
        // Initializing the component template
        this.shadowRoot.append(template.content.cloneNode(true))

        this.$backdrop = this.shadowRoot.querySelector('#backdrop')
        this.$scrollableContainer = document.documentElement

        this.role = 'dialog'
        this.opened = false
        this.noBackdrop = false
        this.closeOnEsc = false
        this.closeOnOutsideClick = false
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
            * Index of the element that is located in the dialog and has `tabindex` > 0 
            * @type {number}
            * @private
            */ 
            _indexOfTab: {type: Number},
        }
    }

    open() { 
        this.opened = true 
    }
    close() { 
        this.opened = false
    }
    confirm() {
        this.close()
        this.dispatchEvent( new CustomEvent('state-changed', {detail: {canceled: false}}))
    }
    cancel() {
        this.close()
        this.dispatchEvent( new CustomEvent('state-changed', {detail: {canceled: true}}))
    }

    /** 
     * Focus-trap opens if the `Tab` or `Tab + Shift` key is pressed
     * @protected
     * @param   {!Event} event
     * @returns {void}
     **/ 
    onTab(event) {
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
    onEsc(event) {
        if(this.closeOnEsc) {
            this.cancel()

            // If there are more dialogs we don't close them
            event.stopImmediatePropagation()
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

        switch (event.code) {
            case "Escape":
                this.onEsc(event)
                break;
            case "Tab":
                this.onTab(event)
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
    
    

    /** 
     * Show the backdrop
     * @protected
     **/ 
    openBackdrop() {
        this.$backdrop.removeAttribute('hidden')
    }

    /** 
     * Hide the dackdrop
     * @protected 
     **/ 
    closeBackdrop() {
        this.$backdrop.setAttribute('hidden', '')
    }

    openedChanged() {
        let hasAnimation = this._checkAnimation()

        if(this.opened) {
            // Save the current active element so that we can restore focus when the dialog is closed.
            // If there is an active element then remove the focus when the dialog opens
            this.$activeElement = document.activeElement == document.body ? null : document.activeElement
            if(this.$activeElement) this.$activeElement.blur()            
            
            this.style.display = '' 
            this.initEventListeners()

        } else {
            // If there is an active element, we return the focus to it when the dialog is closed
            if(this.activeElement) this.activeElement.focus()            
            
            if(!hasAnimation) this.style.display = 'none'
            this.removeEventListeners()
        }

        // Blocking scrolling in the container in order to avoid scrolling the external content
        this.$scrollableContainer.style.overflow = this.opened ? 'hidden' : ''
        
        // Set aria attributes
        this.setAttribute('aria-hidden', !this.opened)
    }

    noBackdropChanged() {
        this.noBackdrop 
            ? this.closeBackdrop() 
            : this.openBackdrop()
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