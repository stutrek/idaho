# Idaho

Idaho is a state machine with functional aspects. Each state is a function that returns an object containing its transitions and any values associated with this state. States are functional, but machines are stateful.

It aims implement state charts in a JavaScript friendly way, using code rather than configuration. Everything that's possible with XState and other state machine/state chart libraries should be possible with Idaho.

-   States are functions rather than configuration.
-   States have a React-like hooks API for data and side effects.
-   Transitions are written as functions rather than configuration.
-   Machines have data that is persists through state transitions.
-   Machines are event emitters.
-   Machines are promises that resolve when the machine reaches a final state.
-   Machines have a single state, ParallelMachines have parallel states.

## Basic Usage

```javascript
import { Machine } from 'idaho';

const on = (machine) => {
    return {
        turnOff: () => machine.transition('off')
    };
};

const off = (machine) => {
    return {
        turnOn: () => machine.transition('on')
    };
};

const states = {on, off};

// start in the off position
const switch = new Machine({states});
console.log(switch.currentName) // off

switch.on('change', (newState) => {
    console.log(newState);
});


switch.current.turnOn();
console.log(switch.currentName) // on

```

## State Hooks

These work just like React hooks.

-   `const [data, setData] = useStateData('propName', 'defaultValue')` - store state data on the machine. The state function will run again with new data.
-   `useEffect(effectFn, [dependencies])` - runs `effectFn` when dependencies change. `effectFn` should return a function to clean up after itself.
-   `const memoizedData = useMemo(creatorFn, [dependencies])` - runs creator function and returns the value when dependencies change.
-   `useHistory(true)` - this makes this state a history state. The value of all items in useState will be preserved if the machine switches out of then back into this state.

### Hooks Example

This machine counts the number of times clicks, resetting once every 5 seconds.

```javascript
import { Machine, useStateData, useEffect } from 'idaho';

const counter = machine => {
    const [clicks, setClicks] = useStateData(0);

    useEffect(() => {
        const interval = setInterval(() => setClicks(0), 5000);
        return () => {
            clearInterval(interval);
        };
    });

    return {
        clicks,
        sendClick: () => {
            if (clicks < 10) {
                setClicks(clicks + 1);
            } else {
                machine.transition('finished');
            }
        },
    };
};

const finished = () => new Final('10 clicks counted');

const timer = new Machine({
    counting,
    finished,
});
```

## Machine Object

The machine object passed to states allows you to read from and change the status of the machine.

-   `machine.transition(stateName, ...args)` - transitions the machine to a new state.
-   `machine.data` - an object of data that will persist through state transitions.
-   `machine.setData({partial: 'data'})` - Sets machine data. State will be rerun with new values.

### Setting state data

```javascript
const on = (machine) => {
    machine.setData({
        lastModified: new Date()
    });
    return {
        turnOff = () => machine.transition('off')
    };
};

const off = (machine) => {
    machine.setData({
        lastModified: new Date()
    });
    return {
        turnOn = () => machine.transition('on')
    };
};

const switch = new Machine({on, off}, { lastModified: null })

console.log(switch.state.lastModified);
```

## More Examples

### Passing arguments to a state

The rest of the arguments to the transition function will be used as arguments to the state

```javascript
import { Machine, useEffect } from 'idaho';

const idle = machine => ({
    cookEgg: egg => machine.transition('cooking', egg),
});

const cooking = (machine, egg) => {
    if (egg.isRotten) {
        throw new Error('egg is rotten');
    }

    return {
        cancel: () => machine.transition('cancelled'),
        finished: () => machine.transition('finished'),
    };
};

const eggCooker = new Machine({
    idle,
    cooking,
});

const egg = {
    isRotten: false,
};

eggCooker.cookEgg(egg);
```

### Final States / Services / Promises

In Idaho all machines are promises, so you can `await` a machine, or call `.then` on it.

```javascript
import { Machine, Final, useEffect } from 'idaho';
import { loader } from 'your/app';

const idle = machine => ({
    load: id => machine.transition('loading', id),
});

const loading = (machine, id) => {
    const url = machine.data.baseUrl + id;
    useEffect(() => {
        let cancelled = false;
        fetch(url)
            .then(response => {
                if (cancelled) {
                    return;
                }
                if (response.ok === false) {
                    machine.transition('error');
                }
                return response.json();
            })
            .then(data => machine.transition('done', data))
            .catch(() => machine.transition('error'));
        return () => {
            cancelled = true;
        };
    }, url);
};

const done = (machine, data) => {
    return new Final(data);
};

const loader = new Machine({ idle, loading, done }, { baseUrl: '/api/cats/' });
loader.state.load(5);

// with regular promises
loader.then(cat => {
    console.log(cat);
});

// in async function
const cat = await loader;
console.log(cat);
```

### Parallel States

```javascript
import { ParallelMachine } from 'idaho';

const on = machine => ({
    turnOff: () => machine.transition('off'),
});

const off = machine => ({
    turnOn: () => machine.transition('on'),
});

const states = { on, off };

const wordProcessor = new ParallelMachine({
    bold: { on, off },
    italics: { on, off },
    underline: { on, off },
});

wordProcessor.bold.state.turnOn();
```

### History States

History states are states that maintain their current values when they are exited and reentered. To use history states, call `useHistory` in your state. Anything from `useStateData` or `useMemo` will remain, but effects will rerun.

This example counts the total amount of time your food has been in the oven. When you take the food out and put it back in the oven, the counter will reset.

```javascript
import { useStateData, useEffect } from 'idaho';

const inOven = machine => {
    const [timeInOven, setTimeInOven] = useStateData(0);
    useEffect(() => {
        const timeout = setTimeout(() => setTimeInOven(timeInOven + 1), 1000);
        return () => {
            clearTImeout(timeout);
        };
    }, [timeInOven]);

    return {
        takeOutOfOven: () => machine.transition('outOfOven'),
    };
};
```

### Transient state nodes -- Throwing transitions

A transient state node is one that immediately transitions to another state. This is useful when a transition could lead to one of two states. With Idaho you can call `machine.transition` within your state to immediately cancel the current transition and go to another state.

Internally Idaho is throwing a transition, so any code after the transition will not run.

```javascript
const checkHeightForRollerCoaster = (machine, rider) => {
    if (rider.height < 36) {
        // inches
        machine.transition('disappointed');
        console.log('this will not log');
    }
    machine.transition('excited');
};
```

### Guards

Guards prevent leaving a state if a condition is not met. For these, put an if in your transition function or make it a no-op.

```javascript
const enteringData = machine => {
    return {
        submit: () => {
            if (machine.data.isValid) {
                machine.transition('submitting');
            }
        },
    };
};
```
