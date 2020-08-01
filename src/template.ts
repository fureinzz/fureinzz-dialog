export const template = document.createElement('template')
template.innerHTML =   `  
    <style>
        :host{
            position: fixed;
            display: flex; 
            align-items: center; 
            justify-content: center;
            top: 0; left: 0; right: 0; bottom: 0;
            height: 100%; width: 100%;
        }
        #dialog {
            position: relative; 
            z-index: 1000;

            background: var(--dialog-background, #fff);
            padding: var(--dialog-padding, 12px);
            padding-top: var(--dialog-padding-top, 0);
            padding-bottom: var(--dialog-padding-bottom, 0);
            padding-left: var(--dialog-padding-left, 0);
            padding-right: var(--dialog-padding-right, 0);
            margin: var(--dialog-margin, 0);
            margin-top: var(--dialog-margin-top, 0);
            margin-bottom: var(--dialog-margin-bottom, 0);
            margin-left: var(--dialog-margin-left, 0);
            margin-right: var(--dialog-margin-right, 0);
            width: var(--dialog-width, 520px);
            height: var(--dialog-height, auto);
            max-height: var(--dialog-max-height);
            max-width: var(--dialog-max-width);
            box-shadow: var(--dialog-box-shadow);
            border-radius: var(--dialog-border-radius, 5px);
        }
        #backdrop {
            position: fixed;
            z-index: 999;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            background: var(--backdrop-background, #000);
            opacity: var(--backdrop-opacity, .5)
        }
    </style>

    <div id="backdrop" part="backdrop"></div>
    <div id="dialog">
        <slot></slot>
    </div>
`