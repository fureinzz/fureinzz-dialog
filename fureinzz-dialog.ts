import {LitElement} from 'lit-element'
import {focusManager} from './src/focus-manager'
import {template} from './src/template'

/** 
 *  `fureinzz-dialog` is an easily customizable and accessible component that adds a UI dialog element.  
 *  The component uses modern shadow-dom technology that allows you to encapsulate styles from the external environment and improves the user experience. 
 *  
 *  @author fureinzz
 **/ 
export class fureinzzDialog extends LitElement {

    public role: string = 'dialog'
    public opened: boolean = false
    public noCloseOnOutsideClick: boolean = false
    public noCloseOnEsc: boolean = false
    public noBackdrop: boolean = false

    protected indexTab: number = 0
    protected $backdrop: HTMLElement
    protected $scrollableContainer: HTMLElement = document.documentElement
    protected $activeElement: HTMLElement | null = null

    constructor () {
        super()

        // Initializing the component template
        this.shadowRoot!.append(template.content.cloneNode(true))
        this.$backdrop = this.shadowRoot!.querySelector('#backdrop') as HTMLElement

        this.onKeyDown = this.onKeyDown.bind(this)
        this.onClick = this.onClick.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    static get properties () {
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
            * If false the dialog will be closed when you press `Esc`
            * @type {!boolean}
            * @public
            */ 
            noCloseOnEsc: {type: Boolean,  attribute: 'no-close-on-esc', reflect: true},
            
            /** 
            * If false the dialog will be closed when you click outside the element
            * @type {!boolean}
            * @public
            */ 
            noCloseOnOutsideClick: {type: Boolean,  attribute: 'no-close-on-outside-click', reflect: true},

            /** 
            * Index of the element that is located in the dialog and has `tabindex` > 0 
            * @type {number}
            * @private
            */ 
            indexTab: {type: Number},
        }
    }

    /** Open the dialog */ 
    open (): void { 
        this.opened = true 
    }
    
    /** Close the dialog */ 
    close (): void { 
        this.opened = false
    }

    confirm (): void {
        this.close()

        // Dispatching an event for the external environment
        // The result of user selection is added to the event's `detail` property
        this.dispatchEvent(new CustomEvent('state-changed', {detail: {canceled: false}}))
    }

    cancel (): void {
        this.close()

        // Dispatching an event for the external environment
        // The result of user selection is added to the event's `detail` property
        this.dispatchEvent(new CustomEvent('state-changed', {detail: {canceled: true}}))
    }

    /** 
     * Focus-trap opens if the `Tab` or `Tab + Shift` key is pressed
     **/ 
    onTab (event: KeyboardEvent): void {
        // If the backdrop is visible then focus-trap is activated
        if (!this.noBackdrop) {
            const {shiftKey} = event

            // Cancel focusing on elements outside the dialog box
            event.preventDefault()
            
            // All elements that have `tabindex` >= 0 and are located inside the dialog
            // tabbableNodes = [{element: HTMLElement, tabIndex: Number}, ...]
            const tabbableNodes = focusManager.getTabbableNodes(this)
            
            // If true, the Shift + Tab combination is pressed, otherwise Tab
            shiftKey ? this.indexTab-- : this.indexTab++
            
            if (this.indexTab - tabbableNodes.length > 1) {
                this.indexTab = 1
            }
            if (this.indexTab < 0) {
                this.indexTab = tabbableNodes.length
            }

            if (tabbableNodes[this.indexTab - 1]) {
                tabbableNodes[this.indexTab - 1].element.focus()
            } else {
                document.activeElement.blur()
            }
        }
    }

    /** 
     * Close the dialog when the `Esc` key is pressed
     **/ 
    onEsc (event: KeyboardEvent): void {
        if (!this.noCloseOnEsc) {
            this.cancel()

            // If there are more dialogs we don't close them
            event.stopImmediatePropagation()
        }
    }

    /** 
     * Checks whether the dialog has animation
     **/ 
    hasAnimation (): boolean {
        const {animationDuration} = this.style
        
        if (animationDuration == '') {
            const {animationDuration} = getComputedStyle(this)
            
            if (animationDuration !== '0s') return true
        }

        return false
    }

    onClick (event: any): void {
        const {path} = event

        // Close overlay when a click occurs outside the dialog 
        if (path[0].getAttribute('id') === 'backdrop' || path[0] === this) {
            if (!this.noCloseOnOutsideClick) {
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

    onFocus (event: FocusEvent): void {
        const {target} = event

        // tabbableNodes = [{element: HTMLElement, tabindex: Number}, ...] => [element, ...]
        const tabbableNodes = focusManager.getTabbableNodes(this).map(item => item.element)
        // Set the index for the element that is in focus
        this.indexTab = tabbableNodes.indexOf(target as HTMLElement) + 1
    }

    onBlur (event: FocusEvent): void {
        const {relatedTarget} = event

        // Reset focus if the user clicked outside of the focused element
        if (relatedTarget === null) {
            this.indexTab = 0
        }
    }

    openedChanged (): void {
        let hasAnimation = this.hasAnimation()
        let event = this.opened ? 'open' : 'close'

        if (this.opened) {
            // Save the current active element so that we can restore focus when the dialog is closed.
            this.$activeElement = document.activeElement == document.body ? null : document.activeElement as HTMLElement
            
            // If there is an active element then remove the focus when the dialog opens
            if(this.$activeElement) this.$activeElement.blur()            
            
            this.style.display = '' 
            this.addEventListeners()

        } else {
            // If there is an active element, we return the focus to it when the dialog is closed
            if(this.$activeElement) this.$activeElement.focus()            
            
            // If there is no animation in the dialog then hide the component
            if(!hasAnimation) this.style.display = 'none'
            this.removeEventListeners()
        }

        // Blocking scrolling in the container in order to avoid scrolling the external content
        this.$scrollableContainer.style.overflow = this.opened ? 'hidden' : ''
        
        // Set aria attributes
        this.setAttribute('aria-hidden', String(!this.opened))

        // Dispatching an event when the state changes
        this.dispatchEvent(new CustomEvent(event))
    }

    noBackdropChanged (): void {
        // Hide or Show backdrop
        this.$backdrop.toggleAttribute('hidden', this.noBackdrop)
    }

    onKeyDown (event: KeyboardEvent): void {
        switch (event.code) {
            case "Escape":
                this.onEsc(event)
                break;
            case "Tab":
                this.onTab(event)
                break;
        }
    }

    updated (changedProperties: any): void {
        changedProperties.forEach((oldValue: unknown, property: string) => {
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
    
    onAnimationEnd (): void {
        // If the element has animation and it closes then remove it from view
        if(this.opened === false) this.style.display = 'none'
    }

    connectedCallback (): void {
        super.connectedCallback()

        // instant closing of the dialog without animation when the page is reloaded
        this.style.display = 'none'

        this.addEventListener('animationend', this.onAnimationEnd)
    }

    disconnectedCallback (): void {
        super.disconnectedCallback()

        // To remove all event listeners when the component is removed
        this.removeEventListener('animationend', this.onAnimationEnd)
        this.removeEventListeners()
    }

    /** Adds the necessary event listeners for the element */ 
    addEventListeners (): void {
        this.addEventListener('blur', this.onBlur, true)
        this.addEventListener('focus', this.onFocus, true)
        this.addEventListener('click', this.onClick, true)
        document.addEventListener('keydown', this.onKeyDown, true)
    }
    
    /** Deletes all event listeners. 
     *  Used to prevent possible memory leaks 
     **/ 
    removeEventListeners (): void {
        this.removeEventListener('blur', this.onBlur, true)
        this.removeEventListener('focus', this.onFocus, true)
        this.removeEventListener('click', this.onClick, true)
        document.removeEventListener('keydown', this.onKeyDown, true)
    }
}

customElements.define('fureinzz-dialog', fureinzzDialog)