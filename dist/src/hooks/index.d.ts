export declare class MachineHooksState {
    private transition;
    constructor(transition: () => void);
    items: Hook[];
    index: number;
    useHistory: boolean;
    refreshMachine: () => void;
}
declare abstract class Hook {
    abstract remove?: () => void;
    abstract dependencies?: any[];
    abstract handleCall: Function;
}
export declare const machineHooksStack: MachineHooksState[];
export declare const useState: <T>(defaultValue: T) => [T, (newValue: T) => void];
export declare const useEffect: (effect: () => void | (() => void), dependencies: any[]) => void;
export declare const useMemo: <T>(value: T, dependencies: any[]) => T;
export declare const useHistory: (value: boolean) => void;
export {};
