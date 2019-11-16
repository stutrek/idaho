import { State, IState } from './State';
interface Events<MachineT> {
    transition: MachineT;
    'child-transition': MachineT;
    'data-change': MachineT;
}
export declare class Machine<StatesT extends State<Machine<StatesT, ParentT, MachineDataT>>, ParentT extends Machine<any> = undefined, MachineDataT = {}> {
    State?: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>;
    parent?: ParentT;
    constructor(State?: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>, parent?: ParentT);
    initialState: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>> | undefined;
    histories: Map<IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>, StatesT>;
    effectClearers: (() => void)[];
    current: StatesT;
    on: <K extends keyof Events<Machine<StatesT, ParentT, MachineDataT>>>(eventName: K, state: StatesT | MachineDataT) => void;
    off: <K extends keyof Events<Machine<StatesT, ParentT, MachineDataT>>>(eventName: K, state: StatesT | MachineDataT) => void;
    private emit;
    data: MachineDataT | undefined;
    private nextData;
    setData(newData: Partial<MachineDataT>): void;
    transition(NextState: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>): void;
    receiveChildTransition(machine: Machine<any, any>): void;
}
export {};
