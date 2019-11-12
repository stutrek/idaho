const { StreetLightSystem, Green } = require('./stoplight');

const stoplight = new StreetLightSystem();

console.log(stoplight.current.constructor.name); // PowerOutage instance

stoplight.resumeNormalOperation();

stoplight.north.current instanceof Green;
console.log(stoplight.north.current.light); // 'green';

// it will change in 25 seconds, when green turns to yellow

stoplight.on('transition', machine => {
    // doesn't get called because only children change
});

stoplight.on('child-transition', machine => {
    console.log('transitioned', machine.direction, machine.current.light);
    // gets called four times, once for each light. Machine is the machine that changed.
});
