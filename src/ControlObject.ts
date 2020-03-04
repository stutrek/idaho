import { Machine } from './Machine';

type PropertyReturnTypes<T> = T[keyof T] extends (a: any) => any ? ReturnType<T[keyof T]> : never;

type PropertyParameterTypes<T> = T[keyof T] extends (a: any) => any
    ? Parameters<T[keyof T]>
    : never;

export class Control<StatesMapT, DataT, FinalStateT> {
    constructor(
        private machine: Machine<StatesMapT, DataT, FinalStateT>,
        targetState: keyof StatesMapT
    ) {
        this.data = machine.data;
        this.stateName = targetState;
        this.setData = (data: Partial<DataT>) => {
            if (this.isActive === false && this.stateName !== this.machine.stateName) {
                throw new Error(
                    `Tried to set Idaho machine data from a state called "${this.stateName}", but Idaho is in "${this.machine.stateName}".`
                );
            }
            machine.setData(data);
        };
        this.previousState = machine.state;
        this.previousStateName = machine.stateName;
    }

    data: DataT;
    setData: (newData: Partial<DataT>) => void;
    stateName: keyof StatesMapT;
    previousState: PropertyReturnTypes<StatesMapT>;
    previousStateName: keyof StatesMapT;
    isActive = true;

    transition = (nextState: keyof StatesMapT, ...args: any[]) => {
        if (this.isActive === false && this.stateName !== this.machine.stateName) {
            throw new Error(
                `Tried to transition from "${this.stateName}", but Idaho is in a state called "${this.machine.stateName}".`
            );
        }
        this.isActive = false;
        this.machine.transition(nextState, ...args);
    };
}
