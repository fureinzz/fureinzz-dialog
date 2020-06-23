const matchesSelector = Element.prototype.matches 

interface tabbableNodes {
    element: HTMLElement,
    tabIndex: number
}

type tabbableNode = Array<tabbableNodes>

class nodeFocusManager {
    /**
     * Focusable elements  
     * @type {Array}
     * @private
     **/ 
    protected nodes: tabbableNode = []


    /** 
     * Returns true if the element is visually accessible
     * @param {!HTMLElement} element 
     * @returns {Boolean}
     **/ 
    isVisible (element: HTMLElement): boolean {
        const {display, visibility} = element.style
        
        if(display !== 'none' && visibility !== 'hidden') {
            const {display, visibility} = getComputedStyle(element)
            return display !== 'none' && visibility !== 'hidden'
        }

        return false
    }

    /** 
     * Returns true if the element is available for focus
     * @param {!HTMLElement} element
     * @returns {Boolean}
     * */ 
    isFocusable (element: HTMLElement): boolean {
        const focusableElements: boolean = matchesSelector.call(element, 'button, textarea, input, select, object')
        const tabIndex: boolean = element.tabIndex >= 0

        
        return focusableElements || tabIndex
            ?  matchesSelector.call(element, ':not([disabled])')
            :  false 
    }

    /** 
     * Returns true if the element is available for focusing via `Tab` or `Tab + Shift`
     * @param {!HTMLElement} element
     * @returns {Boolean}
     * */ 
    isTabbable (element: HTMLElement): boolean {
        return this.isFocusable(element) && this.isVisible(element)
    }    

    /** 
     * Returns array of focusable elements
     * @param {!HTMLElement} element
     * @returns {Array} 
     * */ 
    getTabbableNodes (element: HTMLElement): tabbableNode {
        this.nodes = []
        this.collectNodes(element)

        return this.nodes
    }

    /** 
     * A recursive function that finds all focusable elements inside the parent `element`
     * @param {!HTMLElement} element
     * @returns {void}
     * */ 
    collectNodes (element: HTMLElement): void {
        // Returns false if the element is not visible or the Element is not ELEMENT_NODE
        if(this.isVisible(element) || element.nodeType == Node.ELEMENT_NODE) {
            if(this.isTabbable(element)) {
                this.pushNode(element)
            }

            const children = element.children
            if(children.length) {
                for(let i = 0; i < children.length; i++) {
                    this.collectNodes(children[i] as HTMLElement)
                }
            }            
        }
    }

    /** 
     * Adding an element to a sorted array by inserting it
     * @param {!HTMLElement} element
     * @returns {void}
     * */ 
    pushNode (element: HTMLElement) {
        const tabIndex = element.tabIndex

        const {left, right} = this.sortNodes(tabIndex)
        this.nodes = [...left, {element, tabIndex}, ...right]
    }

    /** 
     * Returns the two parts of the original array `_result`
     * @param {!Number} value
     * @param {?Number} firstValueOfArray
     * @returns {Object}
     * */ 
    sortNodes (value: number, firstValueOfArray: number | null = this.nodes.length ? this.nodes[0].tabIndex : null): {left: tabbableNode, right: tabbableNode} {
        let left: tabbableNode = [], right: tabbableNode = [] 

        // if `firstValueOfArray` === null, the new element is the first in the array
        if(firstValueOfArray === null) return {left, right}
        if(value <= firstValueOfArray) {
            const indexOfnewFirstValue = this.lastIndex(firstValueOfArray) + 1
            
            return indexOfnewFirstValue > this.nodes.length - 1
                ? {left: this.nodes, right}
                : this.sortNodes(value, this.nodes[indexOfnewFirstValue].tabIndex)
        } else {
            const indexOfFirstValue = this.firstIndex(firstValueOfArray)

            left  = this.nodes.slice(0, indexOfFirstValue)
            right = this.nodes.slice(indexOfFirstValue)

            return {left, right}
        }
    }

    lastIndex (value: number): number {
        return this.nodes.map(item => item.tabIndex).lastIndexOf(value)
    }
    firstIndex (value: number): number {
        return this.nodes.map(item => item.tabIndex).indexOf(value)
    }
}

export const focusManager = new nodeFocusManager()