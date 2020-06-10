const node = Element.prototype;
const matchesSelector = node.matches || node.oMatchesSelector || node.mozMatchesSelector ||
node.msMatchesSelector || node.webkitMatchesSelector || node.matchesSelector

class nodeFocusManager {
    result = []

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
    lastIndex(value) {
        return this.result.map(item => item.tabIndex).lastIndexOf(value)
    }
    firstIndex(value) {
        return this.result.map(item => item.tabIndex).indexOf(value)
    }
}

export const focusManager = new nodeFocusManager()