declare class IssueReader {
    shadowReader: ShadowReader;
    constructor(shadowReader: ShadowReader);
    fetch(category: any): Promise<any>;
}
