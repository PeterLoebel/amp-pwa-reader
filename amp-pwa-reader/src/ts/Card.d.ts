declare class Card {
    private readyQueue;
    private ready;
    img: HTMLElement;
    imageData: {
        ratio: number;
        width: number;
        height: number;
    };
    article: Article;
    innerElem: HTMLElement;
    cardHtmlElement: HTMLElement;
    private naturalDimensions;
    private currentTransform;
    headless: boolean;
    articleData: any;
    shadowReader: ShadowReader;
    constructor(articleData: any, headless: boolean, prerenderArticle: boolean, shadowReader: ShadowReader);
    resizeChildren(dimensions: any, animate: any, toFullView: any): void;
    animate(dontAnimate: any, scrollOffset: any): void;
    animateBack(): void;
    create(): void;
    refresh(): void;
    hijackMenuButton(): void;
    activate(): void;
    deactivate(): void;
    bind(): void;
    render(): void;
    setReady(): void;
    readyLoaded(cb: any): void;
}
