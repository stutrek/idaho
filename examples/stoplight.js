const { useEffect, useStateData, Machine } = require('../dist/index');

/*
 
This example shows how to use Idaho to create a stoplight.

Each state has a boolean for red, yellow, and green. Each state transitions to the next state after a timer.

*/

const red = control => {
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

const yellow = control => {
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

const green = control => {
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

const blinkingRed = control => {
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
    red,
    green,
    yellow,
    blinkingRed,
};

const machine = new Machine(states, 'blinkingRed');

setTimeout(() => {
    machine.transition('red');
}, 20000);

machine.on('change', machine => {
    console.log('change!', machine.stateName, machine.state);
});
