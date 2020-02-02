import { Machine, Control, Final, useStateData, useHistory, useEffect, useMemo } from '../../index';

type SwitchState = (
    control: TestControl
) => {
    oopsie: () => void;
    switch: () => void;
    done: () => Final<string>;
};

const off = (control: TestControl) => {
    return {
        oopsie: () => control.transition('oopsie'),
        switch: () => control.transition('on'),
        finish: () => control.transition('done'),
    };
};

const on = (control: TestControl) => {
    return {
        oopsie: () => control.transition('oopsie'),
        switch: () => control.transition('off'),
        finish: () => control.transition('done'),
        sendArguments: (arg1: any, arg2: any) =>
            control.transition('stateWithArguments', arg1, arg2),
        switchToDataSettingState: () => control.transition('dataSettingState'),
        setSomeData: () => {
            control.setData({
                hey: 'there',
            });
        },
        switchToStateWithData: () => control.transition('stateWithData'),
        switchToHistoryState: () => control.transition('stateWithHistory'),
        switchToStateWithEffect: () => control.transition('stateWithEffect', 0),
        switchToStateWithEffectAndHistory: () => control.transition('stateWithEffectAndHistory', 0),
        switchToStateWithEffectAndCleanup: () => control.transition('stateWithEffectAndCleanup', 0),
        switchToStateWithMemo: () => control.transition('stateWithMemo'),
    };
};

const oopsie = (control: TestControl) => {
    throw new Error('oops!');
};

const done = () => {
    return new Final('done');
};

const stateWithArguments = (control: TestControl, arg1: any, arg2: any) => {
    return {
        arg1,
        arg2,
    };
};
const dataSettingState = (control: TestControl) => {
    control.setData({
        hey: 'there',
    });
    return {};
};

const stateWithData = (control: TestControl) => {
    const [value, setValue] = useStateData(0);
    return {
        setValue,
        value,
        turnBackOn: () => control.transition('on'),
    };
};

const stateWithHistory = (control: TestControl) => {
    const [value, setValue] = useStateData(0);
    useHistory(true);
    return {
        setValue,
        value,
        turnBackOn: () => control.transition('on'),
    };
};

let runs = 0;
const stateWithEffect = (control: TestControl, arg: number) => {
    useEffect(() => {
        runs++;
    }, [arg]);

    return {
        runs,
        runAgain: () => control.transition('stateWithEffect', arg + 1),
        dontRunAgain: () => control.transition('stateWithEffect', arg),
        switchToOn: () => control.transition('on'),
    };
};

let runs2 = 0;
const stateWithEffectAndHistory = (control: TestControl, arg: number) => {
    useHistory(true);
    useEffect(() => {
        runs2++;
    }, [arg]);

    return {
        runs: runs2,
        runAgain: () => control.transition('stateWithEffectAndHistory', arg + 1),
        dontRunAgain: () => control.transition('stateWithEffectAndHistory', arg),
        switchToOn: () => control.transition('on'),
    };
};

let runs3 = 0;
let cleanups = 0;
const stateWithEffectAndCleanup = (control: TestControl, arg: number) => {
    useEffect(() => {
        runs3++;
        return () => {
            cleanups++;
        };
    }, [arg]);

    return {
        runs: runs3,
        runAgain: () => control.transition('stateWithEffectAndCleanup', arg + 1),
        dontRunAgain: () => control.transition('stateWithEffectAndCleanup', arg),
        switchToOn: () => control.transition('on'),
    };
};

const stateWithMemo = (control: TestControl) => {
    const [data, setData] = useStateData(0);
    const memoized = useMemo(
        {
            data,
        },
        [data]
    );

    return {
        memoized,
        rerun: () => setData(data + 1),
        dontRerun: () => control.transition('stateWithMemo'),
    };
};

interface TestStates {
    on: SwitchState;
    off: SwitchState;
    oopsie: SwitchState;
    done: SwitchState;
    dataSettingState: SwitchState;
    stateWithData: SwitchState;
    stateWithHistory: SwitchState;
    stateWithArguments: SwitchState;
    stateWithEffect: SwitchState;
    stateWithEffectAndHistory: SwitchState;
    stateWithEffectAndCleanup: SwitchState;
    stateWithMemo: SwitchState;
}

const testStates = {
    off,
    on,
    oopsie,
    done,
    dataSettingState,
    stateWithData,
    stateWithHistory,
    stateWithArguments,
    stateWithEffect,
    stateWithEffectAndHistory,
    stateWithEffectAndCleanup,
    stateWithMemo,
};

type TestControl = Control<TestStates, {}, {}>;

const makeMachine = () => new Machine(testStates, 'on', {});

describe('lifecycle', () => {
    it('should make a new with the right initial state', () => {
        const machine = makeMachine();
        expect(machine.currentName).toBe('on');
    });

    it('should switch to off', () => {
        const machine = makeMachine();
        machine.current.switch();
        expect(machine.currentName).toBe('off');
    });

    it('should whine when you try to switch from a state the machine is no longer in.', () => {
        const machine = makeMachine();
        const oldCurrent = machine.current;
        machine.current.switch();
        expect(oldCurrent.switch).toThrow();
    });

    it('should throw when a state throws', () => {
        const machine = makeMachine();
        expect(() => machine.current.oopsie()).toThrowErrorMatchingInlineSnapshot(`"oops!"`);
    });

    it('should reject when a state throws', () => {
        const machine = makeMachine();
        try {
            machine.current.oopsie();
        } catch (e) {
            // eslint-disable-line
        }
        expect(machine).rejects.toMatchInlineSnapshot(`[Error: oops!]`);
    });

    it('should resolve when a state returns a Finish', async () => {
        const machine = makeMachine();
        machine.current.finish();
        const value = await machine;
        expect(value).toBe('done');
    });

    it('should send arguments to states', async () => {
        const machine = makeMachine();
        machine.current.sendArguments(1, 2);
        expect(machine.current.arg1).toBe(1);
        expect(machine.current.arg2).toBe(2);
    });
});

describe('data', () => {
    it('should have data that can be changed', () => {
        const machine = makeMachine();

        machine.setData({
            hey: 'there',
        });

        expect(machine.data).toEqual({
            hey: 'there',
        });
    });

    it('should be able to set data from a state', () => {
        const machine = makeMachine();

        machine.current.switchToDataSettingState();

        expect(machine.data).toEqual({
            hey: 'there',
        });
    });

    it('should complain when you set data from a state the machine is not in.', () => {
        const machine = makeMachine();
        const oldCurrent = machine.current;
        machine.current.switch();

        expect(oldCurrent.setSomeData).toThrow();
    });
});

describe('emitter', () => {
    it('should emit when you change states', () => {
        const machine = makeMachine();
        const spy = jest.fn();
        const spy2 = jest.fn();

        machine.on('statechange', spy);
        machine.on('change', spy2);

        machine.current.switch();

        expect(spy).toHaveBeenCalledWith(machine);
        expect(spy2).toHaveBeenCalledWith(machine);
    });

    it('should emit when you change data', () => {
        const machine = makeMachine();
        const spy = jest.fn();
        const spy2 = jest.fn();

        machine.on('datachange', spy);
        machine.on('change', spy2);

        machine.setData({
            hey: 'there',
        });

        expect(spy).toHaveBeenCalledWith(machine);
        expect(spy2).toHaveBeenCalledWith(machine);
    });

    it('should be able to set data from a state', () => {
        const machine = makeMachine();
        const spy = jest.fn();
        const spy2 = jest.fn();

        machine.on('datachange', spy);
        machine.on('change', spy2);

        machine.current.switchToDataSettingState();

        expect(spy).toHaveBeenCalledWith(machine);
        expect(spy2).toHaveBeenCalledWith(machine);
    });
});

describe('hooks', () => {
    it('should store data on the current state', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithData();

        expect(machine.current.value).toBe(0);

        machine.current.setValue(69);
        expect(machine.current.value).toBe(69); // heh
    });

    it('should destroy state data when switched out and back', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithData();
        machine.current.setValue(69);
        machine.current.turnBackOn();
        machine.current.switchToStateWithData();

        expect(machine.current.value).toBe(0);
    });

    it('should keep hook data when its a history state.', () => {
        const machine = makeMachine();

        machine.current.switchToHistoryState();
        machine.current.setValue(69);
        machine.current.turnBackOn();
        machine.current.switchToHistoryState();

        expect(machine.current.value).toBe(69);
    });

    it('should run effects when appropriate.', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithEffect();
        expect(machine.current.runs).toBe(1);
        machine.current.dontRunAgain();
        expect(machine.current.runs).toBe(1);
        machine.current.runAgain();
        expect(machine.current.runs).toBe(2);

        machine.current.switchToOn();
        machine.current.switchToStateWithEffect();
        expect(machine.current.runs).toBe(3);
    });

    it('should rerun effects when switching back with history.', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithEffectAndHistory();
        expect(machine.current.runs).toBe(1);
        machine.current.dontRunAgain();
        expect(machine.current.runs).toBe(1);
        machine.current.runAgain();
        expect(machine.current.runs).toBe(2);

        machine.current.switchToOn();
        machine.current.switchToStateWithEffectAndHistory();
        expect(machine.current.runs).toBe(3);
    });

    it('should run cleanups.', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithEffectAndCleanup();
        expect(cleanups).toBe(0);
        machine.current.dontRunAgain();
        expect(cleanups).toBe(0);
        machine.current.runAgain();
        expect(cleanups).toBe(1);

        machine.current.switchToOn();
        expect(cleanups).toBe(2);
    });

    it('should memoize.', () => {
        const machine = makeMachine();

        machine.current.switchToStateWithMemo();

        const original = machine.current.memoized;
        machine.current.dontRerun();
        expect(original).toBe(machine.current.memoized);

        machine.current.rerun();
        expect(original !== machine.current.memoized).toBe(true);
    });
});
