import { EventEmitter } from 'events';

import { Machine } from './Machine';

export interface IState<State, MachineT> {
    new <MachineT>(machine: MachineT): State;
}

interface Events<StateDataT, MachineT extends Machine<any, any, any>> {
    change: State<MachineT, StateDataT>;
}

export class State<
    // @ts-ignore
    MachineT extends Machine<State<MachineT, StateDataT>, any, any>,
    StateDataT = undefined
> {
    constructor(public machine: MachineT) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
    }

    data: StateDataT | undefined;
    private nextData: Partial<StateDataT> | undefined;
    effects: Array<(machine: MachineT) => () => void | void> | undefined;

    on: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    off: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    private emit: <K extends keyof Events<StateDataT, MachineT>>(
        eventName: K,
        data: StateDataT
    ) => void;

    setData(newData: Partial<StateDataT>) {
        if (!this.nextData) {
            this.nextData = newData;
            Promise.resolve().then(() => {
                this.data = {
                    ...this.data,
                    ...this.nextData,
                };
                this.nextData = undefined;
                this.emit('change', this.data);
            });
        } else {
            this.nextData = {
                ...this.nextData,
                ...newData,
            };
        }
    }
}
