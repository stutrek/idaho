(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('events')) :
    typeof define === 'function' && define.amd ? define(['exports', 'events'], factory) :
    (factory((global.idaho = {}),global.events));
}(this, (function (exports,events) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var State = (function () {
        function State(machine) {
            this.machine = machine;
            var emitter = new events.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
        }
        State.prototype.setData = function (newData) {
            var _this = this;
            this.data = __assign(__assign({}, this.data), newData);
            if (this.dataUpdatePromise === undefined) {
                this.dataUpdatePromise = Promise.resolve().then(function () {
                    _this.dataUpdatePromise = undefined;
                    _this.emit('change', _this.data);
                });
            }
        };
        return State;
    }());

    var Machine = (function () {
        function Machine(State, parent) {
            this.State = State;
            this.parent = parent;
            this.histories = new Map();
            this.effectClearers = [];
            var emitter = new events.EventEmitter();
            this.on = emitter.on.bind(emitter);
            this.off = emitter.off.bind(emitter);
            this.emit = emitter.emit.bind(emitter);
            if (State === undefined && this.constructor.initialState !== undefined) {
                this.transition(this.constructor.initialState);
            }
            else if (State !== undefined) {
                this.transition(State);
            }
            else {
                throw new Error('Machine needs either a state passed it on an initialState');
            }
        }
        Machine.prototype.transition = function (NextState) {
            for (var _i = 0, _a = this.effectClearers; _i < _a.length; _i++) {
                var clearer = _a[_i];
                if (clearer) {
                    clearer();
                }
            }
            if (this.histories.has(NextState)) {
                this.current = this.histories.get(NextState);
            }
            else {
                this.current = new NextState(this);
            }
            if (this.current.effects) {
                this.effectClearers = this.current.effects.map(function (effect) { return effect(); });
            }
            else {
                this.effectClearers = [];
            }
            this.emit('transition', this);
            if (this.parent) {
                this.parent.receiveChildTransition(this);
            }
        };
        Machine.prototype.receiveChildTransition = function (machine) {
            this.emit('child-transition', machine);
            if (this.parent) {
                this.parent.receiveChildTransition(machine);
            }
        };
        return Machine;
    }());

    exports.State = State;
    exports.Machine = Machine;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=idaho.umd.js.map
