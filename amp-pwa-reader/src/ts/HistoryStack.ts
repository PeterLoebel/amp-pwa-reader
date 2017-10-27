//import { ShadowReader, Backend } from "./classes";

class  HistoryStack {
    state: { category: string, articleUrl: string };
    backend: Backend;
    shadowReader: ShadowReader;

    window: Window;
    history: History;

    constructor(shadowReader: ShadowReader) {
        this.shadowReader = shadowReader;

        this.backend = this.shadowReader.backend;

        this.window = this.shadowReader.window;
        this.history = this.window.history;

        this.state = (this.history.state && this.history.state.category) ? this.history.state : this.parseUrlIntoState();

        // if the category doesn't exist (e.g. we came from a different backend) return the default one.
        if (!this.backend.categories[this.state.category]) {
            this.state.category = this.backend.defaultCategory;

            this.history.replaceState({
                category: this.state.category
            }, '', this.constructUrl(""));
        }
    }

    constructUrl(articleUrl) {
        return '/' + this.backend.appTitle.toLowerCase() + '/' + ((this.shadowReader && this.shadowReader.nav.category) || this.state.category) + (articleUrl ? '/' + this.backend.getAMPUrlComponent(articleUrl) : '');
    }

    parseUrlIntoState() {

        // grab the pathname from the url (minus slashes at the beginning and end, and the backend)
        var path = location.pathname.replace(/^\/*/, '').replace(/\/*$/, '').replace(this.backend.appTitle.toLowerCase() + '/', '');
        var state = {
            category: this.backend.defaultCategory,
            articleUrl: null
        };

        if (this.backend.getCategoryTitle(path)) {
            // if the pathname is an actual category, use that
            state.category = path;
        } else if (path) {
            // now we can be reasonably sure the path is a full article url
            state.category = path.split('/')[0];
            state.articleUrl = this.backend.constructAMPUrl(state.category, path.substr(state.category.length + 1));
        }

        return state;

    }

    setDocTitle(subTitle) {
        document.title = 'legunto.me' + ' – ' + this.shadowReader.nav.categoryTitle + (subTitle ? ' – ' + subTitle : '');
    }

    navigate(articleUrl: string, replace: boolean, subTitle: string) {

        // set the correct document title
        this.setDocTitle(subTitle);

        var newUrl = this.constructUrl(articleUrl);

        // bail if nothing would change
        if (newUrl === document.location.pathname) {
            if (replace) {
                // we need to replace the state anyway due to that nasty AMP bug.
                this.history.replaceState({
                    category: this.shadowReader.nav.category,
                    articleUrl: articleUrl
                }, '', newUrl);
            }
            return;
        }

        // set a new browser history entry and update the URL
        this.history.pushState({
            category: this.shadowReader.nav.category,
            articleUrl: articleUrl
        }, '', newUrl);

    }

}