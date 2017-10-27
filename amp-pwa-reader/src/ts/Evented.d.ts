declare class Evented {
    events: {};
    constructor();
    bind(eventName: any, fn: any): this;
    unbind(eventName: any, fn: any): this;
    trigger(eventName: any, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any, g?: any, h?: any): this;
}
