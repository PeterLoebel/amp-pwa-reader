import { Evented, Article } from "./classes";

export class DragObserver extends Evented {
    eventStart: any;
    eventMovePrev: any;
    eventMove: any;
    __stop: (e: any) => void;
    __move: (e: any) => void;
    eventDown: any;
    private supportsPointerEvents: boolean;
    private clickPreventer: HTMLDivElement;
    distance: number;
    element: Document;
    private started: boolean;
    axis: string;

    constructor(element: Document, options: { 'axis': string, 'distance': number } = null) {

        super();

        this.started = false;
        this.element = element;
        this.axis = options.axis || 'both';
        this.distance = options.distance || 10;

        this.clickPreventer = this.createClickPreventer();

        this.supportsPointerEvents = !!window.PointerEvent;

        this.element.addEventListener(
            this.supportsPointerEvents ? 'pointerdown' : 'touchstart',
            this.start.bind(this),
        );
    }

    private createClickPreventer() {
        let div = document.createElement('div');
        div.style.width = '30px';
        div.style.height = '30px';
        div.style.position = 'absolute';
        div.style.left = '0';
        div.style.top = '0';
        div.style.zIndex = '1000';
        return div;
    }

    calculateOffset(e) {
        let t = 0
            , s = 0;
        do {
            t += e.offsetLeft,
                s += e.offsetTop
        } while (e = e.offsetParent); return {
            x: t,
            y: s
        }
    }

    meetsDistance(e) {
        return "both" === this.axis && (Math.abs(e.x) >= this.distance || Math.abs(e.y) >= this.distance) || "x" === this.axis && Math.abs(e.x) >= this.distance || "y" === this.axis && Math.abs(e.y) >= this.distance
    }

    start(e) {
        e.pageX && (this.eventDown = e),
            this.__move = (e => this.move(e)),
            this.__stop = (e => this.stop(e)),
            document.addEventListener(this.supportsPointerEvents ? "pointermove" : "touchmove", this.__move, true),
            document.addEventListener(this.supportsPointerEvents ? "pointerup" : "touchend", this.__stop, true)
    }

    move(e) {
        e.pageX && (this.eventMove = e),
            this.eventMovePrev = this.eventMove || this.eventStart,
            this.eventMove = e;
        let t = {
            x: -(this.eventDown.pageX - this.eventMove.pageX),
            y: -(this.eventDown.pageY - this.eventMove.pageY)
        }
            , s = {
                x: "both" === this.axis || "x" === this.axis ? t.x : 0,
                y: "both" === this.axis || "y" === this.axis ? t.y : 0
            };
        this.meetsDistance(s) && !this.started && (this.started = !0,
            document.body.appendChild(this.clickPreventer),
            this.trigger("start", s)),
            this.started && (this.clickPreventer.style.transform = "translate3d(" + (this.eventDown.pageX + t.x - 15) + "px, " + (this.eventDown.pageY + t.y - 15) + "px, 0)",
                this.trigger("move", s))
    }

    stop(e) {
        document.removeEventListener(this.supportsPointerEvents ? "pointermove" : "touchmove", this.__move),
            document.removeEventListener(this.supportsPointerEvents ? "pointerup" : "touchend", this.__stop),
            this.started && (e.stopPropagation(),
                this.clickPreventer.remove(),
                this.started = !1,
                this.trigger("stop"))
    }
}