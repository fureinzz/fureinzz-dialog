# &lt;fureinzz-dialog&gt;

[![npm](https://img.shields.io/npm/v/@fureinzz/fureinzz-dialog?style=flat-square)](https://www.npmjs.com/package/@fureinzz/fureinzz-dialog)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg?style=flat-square)](https://www.webcomponents.org/element/@fureinzz/fureinzz-dialog)
![license](https://img.shields.io/github/license/fureinzz/fureinzz-dialog?style=flat-square)


**Creates a easily customizable and accessible component that adds a UI dialog element.**

+ **Accessible** -  When opening a dialog, the focus falls inside the dialog. When the dialog is closed, the focus is restored to the block that opened the component. You can also close the dialog by pressing Esc.
+ **Works with [Shadow DOM](http://https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM "Shadow DOM")** - Dialog works by using the modern technology of Shadow DOM. This approach improves the experience of using web components
+ **Built using  [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/#dialog_modal)** - Building using Aria attributes and focus trap
+ **light weight** - the volume of the dialog box is [35.5 KB](https://www.npmjs.com/package/@fureinzz/fureinzz-dialog)


## [Usage](#-installation)
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
dialog.open() //** or dialog.opened = true */ 
```

## Styling

You can use CSS variables to styling the dialog more pointwise. All available variables are listed [here](#-installation)