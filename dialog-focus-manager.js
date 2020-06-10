const node = Element.prototype;
const matchesSelector = node.matches || node.oMatchesSelector || node.mozMatchesSelector ||
node.msMatchesSelector || node.webkitMatchesSelector || node.matchesSelector

class nodeFocusManager {
    result = []

}

export const focusManager = new nodeFocusManager()