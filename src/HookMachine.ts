import { EventEmitter } from 'events';
import { machineHooksStack, MachineHooksState } from './hooks';
import { Guard, Final } from './hooks/classes';

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

export class HookMachine<StatesMapT, MachineDataT, FinalStateT = any> {
    constructor(
        public states: StatesMapT,
        initialState: keyof StatesMapT,
        public data: MachineDataT
    ) {
        const internalPromise = new Promise<FinalStateT>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.then = internalPromise.then.bind(internalPromise);
        this.catch = internalPromise.catch.bind(internalPromise);
        this.finally = internalPromise.finally.bind(internalPromise);

        const emitter = new EventEmitter();
        this.on = emitter.on.bind(emitter);
        this.off = emitter.off.bind(emitter);
        this.emit = emitter.emit.bind(emitter);

        const initial = this.runState(initialState);

        this.currentName = initial.finalState;
        this.current = initial.updated;
    }

    currentName: keyof StatesMapT;
    current: any;

    histories = new Map<keyof StatesMapT, MachineHooksState>();

    then: (cb: (data: FinalStateT) => any, errorCb: (error: Error) => any) => void;
    catch: (cb: (error: Error) => any) => void;
    finally: () => void;

    private resolve: (data: FinalStateT) => void = () => undefined;
    private reject: (data: FinalStateT) => void = () => undefined;

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

    private runState = (
        state: keyof StatesMapT
    ): { finalState: keyof StatesMapT; updated: any } => {
        if (typeof this.states[state] !== 'function') {
            throw new Error(`Could not transition to unknown state ${state}.`);
        }
        this.hooksState.index = 0;
        let updated: any;
        try {
            machineHooksStack.push(this.hooksState);
            // @ts-ignore
            updated = this.states[state](this.transition, this.data);
            machineHooksStack.pop();
        } catch (e) {
            machineHooksStack.pop();
            if (e instanceof Guard && e.nextState in this.states) {
                return this.runState(e.nextState as keyof StatesMapT);
            }
            throw e;
        }
        return { finalState: state, updated };
    };

    transition = (nextState: keyof StatesMapT = this.current.name) => {
        if (nextState !== this.current.name) {
            for (const { remove, dependencies } of this.hooksState.items) {
                if (remove !== undefined) {
                    remove();
                    if (this.hooksState.useHistory && dependencies !== undefined) {
                        // make sure the dependencies won't stop it in the next run
                        dependencies.length = 0;
                        dependencies.push({});
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

        const { finalState, updated } = this.runState(nextState);

        const stateChanged = finalState !== this.current.name;
        const dataChanged = shallowCompare(updated, this.current.data) === false;

        if (stateChanged || dataChanged) {
            this.current = {
                name: finalState,
                data: updated,
            };
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

        if (updated instanceof Final) {
            // @ts-ignore
            this.resolve(updated.data);
        }
    };

    private hooksState = new MachineHooksState(this.transition);
}
