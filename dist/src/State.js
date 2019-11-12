var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { EventEmitter } from 'events';
var State = (function () {
    function State(machine) {
        this.machine = machine;
        var emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
    }
    State.prototype.setData = function (newData) {
        var _this = this;
        this.data = __assign(__assign({}, this.data), newData);
        if (this.dataUpdatePromise === undefined) {
            this.dataUpdatePromise = Promise.resolve().then(function () {
                _this.dataUpdatePromise = undefined;
                _this.emit('change', _this.data);
            });
        }
    };
    return State;
}());
export { State };
//# sourceMappingURL=State.js.map