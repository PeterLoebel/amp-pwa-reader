declare class Article {
    hasCard: boolean;
    articles: Article[];
    mainScrollY: number;
    _cssVariables: {
        animationSpeedIn: number;
        animationSpeedOut: number;
        easing: string;
    };
    container: HTMLElement;
    ampDoc: any;
    doc: Document;
    card: Card;
    url: string;
    shadowReader: ShadowReader;
    document: Document;
    constructor(url: string, card: Card, shadowReader: ShadowReader);
    fetch(): Promise<{}>;
    load(): Promise<void>;
    clear(): void;
    sanitize(): void;
    createShadowRoot(): HTMLElement;
    destroyShadowRoot(): void;
    generateCard(): HTMLElement;
    readonly cssVariables: {
        animationSpeedIn: number;
        animationSpeedOut: number;
        easing: string;
    };
    animateIn(): Promise<{}> | Promise<void>;
    animateOut(): Promise<{}> | Promise<void>;
    render(): any;
    show(): Promise<void>;
    hide(): Promise<void>;
    takeoverScroll(): void;
    restoreScroll(): void;
    getArticleByURL: (url: any) => any;
}
