import { MachineHooksState } from './hooks';
export { useState, useEffect, useMemo, useHistory } from './hooks';
interface Current<StatesMapT> {
    name: keyof StatesMapT;
    data: any;
}
interface Events<StatesMapT> {
    change: Current<StatesMapT>;
    statechange: Current<StatesMapT>;
    datachange: Current<StatesMapT>;
}
export declare class HookMachine<StatesMapT, MachineDataT, FinalStateT = any> {
    states: StatesMapT;
    data: MachineDataT;
    constructor(states: StatesMapT, initialState: keyof StatesMapT, data: MachineDataT);
    current: {
        name: keyof StatesMapT;
        data: any;
    };
    histories: Map<keyof StatesMapT, MachineHooksState>;
    then: (cb: (data: FinalStateT) => any, errorCb: (error: Error) => any) => void;
    catch: (cb: (error: Error) => any) => void;
    finally: () => void;
    private resolve;
    private reject;
    on: <K extends keyof Events<StatesMapT>>(eventName: K, callback: (event: Current<StatesMapT>) => void) => void;
    off: <K extends keyof Events<StatesMapT>>(eventName: K, callback: (event: Current<StatesMapT>) => void) => void;
    private emit;
    private runState;
    transition: (nextState?: keyof StatesMapT) => void;
    private hooksState;
}
