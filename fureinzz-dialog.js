import {LitElement} from 'lit-element'
import {focusManager} from './src/focus-manager'
import {template} from './src/template'

export class fureinzzDialog extends LitElement {
    constructor() {
        super()
        this.role = 'dialog'
        this.opened = false
        this.noBackdrop = false
        this.closeOnEsc = false
        this.closeOnOutsideClick = false
        this._indexOfTab = -1
        
        // Initializing the component template
        this.shadowRoot.append(template.content.cloneNode(true))

        this.$backdrop = this.shadowRoot.querySelector('#backdrop')
        this.$scrollableContainer = document.documentElement
        
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClick = this.onClick.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
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
     * Checks whether the dialog has animation
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
    onAnimationEnd() {
        if(this.opened === false) this.style.display = 'none'
    }
    onClick(event) {
        const {path} = event

        // Close overlay when a click occurs outside the dialog 
        if(path[0].getAttribute('id') === 'backdrop' || path[0] === this) {
            if(this.closeOnOutsideClick) {
                this.cancel()
            }
        } else {
            for(let i = 0; i < path.length; i++) {
                // If the element has the `cancel-button` or `confirm-button` attribute then the dialog will be closed
                if(path[i].hasAttribute('cancel-button') || path[i].hasAttribute('confirm-button')) {
                    path[i].hasAttribute('cancel-button') ? this.cancel() : this.confirm()
                    break;
                } else if(path[i].getAttribute('id') === 'dialog') break;
            }
        }
        
    }    
    onKeyDown(event) {

        switch (event.code) {
            case "Escape":
                this.onEsc(event)
                break;
            case "Tab":
                this.onTab(event)
                break;
        }
    }
    onFocus(event) {
        const {target} = event

        // tabbableNodes = [{element: HTMLElement, tabindex: Number}, ...] => [element, ...]
        const tabbableNodes = focusManager.getTabbableNodes(this).map(item => item.element)
        // Set the index for the element that is in focus
        this._indexOfTab = tabbableNodes.indexOf(target)
    }
    onBlur(event) {
        const {relatedTarget} = event

        // Reset focus if the user clicked outside of the focused element
        if(relatedTarget === null) this._indexOfTab = -1
    }
    /** 
     * Show the backdrop
     **/ 
    openBackdrop() {
        this.$backdrop.removeAttribute('hidden')
    }
    /** 
     * Hide the backdrop
     **/ 
    closeBackdrop() {
        this.$backdrop.setAttribute('hidden', '')
    }
    openedChanged() {
        let hasAnimation = this._checkAnimation()

        if(this.opened) {
            // Save the current active element so that we can restore focus when the dialog is closed.
            this.$activeElement = document.activeElement == document.body ? null : document.activeElement
            
            // If there is an active element then remove the focus when the dialog opens
            if(this.$activeElement) this.$activeElement.blur()            
            
            this.style.display = '' 
            this.addEventListeners()

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
        
        this.addEventListener('animationend', this.onAnimationEnd)
    }
    disconnectedCallback() {
        super.disconnectedCallback()

        // To remove all event listeners when the component is removed
            this.removeEventListener('animationend', this.onAnimationEnd)
            this.removeEventListeners()
    }
    addEventListeners() {
        this.addEventListener('blur', this.onBlur, true)
        this.addEventListener('focus', this.onFocus, true)
        this.addEventListener('click', this.onClick, true)
        document.addEventListener('keydown', this.onKeyDown, true)
    }
    removeEventListeners() {
        this.removeEventListener('blur', this.onBlur, true)
        this.removeEventListener('focus', this.onFocus, true)
        this.removeEventListener('click', this.onClick, true)
        document.removeEventListener('keydown', this.onKeyDown, true)
    }
}

customElements.define('fureinzz-dialog', fureinzzDialog)