import { EventEmitter } from 'events';

import { Machine } from './Machine';

export interface IState<StateDataT, MachineT> {
    new (machine: MachineT): State<StateDataT, MachineT>;
}

interface Events<StateDataT, MachineT> {
    change: State<StateDataT, MachineT>;
}

export class State<StateDataT, MachineT> {
    constructor(private machine: Machine<State<StateDataT, MachineT>>) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);
    }

    data: StateDataT | undefined;
    effects: (() => Function | undefined)[] | undefined;

    private dataUpdatePromise: Promise<void> | undefined;

    on: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    off: <K extends keyof Events<StateDataT, MachineT>>(eventName: K, data: StateDataT) => void;
    private emit: <K extends keyof Events<StateDataT, MachineT>>(
        eventName: K,
        data: StateDataT
    ) => void;

    setData(newData: Partial<StateDataT>) {
        this.data = {
            ...this.data,
            ...newData,
        };
        if (this.dataUpdatePromise === undefined) {
            this.dataUpdatePromise = Promise.resolve().then(() => {
                this.dataUpdatePromise = undefined;
                this.emit('change', this.data);
            });
        }
    }
}
