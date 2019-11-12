import { Machine } from './Machine';
export interface IState<StateDataT, MachineT> {
    new (machine: MachineT): State<StateDataT, MachineT>;
}
interface Events<StateDataT, MachineT> {
    change: State<StateDataT, MachineT>;
}
export declare class State<StateDataT, MachineT> {
    private machine;
    constructor(machine: Machine<State<StateDataT, MachineT>>);
    data: StateDataT | undefined;
    effects: (() => Function | undefined)[] | undefined;
    private dataUpdatePromise;
    on: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    off: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    private emit;
    setData(newData: Partial<StateDataT>): void;
}
export {};
