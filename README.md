# Idaho

The 43rd State. Machine.

This is a state machine with a hooks interface. Each state is a function that returns the data for the state and methods to transition out of the state.

This is still in pre-alpha stages.

## Usage

### Basic Machine

```javascript
import { HooksMachine } from 'idaho';

const on = (transition) => {
    return {
        turnOff = () => transition('off')
    };
};

const off = (transition) => {
    return {
        turnOn = () => transition('on')
    };
};

const states = {on, off};

// start in the off position
const switch = new HooksMachine(states, 'off');
console.log(switch.currentName) // off

switch.on('change', (newState) => {
    console.log(newState);
});


switch.current.turnOn();
console.log(switch.currentName) // on

```

## State Hooks

These work just like React hooks.

-   `const [data, setData] = useState('defaultValue')` - store state data on the machine. State will be recalculated when state is changed.
-   `useEffect(effectFn, [dependencies])` - runs `effectFn` when dependencies change. `effectFn` should return a function to clean up after itself.
-   `const memoizedData = useMemo(creatorFn, [dependencies])` - runs creator function and returns the value when dependencies change.
-   `useHistory(true)` - this makes this state a history state. The value of all items in useState will be preserved if the machine switches out of then back into this state.

### Example

```javascript
import { useState, useEffect, useHistory } from 'idaho';

const counter = transition => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTime(time + 1);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [time]);

    // with this line it will count total time ever spent in this state
    // because the time will be preserved when the machine is switched
    // out of then back into this state.
    useHistory(true);

    return {
        time,
        switchToOtherState = () => transition('otherState')
    }
};
```

## Guards

Sometimes a state may be illegal depending on data on the machine it's in. In this case you can throw a guard.

```javascript
import { Guard } from 'idaho';

const conditionalState = (transition, machineData) => {
    if (machineData.isNoGood) {
        throw new Guard('properState');
    }

    return {
        done: () => transition('done'),
    };
};
```

## Final States

You may return a Final from a state to indicate that your machine has entered a final state. Use this when the user has finished a process or a process has completed.

```javascript
import { Final } from 'idaho';

const finalState = (transition, machineData) => {
    return new Final({
        resolution: 'it was a good process',
    });
};
```
