const node = Element.prototype;
const matchesSelector = node.matches || node.oMatchesSelector || node.mozMatchesSelector ||
node.msMatchesSelector || node.webkitMatchesSelector || node.matchesSelector

class nodeFocusManager {
    /**
     * Focusable elements  
     * @type {Array}
     * @private
     **/ 
    _result = []


    /** 
     * Returns true if the element is visually accessible
     * @param {!HTMLElement} element 
     * @returns {Boolean}
     **/ 
    isVisible(element) {
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
    isFocusable(element) {
        const focusableElements = matchesSelector.call(element, 'button, textarea, input, select, object')
        const tabIndex = element.tabIndex >= 0

        
        return focusableElements || tabIndex
            ?  matchesSelector.call(element, ':not([disabled])')
            :  false 
    }

    /** 
     * Returns true if the element is available for focusing via `Tab` or `Tab + Shift`
     * @param {!HTMLElement} element
     * @returns {Boolean}
     * */ 
    isTabbable(element) {
        return this.isFocusable(element) && this.isVisible(element)
    }    

    /** 
     * Returns array of focusable elements
     * @param {!HTMLElement} element
     * @returns {Array} 
     * */ 
    getTabbableNodes(element) {
        this._result = []
        this.collectNodes(element)

        return this._result
    }

    /** 
     * A recursive function that finds all focusable elements inside the parent `element`
     * @param {!HTMLElement} element
     * @returns {void}
     * */ 
    collectNodes(element) {
        // Returns false if the element is not visible or the Element is not ELEMENT_NODE
        if(!this.isVisible(element) || element.nodeType !== Node.ELEMENT_NODE) return false
        
        if(this.isTabbable(element)) {
            this.pushNode(element)
        }

        const children = element.children
        if(children.length) {
            for(let i = 0; i < children.length; i++) {
                this.collectNodes(children[i])
            }
        }
    }

    /** 
     * Adding an element to a sorted array by inserting it
     * @param {!HTMLElement} element
     * @returns {void}
     * */ 
    pushNode(element) {
        const tabIndex = element.tabIndex

        const {left, right} = this.sortNodes(tabIndex)
        this._result = [...left, {element, tabIndex}, ...right]
    }

    /** 
     * Returns the two parts of the original array `_result`
     * @param {!Number} value
     * @param {?Number} firstValueOfArray
     * @returns {Object}
     * */ 
    sortNodes(value, firstValueOfArray = this._result.length ? this._result[0].tabIndex : null) {
        let left = [], right = [] 

        // if `firstValueOfArray` === null, the new element is the first in the array
        if(firstValueOfArray === null) return {left, right}
        if(value <= firstValueOfArray) {
            const indexOfnewFirstValue = this.lastIndex(firstValueOfArray) + 1
            
            return indexOfnewFirstValue > this._result.length - 1
                ? {left: this._result, right}
                : this.sortNodes(value, this._result[indexOfnewFirstValue].tabIndex)
        } else {
            const indexOfFirstValue = this.firstIndex(firstValueOfArray)

            left  = this._result.slice(0, indexOfFirstValue)
            right = this._result.slice(indexOfFirstValue)

            return {left, right}
        }
    }

    lastIndex(value) {
        return this._result.map(item => item.tabIndex).lastIndexOf(value)
    }
    firstIndex(value) {
        return this._result.map(item => item.tabIndex).indexOf(value)
    }
}

export const focusManager = new nodeFocusManager()