"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const hooks_1 = require("./hooks");
const classes_1 = require("./hooks/classes");
const ControlObject_1 = require("./ControlObject");
class Machine {
    constructor(states, initialState, data) {
        this.states = states;
        this.data = data;
        this.stateArgs = [];
        this.isTransitioning = false;
        this.histories = new Map();
        this.resolve = () => undefined;
        this.reject = () => undefined;
        this.resolved = false;
        this.rejected = false;
        this.runState = (state, control, args = undefined) => {
            if (this.rejected || this.resolved) {
                return;
            }
            this.hooksState.index = 0;
            let updated;
            try {
                hooks_1.machineHooksStack.push(this.hooksState);
                updated = state(control, ...args);
                hooks_1.machineHooksStack.pop();
            }
            catch (e) {
                this.rejected = true;
                this.reject(e);
                throw e;
            }
            return updated;
        };
        this.transition = (nextStateName, ...args) => {
            if (this.rejected || this.resolved) {
                return;
            }
            this.isTransitioning = true;
            let isStateChange = nextStateName !== this.stateName;
            this.stateArgs = args;
            const stateData = this.data;
            const control = new ControlObject_1.Control(this, nextStateName);
            if (isStateChange) {
                for (const { remove, dependencies } of this.hooksState.items) {
                    if (remove !== undefined) {
                        remove();
                        if (this.hooksState.useHistory && dependencies !== undefined) {
                            dependencies.length = 0;
                            dependencies.push({});
                        }
                    }
                }
                if (this.hooksState.useHistory) {
                    this.histories.set(this.stateName, this.hooksState);
                }
                if (this.histories.has(nextStateName)) {
                    this.hooksState = this.histories.get(nextStateName);
                }
                else {
                    this.hooksState = new hooks_1.MachineHooksState(() => {
                        this.state = this.runState(this.states[nextStateName], control, args);
                        this.emit('change', this);
                    });
                }
            }
            const nextStateValue = this.runState(this.states[nextStateName], control, args);
            if (control.isActive) {
                this.isTransitioning = false;
                this.state = nextStateValue;
                this.stateName = nextStateName;
                const dataChanged = this.data !== stateData;
                if (isStateChange) {
                    this.emit('statechange', this);
                }
                if (dataChanged) {
                    this.emit('datachange', this);
                }
                this.emit('change', this);
                if (nextStateValue instanceof classes_1.Final) {
                    this.resolved = true;
                    this.resolve(nextStateValue.value);
                }
            }
        };
        this.hooksState = new hooks_1.MachineHooksState(() => {
            this.transition(this.stateName, ...this.stateArgs);
        });
        const internalPromise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.then = internalPromise.then.bind(internalPromise);
        this.catch = internalPromise.catch.bind(internalPromise);
        this.finally = internalPromise.finally.bind(internalPromise);
        const emitter = new events_1.EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
        this.transition(initialState);
    }
    setData(newData) {
        this.data = Object.assign(Object.assign({}, this.data), newData);
        if (this.isTransitioning === false) {
            this.emit('datachange', this);
            this.emit('change', this);
        }
    }
}
exports.Machine = Machine;
//# sourceMappingURL=Machine.js.map