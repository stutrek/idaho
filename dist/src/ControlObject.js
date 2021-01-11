"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Control {
    constructor(machine, targetState) {
        this.machine = machine;
        this.isActive = true;
        this.transition = (nextState, ...args) => {
            if (this.isActive === false && this.stateName !== this.machine.stateName) {
                throw new Error(`Tried to transition from "${this.stateName}", but Idaho is in a state called "${this.machine.stateName}".`);
            }
            this.isActive = false;
            this.machine.transition(nextState, ...args);
        };
        this.data = machine.data;
        this.stateName = targetState;
        this.setData = (data) => {
            if (this.isActive === false && this.stateName !== this.machine.stateName) {
                throw new Error(`Tried to set Idaho machine data from a state called "${this.stateName}", but Idaho is in "${this.machine.stateName}".`);
            }
            machine.setData(data);
        };
        this.previousState = machine.state;
        this.previousStateName = machine.stateName;
    }
}
exports.Control = Control;
//# sourceMappingURL=ControlObject.js.map