import { Machine } from './Machine';
declare type PropertyReturnTypes<T> = T[keyof T] extends (a: any) => any ? ReturnType<T[keyof T]> : never;
export declare class Control<StatesMapT, DataT, FinalStateT> {
    private machine;
    constructor(machine: Machine<StatesMapT, DataT, FinalStateT>);
    data: DataT;
    setData: (newData: Partial<DataT>) => void;
    previousState: PropertyReturnTypes<StatesMapT>;
    previousStateName: keyof StatesMapT;
    isActive: boolean;
    transition: (nextState: keyof StatesMapT, ...args: any[]) => void;
}
export {};
