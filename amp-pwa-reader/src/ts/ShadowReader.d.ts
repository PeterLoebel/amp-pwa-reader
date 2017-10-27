interface Window {
    AMP: any;
    shadowReader: ShadowReader;
}
interface EventTarget {
    nodeName: string;
    dataset: DOMStringMap;
}
declare class ShadowReader {
    nav: Nav;
    headerElement: HTMLElement;
    hamburgerElement: HTMLButtonElement;
    itemsElement: HTMLElement;
    clickEvent: string;
    historyStack: HistoryStack;
    backend: Backend;
    window: Window;
    document: Document;
    constructor();
    init(): void;
    ampReady(callback: any): void;
    enableCardTabbing(): void;
    disableCardTabbing(): void;
    focusVisibleCard(): void;
}
