import { Machine, Control } from '../../index';

interface OnOffStates {
    on: SwitchState;
    off: SwitchState;
}

type OnOffControl = Control<OnOffStates, {}, never>;

type SwitchState = (control: OnOffControl) => { switch: () => void };

const off = (control: OnOffControl) => {
    return {
        switch: () => control.transition('on'),
    };
};

const on = (control: OnOffControl) => {
    return {
        switch: () => control.transition('off'),
    };
};

const onOffStates = { off, on };

describe('basics', () => {
    it('should make a new with the right initial state', () => {
        const machine = new Machine(onOffStates, 'on');
        expect(machine.currentName).toBe('on');
    });
    it('should switch to off', () => {
        const machine = new Machine(onOffStates, 'on');
        machine.current.switch();
        expect(machine.currentName).toBe('off');
    });
});
