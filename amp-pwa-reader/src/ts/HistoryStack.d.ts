declare class HistoryStack {
    state: {
        category: string;
        articleUrl: string;
    };
    backend: Backend;
    shadowReader: ShadowReader;
    window: Window;
    history: History;
    constructor(shadowReader: ShadowReader);
    constructUrl(articleUrl: any): string;
    parseUrlIntoState(): {
        category: string;
        articleUrl: any;
    };
    setDocTitle(subTitle: any): void;
    navigate(articleUrl: string, replace: boolean, subTitle: string): void;
}
