const node = Element.prototype;
const matchesSelector = node.matches || node.oMatchesSelector || node.mozMatchesSelector ||
node.msMatchesSelector || node.webkitMatchesSelector || node.matchesSelector

class nodeFocusManager {
    result = []

    getTabbableNodes(node) {
        this.result = []
        
        this.collectNodes(node)
        return this.result
    }
    isVisible(element) {
        const {display, visibility} = element.style
        
        if(display !== 'none' && visibility !== 'hidden') {
            const {display, visibility} = getComputedStyle(element)
            return display !== 'none' && visibility !== 'hidden'
        }

        return false
    }
    isFocusable(element) {
        const focusableElements = matchesSelector.call(element, 'button, textarea, input, select, object')
        const tabIndex = element.tabIndex >= 0

        
        return focusableElements || tabIndex
            ?  matchesSelector.call(element, ':not([disabled])')
            :  false 
    }
    isTabbable(element) {
        return this.isFocusable(element) && this.isVisible(element)
    }
    collectNodes(element) {
        if(element.nodeType !== Node.ELEMENT_NODE) return false
        if(this.isVisible(element) === false) return false

        if(this.isTabbable(element)) {this.pushNode(element)}

        const children = element.children
        if(children.length) {
            for(let i = 0; i < children.length; i++) {
                this.collectNodes(children[i])
            }
        }
    }
    pushNode(element) {
        const tabIndex = element.tabIndex

        const {left, right} = this.sortNodes(tabIndex)
        this.result = [...left, {element, tabIndex}, ...right]
    }
    sortNodes(value, firstValueOfArray = this.result.length ? this.result[0].tabIndex : null) {
        let left = [], right = [] 

        if(firstValueOfArray === null) return {left, right}
        if(value <= firstValueOfArray) {
            const indexOfnewFirstValue = this.lastIndex(firstValueOfArray) + 1
            
            return indexOfnewFirstValue > this.result.length - 1
                ? {left: this.result, right}
                : this.sortNodes(value, this.result[indexOfnewFirstValue].tabIndex)
        } else {
            const indexOfFirstValue = this.firstIndex(firstValueOfArray)

            left  = this.result.slice(0, indexOfFirstValue)
            right = this.result.slice(indexOfFirstValue)

            return {left, right}
        }
    }
    lastIndex(value) {
        return this.result.map(item => item.tabIndex).lastIndexOf(value)
    }
    firstIndex(value) {
        return this.result.map(item => item.tabIndex).indexOf(value)
    }
}

export const focusManager = new nodeFocusManager()