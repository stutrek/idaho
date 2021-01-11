import { useState, useEffect } from 'react';

import { Machine, StateMap } from './src/Machine';

export function useMachineStateName<StatesT extends StateMap, DataT, FinalT>(
    machine: Machine<StatesT, DataT, FinalT>
) {
    const [stateName, setStateName] = useState<keyof StatesT>(machine.stateName);

    useEffect(() => {
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

export function useMachineState<StatesT extends StateMap, DataT, FinalT>(
    machine: Machine<StatesT, DataT, FinalT>
) {
    const [state, setStateValue] = useState<ReturnType<StatesT[keyof StatesT]>>(machine.state);

    useEffect(() => {
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

export function useMachineData<StatesT extends StateMap, DataT, FinalT>(
    machine: Machine<StatesT, DataT, FinalT>
): DataT {
    const [data, setData] = useState<DataT>(machine.data);

    useEffect(() => {
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

export function useMachine<StatesT extends StateMap, DataT, FinalT>(
    machine: Machine<StatesT, DataT, FinalT>
) {
    const [{ stateName, state }, setStateName] = useState({
        stateName: machine.stateName,
        state: machine.state,
    });

    useEffect(() => {
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

    return [stateName, state] as [typeof stateName, StatesT[typeof stateName]];
}
