import { EventEmitter } from 'events';
import { machineHooksStack, MachineHooksState } from './hooks';

export { useState, useEffect, useMemo, useHistory } from './hooks';

const shallowCompare = (obj1: any, obj2: any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(key => obj1[key] === obj2[key]);

interface Current<StatesMapT> {
    name: keyof StatesMapT;
    data: any;
}

interface Events<StatesMapT> {
    change: Current<StatesMapT>;
    statechange: Current<StatesMapT>;
    datachange: Current<StatesMapT>;
}

export class Guard {
    constructor(public nextState: string) {}
}

export class HookMachine<StatesMapT, MachineDataT> {
    constructor(
        public states: StatesMapT,
        initialState: keyof StatesMapT,
        public data: MachineDataT
    ) {
        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        this.current = {
            name: initialState,
            data: this.runState(initialState),
        };
    }

    current: {
        name: keyof StatesMapT;
        data: any;
    };

    histories = new Map<keyof StatesMapT, MachineHooksState>();

    on: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        callback: (event: Current<StatesMapT>) => void
    ) => void;
    off: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        callback: (event: Current<StatesMapT>) => void
    ) => void;
    private emit: <K extends keyof Events<StatesMapT>>(
        eventName: K,
        event: Current<StatesMapT>
    ) => void;

    private runState = (state: keyof StatesMapT) => {
        this.hooksState.index = 0;
        machineHooksStack.push(this.hooksState);
        // @ts-ignore
        const updated = this.states[state](this.transition, this.data);
        machineHooksStack.pop();
        return updated;
    };

    transition = (nextState: keyof StatesMapT = this.current.name) => {
        if (nextState !== this.current.name) {
            for (const { remove, guards } of this.hooksState.items) {
                if (remove !== undefined) {
                    remove();
                    if (this.hooksState.useHistory && guards !== undefined) {
                        // make sure the guards won't stop it in the next run
                        guards.length = 0;
                        guards.push({});
                    }
                }
            }
            if (this.hooksState.useHistory) {
                this.histories.set(this.current.name, this.hooksState);
            }
            if (this.histories.has(nextState)) {
                this.hooksState = this.histories.get(nextState)!;
            } else {
                this.hooksState = new MachineHooksState(this.transition);
            }
        }

        let updated;
        try {
            updated = this.runState(nextState);
        } catch (e) {
            if (e instanceof Guard && e.nextState in this.states) {
                this.transition(e.nextState as keyof StatesMapT);
                return;
            }
        }

        const stateChanged = nextState !== this.current.name;
        const dataChanged = shallowCompare(updated, this.current.data) === false;

        if (stateChanged || dataChanged) {
            this.current = {
                name: nextState,
                data: updated,
            };
            // do observable thing
        }

        if (stateChanged) {
            this.emit('statechange', this.current);
        }
        if (dataChanged) {
            this.emit('datachange', this.current);
        }
        if (stateChanged || dataChanged) {
            this.emit('change', this.current);
        }
    };

    private hooksState = new MachineHooksState(this.transition);
}
