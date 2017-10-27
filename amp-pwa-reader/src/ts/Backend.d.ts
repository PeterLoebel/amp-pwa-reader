declare class Backend {
    categories: {
        'flexedd': string;
        'us': string;
        'us-news--us-politics': string;
        'world': string;
        'commentisfree': string;
        'us--technology': string;
        'us--culture': string;
        'us--lifeandstyle': string;
        'fashion': string;
        'us--business': string;
        'us--travel': string;
    };
    defaultCategory: string;
    ampEndpoint: string;
    appTitle: string;
    constructor();
    getCategoryTitle(category: string): string;
    getRSSUrl(category: string): string;
    getRSSTitle(entry: FeedEntry): string;
    getRSSContent(entry: FeedEntry): string[];
    getRSSLink(entry: FeedEntry): string;
    getRSSImage(entry: FeedEntry): any;
    getRSSDescription(entry: FeedEntry): string;
    getIssueTitle(entry: IssueEntry): string;
    getIssueIssue(entry: IssueEntry): string;
    getIssueLink(entry: IssueEntry): string;
    getIssueImage(entry: IssueEntry): string;
    getIssueDescription(entry: IssueEntry): string;
    getAMPUrl(url: string): string;
    constructAMPUrl(category: string, path: string): string;
    getAMPUrlComponent(articleUrl: string): string;
    extractSchemaData(doc: any): any;
    sanitize(article: Article): void;
}
