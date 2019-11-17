import { Machine } from './Machine';
export interface IState<State, MachineT> {
    new <MachineT>(machine: MachineT): State;
}
interface Events<StateDataT, MachineT extends Machine<any, any, any>> {
    change: State<MachineT, StateDataT>;
}
export declare class State<MachineT extends Machine<State<MachineT, StateDataT>, any, any>, StateDataT = undefined> {
    machine: MachineT;
    constructor(machine: MachineT);
    data: StateDataT | undefined;
    private nextData;
    effects: Array<(machine: MachineT) => () => void | void> | undefined;
    on: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    off: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    private emit;
    setData(newData: Partial<StateDataT>): void;
}
export {};
