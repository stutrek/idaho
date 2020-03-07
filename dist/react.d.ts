import { Machine } from './src/Machine';
export declare function useMachineStateName<StatesT, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): keyof StatesT;
export declare function useMachineState<StatesT, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): any;
export declare function useMachineData<StatesT, DataT, FinalT>(machine: Machine<StatesT, DataT, FinalT>): DataT;
