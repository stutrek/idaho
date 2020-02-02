const { useEffect, useStateData, Machine } = require('../dist/index');

/*
 
This example shows how to use Idaho to create a stoplight.

Each state has a boolean for red, yellow, and green. Each state transitions to the next state after a timer.

*/

const Red = control => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            control.transition('green');
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

const Yellow = control => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            control.transition('red');
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

const Green = control => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            control.transition('yellow');
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

const BlinkingRed = control => {
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

const machine = new Machine(states, 'blinkingRed');

setTimeout(() => {
    machine.transition('red');
}, 20000);

machine.on('change', machine => {
    console.log('change!', machine.stateName, machine.state);
});
