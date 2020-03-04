var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Control = (function () {
    function Control(machine, targetState) {
        var _this = this;
        this.machine = machine;
        this.isActive = true;
        this.transition = function (nextState) {
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (_this.isActive === false && _this.stateName !== _this.machine.stateName) {
                throw new Error("Tried to transition from \"" + _this.stateName + "\", but Idaho is in a state called \"" + _this.machine.stateName + "\".");
            }
            _this.isActive = false;
            (_a = _this.machine).transition.apply(_a, __spreadArrays([nextState], args));
        };
        this.data = machine.data;
        this.stateName = targetState;
        this.setData = function (data) {
            if (_this.isActive === false && _this.stateName !== _this.machine.stateName) {
                throw new Error("Tried to set Idaho machine data from a state called \"" + _this.stateName + "\", but Idaho is in \"" + _this.machine.stateName + "\".");
            }
            machine.setData(data);
        };
        this.previousState = machine.state;
        this.previousStateName = machine.stateName;
    }
    return Control;
}());
export { Control };
//# sourceMappingURL=ControlObject.js.map