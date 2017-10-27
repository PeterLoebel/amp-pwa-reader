//import { Nav, HistoryStack, Backend } from "./classes";

interface Window {
    AMP: any;
    shadowReader: ShadowReader;
}

interface EventTarget {
    nodeName: string;
    dataset: DOMStringMap;
}

class ShadowReader {
    nav: Nav;
    headerElement: HTMLElement;
    hamburgerElement: HTMLButtonElement;
    itemsElement: HTMLElement;
    clickEvent: string;
    historyStack: HistoryStack;
    backend: Backend;
    window: Window;
    document: Document;

    constructor() {
        this.backend = new Backend();
        this.clickEvent = 'click';
        this.window = window;
        this.document = this.window.document;

        this.itemsElement = this.document.querySelector('main') as HTMLElement;
        this.headerElement = this.document.querySelector('header');
        this.hamburgerElement = this.document.querySelector('.sr-hamburger') as HTMLButtonElement;
    }

    init(): void {
        
        this.nav = new Nav();
        this.nav.init(this);
    }

    ampReady(callback): void {
        (this.window.AMP = this.window.AMP || []).push(callback);
    }

    enableCardTabbing(): void {
        let children = Array.from(this.itemsElement.children); // sadly needed for Safari
        for (let item of children) {
            item.children[1].removeAttribute('tabindex');
        }
    }

    disableCardTabbing(): void {
        let children = Array.from(this.itemsElement.children); // sadly needed for Safari
        for (let item of children) {
            item.children[1].setAttribute('tabindex', "-1");
        }
    }

    focusVisibleCard(): void {
        // if cards haven't been initialized yet, ignore
        if (!this.nav || !this.nav.cards) {
            return;
        }

        const scrollY: number = this.window.scrollY;
        const innerHeight: number = this.window.innerHeight;

        for (let card of this.nav.cards) {
            if (card.cardHtmlElement.offsetTop < (scrollY + innerHeight) && card.cardHtmlElement.offsetTop > scrollY) {
                card.innerElem.focus();
                break;
            }
        }
    }
}