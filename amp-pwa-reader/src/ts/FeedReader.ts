class FeedReader {

    shadowReader: ShadowReader;

    constructor(shadowReader: ShadowReader) {
        this.shadowReader = shadowReader;
    }

    fetch(category) {

        let rssUrl: string = this.shadowReader.backend.getRSSUrl(category);
        let yqlQuery: string = 'select * from feed where url = \'' + encodeURIComponent(rssUrl) + '\'';
        let yqlUrl: string = 'https://query.yahooapis.com/v1/public/yql?q=' + yqlQuery + '&format=json';

        return fetch(yqlUrl)
            .then(response => response.json())
            .then(rss => {

                let entries = rss.query.results.item;

                return entries.map(entry => {
                    return new FeedEntry(
                        this.shadowReader.backend.getRSSTitle(entry),
                        this.shadowReader.backend.getRSSDescription(entry),
                        this.shadowReader.backend.getRSSLink(entry),
                        this.shadowReader.backend.getRSSImage(entry),
                        this.shadowReader.backend.getRSSContent(entry)
                    )
                });
            });
    }
}
