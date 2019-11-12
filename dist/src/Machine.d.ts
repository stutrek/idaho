import { State, IState } from './State';
interface Events<StatesT> {
    transition: Machine<StatesT>;
    'child-transition': Machine<StatesT>;
}
export declare class Machine<StatesT> {
    State?: IState<any, any>;
    parent?: Machine<any>;
    constructor(State?: IState<any, any>, parent?: Machine<any>);
    histories: Map<IState<any, any>, State<any, any>>;
    effectClearers: (Function | undefined)[];
    static initialState?: IState<any, any>;
    current: State<any, any>;
    on: <K extends keyof Events<StatesT>>(eventName: K, state: StatesT) => void;
    off: <K extends keyof Events<StatesT>>(eventName: K, state: StatesT) => void;
    private emit;
    transition(NextState: IState<any, any>): void;
    receiveChildTransition(machine: Machine<any>): void;
}
export {};
