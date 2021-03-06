# &lt;fureinzz-dialog&gt;

[![npm](https://img.shields.io/npm/v/@fureinzz/fureinzz-dialog?style=flat-square)](https://www.npmjs.com/package/@fureinzz/fureinzz-dialog)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg?style=flat-square)](https://www.webcomponents.org/element/@fureinzz/fureinzz-dialog)
![license](https://img.shields.io/github/license/fureinzz/fureinzz-dialog?style=flat-square)


**Creates a easily customizable and accessible component that adds a UI dialog element.**

+ **Accessible** -  When opening a dialog, the focus falls inside the dialog. When the dialog is closed, the focus is restored to the block that opened the component. You can also close the dialog by pressing Esc.

+ **Works with any framework** - the component is based on the native `customElements` technology, which makes it possible to use it together with any library or framework

+ **Works with [Shadow DOM](http://https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM "Shadow DOM")** - Dialog works by using the modern technology of Shadow DOM. This approach improves the experience of using web components
+ **Built using  [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/#dialog_modal)** - Building using Aria attributes and focus trap
+ **light weight** - the volume of the dialog box is **[35.5 KB](https://www.npmjs.com/package/@fureinzz/fureinzz-dialog)**

## Installation 

We recommend using [npm](https://www.npmjs.com/package/@fureinzz/fureinzz-dialog) for installation

```
npm install @fureinzz/fureinzz-dialog
```

## Usage
Before using the dialog you must import the component module: ( `import "@fureinzz/fureinzz-dialog"` ).  After adding the module, you can use `fureinzz-dialog` in your app


To open the dialog, you can specify the `opened` attribute for the html element
```html
<fureinzz-dialog opened>
    <div> Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
</fureinzz-dialog>
```

Alternatively you can open the dialog using the `opened` property or using the `open()` method
```javascript
const dialog = document.querySelector("fureinzz-dialog")
dialog.open()
```

## Styling

You can use CSS variables to styling the dialog more pointwise. All available variables are listed [here](#CSS-variables)

You can also easily change the position of the dialog. Since the component is positioned relative to the parent, you can specify any location for the element using `flexbox` or `grid`

## Properties 

When initializing a component each of the properties presented is false by default

+ **opened** -  If `true` the dialog will be opened otherwise closed 
+ **noCloseOnOutsideClick** - If it is `false` the dialog will be closed when you click outside of its zone
+ **noCloseOnEsc** - If `false` the dialog will be closed when you press `Esc` 
+ **noBackdrop** - If it is `true` then the backdrop will be hidden

**Example of how you can set a property in an html file:**
```html
<fureinzz-dialog opened no-close-on-esc no-bakcdrop>
    <div> Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
</fureinzz-dialog>
```

## Events 
The dialog can dispatch 3 types of events to the external environment

+ **open** - Event that is dispatched when opening the dialog
+ **close** - An event that is dispatched when the user clicks outside the dialog area or press on Ecs. This event can be canceled using `event.preventDefault()`
+ **cancel** - Event that is dispatched when clicking on buttons contained inside the dialog with the *cancel-button* or *confirm-button* attribute. The event can also be called using the `.cancel()` and `.confirm()` methods. In the body `event.detail` contains the result of `{canceled: ...}`

```javascript
    const dialog = document.querySelector("fureinzz-dialog")

    dialog.addEventListener("cancel", event => {
        const detail = event.detail
       
       // If a button with the `cancel-button` attribute was clicked
        console.log(detail) // {canceled: true}
    })
```

## CSS-variables

Here are all the css properties that you can manipulate to change the appearance of both the dialog and the background

**Dialog:**
+ *--dialog-padding*
+ *--dialog-background*
+ *--dialog-margin*
+ *--dialog-width*
+ *--dialog-height*
+ *--dialog-max-height*
+ *--dialog-max-width*
+ *--dialog-box-shadow*
+ *--dialog-border-radius*

**Backdrop:**

+ *--backdrop-background*
+ *--backdrop-opacity*
