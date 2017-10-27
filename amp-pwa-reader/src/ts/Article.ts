//import {  Card, ShadowReader} from "./classes";

class Article {
    hasCard: boolean;
    articles: Article[];
    mainScrollY: number;
    _cssVariables: { animationSpeedIn: number, animationSpeedOut: number, easing: string };
    container: HTMLElement;
    //clonedCard: HTMLElement;
    ampDoc: any;
    doc: Document;
    card: Card;
    url: string;
    shadowReader: ShadowReader;
    document: Document;

    constructor(url: string, card: Card = null, shadowReader: ShadowReader) {
        this.shadowReader = shadowReader;
        this.url = this.shadowReader.backend.getAMPUrl(url);
        this.card = card;
        this.articles = new Array<Article>();
        this.articles[this.url] = this;
        this.document = document;

        //this.dramaticWelcome();
    }

    fetch() {

        // unfortunately fetch() does not support retrieving documents,
        // so we have to resort to good old XMLHttpRequest.
        let xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {

            if (this.shadowReader.nav.category === "flexedd"|| this.url.startsWith("IssuesAmp")) {
                xhr.open('GET', '/' + this.url, true);
            }
            else {
                xhr.open('GET', 'https://seed-octagon.glitch.me/' + encodeURIComponent(this.url), true);
            }

            xhr.responseType = 'document';
            xhr.setRequestHeader('Accept', 'text/html');

            xhr.onload = () => {
                let isAMP = xhr.responseXML.documentElement.hasAttribute('amp') || xhr.responseXML.documentElement.hasAttribute('⚡');

                if (isAMP) {
                    return resolve(xhr.responseXML);
                }
                else {
                    reject('Article does not have an AMP version.');
                }

            }; // .responseXML contains a ready-to-use Document object
            xhr.send();
        });
    }

    load(): Promise<void> {
        return (this.doc ? Promise.resolve() : this.fetch().then(doc => {
            this.doc = doc as Document;
            this.sanitize();
        }));
    }

    clear(): void {
        this.ampDoc.close();
        this.destroyShadowRoot();
    }

    sanitize(): void {

        let hasCard = !!this.card;

        // call the sanitizer of the respective content backend
        this.shadowReader.backend.sanitize(this);

        // add the correct backend export class , as the styling expects it
        this.doc.body.classList.add('sr-backend-' + this.shadowReader.backend.appTitle.toLowerCase());

        // insert stylesheet that styles the featured image
        let stylesheet = this.document.createElement('link');
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.href = '/inline.css';
        this.doc.body.appendChild(stylesheet);

    }

    createShadowRoot(): HTMLElement {
        let shadowRoot: HTMLElement = this.document.createElement('article');
        shadowRoot.classList.add('sr-article');
        this.document.body.appendChild(shadowRoot);
        return shadowRoot;
    }

    destroyShadowRoot(): void {
        this.document.body.removeChild(this.container);
    }

    generateCard() {

        let articleData = new ArticleData("", "", "", 0);

        let card = new Card(articleData, true, true, this.shadowReader).cardHtmlElement;

        // resize card to image ratio
        card.style.height = (innerWidth * articleData.imageRatio) + 'px';
        card.style.margin = '0';

        //this.clonedCard = card;
        return card;
    }

    get cssVariables() {

        if (!this._cssVariables) {
            let htmlStyles = window.getComputedStyle(this.document.querySelector("html"));
            this._cssVariables = {
                animationSpeedIn: parseFloat(htmlStyles.getPropertyValue("--animation-speed-in")) * 1000,
                animationSpeedOut: parseFloat(htmlStyles.getPropertyValue("--animation-speed-in")) * 1000,
                easing: htmlStyles.getPropertyValue("--animation-easing")
            };
        }

        return this._cssVariables;

    }

    animateIn() {

        // No animation if there's no card to animate from
        if (!this.card) {
            return Promise.resolve();
        }

        return new Promise(resolve => {

            let _transitionEnd = () => {
                this.container.removeEventListener('transitionend', _transitionEnd);
                resolve();
            };

            this.container.addEventListener('transitionend', _transitionEnd, false);
            this.container.classList.add('at-top');
        });
    }

    animateOut() {

        // No animation if there's no card to animate from
        if (!this.card) {
            return Promise.resolve();
        }

        return new Promise(resolve => {

            let _transitionEnd = () => {
                this.container.removeEventListener('transitionend', _transitionEnd);
                resolve();
            };

            this.container.addEventListener('transitionend', _transitionEnd, false);
            this.container.classList.remove('at-top');
        });

    }

    render() {
        // Create an empty container for the AMP page
        this.container = this.createShadowRoot();

        // Tell Shadow AMP to initialize the AMP page in prerender-mode
        this.ampDoc = this.shadowReader.window.AMP.attachShadowDoc(this.container, this.doc, this.url);
        this.ampDoc.setVisibilityState('prerender');

        return this.ampDoc.ampdoc.whenReady();
    }

    async show(): Promise<void> {

        // animate the article in. Only makes sense when there's a card transition
        // at the same time, within animateIn, we check for the availability of a
        // connected card, and don't animate if it's not around.
        await this.animateIn();

        // Hide the original card, show the cloned one (this also animates)
        if (this.card) {
            //this.card.style.opacity = '1';
            this.card.cardHtmlElement.style.opacity = '1';
        }

        // add export class  to html element for to contain the scroll, and transform
        // the hamburger into a 'back' button.
        this.document.documentElement.classList.add('sr-article-shown');

        this.takeoverScroll();

        // Set the visibility state of the AMP doc to visible
        this.ampDoc.setVisibilityState('visible');

        // Finally, add new history entry
        // Note: We're doing this deliberately late due to an AMP
        // Bug that overrides the history state object early on
        this.shadowReader.nav.setOpenArticle(this, true);
    }

    async hide(): Promise<void> {

        // remove export class  to html element for global CSS stuff
        this.document.documentElement.classList.remove('sr-article-shown');

        this.restoreScroll();

        // animate everything back to the card/listing view, then
        // clear the old Shadow DOM to free up memory.
        await this.animateOut();

        this.clear();
    }

    takeoverScroll() {
        this.mainScrollY = this.document.scrollingElement.scrollTop;
        this.document.scrollingElement.scrollTop = 0;
        this.container.style.transform = '';
    }

    restoreScroll() {
        this.document.scrollingElement.scrollTop = this.mainScrollY;
    }

    getArticleByURL = function (url) {
        return this.articles[url];
    }
}
