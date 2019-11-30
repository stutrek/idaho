import { useEffect, useState, HookMachine } from '../dist/index';

const Red = transition => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            transition('green');
        }, 30000);
        return () => {
            clearTimeout(timeout);
        };
    });
    return {
        red: true,
        yellow: false,
        green: false,
    };
};

const Yellow = transition => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            transition('red');
        }, 3000);
        return () => {
            clearTimeout(timeout);
        };
    });
    return {
        red: false,
        yellow: true,
        green: false,
    };
};

const Green = transition => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            transition('yellow');
        }, 27000);
        return () => {
            clearTimeout(timeout);
        };
    });
    return {
        red: false,
        yellow: false,
        green: true,
    };
};

const BlinkingRed = transition => {
    const [isOn, setIsOn] = useStateData(true);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsOn(!isOn);
        }, 3000);
        return () => {
            clearTimeout(timeout);
        };
    }, [isOn]);
    return {
        red: isOn,
        yellow: false,
        green: false,
    };
};

const states = {
    red: Red,
    green: Green,
    yellow: Yellow,
    blinkingRed: BlinkingRed,
};

const machine = new HookMachine(states, 'blinkingRed');

setTimeout(() => {
    machine.transition('red');
}, 20000);

machine.on('change', status => {
    console.log('change!', status);
});
