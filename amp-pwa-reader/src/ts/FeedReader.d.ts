declare class FeedReader {
    shadowReader: ShadowReader;
    constructor(shadowReader: ShadowReader);
    fetch(category: any): Promise<any>;
}
