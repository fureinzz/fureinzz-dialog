# &lt;fureinzz-dialog&gt;

`<fureinzz-dialog>` is a modern dialog component that provides an extended set of functions for interacting with the user interface. The component implements a focus trap, so when opening a dialog box, the focus will only be directed to the dialog box elements. You can also change the state of the dialog box by assigning the`cancel-button` or `confirm-button` attribute to a button inside the component. When you click this button, the `state-changed` event will appear and the dialog box will close.

**Example:**
```html
<fureinzz-dialog opened>
  <div>
    <span> Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
  </div>
</fureinzz-dialog>
```

## Styling
If you want to animate a dialog use the Web Animation API

**Example:**

```css
    @keyframes fadeIn {
      from {opacity: 0}
      to   {opacity: 1}
    }
    fureinzz-dialog[opened] {animation: fadeIn .3s ease forwards}
```


## Properties
| Property | type | Description | Default |
| --- | --- | --- | --- |
| `opened` | Boolean | Set **true** to show object contents | `false` |
| `noBackdrop` | Boolean | Set **true** to disable backdrop overlay  | `false` |
| `closeOnOustideClick` | Boolean | If  **true**, the dialog will be closed if you click outside of its zone| `false` |
| `closeOnEsc` | Boolean | If **true**, pressing `Esc` will close the dialog| `false` |


## Events
| Event | Description | 
| --- | --- | 
| `state-changed`  |Triggered when using the `cancel()` or `confirm()` method|

## Usage

#### Installation
```
npm install  @fureinzz/fureinzz-dialog
```

#### In an HTML file
```html
<html>
  <head>
    <script type="module">
      import '@fureinzz/fureinzz-dialog/fureinzz-dialog.js'
    </script>
  </head>
  <body>
    <fureinzz-dialog opened>
      <div>
        <span> Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
      </div>
    </fureinzz-dialog>
  </body>
</html>
```
