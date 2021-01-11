"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function useMachineStateName(machine) {
    const [stateName, setStateName] = react_1.useState(machine.stateName);
    react_1.useEffect(() => {
        const listener = () => {
            setStateName(machine.stateName);
        };
        machine.on('statechange', listener);
        return () => {
            machine.off('statechange', listener);
        };
    }, [machine]);
    return stateName;
}
exports.useMachineStateName = useMachineStateName;
function useMachineState(machine) {
    const [state, setStateValue] = react_1.useState(machine.state);
    react_1.useEffect(() => {
        const listener = () => {
            setStateValue(machine.state);
        };
        machine.on('statechange', listener);
        return () => {
            machine.off('statechange', listener);
        };
    }, [machine]);
    return state;
}
exports.useMachineState = useMachineState;
function useMachineData(machine) {
    const [data, setData] = react_1.useState(machine.data);
    react_1.useEffect(() => {
        const listener = () => {
            setData(machine.data);
        };
        machine.on('datachange', listener);
        return () => {
            machine.off('datachange', listener);
        };
    }, [machine]);
    return data;
}
exports.useMachineData = useMachineData;
function useMachine(machine) {
    const [{ stateName, state }, setStateName] = react_1.useState({
        stateName: machine.stateName,
        state: machine.state,
    });
    react_1.useEffect(() => {
        const listener = () => {
            setStateName({
                stateName: machine.stateName,
                state: machine.state,
            });
        };
        machine.on('statechange', listener);
        return () => {
            machine.off('statechange', listener);
        };
    }, [machine]);
    return [stateName, state];
}
exports.useMachine = useMachine;
//# sourceMappingURL=react.js.map