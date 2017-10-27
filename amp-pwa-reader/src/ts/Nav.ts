//import { Article, IssueReader, Card, HistoryStack, ShadowReader } from "./classes";

class Nav {
    private cardViewInitialized: boolean;
    categoryTitle: string;
    hamburgerReturnAction: any;
    openArticle: Article;
    categoriesMenue: HTMLDivElement;
    issueReader: IssueReader;
    feedReader: FeedReader;
    cards: Card[];
    category: string;
    shadowReader: ShadowReader;
    article: Article;
    document: Document;

    constructor() {
        this.category = "";
        this.cards = [];
    }

    init(shadowReader: ShadowReader): void {

        this.shadowReader = shadowReader;

        this.issueReader = new IssueReader(this.shadowReader);
        this.feedReader = new FeedReader(this.shadowReader);


        this.document = this.shadowReader.document;

        this.shadowReader.historyStack = new HistoryStack(this.shadowReader);

        // The history module resolves the initial state from either the history API
        // or the loaded URL, in case there's no history entry.
        let state = this.shadowReader.historyStack.state;

        this.categoriesMenue = this.document.querySelector('.sr-navigation') as HTMLDivElement;

        // Create the nav items from categories
        this.create();


        this.bind();

        if (state.articleUrl) {
            // Open the correct article, even before switching to the category, if we
            // have one (but only when the AMP lib is ready, since it's loaded async).
            this.shadowReader.ampReady(() => {
                this.startWithArticle(state);
            });
        } else {
            // If there's no article to be loaded, just load the default or
            // selected category.
            this.switchCategory(state.category);
        }


        // initialize slide logic
        this.initMenuSlide();

    }

    clear(): void {
        this.categoriesMenue.innerHTML = '';
    }

    create(): void {

        let fragment = this.document.createDocumentFragment();

        for (let category in this.shadowReader.backend.categories) {
            let item = this.document.createElement('li');
            let link = this.document.createElement('a');
            link.href = '#';
            link.dataset.tag = category;
            link.textContent = this.shadowReader.backend.categories[category];
            item.appendChild(link);
            fragment.appendChild(item);
        }

        this.categoriesMenue.appendChild(fragment);
    }

    initMenuSlide(): void {

        const skirt: HTMLDivElement = this.document.querySelector('.sr-navigation-skirt') as HTMLDivElement;
        let wasOpen: boolean = false;
        let delta: number = 0;

        // todo: eventuell wieder einbauen
        // this.dragObserver = new DragObserver(this.document, { axis: 'x', distance: 0 });

        //this.dragObserver.bind('start', () => {
        //    wasOpen = this.document.body.classList.contains('sr-nav-shown');
        //    this.element.classList.add('sr-disable-transitions');
        //});

        //this.dragObserver.bind('move', (position) => {
        //    delta = position.x;
        //    let refPoint = wasOpen ? 0 : 200;
        //    let x = Math.max(-200, Math.min(position.x, refPoint) - refPoint);
        //    this.element.style.transform = 'translateX(' + x + 'px)';
        //    skirt.style.opacity = (1 - (x / -200)).toString();
        //});

        //this.dragObserver.bind('stop', () => {
        //    this.element.classList.remove('sr-disable-transitions');
        //    this.element.style.transform = '';
        //    skirt.style.opacity = '';
        //    if (Math.abs(delta) > 70) {
        //        this[wasOpen ? 'hide' : 'show']();
        //    }
        //});
    }

    startWithArticle(state) {

        let article;

        if (this.article == null) {
            article = new Article(state.articleUrl, null, this.shadowReader);
        }
        else {
            article = this.article.getArticleByURL(state.articleUrl);
        }

        // if we have a card, things are easy: simply pretend we click on the card!
        if (article.card) {
            return article.card.activate();
        }

        // otherwise things are a little more complicated, as we have no card to click on..
        article.load()
            .then(() => article.render())
            .then(() => {

                // disable transitions temporarily, don't want them at load time
                article.container.classList.add('sr-disable-transitions');

                // passing true here ensures that the state is overwritten again..
                article.show(true).then(() => {
                    // hide the skeleton UI
                    // INVESTIGATE: For some reason needs a delay..
                    setTimeout(() => {
                        this.document.body.classList.remove('sr-skeleton-ui-article');
                        article.container.classList.remove('sr-disable-transitions');
                    }, 100);

                });

                // the return button in this state is a special case, and can't animate (yet)
                this.hamburgerReturnAction = () => {
                    this.shadowReader.enableCardTabbing();
                    article.card && article.card.animateBack();
                    article.hide();
                    this.shadowReader.historyStack.navigate(null, null, null);
                };

                // switch to the correct category only after the article is loaded for max perf
                this.switchCategory(state.category).then(() => {
                    // now that the cards have been lazily loaded, attempt to reconnect the
                    // already loaded article with the proper card
                    for (let card of this.cards) {
                        if (card.article.url === article.url) {
                            card.readyLoaded(() => {

                                // link our custom initialized article with our card
                                article.card = card;
                                card.article = article;

                                // if the card is somewhere outside the scroll position, we need
                                // to set it to a place where the card is actually visible.
                                article._mainScrollY = Math.max(0, card.cardHtmlElement.offsetTop - innerHeight / 3);

                                // apply the 'zoomed-in' state on the card behind the scenes, so
                                // we can animate back when the user clicks back
                                // TODO: stupid to call this method animate..
                                article.card.animate(false, -article._mainScrollY);

                            });
                        }
                    }

                    // set main view to insert so you can't tab into it
                    this.shadowReader.disableCardTabbing();

                });

            });
    }

    setOpenArticle(article: Article, replace: boolean): void {

        this.openArticle = article;

        // Set new history entry
        this.shadowReader.historyStack.navigate(article.url, replace, article.ampDoc.title);
    }

    getNavElement(category) {
        return this.document.querySelector('.sr-navigation a[data-tag="' + category + '"]');
    }

    setNavElement(category) {

        // mark old menu element as inactive
        if (this.category) {
            let oldNavElement = this.getNavElement(this.category);
            oldNavElement && (oldNavElement.parentNode as HTMLDivElement).classList.remove('active');
        }

        // mark new one as active
        let navElement = this.getNavElement(category);
        (navElement.parentNode as HTMLDivElement).classList.add('active');

        // change category title
        let categoryTileHtmlElement = this.document.querySelector('.sr-category span')

        categoryTileHtmlElement.textContent = this.categoryTitle + " ";

        if (category === "flexedd") {

            let link = this.document.createElement('a');
            link.href = 'http://flexedd.com/';
            link.textContent = "flexedd.com";
            categoryTileHtmlElement.appendChild(link);
        }
        else {
            let link = this.document.createElement('a');
            link.href = 'http://www.theguardian.com';
            link.textContent = "theguardian";
            categoryTileHtmlElement.appendChild(link);
       }
    }

    switchCategory(category) {

        // set the new title
        this.categoryTitle = this.shadowReader.backend.getCategoryTitle(category);

        // mark menu element as active
        this.setNavElement(category);

        // set the category
        this.category = category;

        // set current cards to loading
        for (let card of this.cards) {
            card.cardHtmlElement.classList.add('sr-loading');
        }

        // hide menu
        this.hide();

        return this.fetchEntries(category);
    }

    async fetchEntries(category: string) {
        let entries: any = null;

        if (category === "flexedd") {
            entries = await this.fetchIssuesEntries(category);
        }
        else {
            // the guardian
            entries = await this.fetchFeedEntries(category);
        }

        // if this is the first time loading cards, now would
        // be a good time to remove the skeleton ui class  from the body
        if (!this.cardViewInitialized) {
            this.document.body.classList.remove('sr-skeleton-ui');
            this.cardViewInitialized = true;
        }

        // empty items container (lazy..)
        this.shadowReader.itemsElement.innerHTML = '';

        this.cards = [];

        // render new entries
        let numberToPrerender = 3;

        for (let entry of entries) {
            this.cards.push(new Card(entry, false, --numberToPrerender >= 0, this.shadowReader));
        }

        // reset scroll position
        this.document.scrollingElement.scrollTop = 0;

        // restore focus
        (this.shadowReader.itemsElement.firstElementChild.children[1] as HTMLDivElement).focus();

        return
    }
    async fetchFeedEntries(category: string) {
        // fetch new nav entries via RSS via YQL
        return await this.feedReader.fetch(category);
    }

    async fetchIssuesEntries(category: string) {
        // fetch new nav entries from legunto
        return await this.issueReader.fetch(category);
    }

    show() {

        //disable focus for all menu elements
        let children = Array.from(this.categoriesMenue.children); // sadly needed for Safari

        for (let child of children) {
            (child.firstChild as HTMLDivElement).removeAttribute('tabindex');
        }

        // focus the first element in the menu
        (this.categoriesMenue.children[0].firstChild as HTMLDivElement).focus();

        this.document.body.classList.add('sr-nav-shown');
    }

    hide() {

        //disable focus for all menu elements
        let children = Array.from(this.categoriesMenue.children); // sadly needed for Safari

        if (children !== undefined) {
            for (let child of children) {
                (child.firstChild as HTMLDivElement).setAttribute('tabindex', '-1');
            }
        }

        // focus on the appropriate card in the main view
        this.shadowReader.focusVisibleCard();

        this.document.body.classList.remove('sr-nav-shown');
    }

    toggle() {
        return this[this.document.body.classList.contains('sr-nav-shown') ? 'hide' : 'show']();
    }

    resize() {
        for (let card of this.cards) {
            card.refresh();
        }
    }

    bind() {

        /* history navigation */
        this.shadowReader.window.addEventListener('popstate', event => {

            let state = {
                category: event.state && event.state.category ? event.state.category : this.category,
                articleUrl: event.state ? event.state.articleUrl : null
            };

            // switch to the correct category if not already on it
            if (this.category !== state.category) {
                this.switchCategory(state.category);
            }

            // if we go to a state where no article was open, and we have a
            // currently-opened one, close it again
            if (this.openArticle && !state.articleUrl && this.hamburgerReturnAction) {
                this.hamburgerReturnAction();
                this.hamburgerReturnAction = null;
                this.openArticle = null;
            }

            // If there's an article in the state object, we need to open it
            if (state.articleUrl) {
                this.startWithArticle(state);
            }

        }, false);

        /* clicks on the hamburger menu icon */
        this.document.querySelector('.sr-hamburger').addEventListener(this.shadowReader.clickEvent, event => {

            // default menu toggle (only executes when not in article view)
            !this.document.documentElement.classList.contains('sr-article-shown') && this.toggle();

            // use as temporary back button
            if (this.hamburgerReturnAction) {
                this.hamburgerReturnAction(event);
                this.hamburgerReturnAction = null;
            }

        }), false;

        /* clicks on menu links */
        this.document.querySelector('.sr-navigation').addEventListener(this.shadowReader.clickEvent, event => {

            // we're doing event delegation, and only want to trigger action on links
            if (event.target.nodeName !== 'A')
                return;

            // switch to the clicked category
            //this.switchCategory(event.target.dataset.tag, event.target.parentNode);
            this.switchCategory(event.target.dataset.tag);

            // set entry in the browser history, navigate URL bar
            this.shadowReader.historyStack.navigate(null, null, this.category);

            event.preventDefault();
        }), false;

        /* clicks on menu skirt */
        this.document.querySelector('.sr-navigation-skirt').addEventListener(this.shadowReader.clickEvent, () => {
            this.hide();
        }), false;

        /* resize event, mostly relevant for Desktop resolutions */
        let debounce;
        this.shadowReader.window.addEventListener('resize', () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                this.resize();
            }, 100);
        });
    }
}