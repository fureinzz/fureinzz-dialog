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

            animation: var(--dialog-animation);
            background: var(--dialog-background, #fff);
            padding: var(--dialog-padding, 12px);
            margin: var(--dialog-margin, 0);
            width: var(--dialog-width, auto);
            height: var(--dialog-height, auto);
            box-shadow: var(--dialog-box-shadow);
            border-radius: var(--dialog-border-radius, 5px);
            max-height: var(--dialog-max-height, auto);
            max-width: var(--dialog-max-width, 520px);
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