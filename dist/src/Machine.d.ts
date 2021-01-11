import { MachineHooksState } from './hooks';
interface Events<StatesMapT extends StateMap, MachineDataT, FinalStateT> {
    change: Machine<StatesMapT, MachineDataT, FinalStateT>;
    statechange: Machine<StatesMapT, MachineDataT, FinalStateT>;
    datachange: Machine<StatesMapT, MachineDataT, FinalStateT>;
}
declare type StateFunction = (controller: any) => any;
export declare type StateMap = {
    [index: string]: StateFunction;
};
export declare class Machine<StatesMapT extends StateMap, MachineDataT, FinalStateT = never> {
    states: StatesMapT;
    data?: MachineDataT;
    constructor(states: StatesMapT, initialState: keyof StatesMapT, data?: MachineDataT);
    stateName: keyof StatesMapT;
    state: ReturnType<StatesMapT[keyof StatesMapT]>;
    private stateArgs;
    private isTransitioning;
    histories: Map<keyof StatesMapT, MachineHooksState>;
    then: (cb: (data: FinalStateT) => any, errorCb: (error: Error) => any) => void;
    catch: (cb: (error: Error) => any) => void;
    finally: () => void;
    private resolve;
    private reject;
    private resolved;
    private rejected;
    on: <K extends keyof Events<StatesMapT, MachineDataT, FinalStateT>>(eventName: K, callback: (event: Machine<StatesMapT, MachineDataT, FinalStateT>) => void) => void;
    off: <K extends keyof Events<StatesMapT, MachineDataT, FinalStateT>>(eventName: K, callback: (event: Machine<StatesMapT, MachineDataT, FinalStateT>) => void) => void;
    private emit;
    setData(newData: Partial<MachineDataT>): void;
    private runState;
    transition: (nextStateName: keyof StatesMapT, ...args: any[]) => void;
    private hooksState;
}
export {};
