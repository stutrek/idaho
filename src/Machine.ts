import { State, IState } from './State';
import { EventEmitter } from 'events';

interface Events<MachineT> {
    transition: MachineT;
    'child-transition': MachineT;
    'data-change': MachineT;
}

export class Machine<
    StatesT extends State<Machine<StatesT, ParentT, MachineDataT>>,
    ParentT extends Machine<any> = undefined,
    MachineDataT = {}
> {
    constructor(
        public State?: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>,
        public parent?: ParentT
    ) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        // @ts-ignore
        if (State === undefined && this.initialState !== undefined) {
            // @ts-ignore
            this.transition(this.initialState);
        } else if (State !== undefined) {
            this.transition(State);
        } else {
            throw new Error('Machine needs either a state passed it on an initialState');
        }
    }

    initialState: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>> | undefined;

    histories = new Map<IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>, StatesT>();

    effectClearers: (() => void)[] = [];

    current: StatesT;

    on: <K extends keyof Events<Machine<StatesT, ParentT, MachineDataT>>>(
        eventName: K,
        state: StatesT | MachineDataT
    ) => void;
    off: <K extends keyof Events<Machine<StatesT, ParentT, MachineDataT>>>(
        eventName: K,
        state: StatesT | MachineDataT
    ) => void;
    private emit: <K extends keyof Events<Machine<StatesT, ParentT, MachineDataT>>>(
        eventName: K,
        state: StatesT | MachineDataT
    ) => void;

    data: MachineDataT | undefined;

    private nextData: Partial<MachineDataT> | undefined;
    setData(newData: Partial<MachineDataT>) {
        this.data = {
            ...this.data,
            ...newData,
        };
        this.emit('data-change', this.data!);
    }

    transition(NextState: IState<StatesT, Machine<StatesT, ParentT, MachineDataT>>) {
        for (const clearer of this.effectClearers) {
            if (clearer) {
                clearer();
            }
        }
        if (this.histories.has(NextState)) {
            const history = this.histories.get(NextState);
            this.current = history;
        } else {
            this.current = new NextState(this);
        }

        if (this.current.effects) {
            // @ts-ignore
            this.effectClearers = this.current.effects.map(effect => effect(this));
        } else {
            this.effectClearers = [];
        }

        // @ts-ignore
        this.emit('transition', this);
        if (this.parent) {
            this.parent.receiveChildTransition(this);
        }
    }

    receiveChildTransition(machine: Machine<any, any>) {
        // @ts-ignore
        this.emit('child-transition', machine);
        if (this.parent) {
            this.parent.receiveChildTransition(machine);
        }
    }
}
