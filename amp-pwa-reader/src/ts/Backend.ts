//import { ArticleData } from "./classes";

class Backend {

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

    constructor() {
        this.appTitle = 'pl2';
        this.ampEndpoint = 'https://amp.theguardian.com/';
        this.defaultCategory = 'flexedd';
        this.categories = {
            'flexedd': 'FlexEdd',
            'us': 'top news',
            'us-news--us-politics': 'politics',
            'world': 'world',
            'commentisfree': 'opinion',
            'us--technology': 'tech',
            'us--culture': 'arts',
            'us--lifeandstyle': 'lifestyle',
            'fashion': 'fashion',
            'us--business': 'business',
            'us--travel': 'travel'
        };
    }

    getCategoryTitle(category: string): string {
        return this.categories[category];
    }

    /*
    * RSS Feed related getters and functions.
    */
    getRSSUrl(category: string): string {
        return 'https://www.theguardian.com/' + category.replace('--', '/') + '/rss';
    }

    getRSSTitle(entry: FeedEntry) {
        return entry.title;
    }

    getRSSContent(entry: FeedEntry) {
        return entry.content;
    }

    getRSSLink(entry: FeedEntry) {
        return entry.link;
    }

    getRSSImage(entry: FeedEntry) {
        return entry.content ? entry.content[entry.content.length - 1]['url'] : '';
    }

    getRSSDescription(entry: FeedEntry) {
        return entry.description.replace(/<[^>]+>/ig, '');
    }

    /*
     * Issues related getters and functions.
     */
    getIssueTitle(entry: IssueEntry): string {
        return entry.title;
    }

    getIssueIssue(entry: IssueEntry): string {
        return entry.description;
    }

    getIssueLink(entry: IssueEntry): string {
        return entry.link;
    }

    getIssueImage(entry: IssueEntry): string {
        return entry.image;
    }

    getIssueDescription(entry: IssueEntry): string {
        return entry.description.replace(/<[^>]+>/ig, '');
    }

    /*
     * AMP Doc related functions.
     */
    getAMPUrl(url: string): string {
        return url.replace('www.', 'amp.');
       // return url;
    }

    constructAMPUrl(category: string, path: string): string {
        return this.ampEndpoint + path;
    }

    getAMPUrlComponent(articleUrl: string): string {
        return articleUrl.replace(this.ampEndpoint, '');
    }

    extractSchemaData(doc) {
        let schemaData = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let schema of schemaData) {
            let parsedSchema = JSON.parse(schema.textContent);
            if (/WebPage|NewsArticle/.test(parsedSchema['@@type'])) {
                return parsedSchema;
            }
        }
        return null;
    }

    sanitize(article: Article) {

        let doc = article.doc;

        // remove stuff we don't need in embed mode
        let header = doc.getElementsByTagName('header');
        if (header.length)
            header[0].remove();

        // remove sidebar
        let sidebar = doc.getElementsByTagName('amp-sidebar');
        if (sidebar.length)
            sidebar[0].remove();

        //// remove content head
        //let contentHead = doc.querySelector('header.content__head');
        //if (contentHead) {
        //   this._title = contentHead.querySelector('h1.content__headline').textContent;
        //    this._description = contentHead.querySelector('.content__standfirst meta').getAttribute('content');
        //    contentHead.remove();
        //}

        //// remove the featured image of the AMP article
        //let featuredImage = doc.querySelector('.media-primary amp-img');
        //if (featuredImage) {
        //    this._image = featuredImage.getAttribute('src');
        //    this._imageRatio = featuredImage.getAttribute('height') / featuredImage.getAttribute('width');
        //    featuredImage.remove();
        //}
    }
}

