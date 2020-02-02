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
        switchToSameState: () => control.transition('on'),
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
        expect(machine.stateName).toBe('on');
    });

    it('should switch to off', () => {
        const machine = makeMachine();
        machine.state.switch();
        expect(machine.stateName).toBe('off');
    });

    it('should whine when you try to switch from a state the machine is no longer in.', () => {
        const machine = makeMachine();
        const oldCurrent = machine.state;
        machine.state.switch();
        expect(oldCurrent.switch).toThrow();
    });

    it('should throw when a state throws', () => {
        const machine = makeMachine();
        expect(() => machine.state.oopsie()).toThrowErrorMatchingInlineSnapshot(`"oops!"`);
    });

    it('should reject when a state throws', () => {
        const machine = makeMachine();
        try {
            machine.state.oopsie();
        } catch (e) {
            // eslint-disable-line
        }
        expect(machine).rejects.toMatchInlineSnapshot(`[Error: oops!]`);
    });

    it('should resolve when a state returns a Finish', async () => {
        const machine = makeMachine();
        machine.state.finish();
        const value = await machine;
        expect(value).toBe('done');
    });

    it('should send arguments to states', async () => {
        const machine = makeMachine();
        machine.state.sendArguments(1, 2);
        expect(machine.state.arg1).toBe(1);
        expect(machine.state.arg2).toBe(2);
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

        machine.state.switchToDataSettingState();

        expect(machine.data).toEqual({
            hey: 'there',
        });
    });

    it('should complain when you set data from a state the machine is not in.', () => {
        const machine = makeMachine();
        const oldCurrent = machine.state;
        machine.state.switch();

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

        machine.state.switch();

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

        machine.state.switchToDataSettingState();

        expect(spy).toHaveBeenCalledWith(machine);
        expect(spy2).toHaveBeenCalledWith(machine);
    });

    it('should be only call change when transitioning to the same state as before', () => {
        const machine = makeMachine();
        const spy = jest.fn();
        const spy2 = jest.fn();
        const spy3 = jest.fn();

        machine.on('datachange', spy);
        machine.on('statechange', spy2);
        machine.on('change', spy3);

        machine.state.switchToSameState();

        expect(spy).toHaveBeenCalledTimes(0);
        expect(spy2).toHaveBeenCalledTimes(0);
        expect(spy3).toHaveBeenCalledWith(machine);
    });
});

describe('hooks', () => {
    it('should store data on the state state', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithData();

        expect(machine.state.value).toBe(0);

        machine.state.setValue(69);
        expect(machine.state.value).toBe(69); // heh
    });

    it('should destroy state data when switched out and back', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithData();
        machine.state.setValue(69);
        machine.state.turnBackOn();
        machine.state.switchToStateWithData();

        expect(machine.state.value).toBe(0);
    });

    it('should keep hook data when its a history state.', () => {
        const machine = makeMachine();

        machine.state.switchToHistoryState();
        machine.state.setValue(69);
        machine.state.turnBackOn();
        machine.state.switchToHistoryState();

        expect(machine.state.value).toBe(69);
    });

    it('should run effects when appropriate.', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithEffect();
        expect(machine.state.runs).toBe(1);
        machine.state.dontRunAgain();
        expect(machine.state.runs).toBe(1);
        machine.state.runAgain();
        expect(machine.state.runs).toBe(2);

        machine.state.switchToOn();
        machine.state.switchToStateWithEffect();
        expect(machine.state.runs).toBe(3);
    });

    it('should rerun effects when switching back with history.', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithEffectAndHistory();
        expect(machine.state.runs).toBe(1);
        machine.state.dontRunAgain();
        expect(machine.state.runs).toBe(1);
        machine.state.runAgain();
        expect(machine.state.runs).toBe(2);

        machine.state.switchToOn();
        machine.state.switchToStateWithEffectAndHistory();
        expect(machine.state.runs).toBe(3);
    });

    it('should run cleanups.', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithEffectAndCleanup();
        expect(cleanups).toBe(0);
        machine.state.dontRunAgain();
        expect(cleanups).toBe(0);
        machine.state.runAgain();
        expect(cleanups).toBe(1);

        machine.state.switchToOn();
        expect(cleanups).toBe(2);
    });

    it('should memoize.', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithMemo();

        const original = machine.state.memoized;
        machine.state.dontRerun();
        expect(original).toBe(machine.state.memoized);

        machine.state.rerun();
        expect(original !== machine.state.memoized).toBe(true);
    });

    it('should call change handler when setState is called', () => {
        const machine = makeMachine();

        machine.state.switchToStateWithData();

        const spy = jest.fn();
        const spy2 = jest.fn();
        const spy3 = jest.fn();

        machine.on('datachange', spy);
        machine.on('statechange', spy2);
        machine.on('change', spy3);

        machine.state.setValue(69);

        expect(spy).toHaveBeenCalledTimes(0);
        expect(spy2).toHaveBeenCalledTimes(0);
        expect(spy3).toHaveBeenCalledWith(machine);

        expect(machine.state.value).toBe(69); // heh
    });
});
