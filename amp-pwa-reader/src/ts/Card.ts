//import { Article, ShadowReader } from "./classes";

class Card {
    private readyQueue: any;

    private ready: boolean;
    img: HTMLElement;
    imageData: {
        ratio: number,
        width: number,
        height: number
    };
    article: Article;
    innerElem: HTMLElement;
    cardHtmlElement: HTMLElement;

    private naturalDimensions: {
        width: number;
        height: number;
    };
    private currentTransform: {
        scaleX: number;
        scaleY: number;
        translateX: number;
        translateY: number;
    };
    headless: boolean;
    articleData: any;
    shadowReader: ShadowReader;

    constructor(articleData: any, headless: boolean, prerenderArticle: boolean, shadowReader: ShadowReader) {

        this.articleData = articleData;
        this.headless = headless;
        this.currentTransform = { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 };
        this.naturalDimensions = { width: 0, height: 0 };
        this.shadowReader = shadowReader;

        this.create();
        this.bind();

        // if we're in headless mode, that means the Card is initialized purely to
        // render out the featured image in the Shadow DOM, not for the list view,
        // thus we don't need to fancy it up.
        if (this.headless) {
            this.cardHtmlElement.classList.add('sr-full');
            this.innerElem.setAttribute('tabindex', "-1");
        } else {
            this.article = new Article(this.articleData.link, this, this.shadowReader);
            this.render();
        }

        if (prerenderArticle) {
            this.article.load();
        }

    }

    resizeChildren(dimensions, animate, toFullView) {

        let width = this.imageData.width;
        let height = this.imageData.height;
        let elemWidth = dimensions.width;
        let elemHeight = dimensions.height;
        let scaleY = elemHeight / height;
        let scaleX = elemWidth / width;

        let fitHorizontally = scaleX > scaleY;
        let centerX = 'translateX(' + (-(((width * scaleY) - elemWidth) / 2)) + 'px)';
        let centerY = 'translateY(' + (-(((height * scaleX) - elemHeight) / 2)) + 'px)';

        if (animate === false) {
            this.cardHtmlElement.classList.add('sr-disable-transitions');
        }

        // rescale image
        this.img.style.transform = (fitHorizontally ? centerY : centerX) + // center
            'scaleY(' + (1 / this.currentTransform.scaleY) + ')' + // normalizing
            'scaleX(' + (fitHorizontally ? scaleX : scaleY) + ')' + // fill the whole card
            'scaleY(' + (fitHorizontally ? scaleX : scaleY) + ')' + // fill the whole card
            'scaleX(' + (1 / this.currentTransform.scaleX) + ')' + // normalizing
            'scale(var(--hover-scale))'; // additional CSS variable we can control (we use it for hover effects)

        // rescale inner element
        this.innerElem.style.transform = 'scaleX(' + (1 / this.currentTransform.scaleX) + ')' // normalizing
            + 'scaleY(' + (1 / this.currentTransform.scaleY) + ')'; // normalizing

        // if the paragraph was hidden before, we need to slide it in..
        if (!this.cardHtmlElement.matches('.sr-card:first-child') && toFullView) {
            let paragraph = this.cardHtmlElement.children[1].children[1] as HTMLElement;
            this.innerElem.style.transform += ' translateY(-' + (paragraph.offsetHeight + 16) + 'px)'; // 16px = 1em
        }

        // back to transitions after next render tick if prev disabled..
        if (animate === false) {
            setTimeout(() => { // turns out requestAnimationFrame isn't enough here..
                this.cardHtmlElement.classList.remove('sr-disable-transitions');
            }, 0);
        }

    }

    animate(dontAnimate, scrollOffset) {

        this.cardHtmlElement.classList.add('sr-full');

        let offsetLeft = this.cardHtmlElement.offsetLeft + this.cardHtmlElement.parentElement.offsetLeft;
        let offsetTop = (this.cardHtmlElement.offsetTop + this.cardHtmlElement.parentElement.offsetTop) - this.shadowReader.headerElement.offsetHeight - scrollY + (scrollOffset || 0);
        let currentWidth = this.naturalDimensions.width;
        let currentHeight = this.naturalDimensions.height;
        let newWidth = innerWidth;
        let newHeight = newWidth * this.imageData.ratio;

        this.currentTransform = {
            scaleX: (newWidth / currentWidth),
            scaleY: (newHeight / currentHeight),
            translateX: -offsetLeft,
            translateY: -offsetTop
        };

        // animate the card to the natural ratio of the featured image
        this.cardHtmlElement.style.transform = 'translateY(' + this.currentTransform.translateY + 'px)'
            + 'translateX(' + this.currentTransform.translateX + 'px)'
            + 'scaleX(' + this.currentTransform.scaleX + ')'
            + 'scaleY(' + this.currentTransform.scaleY + ')';

        // counter-animate all children
        this.resizeChildren({
            width: newWidth,
            height: newHeight
        }, /*animate*/!dontAnimate, true);

    }

    animateBack() {

        this.cardHtmlElement.classList.remove('sr-full');

        // animate to the right height
        this.cardHtmlElement.style.transform = '';

        this.currentTransform = {
            scaleX: 1,
            scaleY: 1,
            translateY: 0,
            translateX: 0
        };

        // counter-animate all children
        this.resizeChildren(this.naturalDimensions, true, false);

    }

    create() {

        let elem = document.createElement('div'),
            innerElem = document.createElement('a'),
            img = document.createElement('img'),
            h2 = document.createElement('h2'),
            p = document.createElement('p');

        h2.innerHTML = this.articleData.title;
        p.innerHTML = this.articleData.description;

        innerElem.className = 'sr-inner';
        innerElem.href = this.articleData.link || '';
        elem.className = 'sr-card';
        img.src = this.articleData.image;
        img.setAttribute('role', 'presentation'); // prevents screen reader access

        // if we're in headless mode, that means the Card is initialized purely to
        // render out the featured image in the Shadow DOM, not for the list view,
        // thus we don't need to fancy it up for animations.
        if (!this.headless) {

            img.style.opacity = "0";
            img.onload = () => {

                this.imageData = {
                    ratio: img.offsetHeight / img.offsetWidth,
                    width: img.offsetWidth,
                    height: img.offsetHeight
                };

                this.naturalDimensions = {
                    width: elem.offsetWidth,
                    height: elem.offsetHeight
                };

                this.resizeChildren(this.naturalDimensions, false, false);
                img.style.opacity = '';
                this.setReady();

            };

        }

        // todo: remove diesen hack
        if (this.shadowReader.nav.category === "flexedd") {
            h2.style.opacity = '0';

            p.className = 'fe-description';

            //p.style.height = '0em';
            //p.style.setProperty("height", "inline", "important")
        }
        innerElem.appendChild(h2);
        innerElem.appendChild(p);

        elem.appendChild(img);
        elem.appendChild(innerElem);

        this.cardHtmlElement = elem;
        this.img = img;
        this.innerElem = innerElem;

    }

    refresh() {

        this.naturalDimensions = {
            width: this.cardHtmlElement.offsetWidth,
            height: this.cardHtmlElement.offsetHeight
        };

        this.resizeChildren(this.naturalDimensions, false, false);

    }

    hijackMenuButton() {
        this.shadowReader.nav.hamburgerReturnAction = event => {
            // Go back in history stack, but only if we don't trigger the method
            // manually, coming from popstate
            if (event) history.back();

            this.deactivate();
        };
    }

    activate() {

        // set main view to inert so you can't tab into it
        this.shadowReader.disableCardTabbing();

        // add loading spinner (and promote to layer)
        this.cardHtmlElement.classList.add('sr-loading', 'sr-promote-layer');

        this.article.load()
            .then(() => this.article.render())
            .then(() => {
                // remove loading spinner
                this.cardHtmlElement.classList.remove('sr-loading');

                this.animate(false, 0);
                this.article.show();
                this.hijackMenuButton();
            })
            .catch(error => {
                console.log(error);
                this.cardHtmlElement.classList.remove('sr-loading');
            });
    }

    deactivate() {

        // restore tabbing in main view
        this.shadowReader.enableCardTabbing();

        this.animateBack();
        this.article.hide();
    }

    bind() {
        /* use click event on purpose here, to not interfere with panning */
        this.cardHtmlElement.addEventListener('click', (event) => {

            // don't trigger the default link click
            event.preventDefault();

            // blur the element, as the focus style would hinder the animation
            this.innerElem.blur();

            // if we're looking at the duplicate card in the article view, a click
            // on the card should do nothing at all
            if (!this.cardHtmlElement.classList.contains('sr-full')) {
                // activate the card
                this.activate();
            }

        });
    }

    render() {
        this.shadowReader.itemsElement.appendChild(this.cardHtmlElement);
    }

    setReady() {
        this.ready = true;
        if (this.readyQueue) {
            for (let cb of this.readyQueue) {
                cb();
            }
            this.readyQueue = [];
        }
    }

    readyLoaded(cb) {
        if (!this.ready) {
            this.readyQueue = this.readyQueue || [];
            this.readyQueue.push(cb);
        } else {
            cb();
        }
    }

}