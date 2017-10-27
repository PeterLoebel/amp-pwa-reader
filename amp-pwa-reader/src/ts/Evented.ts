class  Evented {
    events: {
    };

  constructor () {
    this.events = {};
  }

  bind (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
    return this;
  }

  unbind (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    let index = this.events[eventName].indexOf(fn);
    if(index > -1) {
      this.events[eventName].splice(index, 1);
    }
    return this;
  }

  trigger(eventName, a = null, b = null, c = null, d = null, e = null, f = null, g = null, h=null) {
    this.events[eventName] = this.events[eventName] || [];
    for (let i = 0; i < this.events[eventName].length; i++) {
      this.events[eventName][i](a, b, c, d, e, f, g, h);
    }
    return this;
  }

}