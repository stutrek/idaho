import { State, IState } from './State';
import { EventEmitter } from 'events';

interface Events<StatesT> {
    transition: Machine<StatesT>;
    'child-transition': Machine<StatesT>;
}

export class Machine<StatesT> {
    constructor(public State?: IState<any, any>, public parent?: Machine<any>) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        // @ts-ignore
        if (State === undefined && this.constructor.initialState !== undefined) {
            // @ts-ignore
            this.transition(this.constructor.initialState);
        } else if (State !== undefined) {
            this.transition(State);
        } else {
            throw new Error('Machine needs either a state passed it on an initialState');
        }
    }

    histories = new Map<IState<any, any>, State<any, any>>();

    effectClearers: (Function | undefined)[] = [];

    static initialState?: IState<any, any>;
    current: State<any, any>;

    on: <K extends keyof Events<StatesT>>(eventName: K, state: StatesT) => void;
    off: <K extends keyof Events<StatesT>>(eventName: K, state: StatesT) => void;
    private emit: <K extends keyof Events<StatesT>>(eventName: K, state: StatesT) => void;

    transition(NextState: IState<any, any>) {
        for (const clearer of this.effectClearers) {
            if (clearer) {
                clearer();
            }
        }
        if (this.histories.has(NextState)) {
            this.current = this.histories.get(NextState);
        } else {
            this.current = new NextState(this);
        }
        if (this.current.effects) {
            this.effectClearers = this.current.effects.map(effect => effect());
        } else {
            this.effectClearers = [];
        }

        // @ts-ignore
        this.emit('transition', this);
        if (this.parent) {
            this.parent.receiveChildTransition(this);
        }
    }

    receiveChildTransition(machine: Machine<any>) {
        // @ts-ignore
        this.emit('child-transition', machine);
        if (this.parent) {
            this.parent.receiveChildTransition(machine);
        }
    }
}
