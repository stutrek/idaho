import { Machine, Control, Final } from '../../index';

interface OnOffStates {
    on: SwitchState;
    off: SwitchState;
    oopsie: SwitchState;
    done: SwitchState;
    dataSettingState: SwitchState;
}

type OnOffControl = Control<OnOffStates, {}, {}>;

type SwitchState = (
    control: OnOffControl
) => {
    oopsie: () => void;
    switch: () => void;
    done: () => Final<string>;
};

const off = (control: OnOffControl) => {
    return {
        oopsie: () => control.transition('oopsie'),
        switch: () => control.transition('on'),
        finish: () => control.transition('done'),
    };
};

const on = (control: OnOffControl) => {
    return {
        oopsie: () => control.transition('oopsie'),
        switch: () => control.transition('off'),
        finish: () => control.transition('done'),
        switchToDataSettingState: () => control.transition('dataSettingState'),
        setSomeData: () => {
            control.setData({
                hey: 'there',
            });
        },
    };
};

const oopsie = (control: OnOffControl) => {
    throw new Error('oops!');
};

const done = () => {
    return new Final('done');
};

const dataSettingState = (control: OnOffControl) => {
    control.setData({
        hey: 'there',
    });
    return {};
};

const onOffStates = { off, on, oopsie, done, dataSettingState };

const makeMachine = () => new Machine(onOffStates, 'on', {});

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
