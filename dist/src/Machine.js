import { EventEmitter } from 'events';
var Machine = (function () {
    function Machine(State, parent) {
        this.State = State;
        this.parent = parent;
        this.histories = new Map();
        this.effectClearers = [];
        var emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
        if (State === undefined && this.constructor.initialState !== undefined) {
            this.transition(this.constructor.initialState);
        }
        else if (State !== undefined) {
            this.transition(State);
        }
        else {
            throw new Error('Machine needs either a state passed it on an initialState');
        }
    }
    Machine.prototype.transition = function (NextState) {
        for (var _i = 0, _a = this.effectClearers; _i < _a.length; _i++) {
            var clearer = _a[_i];
            if (clearer) {
                clearer();
            }
        }
        if (this.histories.has(NextState)) {
            this.current = this.histories.get(NextState);
        }
        else {
            this.current = new NextState(this);
        }
        if (this.current.effects) {
            this.effectClearers = this.current.effects.map(function (effect) { return effect(); });
        }
        else {
            this.effectClearers = [];
        }
        this.emit('transition', this);
        if (this.parent) {
            this.parent.receiveChildTransition(this);
        }
    };
    Machine.prototype.receiveChildTransition = function (machine) {
        this.emit('child-transition', machine);
        if (this.parent) {
            this.parent.receiveChildTransition(machine);
        }
    };
    return Machine;
}());
export { Machine };
//# sourceMappingURL=Machine.js.map