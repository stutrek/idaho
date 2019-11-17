export declare const useState: <T>(defaultValue: T) => [T, (newValue: T) => void];
export declare const useEffect: (effect: () => () => {}, guards: any[]) => void;
interface Current<StatesMapT> {
    name: keyof StatesMapT;
    data: any;
}
interface Events<StatesMapT> {
    change: Current<StatesMapT>;
    statechange: Current<StatesMapT>;
    datachange: Current<StatesMapT>;
}
export declare class HookMachine<StatesMapT, MachineDataT> {
    states: StatesMapT;
    data: MachineDataT;
    constructor(states: StatesMapT, initialState: keyof StatesMapT, data: MachineDataT);
    current: {
        name: keyof StatesMapT;
        data: any;
    };
    on: <K extends keyof Events<StatesMapT>>(eventName: K, callback: (event: Current<StatesMapT>) => void) => void;
    off: <K extends keyof Events<StatesMapT>>(eventName: K, callback: (event: Current<StatesMapT>) => void) => void;
    private emit;
    private runState;
    transition: (nextState?: keyof StatesMapT) => void;
    private hooksState;
}
export {};
