///#source 1 1 /js/exHelp.js
/// <reference path="_references.js" />

/*!

exHelp Library - Extensible Helper // Version 1.1.0.0
http://www.github.com/xwcg

The MIT License (MIT)

Copyright (c) 2014 Michael Schwarz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function InitExHelp(window)
{
    var exHelpObject =
        {
            _storage: {},
            _subscribers: {},

            // Object to hold settings

            settings: {},

            // Information about the current application
            info:
                {
                    AppName: "Extensible Helper Class",
                    Version: "1.1.0.0",
                    Author: "Michael Schwarz"
                },

            addStorage: function (name)
            {
                /// <summary>
                /// Creates a new storage (name)
                /// </summary>
                /// <param name="name" type="String">Name of the storage</param>
                /// <returns type="Object">Storage object</returns>

                // If the storage is undefined (does not exist)
                if (this._storage[name] === undefined)
                {
                    // Create it
                    this._storage[name] = {};
                }
                // And return it
                return this.getStorage(name);
            },

            getStorage: function (name)
            {
                /// <summary>
                /// Get reference to storage (name)
                /// </summary>
                /// <param name="name" type="String">Name of the Storage</param>
                /// <returns type="Object|undefined">Storage object or undefined if it does not exist</returns>

                // return the storage
                return this._storage[name];
            },

            storage: function (name)
            {
                /// <summary>
                /// Returns a reference to storage (name) and creates it if necessary
                /// </summary>
                /// <param name="name" type="String">Name of the storage</param>
                /// <returns type="Object">Storage object</returns>

                // If the storage exists
                if (this._storage[name])
                    // return it
                    return this._storage[name];
                else
                    // else: create and return it
                    return this.addStorage(name);
            },

            subscribe: function (name, cb)
            {
                /// <summary>
                /// Subscribe a function (cb) to trigger (name)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>
                /// <param name="cb" type="Function">Callback to execute</param>

                // If the trigger has a subscriber list
                if (this._subscribers[name])
                    // Add this callback to it
                    this._subscribers[name].push(cb);
                else
                {
                    // Else:
                    // Create a new list for that trigger
                    this._subscribers[name] = [];
                    // And call this function again
                    this.subscribe(name, cb);
                }
            },

            unsubscribe: function (name, cb)
            {
                /// <summary>
                /// Unsubscribe a function (cb) from trigger (name)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>
                /// <param name="cb" type="Function">Callback to unsubscribe</param>

                // If there is a subscriber list for this trigger
                if (this._subscribers[name])
                {
                    // Go through all subsribers
                    for (var i = 0; i < this._subscribers[name].length; i++)
                    {
                        // If the subscriber is the same as the provided callback
                        if (this._subscribers[name][i] === cb)
                        {
                            // Remove it from the subscriber listd
                            this._subscribers[name].splice(i, 1);

                            // and step out of the loop since the index is now corrupted
                            break;
                        }
                    }
                }
            },

            clearSubscriptions: function (name)
            {
                /// <summary>
                /// Clear all subscribers from trigger (name)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>

                // If there is a subscriber list for this trigger
                if (this._subscribers[name])
                    // Empty it
                    this._subscribers[name] = [];
            },

            // ! Internal Trigger Function
            _trigger: function exHelp_Trigger_Internal(name, e)
            {
                // If there is a subscriber list for this trigger
                if (this._subscribers[name])
                {
                    // scope = subscriber list
                    var scope = this._subscribers[name];

                    // Go through all subscribers
                    for (var i = 0; i < scope.length; i++)
                    {
                        // get the current subscriber
                        var subscriber = scope[i];

                        // And execute it (window context)
                        subscriber.apply(window, e);
                    }
                }
            },

            trigger: function exHelp_Trigger(name, e, clearAfter, immediate)
            {
                /// <signature>
                /// <summary>
                /// Trigger event (name) with parameters (e)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>
                /// <param name="e" type="Array">Parameters array for the subscriber callback
                /// functions</param>
                /// <param name="clearAfter" type="Boolean">If true, will clear all subscribers of
                /// this trigger after execution</param>
                /// <param name="immediate" type="Boolean">If true, will not be deferred to the end
                /// of the execution queue</param> </signature>
                ///
                /// <signature>
                /// <summary>
                /// Trigger event (name) with parameters (e)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>
                /// <param name="e" type="Array">Parameters array for the subscriber callback
                /// functions</param>
                /// <param name="clearAfter" type="Boolean">If true, will clear all subscribers of
                /// this trigger after execution</param> </signature>
                ///
                /// <signature>
                /// <summary>
                /// Trigger event (name) with parameters (e)
                /// </summary>
                /// <param name="name" type="String">Trigger name</param>
                /// <param name="e" type="Array">Parameters array for the subscriber callback
                /// functions</param> </signature>

                // Get "this" to a local variable for scoping
                var $this = this;

                // If not immediate
                if (!immediate)
                    // Defer this trigger to the end of the execution stack
                    this.defer(function exHelp_Trigger_Defer()
                    {
                        // Trigger it
                        $this._trigger(name, e);

                        // If we want to clear the subscribers afterwards, do so
                        clearAfter && $this.clearSubscriptions(name);
                    });
                else
                {
                    // If immediate
                    // Trigger it
                    this._trigger(name, e);
                    // If we want to clear the subscribers afterwards, do so
                    clearAfter && this.clearSubscriptions(name);
                }
            },

            defer: function exHelp_Defer(e, context, args, time)
            {
                /// <signature>
                /// <summary>
                /// Puts the function at the end of the execution stack
                /// </summary>
                /// <param name="e" type="Function">Function to defer</param>
                /// <param name="context" type="Object">Context to execute the function in</param>
                /// <param name="args" type="Array">Parameter array</param>
                /// <param name="time" type="Int">Delay time in ms</param> </signature>
                ///
                /// <signature>
                /// <summary>
                /// Puts the function at the end of the execution stack
                /// </summary>
                /// <param name="e" type="Function">Function to defer</param>
                /// <param name="context" type="Object">Context to execute the function in</param>
                /// <param name="args" type="Array">Parameter array</param> </signature>
                ///
                /// <signature>
                /// <summary>
                /// Puts the function at the end of the execution stack
                /// </summary>
                /// <param name="e" type="Function">Function to defer</param>
                /// <param name="context" type="Object">Context to execute the function in</param>
                /// </signature>
                ///
                /// <signature>
                /// <summary>
                /// Puts the function at the end of the execution stack
                /// </summary>
                /// <param name="e" type="Function">Function to defer</param> </signature>

                // If the provided callback is actually a function
                if (this.is.function(e))
                {
                    // Defer
                    setTimeout(function exHelp_Defer_Execution()
                    {
                        // do we have a context?
                        if (context)
                            // Yes, execute it with it
                            e.apply(context, args);
                        else if (args)
                            e.apply(undefined, args);
                        else
                            // No, execute locally
                            e();
                        // Timeout specified? Yes, use it, otherwise use 1 for fastest speed
                    }, time ? time : 1);
                }
            },

            extend: function (base, branch)
            {
                if (!branch)
                {
                    branch = base;
                    base = this;
                }

                for (var key in branch)
                {
                    if (branch[key] !== undefined)
                        base[key] = branch[key];
                }
            },

            each: function (obj, callback, args)
            {
                if (obj["length"] !== void 0)
                {
                    var i = 0, length = obj.length;
                    if (args)
                    {
                        for (; i < length; i++)
                        {
                            if (callback.apply(obj[i], args) === false)
                                break;
                        }
                    }
                    else
                    {
                        for (; i < length; i++)
                        {
                            if (callback.call(obj[i], i, obj[i]) === false)
                                break;
                        }
                    }
                }

                return obj;
            },

            jsonParse: function (str)
            {
                /// <summary>
                /// Parses JSON (j) and fails gracefully on error
                /// </summary>
                /// <param name="str" type="String">JSON to parse</param>
                /// <returns type="mixed|null">JSON Parse result or null on error</returns>
                try
                {
                    return JSON.parse(str);
                }
                catch (e)
                {
                    console.error("JSON Parse Error ", e, "While Parsing: '", str, "'");
                    return null;
                }
            },
            jsonStringify: function (e)
            {
                /// <summary>
                /// Stringifies (e) to JSON and fails gracefully on error
                /// </summary>
                /// <param name="e" type="mixed">Value to stringify into JSON</param>
                /// <returns type="String|null">JSON String or null on error</returns>
                try
                {
                    return JSON.stringify(e);
                }
                catch (e)
                {
                    console.error("JSON Stringify Error ", e, "While Stringifying: ", e);
                    return null;
                }
            },

            // Helpers for randomization
            random:
                {
                    //! Internal random string function (letters AND numbers!)
                    _gen: function (args)
                    {
                        var ASCII_UPPER = args.upper || 65;
                        var ASCII_LOWER = args.lower || 90;
                        var MaxLength = args.len || args.length || 8;

                        var str = "";

                        // As long as the string is not the desired length
                        while (str.length < MaxLength)
                        {
                            // Decide whether to add a letter or number
                            if ((Math.random() * 100) >= 50)
                            {
                                // Add a letter (fancy mathemagics)
                                str += String.fromCharCode(Math.floor((Math.random() * (ASCII_UPPER - ASCII_LOWER)) + ASCII_LOWER));
                            }
                            else
                            {
                                // Add a number (no mathemagics)
                                str += Math.floor(Math.random() * 9).toString();
                            }
                        }

                        return str;
                    },

                    number: function (min, max)
                    {
                        /// <summary>
                        /// Returns a random number between (min) and (max)
                        /// </summary>
                        /// <param name="min" type="Number">Lower bound</param>
                        /// <param name="max" type="Number">Upper bound</param>
                        /// <returns type="Number">Random number</returns>

                        return (Math.random() * (max - min)) + min;
                    },
                    string: function (len, upper)
                    {
                        /// <signature>
                        /// <summary>
                        /// Returns a random string of length (len)
                        /// </summary>
                        /// <param name="len" type="Int">Desired string length</param>
                        /// <param name="upper" type="Boolean">If true, will return UPPERCASE string</param>
                        /// <returns type="String">Random string</returns>
                        /// </signature>
                        /// <signature>
                        /// <summary>
                        /// Returns a random string of length (len)
                        /// </summary>
                        /// <param name="len" type="Int">Desired string length</param>
                        /// <returns type="String">Random string</returns>
                        /// </signature>

                        var ASCII_LOWER = 65; // Lower ascii boundary (A)
                        var ASCII_UPPER = 90; // Upper ascii boundary (Z)

                        if (upper !== undefined && upper === false)
                        {
                            ASCII_LOWER = 97; // Lower ascii boundary (a)
                            ASCII_UPPER = 122; // Upper ascii boundary (z)
                        }

                        return this._gen(
                            {
                                upper: ASCII_UPPER,
                                lower: ASCII_LOWER,
                                len: len
                            });
                    },
                    hex: function (len)
                    {
                        /// <summary>
                        /// Returns a random HEX string [a-f0-9] of length (len)
                        /// </summary>
                        /// <param name="len" type="Int">Desired string length</param>
                        /// <returns type="String">Random Hex String</returns>

                        // Basically the same as a random string generator but the ASCII boundaries are limited to a-f and 0-9
                        var ASCII_LOWER = 97; // Lower ascii boundary (a)
                        var ASCII_UPPER = 102; // Upper ascii boundary (f)

                        return this._gen(
                            {
                                upper: ASCII_UPPER,
                                lower: ASCII_LOWER,
                                len: len
                            });
                    },
                    guid: function ()
                    {
                        /// <summary>
                        /// Returns a pseudorandom GUID [a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}
                        /// </summary>
                        /// <returns type="String">GUID</returns>
                        return "{0}-{1}-{2}-{3}-{4}".format(
                            this.hex(8),
                            this.hex(4),
                            this.hex(4),
                            this.hex(4),
                            this.hex(12)
                            );
                    },
                    hexColor: function ()
                    {
                        /// <summary>
                        /// Returns a random hex colour
                        /// </summary>
                        /// <returns type="String">Hex Colour</returns>
                        return "#" + this.hex(6);
                    },
                    date: function (min, max)
                    {
                        /// <summary>
                        /// Returns a random date between (min) and (max)
                        /// NOTE: Requires exHelp Date Extension!
                        /// </summary>
                        /// <param name="min" type="Date">Lower bound date</param>
                        /// <param name="max" type="Date">Upper bound date</param>
                        /// <returns type="Date">Random date</returns>

                        // We need the date extension, so check for it
                        if (!exHelpObject.date)
                            return console.error("exHelp: Date Extension not found!");

                        // Get timestamps
                        var mmax = exHelpObject.date.fix(max).getTime();
                        var mmin = exHelpObject.date.fix(min).getTime();

                        // Make a new date object by using mathemagics with the timestamps
                        return exHelpObject.date.fix((Math.random() * (mmax - mmin)) + mmin);
                    }
                },

            // Array helpers
            array:
                {
                    clone: function (a)
                    {
                        /// <summary>
                        /// Clones an array (No references!)
                        /// </summary>
                        /// <param name="a" type="Array">Array to be cloned</param>
                        /// <returns type="Array">Cloned array</returns>

                        // By stringyfing the object to JSON and back we avoid pesky references
                        return exHelpObject.jsonParse(exHelpObject.jsonStringify(a));
                    },

                    sieve: function (e)
                    {
                        /// <summary>
                        /// Cleans an array by removing empty values ("", null, undefined) and trimming all strings
                        /// </summary>
                        /// <param name="e" type="Array">Array to be cleaned</param>
                        /// <returns type="Array">Cleaned array</returns>

                        var temp = e;

                        var fncSieve = function (a)
                        {
                            for (var key in a)
                            {
                                var value = a[key];
                                if (exHelpObject.isString(value))
                                {
                                    a[key] = value = value.trim();
                                    if (value.trim().length == 0)
                                    {
                                        a.splice(key, 1);
                                        return fncSieve(a);
                                    }
                                }
                                else
                                {
                                    if (value === null || value === undefined)
                                    {
                                        a.splice(key, 1);
                                        return fncSieve(a);
                                    }
                                }
                            }
                            return a;
                        };

                        return fncSieve(temp);
                    },

                    contains: function (arr, value)
                    {
                        return arr.indexOf(value) !== -1;
                    }

                },
            // Math helpers
            math:
                {
                    rect: function (t, l, b, r)
                    {
                        return {
                            top: t ? t : 0,
                            left: l ? l : 0,
                            right: r ? r : 0,
                            bottom: b ? b : 0,
                            get width() { return this.right - this.left; },
                            get height() { return this.bottom - this.top; },
                            set width(val) { this.right = this.left + val; },
                            set height(val) { this.bottom = this.top + val; },
                            moveTopBy: function (val) { this.top += val, this.bottom += val; },
                            moveTopTo: function (val) { var h = this.height; this.top = val, this.bottom = this.top + h; },
                            moveLeftBy: function (val) { this.left += val, this.right += val; },
                            moveLeftTo: function (val) { var w = this.width; this.left = val, this.right = this.left + w; },
                            intersects: function (rect)
                            {
                                return (this.left <= rect.right &&
                                      rect.left <= this.right &&
                                      this.top <= rect.bottom &&
                                      rect.top <= this.bottom);
                            },
                            contains: function (rect)
                            {
                                return rect.left <= this.right && rect.left >= this.left &&
                                    rect.top <= this.bottom && rect.top >= this.top &&
                                    rect.right <= this.right && rect.right >= this.left &&
                                    rect.bottom <= this.bottom && rect.bottom >= this.top;
                            }
                        };
                    },
                    easing:
                        {
                            linearTween: function (t, b, c, d)
                            {
                                /// <summary>
                                /// simple linear tweening - no easing, no acceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return c * t / d + b;
                            },
                            easeInQuad: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quadratic easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return c * t * t + b;
                            },
                            easeOutQuad: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quadratic easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return -c * t * (t - 2) + b;
                            },
                            easeInOutQuad: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quadratic easing in/out - acceleration until halfway, then deceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return c / 2 * t * t + b;
                                t--;
                                return -c / 2 * (t * (t - 2) - 1) + b;
                            },
                            easeInCubic: function (t, b, c, d)
                            {
                                /// <summary>
                                /// cubic easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return c * t * t * t + b;
                            },
                            easeOutCubic: function (t, b, c, d)
                            {
                                /// <summary>
                                /// cubic easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                t--;
                                return c * (t * t * t + 1) + b;
                            },
                            easeInOutCubic: function (t, b, c, d)
                            {
                                /// <summary>
                                /// cubic easing in/out - acceleration until halfway, then deceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return c / 2 * t * t * t + b;
                                t -= 2;
                                return c / 2 * (t * t * t + 2) + b;
                            },
                            easeInQuart: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quartic easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return c * t * t * t * t + b;
                            },
                            easeOutQuart: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quartic easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                t--;
                                return -c * (t * t * t * t - 1) + b;
                            },
                            easeInOutQuart: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quartic easing in/out - acceleration until halfway, then deceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return c / 2 * t * t * t * t + b;
                                t -= 2;
                                return -c / 2 * (t * t * t * t - 2) + b;
                            },
                            easeInQuint: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quintic easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return c * t * t * t * t * t + b;
                            },
                            easeOutQuint: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quintic easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                t--;
                                return c * (t * t * t * t * t + 1) + b;
                            },
                            easeInOutQuint: function (t, b, c, d)
                            {
                                /// <summary>
                                /// quintic easing in/out - acceleration until halfway, then deceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return c / 2 * t * t * t * t * t + b;
                                t -= 2;
                                return c / 2 * (t * t * t * t * t + 2) + b;
                            },
                            easeInSine: function (t, b, c, d)
                            {
                                /// <summary>
                                /// sinusoidal easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                            },
                            easeOutSine: function (t, b, c, d)
                            {
                                /// <summary>
                                /// sinusoidal easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return c * Math.sin(t / d * (Math.PI / 2)) + b;
                            },
                            easeInOutSine: function (t, b, c, d)
                            {
                                /// <summary>
                                /// sinusoidal easing in/out - accelerating until halfway, then decelerating
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
                            },
                            easeInExpo: function (t, b, c, d)
                            {
                                /// <summary>
                                /// exponential easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return c * Math.pow(2, 10 * (t / d - 1)) + b;
                            },
                            easeOutExpo: function (t, b, c, d)
                            {
                                /// <summary>
                                /// exponential easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                return c * (-Math.pow(2, -10 * t / d) + 1) + b;
                            },
                            easeInOutExpo: function (t, b, c, d)
                            {
                                /// <summary>
                                /// exponential easing in/out - accelerating until halfway, then decelerating
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                                t--;
                                return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
                            },
                            easeInCirc: function (t, b, c, d)
                            {
                                /// <summary>
                                /// circular easing in - accelerating from zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                return -c * (Math.sqrt(1 - t * t) - 1) + b;
                            },
                            easeOutCirc: function (t, b, c, d)
                            {
                                /// <summary>
                                /// circular easing out - decelerating to zero velocity
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d;
                                t--;
                                return c * Math.sqrt(1 - t * t) + b;
                            },
                            easeInOutCirc: function (t, b, c, d)
                            {
                                /// <summary>
                                /// circular easing in/out - acceleration until halfway, then deceleration
                                /// </summary>
                                /// <param name="t">current time</param>
                                /// <param name="b">start value</param>
                                /// <param name="c">change in value</param>
                                /// <param name="d">duration</param>
                                /// <returns type="float">new value</returns>
                                t /= d / 2;
                                if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                                t -= 2;
                                return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
                            }
                        },
                    // Percentage helpers
                    Percentage:
                        {
                            XofY: function (current, max)
                            {
                                /// <summary>
                                /// Calculates X% of Y
                                /// </summary>
                                /// <param name="current" type="Number">Current Value</param>
                                /// <param name="max" type="Number">Maximum Value</param>
                                /// <returns type="Number">Percentage</returns>
                                return (current / max) * 100;
                            }
                        },
                    Dist2D: function (a, b)
                    {
                        if (a && a.x != undefined && a.y != undefined && b && b.x != undefined && b.y != undefined)
                        {
                            var xd = b.x - a.x;
                            var yd = b.y - a.y;
                            return Math.sqrt(xd * xd + yd * yd);
                        }

                        return 0;
                    },
                    Midpoint2D: function (a, b)
                    {
                        if (a && a.x != undefined && a.y != undefined && b && b.x != undefined && b.y != undefined)
                        {
                            // return Point((p1.x+p2.x)/2, (p1.y+p2.y)/2)
                            return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
                        }
                        return { x: 0, y: 0 };
                    },
                    Dist3D: function (a, b)
                    {
                        if (a && a.x != undefined && a.y != undefined && b && b.x != undefined && b.y != undefined)
                        {
                            var xd = b.x - a.x;
                            var yd = b.y - a.y;
                            var zd = b.z - a.z;
                            return Math.sqrt(xd * xd + yd * yd + zd * zd);
                        }

                        return 0;
                    }
                },
            // Color functions
            color:
                {
                    // Internal: converts 0-255 to hex equivalent
                    _component: function (c)
                    {
                        var hex = c.toString(16);
                        return hex.length === 1 ? "0" + hex : hex;
                    },
                    HexToRGB: function (hex)
                    {
                        /// <summary>
                        /// Converts a HEX string to an RGB Object
                        /// </summary>
                        /// <param name="hex" type="String">Valid Hex String (#[a-f0-9]{6})</param>
                        /// <returns type="Object">RGB object { r, g, b }</returns>

                        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                        };
                    },
                    HexToHSV: function (hex)
                    {
                        /// <summary>
                        /// Converts a HEX string to an HSV Object
                        /// </summary>
                        /// <param name="hex" type="String">Valid Hex String (#[a-f0-9]{6})</param>
                        /// <returns type="Object">HSV object { h, s, v }</returns>

                        var rgb = this.HexToRGB(hex);
                        return this.RGBToHSV(rgb.r, rgb.g, rgb.b);
                    },
                    RGBToHex: function (cr, cg, cb)
                    {
                        /// <signature>
                        /// <summary>
                        /// Converts RGB to Hex String
                        /// </summary>
                        /// <param name="cr" type="Number">Red</param>
                        /// <param name="cg" type="Number">Green</param>
                        /// <param name="cb" type="Number">Blue</param>
                        /// <returns type="String">Hex String</returns>
                        /// </signature>
                        ///
                        /// <signature>
                        /// <summary>
                        /// Converts RGB Object to Hex String
                        /// </summary>
                        /// <param name="cr" type="Object">RGB object { r, g, b }</param>
                        /// <returns type="String">Hex String</returns>
                        /// </signature>

                        if (cr && !cg && !cb && exHelpObject.is.object(cr))
                        {
                            var r = cr.r;
                            var g = cr.g;
                            var b = cr.b;
                        }
                        else
                        {
                            var r = cr;
                            var g = cg;
                            var b = cb;
                        }

                        return "#" + this._component(r) + this._component(g) + this._component(b);
                    },
                    RGBToHSV: function ()
                    {
                        /// <summary>
                        /// Converts RGB Arguments to HSV Object { h, s, v }
                        /// </summary>
                        /// <param name="red" type="Number">Red</param>
                        /// <param name="green" type="Number">Green</param>
                        /// <param name="blue" type="Number">Blue</param>
                        /// <returns type="Object">HSV object { h, s, v }</returns>

                        // http://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
                        var rr, gg, bb,
                        r = arguments[0] / 255,
                        g = arguments[1] / 255,
                        b = arguments[2] / 255,
                        h, s,
                        v = Math.max(r, g, b),
                        diff = v - Math.min(r, g, b),
                        diffc = function (c)
                        {
                            return (v - c) / 6 / diff + 1 / 2;
                        };

                        if (diff == 0)
                        {
                            h = s = 0;
                        } else
                        {
                            s = diff / v;
                            rr = diffc(r);
                            gg = diffc(g);
                            bb = diffc(b);

                            if (r === v)
                            {
                                h = bb - gg;
                            } else if (g === v)
                            {
                                h = (1 / 3) + rr - bb;
                            } else if (b === v)
                            {
                                h = (2 / 3) + gg - rr;
                            }
                            if (h < 0)
                            {
                                h += 1;
                            } else if (h > 1)
                            {
                                h -= 1;
                            }
                        }
                        return {
                            h: Math.round(h * 360),
                            s: Math.round(s * 100),
                            v: Math.round(v * 100)
                        };
                    },
                    // Converts H,S,V arguments to RGB Object {r, g, b}
                    HSVToRGB: function (h, s, v)
                    {
                        /// <summary>
                        /// Converts HSV arguments to RGB Object
                        /// </summary>
                        /// <param name="h" type="Number">Hue</param>
                        /// <param name="s" type="Number">Saturation</param>
                        /// <param name="v" type="Number">Value</param>
                        /// <returns type="Object">RGB Object {r, g, b}</returns>

                        // http://snipplr.com/view/14590
                        var r, g, b;
                        var i;
                        var f, p, q, t;

                        h = Math.max(0, Math.min(360, h));
                        s = Math.max(0, Math.min(100, s));
                        v = Math.max(0, Math.min(100, v));
                        s /= 100;
                        v /= 100;

                        if (s == 0)
                        {
                            r = g = b = v;
                            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                        }

                        h /= 60; // sector 0 to 5
                        i = Math.floor(h);
                        f = h - i; // factorial part of h
                        p = v * (1 - s);
                        q = v * (1 - s * f);
                        t = v * (1 - s * (1 - f));

                        switch (i)
                        {
                            case 0:
                                r = v;
                                g = t;
                                b = p;
                                break;

                            case 1:
                                r = q;
                                g = v;
                                b = p;
                                break;

                            case 2:
                                r = p;
                                g = v;
                                b = t;
                                break;

                            case 3:
                                r = p;
                                g = q;
                                b = v;
                                break;

                            case 4:
                                r = t;
                                g = p;
                                b = v;
                                break;

                            default: // case 5:
                                r = v;
                                g = p;
                                b = q;
                        }

                        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
                    },
                    HSVToHex: function (h, s, v)
                    {
                        /// <summary>
                        /// Converts HSV arguments to Hex String
                        /// </summary>
                        /// <param name="h" type="Number">Hue</param>
                        /// <param name="s" type="Number">Saturation</param>
                        /// <param name="v" type="Number">Value</param>
                        /// <returns type="String">Hex String</returns>

                        var rgb = this.HSVToRGB(h, s, v);
                        return this.RGBToHex(rgb);
                    },
                    Saturate: function (c, i)
                    {
                        /// <summary>
                        /// Changes Saturation
                        /// </summary>
                        /// <param name="c" type="HexString|HSVObject|RGBObject">Color to change</param>
                        /// <param name="i" type="Number">Saturation 0-100</param>
                        /// <returns type="HexString|HSVObject|RGBObject">Color with changed saturation in input format</returns>

                        var originalColor = 0;
                        var intensity = i || 100;

                        // Check which color type we have been given
                        if (exHelpObject.is.object(c))
                        {
                            if (c.h && c.s && c.v)
                                originalColor = "HSV";
                            else if (c.r && c.g && c.b)
                                originalColor = "RGB";
                        }
                        else if (c.startsWith("#"))
                            originalColor = "HEX";

                        // No type detected
                        if (originalColor === 0)
                            return c; // Do nothing and return original color

                        var hsv = 0;

                        // Convert input color to HSV
                        switch (originalColor)
                        {
                            case "HSV":
                                hsv = c;
                                break;
                            case "RGB":
                                hsv = this.RGBToHSV(c.r, c.g, c.b);
                                break;
                            case "HEX":
                                hsv = this.HexToHSV(c);
                                break;
                        }

                        // Set the saturation
                        hsv.s = intensity;

                        // Convert back to original color and return it
                        switch (originalColor)
                        {
                            case "HSV":
                                return hsv;
                            case "RGB":
                                return this.HSVToRGB(hsv.h, hsv.s, hsv.v);
                            case "HEX":
                                return this.HSVToHex(hsv.h, hsv.s, hsv.v);
                        }
                    },
                    Lightness: function (c, i)
                    {
                        /// <summary>
                        /// Changes Light-/Brightness
                        /// </summary>
                        /// <param name="c" type="HexString|HSVObject|RGBObject">Color to change</param>
                        /// <param name="i" type="Number">Lightness 0-100</param>
                        /// <returns type="HexString|HSVObject|RGBObject">Color with changed lightness in input format</returns>

                        var originalColor = 0;
                        var intensity = i || 100;

                        if (exHelpObject.is.object(c))
                        {
                            if (c.h && c.s && c.v)
                                originalColor = "HSV";
                            else if (c.r && c.g && c.b)
                                originalColor = "RGB";
                        }
                        else if (c.startsWith("#"))
                            originalColor = "HEX";

                        if (originalColor === 0)
                            return c;

                        var hsv = 0;

                        switch (originalColor)
                        {
                            case "HSV":
                                hsv = c;
                                break;
                            case "RGB":
                                hsv = this.RGBToHSV(c.r, c.g, c.b);
                                break;
                            case "HEX":
                                hsv = this.HexToHSV(c);
                                break;
                        }

                        hsv.v = intensity;

                        switch (originalColor)
                        {
                            case "HSV":
                                return hsv;
                            case "RGB":
                                return this.HSVToRGB(hsv.h, hsv.s, hsv.v);
                            case "HEX":
                                return this.HSVToHex(hsv.h, hsv.s, hsv.v);
                        }
                    }
                },
            // Cookie Helpers
            cookies:
            {
                cookies: [],

                Read: function ()
                {
                    /// <summary>
                    /// Read cookies into the this.cookies array
                    /// </summary>
                    this.cookies = [];
                    var $cookieStr = document.cookie;
                    var $cookieList = $cookieStr.split(";");
                    for (var i = 0; i < $cookieList.length; i++)
                    {
                        var $csplit = $cookieList[i].split("=");
                        var $cookie = { name: $csplit[0], value: $csplit[1] };
                        this.cookies.push($cookie);
                    }
                },

                Clear: function ()
                {
                    /// <summary>
                    /// Sets all current cookies for this domain to expire
                    /// </summary>

                    this.Read();

                    for (var i = 0; i < this.cookies.length; i++)
                    {
                        $cookie = this.cookies[i];
                        document.cookie = "{0}=; expires={1}".format($cookie.name, (new Date(0).toUTCString()));
                    }
                }
            },

            // String Helpers
            string:
                {
                    pad: function (str, char, num)
                    {
                        /// <summary>
                        /// Pads a string to a specified minimum length
                        /// </summary>
                        /// <param name="str" type="mixed">string to be padded</param>
                        /// <param name="char" type="String">char to fill the size</param>
                        /// <param name="num" type="Integer">minimum length</param>
                        /// <returns type="String">Padded string</returns>

                        if (!char || char === "" || char.length === 0) char = " ";
                        if (!num) num = 2;

                        var s = "" + str;
                        while (str.length < num) s = char + s;
                        return s;
                    }

                },

            // HTML5 Fullscreen API Helpers
            fullscreen:
                {
                    _fromUser: false,
                    get isFullscreen()
                    {
                        return !(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement);
                    },
                    get isUserFullScreen()
                    {
                        return this.isFullscreen && this._fromUser;
                    },
                    enter: function (from)
                    {
                        if (!from) from = document.documentElement;
                        if (!this.isFullscreen)
                        {
                            if (from.requestFullscreen)
                            {
                                from.requestFullscreen();
                            }
                            else if (from.msRequestFullscreen)
                            {
                                from.msRequestFullscreen();
                            }
                            else if (from.mozRequestFullScreen)
                            {
                                from.mozRequestFullScreen();
                            }
                            else if (from.webkitRequestFullscreen)
                            {
                                from.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                            }
                        }

                        this._fromUser = true;
                    },
                    exit: function ()
                    {
                        if (this.isFullscreen)
                        {
                            if (document.exitFullscreen)
                            {
                                document.exitFullscreen();
                            }
                            else if (document.msExitFullscreen)
                            {
                                document.msExitFullscreen();
                            }
                            else if (document.mozCancelFullScreen)
                            {
                                document.mozCancelFullScreen();
                            }
                            else if (document.webkitExitFullscreen)
                            {
                                document.webkitExitFullscreen();
                            }
                        }

                        this._fromUser = false;
                    }
                },

            // Browser and Feature Detection Helpers
            browser:
                {
                    // Returns true<bool> if browser is on a mobile device
                    get isMobile()
                    {
                        // for some reason, 1000x more reliable than checking the user agent (also faster)
                        // iPhone 5 landscape reports 568px width, rounded to 570
                        if (window.innerWidth <= 1024)
                            return true;

                        return false;
                    },
                    // Returns true<bool> if browser is in portrait
                    get isPortrait()
                    {
                        if (window.innerWidth < window.innerHeight)
                            return true;

                        return false;
                    },

                    // Returns true<bool> if touch input is used
                    get isTouch()
                    {
                        return "ontouchstart" in window;
                    },

                    // Returns true<bool> if browser is Mozilla Firefox
                    get isFirefox()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
                    },

                    // Returns true<bool> if browser is Google Chrome
                    get isChrome()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
                    },

                    // Returns true<bool> if browser is Apple Safari
                    get isSafari()
                    {
                        return (navigator.userAgent.toLowerCase().indexOf("safari") > -1 && !this.isChrome)
                         || (navigator.userAgent.toLowerCase().indexOf("applewebkit") > -1 && !this.isChrome);
                    },

                    // Returns true<bool> if browser is Opera
                    get isOpera()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("opera") > -1;
                    },

                    // Returns true<bool> if browser is Microsoft Internet Explorer
                    get isMSIE()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("trident") > -1;
                    },

                    // Returns true<bool> if browser is Microsoft Edge
                    get isEdge()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("edge/") > -1;
                    },

                    // Returns true<bool> if browser is Microsoft IE Mobile
                    get isIEMobile()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("iemobile") > -1;
                    },

                    // Returns true<bool> if browser is on a Windows Phone
                    get isWindowsPhone()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("windows phone") > -1;
                    },

                    // Returns true<bool> if browser uses Webkit
                    get isWebkit()
                    {
                        return navigator.userAgent.toLowerCase().indexOf("webkit") > -1;
                    },

                    // Returns true<bool> if the system is iOS
                    get isiOS()
                    {
                        return (this.isSafari && this.isTouch);
                    },

                    // Returns true<bool> if the system is iOS 7
                    get isiOS7()
                    {
                        return (this.isiOS && (navigator.userAgent.toLowerCase().indexOf("os 7") > -1));
                    },

                    get supportsHistoryAPI()
                    {
                        return !!(window.history && history.pushState);
                    }
                },

            // Networking Helpers
            net:
                {
                    request: function (url, options)
                    {
                        var baseOptions =
                            {
                                method: "GET",
                                data: null,
                                progress: null,
                                load: null,
                                error: null,
                                abort: null,
                                finished: null
                            };

                        exHelp.extend(baseOptions, options);

                        var xhr = new XMLHttpRequest();

                        var onProgress = function WrappedOnProgress(e)
                        {
                            if (baseOptions.progress && exHelp.is.function(baseOptions.progress))
                                baseOptions.progress(e);
                        };
                        var onLoad = function WrappedOnLoad(e)
                        {
                            if (baseOptions.load && exHelp.is.function(baseOptions.load))
                                baseOptions.load(e);
                        };
                        var onError = function WrappedOnError(e)
                        {
                            if (baseOptions.error && exHelp.is.function(baseOptions.error))
                                baseOptions.error(e);
                        };
                        var onAbort = function WrappedOnAbort(e)
                        {
                            if (baseOptions.abort && exHelp.is.function(baseOptions.abort))
                                baseOptions.abort(e);
                        };
                        var onReadyState = function WrappedOnReadyState(e)
                        {
                            switch (xhr.readyState)
                            {
                                case XMLHttpRequest.OPENED:
                                case XMLHttpRequest.HEADERS_RECEIVED:
                                case XMLHttpRequest.LOADING:
                                case XMLHttpRequest.UNSENT:
                                    break;
                                case XMLHttpRequest.DONE:
                                    var success = xhr.status == 200;
                                    if (baseOptions.finished && exHelp.is.function(baseOptions.finished))
                                        baseOptions.finished(success, xhr.responseText, xhr);
                                    break;
                            }
                        };

                        xhr.onprogress = onProgress;
                        xhr.onabort = onAbort;
                        xhr.onerror = onError;
                        xhr.onload = onLoad;
                        xhr.onreadystatechange = onReadyState;

                        xhr.open(baseOptions.method, url);

                        if (baseOptions.data && baseOptions.method == "POST")
                        {
                            var datastring = "";

                            // http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
                            var encode = function (obj, prefix)
                            {
                                var str = [];
                                for (var p in obj)
                                {
                                    if (obj.hasOwnProperty(p))
                                    {
                                        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                                        str.push(typeof v == "object" ?
                                          encode(v, k) :
                                          encodeURIComponent(k) + "=" + encodeURIComponent(v));
                                    }
                                }
                                return str.join("&");
                            };

                            datastring = encode(baseOptions.data);
                            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            xhr.send(datastring);
                        }
                        else
                        {
                            xhr.send();
                        }
                    }
                },

            //! Other checking functions

            is:
                {
                    string: function (e)
                    {
                        return !!(typeof e == "string" || e instanceof String);
                    },
                    "function": function (e)
                    {
                        return !!(typeof e === "function" || e instanceof Function);
                    },
                    object: function (e)
                    {
                        return !!(typeof e === "object" || e instanceof Object);
                    },
                    array: Array.isArray,
                    arraylike: function (e)
                    {
                        return e !== void 0 && e["length"] !== void 0;
                    },
                    number: function (e)
                    {
                        return !isNaN(e) && isFinite(e) && e !== false && e !== true && e !== null && e !== undefined;
                    },
                    mouse_event: function (e)
                    {
                        return !!(typeof e === "MouseEvent" || e instanceof MouseEvent);
                    },
                    keyboard_event: function (e)
                    {
                        return !!(typeof e === "KeyboardEvent" || e instanceof KeyboardEvent);
                    }
                },

            // HTML5 Notifications
            browserNotification:
            {
                _mode: 0,
                _permission: 1,
                _api: null,
                _counter: 0,

                // Permission Constants<int>
                permissions:
                    {
                        // Permission to show notifications has been requested and granted
                        get ALLOWED()
                        {
                            return 0;
                        },
                        // Permission to show notifications has not been requested
                        get NOT_ALLOWED()
                        {
                            return 1;
                        },
                        // Permission to show notifications has been requested and denied
                        get DENIED()
                        {
                            return 2;
                        }
                    },

                // Mode Constants<int>
                modes:
                    {
                        // HTML5 Notifications are not supported
                        get NONE()
                        {
                            return 0;
                        },
                        // HTML5 Notifications are supported according to the W3C Standard
                        get W3C()
                        {
                            return 1;
                        },
                        // HTML5 Notifications are supported with the Webkit Implementation
                        get WEBKIT()
                        {
                            return 2;
                        }
                    },
                _list: [],

                Init: function ()
                {
                    /// <summary>
                    /// Initialize HTML5 Notifications
                    /// Call via click event to request permissions
                    /// </summary>

                    if (this.Check_Support(true))
                    {
                        switch (this.Permission.Check(true))
                        {
                            case this.permissions.ALLOWED:
                                break;
                            case this.permissions.NOT_ALLOWED:
                                this.Permission.Request();
                                p.browserNotification.Init();
                                break;
                            case this.permissions.DENIED:
                                break;
                        }
                    }
                },

                Check_Support: function (set)
                {
                    /// <signature>
                    /// <summary>
                    /// Check if the current browser supports HTML5 Notifications
                    /// </summary>
                    /// <param name="set" type="Boolean">If true, the value will be set internally as well</param>
                    /// <returns type="Boolean">Whether or not notifications are supported</returns>
                    /// </signature>
                    ///
                    /// <signature>
                    /// <summary>
                    /// Check if the current browser supports HTML5 Notifications
                    /// </summary>
                    /// <returns type="Boolean">Whether or not notifications are supported</returns>
                    /// </signature>
                    ///

                    if (exHelpObject.isSafari)
                    {
                        this._api = null;
                        return false;
                    }

                    var isValid = function (e)
                    {
                        if (!e || !e.checkPermission || !e.createNotification || !e.requestPermission)
                            return false;

                        return true;
                    };

                    if (isValid(window.Notification))
                    {
                        set && (this._api = window.Notification);
                    }
                    if (isValid(window.webkitNotifications))
                    {
                        set && (this._api = window.webkitNotifications);
                    }

                    if (set)
                        return !!this._api;
                    else
                        return isValid(window.Notification) || isValid(window.webkitNotifications);
                },
                // HTML5 Notifications Permission Handling
                Permission:
                    {
                        // Check if HTML5 Notifications are permitted
                        Check: function (set)
                        {
                            /// <signature>
                            /// <summary>
                            /// Check if HTML5 Notifications are permitted
                            /// </summary>
                            /// <param name="set" type="Boolean">If true, the value will be set internally as well</param>
                            /// <returns type="Boolean">Whether or not notifications are permitted</returns>
                            /// </signature>
                            ///
                            /// <signature>
                            /// <summary>
                            /// Check if HTML5 Notifications are permitted
                            /// </summary>
                            /// <returns type="Boolean">Whether or not notifications are permitted</returns>
                            /// </signature>
                            ///

                            if (!exHelpObject.browserNotification._api)
                                if (!exHelpObject.browserNotification.Check_Support(true))
                                    return;

                            var result = exHelpObject.browserNotification._api.checkPermission();
                            set && (exHelpObject.browserNotification._permission = result);
                            return result;
                        },

                        // Request permission to show HTML5 Notifications
                        // NOTE: This has to be executed on a click handler
                        Request: function ()
                        {
                            /// <summary>
                            /// Request permission to show HTML5 Notifications
                            /// NOTE: This has to be executed on a click handler
                            /// </summary>
                            /// <returns type="Boolean">Whether or not notifications have been granted or denied</returns>

                            return p.browserNotification._api.requestPermission();
                        }
                    },
                _Push_Basic: function ($opts)
                {
                    if (!exHelpObject.settings.useNativeNotifications ||
                        !this.Check_Support() ||
                        this.Permission.Check() !== this.permissions.ALLOWED)
                        return;

                    var $title = $opts.title || exHelpObject.info.AppName;
                    var $content = $opts.content || $opts.msg || $opts.message || $opts.txt || $opts.text;
                    var $img = $opts.img || $opts.pic || "favicon.png";

                    var $onShow = $opts.show || $opts.onshow || $opts.onShow || $opts.display || $opts.ondisplay || $opts.onDisplay;
                    var $onClose = $opts.close || $opts.onClose || $opts.hide || $opts.onHide;

                    var $notification = this._api.createNotification($img, $title, $content);
                    $onShow && exHelp.is.isFunction($onShow) && ($notification.ondisplay = $onShow);
                    $onClose && exHelp.is.isFunction($onClose) && ($notification.onclose = $onClose);

                    $notification.show();

                    this._list[this._counter.toString()] = $notification;
                    //this._counter++;

                    return { notification: $notification, id: this._counter++ };
                },

                Push: function (title, message)
                {
                    /// <summary>
                    /// Push a notification
                    /// </summary>
                    /// <param name="title" type="String">Title of the notification</param>
                    /// <param name="message" type="String">Message of the notification</param>
                    /// <returns type="Object">Notification wrapper object { notification, id }</returns>

                    return this._Push_Basic(
                        {
                            title: title,
                            content: message
                        });
                },

                PushWithImage: function (title, message, pic)
                {
                    /// <summary>
                    /// Push a notification with a custom image
                    /// </summary>
                    /// <param name="title" type="String">Title of the notification</param>
                    /// <param name="message" type="String">Message of the notification</param>
                    /// <param name="pic" type="String">URL of the image of the notification</param>
                    /// <returns type="Object">Notification wrapper object { notification, id }</returns>

                    return this._Push_Basic(
                        {
                            title: title,
                            content: message,
                            img: pic
                        });
                },

                PushAdvanced: function (options)
                {
                    /// <summary>
                    /// Push a notification with (options) (For advanced users only)
                    /// </summary>
                    /// <param name="options" type="Object">Settings object { title, txt, img, show, close }</param>
                    /// <returns type=""></returns>

                    return this._Push_Basic(options);
                }
            },

            locale:
                {
                    _locale: "en",
                    set: function (l)
                    { this._locale = l; },
                    getString: function (str)
                    {
                        var store = exHelpObject.storage("locale");
                        if (store[this._locale] && store[this._locale][str])
                            return store[this._locale][str];

                        return str;
                    }

                }
        };

    var exHelpExtend = function (e)
    {
        exHelpObject.extend(e);
    };

    window.exHelp = exHelpObject;
    window.exHelpExtend = exHelpExtend;
})(window);

// C# Style String.Format
// http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
String.prototype.format = function ()
{
    var a = arguments;
    return this.replace(/{(\d+)}/g, function (c, d)
    {
        return "undefined" != typeof a[d] ? a[d] : c;
    });
};

// http://stackoverflow.com/questions/646628/javascript-startswith
String.prototype.startsWith = function (str)
{
    /// <summary>
    /// Check if this string starts with (str)
    /// </summary>
    /// <param name="str" type="String">Needle to check</param>
    /// <returns type="Boolean">True if this string starts with (str)</returns>
    return this.slice(0, str.length) == str;
};

// http://stackoverflow.com/questions/646628/javascript-startswith
String.prototype.endsWith = function (str)
{
    /// <summary>
    /// Check if this string ends with (str)
    /// </summary>
    /// <param name="str" type="String">Needle to check</param>
    /// <returns type="Boolean">True if this string ends with (str)</returns>
    return this.slice(-str.length) == str;
};

String.prototype.contains = function (str)
{
    return this.indexOf(str) !== -1;
};

// http://stackoverflow.com/questions/202605/repeat-string-javascript
String.prototype.repeat = function (n)
{
    /// <summary>
    /// Repeats this string (n) times
    /// </summary>
    /// <param name="n" type="Integer">How often to repeat this string</param>
    /// <returns type="String">Repeated string</returns>
    var x = this;
    var s = "";
    for (; ;)
    {
        if (n & 1) s += x;
        n >>= 1;
        if (n) x += x;
        else break;
    }
    return s;
};

// http://stackoverflow.com/a/5047712
//String.prototype.width = function (font)
//{
//    var f = font || '12px arial',
//        o = $('<div>' + this + '</div>')
//              .css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f })
//              .appendTo($('body')),
//        w = o.width();

//    o.remove();

//    return w;
//}
///#source 1 1 /js/exHelp_Element.js
/// <reference path="_references.js" />

/*!

exHelp Library - Element Helper Plugin // Version 1.0.0.0
http://www.github.com/xwcg

The MIT License (MIT)

Copyright (c) 2016 Michael Schwarz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function InitExHelp_ElementPlugin(window)
{
    if (window['exHelp'] == void 0 || window['exHelpExtend'] == void 0)
    {
        return setTimeout(InitExHelp_ElementPlugin, 100, window);
    }

    var exElement = function (selector, options)
    {
        return new exElement.functions.init(selector, options);
    };

    var exHelpElement =
        {
            e: exElement,
            isExElement: function (e) { return !!(e instanceof exHelp.e); }
        };

    var domReadySusbcriberTopic = "_dom_ready";
    var onDomReady = function ()
    {
        document.removeEventListener("DOMContentLoaded", onDomReady);
        window.removeEventListener("load", onDomReady);

        exHelp.trigger(domReadySusbcriberTopic);
    };

    document.addEventListener("DOMContentLoaded", onDomReady);
    window.addEventListener("load", onDomReady);

    exElement.functions = exElement.prototype =
        {
            constructor: exElement,
            init: function (selector, options)
            {
                if (!selector) return this;

                var matches = [];

                if (exHelp.is.string(selector))
                {
                    if (selector.charAt(0) == "<" && selector.length >= 3 && selector.charAt(selector.length - 1) == ">")
                    {
                        var tempElement = window.document.createElement("div");
                        tempElement.innerHTML = selector;
                        matches = tempElement.childNodes;

                        return new exElement(matches, options);
                    }
                    else
                    {
                        matches = window.document.querySelectorAll(selector);
                        for (var i = 0; i < matches.length; i++)
                            this[i] = matches[i];

                        this.length = matches.length;
                    }
                }
                else if (exHelp.is.arraylike(selector))
                {
                    var tempmatch, length = selector.length, i = 0;
                    for (; i < length; i++)
                    {
                        if (selector[i] instanceof exHelp.e)
                            tempmatch = selector[i];
                        else
                            tempmatch = new exElement(selector[i], options);

                        if (tempmatch.length > 0)
                            matches.push(tempmatch[0]);
                    }

                    length = matches.length;
                    for (i = 0; i < length; i++)
                        this[i] = matches[i];

                    this.length = matches.length;
                }
                else if (exHelp.is.object(selector))
                {
                    if (selector instanceof exHelp.e)
                        return selector;

                    this.context = this[0] = selector;
                    this.length = 1;
                }

                this._applyOptions(options);

                return this;
            },

            length: 0,

            each: function (callback)
            {
                //exHelp.each(this, callback);
                for (var i = 0; i < this.length; i++)
                    if (callback.call(this[i], i, this[i]) === false)
                        return false;

                return true;
            },

            // Internal

            _applyOptions: function (options)
            {
                var key, value;
                for (key in options)
                {
                    value = options[key];
                    switch (key.toLowerCase())
                    {
                        case "html":
                            if (value.startsWith("__LOCALE__:"))
                            {
                                var localeKey = value.split(":")[1];
                                this.setHtml(exHelp.locale.getString(localeKey));
                            }
                            else
                                this.setHtml(value);
                            break;

                        case "class":
                            this.addClass(value);
                            break;

                        case "width":
                        case "height":
                        case "top":
                        case "left":
                        case "right":
                        case "bottom":
                        case "position":
                            this.setStyle(key, value);
                            break;

                        default:
                            this.setAttr(key, value);
                            break;
                    }
                }
            },

            // Basic DOM Functions

            setAttr: function (name, value)
            {
                this.each(function ()
                {
                    if (this["setAttribute"] !== void 0)
                        this.setAttribute(name, value);
                    //try { this.setAttribute(name, value); } catch (ex) { this[name] = value; }
                });
                return this;
            },
            getAttr: function (name)
            {
                var ret = null;
                this.each(function ()
                {
                    if (this["getAttribute"] !== void 0)
                        ret = this.getAttribute(name);

                    if (ret == null)
                    {
                        // Sometimes getAttribute returns null even though the attribute definitely exists
                        // and definitely has a value. I don't know why, it just does.
                        // Thus: Go through the attributes list and find the attribute...
                        var attrList = this.attributes, l = attrList.length, i = 0;
                        for (; i < l; i++)
                        {
                            var $this = attrList[i],
                                n = $this.name || $this.nodeName,
                                v = $this.value || $this.nodeValue || $this.textContent;
                            if (n == name)
                            {
                                ret = v;
                                break;
                            }
                        }
                    }
                });
                return ret;
            },

            setHtml: function (value)
            {
                this.each(function ()
                {
                    if (this["innerHTML"] !== void 0)
                    {
                        this.innerHTML = value;
                    }
                    else if (this["textContent"] !== void 0)
                    {
                        this.textContent = value;
                    }
                });

                return this;
            },

            getHtml: function ()
            {
                var ret = null;
                this.each(function ()
                {
                    if (this["innerHTML"] !== void 0)
                    {
                        ret = this.innerHTML;
                    }
                    else if (this["textContent"] !== void 0)
                    {
                        ret = this.textContent;
                    }
                });
                return ret;
            },

            empty: function ()
            {
                return this.setHtml("");
            },

            remove: function ()
            {
                this.each(function ()
                {
                    this.parentNode.removeChild(this);
                });

                return this;
            },

            children: function ()
            {
                var ret = [];
                this.each(function ()
                {
                    var i = 0, children = this.childNodes, length = children.length;
                    for (; i < length; i++)
                        ret.push(children[i]);
                });

                return new exElement(ret);
            },
            find: function (query)
            {
                if (!query) return new exElement([]);

                var ret = [], ele, isClass = query.charAt(0) == ".", isId = query.charAt(0) == "#", pureName = isClass || isId ? query.substr(1) : query, i, length;

                this.each(function exElement_FindIterator()
                {
                    ele = new exElement(this);
                    if ((isClass && ele.hasClass(pureName)) || (isId && ele.getAttr("id") == pureName) || (!isClass && !isId && ele[0].nodeName.toLowerCase() == pureName.toLowerCase()))
                    {
                        ret.push(this);
                    }

                    if (this.childNodes.length > 0)
                    {
                        ele = ele.children().find(query);
                        length = ele.length;
                        if (length > 0)
                        {
                            for (i = 0; i < length; i++)
                                ret.push(ele[i]);
                        }
                    }
                });

                return new exElement(ret);
            },
            exclusive: function (query)
            {
                var ret = [], ele, isClass = query.charAt(0) == ".", isId = query.charAt(0) == "#", pureName = isClass || isId ? query.substr(1) : query, i, length;

                this.each(function exElement_ExclusiveIterator()
                {
                    ele = new exElement(this);
                    if ((isClass && ele.hasClass(pureName)) || (isId && ele.getAttr("id") == pureName) || (!isClass && !isId && ele[0].nodeName.toLowerCase() == pureName.toLowerCase()))
                    {
                        ret.push(this);
                    }
                });

                return new exElement(ret);
            },

            getWidth: function ()
            {
                return parseFloat(this.getComputedStyle("width"));
            },
            getHeight: function ()
            {
                return parseFloat(this.getComputedStyle("height"));
            },

            getParents: function (until)
            {
                var parents = [],
                    hasUntil = until !== undefined,
                    untilIsClass = hasUntil && until.startsWith("."),
                    untilIsId = hasUntil && until.startsWith("#");

                var gp = function (e)
                {
                    if (e)
                    {
                        var $e = new exElement(e);
                        parents.push(e);
                        if (hasUntil)
                        {
                            if ((untilIsClass && $e.hasClass(until)) || (untilIsId && $e.getAttr("id") == until))
                                return false;
                        }

                        if (e.parentNode)
                        {
                            return gp(e.parentNode);
                        }
                    }
                };

                this.each(function ()
                {
                    if (this)
                    {
                        gp(this.parentNode);
                    }
                });

                return new exElement(parents);
            },

            getPageXY: function ()
            {
                var fullscreenElement = document.fullScreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                var offset = { x: 0, y: 0 };
                var getOffset = function (e)
                {
                    if (exHelp.fullscreen.isFullscreen && fullscreenElement == e)
                        return;

                    offset.x += e.offsetLeft;
                    offset.y += e.offsetTop;

                    if (e.offsetParent)
                        getOffset(e.offsetParent);
                };

                this.each(function ()
                {
                    getOffset(this);
                });

                return offset;
            },

            getPageBounds: function ()
            {
                var xy = this.getPageXY();
                var bounds = {
                    left: xy.x,
                    top: xy.y,
                    right: xy.x + this.getWidth(),
                    bottom: xy.y + this.getHeight()
                };

                return bounds;
            },


            getRelativeXY: function (until)
            {
                var offset = { x: 0, y: 0 },
                    isClass = until.charAt(0) == ".",
                    isId = until.charAt(0) == "#",
                    pureName = isClass || isId ? until.substr(1) : until;

                var getOffset = function (e)
                {
                    var ele = new exElement(e);
                    if ((isClass && ele.hasClass(pureName)) || (isId && ele.getAttr("id") == pureName) || (!isClass && !isId && ele[0].nodeName.toLowerCase() == pureName.toLowerCase()))
                        return false;

                    offset.x += e.offsetLeft;
                    offset.y += e.offsetTop;

                    if (e.offsetParent)
                        getOffset(e.offsetParent);
                };

                this.each(function ()
                {
                    getOffset(this);
                });

                return offset;
            },

            getRelativeBounds: function (until)
            {
                var xy = this.getRelativeXY(until);
                var bounds = {
                    left: xy.x,
                    top: xy.y,
                    right: xy.x + this.getWidth(),
                    bottom: xy.y + this.getHeight()
                };

                return bounds;
            },

            getRelativeBoundingClientRect: function ()
            {
                var boundingRect = null;
                var relBounds = this.getPageBounds();
                this.each(function ()
                {
                    boundingRect = this.getBoundingClientRect();
                });

                if (boundingRect != null)
                {
                    var outRect = {
                        top: boundingRect.top - relBounds.top,
                        left: boundingRect.left - relBounds.left,
                        right: boundingRect.right - relBounds.right,
                        bottom: boundingRect.bottom - relBounds.bottom,
                        width: boundingRect.width,
                        height: boundingRect.height
                    };

                    return outRect;
                }

                return relBounds;
            },

            getComputedStyle: function (prop)
            {
                var ret = null;

                this.each(function ()
                {
                    if (window.getComputedStyle)
                    {
                        ret = window.getComputedStyle(this, null).getPropertyValue(prop);
                    }
                    else if (this.currentStyle)
                    {
                        ret = this.currentStyle[prop];
                    }
                    else
                    {
                        ret = this.style[prop];
                    }
                });

                return ret;
            },

            addClass: function (value)
            {
                var values = value.split(" ");
                this.each(function ()
                {
                    var classes = this.className.split(" ");
                    for (var i = 0; i < values.length; i++)
                        if (!exHelp.array.contains(classes, values[i]))
                        {
                            classes.push(values[i]);
                        }
                    this.className = classes.join(" ").trim();
                });
                return this;
            },

            removeClass: function (value)
            {
                var values = value.split(" ");
                this.each(function ()
                {
                    var classes = this.className.split(" ");
                    for (var i = 0; i < values.length; i++)
                        if (exHelp.array.contains(classes, values[i]))
                        {
                            classes.splice(classes.indexOf(values[i]), 1);
                        }
                    this.className = classes.join(" ").trim();
                });
                return this;
            },

            toggleClass: function (value)
            {
                var values = value.split(" ");
                this.each(function ()
                {
                    var classes = this.className.split(" ");
                    for (var i = 0; i < values.length; i++)
                        if (exHelp.array.contains(classes, values[i]))
                        {
                            classes.splice(classes.indexOf(values[i]), 1);
                        }
                        else
                        {
                            classes.push(values[i]);
                        }
                    this.className = classes.join(" ").trim();
                });
                return this;
            },

            hasClass: function (value)
            {
                var ret = false;
                this.each(function ()
                {
                    var classes = this.className ? this.className.split(" ") : [];
                    if (exHelp.array.contains(classes, value))
                    {
                        ret = true;
                        return false;
                    }
                });
                return ret;
            },

            setStyle: function (name, value)
            {
                this.each(function ()
                {
                    this.style[name] = value;
                });
            },

            appendTo: function (target)
            {
                target = new exElement(target);
                this.each(function ()
                {
                    var $this = this;
                    target.each(function ()
                    {
                        this.appendChild($this);
                    });
                });
                return this;
            },

            prependTo: function (target)
            {
                target = new exElement(target);
                this.each(function ()
                {
                    var $this = this;
                    target.each(function ()
                    {
                        this.insertBefore($this, this.firstChild);
                    });
                });
                return this;
            },

            // Event handling

            _evtQueue: function ()
            {
                var queue = [];

                this.add = function (e)
                {
                    queue.push(e);
                };

                this.call = function (context)
                {
                    for (var i = 0, l = queue.length; i < l; i++)
                    {
                        queue[i].call(context);
                    }
                };

                this.remove = function (e)
                {
                    var newQueue = [];
                    for (var i = 0, l = queue.length; i < l; i++)
                    {
                        if (queue[i] !== e) newQueue.push(queue[i]);
                    }
                };

                this.length = function () { return queue.length; };
            },

            on: function (events, callback)
            {
                var evts = [], $this = this;
                if (exHelp.is.string(events))
                {
                    if (events.contains(" "))
                        evts = events.split(" ");
                    else if (events.contains(","))
                    {
                        evts = events.split(",");
                        for (var i = 0; i < evts.length; i++)
                            evts[i] = evts[i].trim();
                    }
                    else
                        evts.push(events);
                }

                var i = 0, length = evts.length, e;
                for (; i < length; i++)
                {
                    e = evts[i];

                    switch (e)
                    {
                        case "ready":
                            exHelp.subscribe(domReadySusbcriberTopic, callback);
                            break;

                        case "tap":
                            var tapHandler = function (element)
                            {
                                var isDown = false, ignoreUntilNew = false, xe = new exElement(element);

                                element.addEventListener("touchstart", function (e)
                                {
                                    //exHelp.reader.dbg("start");
                                    ignoreUntilNew = false;
                                    isDown = true;
                                    xe.addClass("pressed");
                                }, { passive: true });

                                element.addEventListener("touchcancel", function (e)
                                {
                                    if (!ignoreUntilNew)
                                    {
                                        //exHelp.reader.dbg("cancel");
                                        ignoreUntilNew = true;
                                        isDown = false;
                                        xe.removeClass("pressed");
                                    }
                                }, { passive: true });

                                element.addEventListener("touchmove", function (e)
                                {
                                    if (!ignoreUntilNew)
                                    {
                                        var bounds = new exElement(element).getPageBounds();

                                        if (e && e.touches && e.touches.length > 0)
                                        {
                                            var touch = e.touches[0];
                                            if (touch.pageX < bounds.left || touch.pageX > bounds.right || touch.pageY < bounds.top || touch.pageY > bounds.bottom)
                                            {
                                                isDown = false;
                                                element.dispatchEvent(new TouchEvent("touchcancel"));
                                            }
                                        }
                                    }
                                }, { passive: true });

                                element.addEventListener("touchend", function (e)
                                {
                                    if (!ignoreUntilNew)
                                    {
                                        if (isDown)
                                        {
                                            // Prevent double triggering of tap and click
                                            if (e && e.preventDefault) e.preventDefault();
                                            if (e && e.stopPropagation) e.stopPropagation();

                                            //exHelp.reader.dbg("end");
                                            element._ehe_queue_tap.call(element);
                                            isDown = false;
                                            xe.removeClass("pressed");
                                        }
                                    }
                                });
                            };

                            this.each(function ()
                            {
                                if (!this._ehe_queue_tap)
                                    this._ehe_queue_tap = new $this._evtQueue();

                                if (!this._ehe_taphandler)
                                    this._ehe_taphandler = new tapHandler(this);

                                this._ehe_queue_tap.add(callback);
                            });
                            break;

                        case "resize":
                            var resizeAttacher = function ()
                            {
                                if (this instanceof Element)
                                {
                                    if (this._ehe_resize_handler)
                                    {
                                        this._ehe_queue_resize.add(callback);
                                    }
                                    else
                                    {
                                        if (!this._ehe_queue_resize)
                                            this._ehe_queue_resize = new exElement.functions._evtQueue();

                                        this._ehe_queue_resize.add(callback);
                                        this._ehe_resize_handler = document.createElement("div");

                                        var $this = this;
                                        var style = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;";
                                        var styleChild = "position: absolute; left: 0; top: 0; transition: 0s;";

                                        this._ehe_resize_handler.className = "ehe-resize-event-dummy";
                                        this._ehe_resize_handler.style.cssText = style;
                                        this._ehe_resize_handler.innerHTML = "<div class=\"resize-sensor-expand\" style=\"{0}\"><div style=\"{1}\"></div></div><div class=\"resize-sensor-shrink\" style=\"{0}\"><div style=\"{1} width: 200%; height: 200%\"></div></div>"
                                        .format(style, styleChild);

                                        this.appendChild(this._ehe_resize_handler);

                                        var expand = this._ehe_resize_handler.childNodes[0];
                                        var expandChild = expand.childNodes[0];
                                        var shrink = this._ehe_resize_handler.childNodes[1];

                                        var reset = function ()
                                        {
                                            expandChild.style.width = 100000 + 'px';
                                            expandChild.style.height = 100000 + 'px';

                                            expand.scrollLeft = 100000;
                                            expand.scrollTop = 100000;

                                            shrink.scrollLeft = 100000;
                                            shrink.scrollTop = 100000;
                                        };

                                        reset();

                                        var lastWidth, lastHeight;
                                        var cachedWidth, cachedHeight; //useful to not query offsetWidth twice

                                        var onScroll = function ()
                                        {
                                            if ((cachedWidth = $this.offsetWidth) != lastWidth || (cachedHeight = $this.offsetHeight) != lastHeight)
                                            {
                                                $this._ehe_queue_resize.call(this);

                                                lastWidth = cachedWidth;
                                                lastHeight = cachedHeight;
                                            }
                                            reset();
                                        };

                                        expand.addEventListener("scroll", onScroll);
                                        shrink.addEventListener("scroll", onScroll);
                                    }

                                    return false;
                                }
                            };

                            if (this.each(resizeAttacher) === false)
                                break;

                        default:
                            this.each(function ()
                            {
                                this.addEventListener(e, callback);
                            });
                            break;
                    }
                }

                return this;
            },
            off: function (events, callback)
            {
                var evts = [], $this = this;
                if (exHelp.is.string(events))
                {
                    if (events.contains(" "))
                        evts = events.split(" ");
                    else if (events.contains(","))
                    {
                        evts = events.split(",");
                        for (var i = 0; i < evts.length; i++)
                            evts[i] = evts[i].trim();
                    }
                    else
                        evts.push(events);
                }

                var i = 0, length = evts.length, e;
                for (; i < length; i++)
                {
                    e = evts[i];

                    switch (e)
                    {
                        case "ready":
                            exHelp.unsubscribe(domReadySusbcriberTopic, callback);
                            break;

                        case "tap":
                            this.each(function ()
                            {
                                if (this._ehe_queue_tap)
                                    this._ehe_queue_tap.remove(callback);
                            });
                            break;

                        case "resize":
                            var resizeAttacher = function ()
                            {
                                if (this instanceof Element)
                                {
                                    if (this._ehe_queue_resize)
                                    {
                                        this._ehe_queue_resize.remove(callback);
                                    }
                                }
                            };

                            if (this.each(resizeAttacher) === false)
                                break;

                        default:
                            this.each(function ()
                            {
                                this.removeEventListener(e, callback);
                            });
                            break;
                    }
                }

                return this;
            }
        };

    exElement.functions.init.prototype = exElement.functions;
    exElement.extend = exElement.functions.extend = function (e)
    {
        exHelp.extend(this, e);
    };


    // Extend exHelp
    window.exHelpExtend(exHelpElement);

})(window);
///#source 1 1 /js/init.js
/// <reference path="_references.js" />

(function InitReader(window)
{
    if (window['exHelp'] == void 0 || window['exHelpExtend'] == void 0 || window['exHelp']['e'] == void 0)
    {
        return setTimeout(InitReader, 100, window);
    }

    // Create shorthand
    var p = exHelp;

    var reader =
        {
            reader:
                {
                    container: null,
                    path: null,
                    render_canvas: null,
                    sound: null,

                    dbg_log: [],
                    dbg: function (a)
                    {
                        /*
                        var $this = p.reader;
                        $this.dbg_log.push(a);

                        if ($this.dbg_log.length > 5)
                            $this.dbg_log.splice(0, 1);

                        var ele = p.e("#dbgcontainer");
                        if (!ele || ele.length == 0)
                        {
                            ele = p.e("<div>", { "id": "dbgcontainer" }).appendTo($this.container);
                        }

                        ele.setHtml("<p>" + $this.dbg_log.join("</p><p>") + "</p>");
                        */
                    },

                    settings:
                        {
                            language: "en",

                            show_go_to_page: false,

                            preload: false,

                            custom_background: null,
                            custom_backgound_mode: null,

                            start_page: 1,
                            no_pdf: false,

                            slideshow_mode: false,
                            slideshow_timing: 5,
                            slideshow_controls: false,
                            slideshow_pdf: false,

                            page_mode: "auto",
                            page_sound: 0,
                            page_sound_volume: 1.0,

                            show_zoom: true,
                            enable_pinching: false,
                            enable_double_tapping: false,
                            enable_mousewheel_zoom: false,
                            zoom_max: 4.0,
                            zoom_min: "auto",
                            zoom_doubleclick: 1.0,
                            zoom_wheel_step: 0.1,
                            zoom_button_step: 0.1,

                            enable_dragging: true,
                            enable_scrollbars: false,

                            show_fullscreen: true,
                            hide_in_fullscreen: true,

                            show_invert: false,
                            show_download: false,

                            show_overview: true,
                            overview_direction: "bottom",
                            overview_overlay: false,
                            overview_size: 150,
                            overview_start_open: false,

                            enable_keyboard_navigation: false,
                            enable_swiping: false,
                            enable_arrows: false,

                            social_twitter: null,
                            social_facebook: null,
                            social_google: null,
                            social_email: false,

                            enable_printing: false,

                            small_controls: false
                        },

                    control_assignments:
                        {
                            "overview": "bottomright-ver",
                            "fullscreen": "bottomright-ver",
                            "invert": "topright-hor",
                            "zoom-in": "topright-hor",
                            "zoom-out": "topright-hor",
                            "go-back": "left",
                            "go-fwd": "right",
                            "download": "bottomleft-hor",
                            "goto": "bottomleft-hor",
                            "ss-back": "bottom",
                            "ss-play": "bottom",
                            "ss-pause": "bottom",
                            "ss-fwd": "bottom"
                        },

                    elements:
                       [
                            {
                                selector: ".content",
                                construct: "<div>",
                                options: { "class": "content", tabindex: 0 },

                                children:
                                    [
                                        {
                                            selector: ".pages",
                                            options: { "class": "pages" },
                                            children:
                                                [
                                                    {
                                                        selector: ".overlayer",
                                                        options: { "class": "overlayer" }
                                                    }
                                                ]
                                        }
                                    ]
                            },

                            {
                                selector: ".controls",
                                options: { "class": "controls" },
                                children:
                                    [
                                        {
                                            selector: ".topleft",
                                            options: { "class": "topleft" },
                                            children:
                                                [
                                                    { selector: ".horizontal", options: { "class": "horizontal flex" } },
                                                    { selector: ".vertical", options: { "class": "vertical flex" } }
                                                ]
                                        },
                                        {
                                            selector: ".topright",
                                            options: { "class": "topright" },
                                            children:
                                                [
                                                    { selector: ".horizontal", options: { "class": "horizontal flex" } },
                                                    { selector: ".vertical", options: { "class": "vertical flex" } }
                                                ]
                                        },
                                        {
                                            selector: ".bottomleft",
                                            options: { "class": "bottomleft" },
                                            children:
                                                [
                                                    { selector: ".horizontal", options: { "class": "horizontal flex" } },
                                                    { selector: ".vertical", options: { "class": "vertical flex" } }
                                                ]
                                        },
                                        {
                                            selector: ".bottomright",
                                            options: { "class": "bottomright" },
                                            children:
                                                [
                                                    { selector: ".horizontal", options: { "class": "horizontal flex" } },
                                                    { selector: ".vertical", options: { "class": "vertical flex" } }
                                                ]
                                        },

                                        {
                                            selector: ".top",
                                            options: { "class": "top flex horizontal center-content" }
                                        },

                                        {
                                            selector: ".left",
                                            options: { "class": "left flex vertical center-content" }
                                        },

                                        {
                                            selector: ".bottom",
                                            options: { "class": "bottom flex horizontal center-content" }
                                        },

                                        {
                                            selector: ".right",
                                            options: { "class": "right flex vertical center-content" }
                                        }
                                    ]
                            },

                            {
                                selector: ".overviews",
                                options: { "class": "overviews" }
                            },

                            {
                                selector: ".main-loader",
                                options: { "class": "main-loader loader" }
                            },

                            {
                                selector: ".status",
                                options: { "class": "status flex horizontal" },
                                children:
                                    [
                                        {
                                            selector: ".loader",
                                            options: { "class": "loader" },
                                            children: [{ selector: ".spinner", options: { "class": "spinner" } }]
                                        },
                                        {
                                            selector: ".text",
                                            options: { "class": "text", html: "__LOCALE__:LOADING" }
                                        },
                                        {
                                            selector: ".finished-overlay",
                                            options: { "class": "finished-overlay hidden", html: "__LOCALE__:LOADING_FINISHED" }
                                        },
                                        {
                                            selector: ".error-overlay",
                                            options: { "class": "error-overlay hidden", html: "__LOCALE__:LOADING_ERROR" }
                                        }
                                    ]
                            },
                            {
                                selector: ".render-canvas",
                                construct: "<canvas>",
                                options: { "class": "render-canvas" }
                            }
                       ],

                    checkFileExists: function (path, callback)
                    {
                        p.net.request(path,
                                {
                                    method: "HEAD",
                                    finished: function (success, data, xhr)
                                    {
                                        if (callback && p.is.function(callback))
                                            callback(success && xhr.status == 200);
                                    }
                                });
                    },

                    makeMessage: function (title, text, onButton)
                    {
                        var box = p.e("<div>", { "class": "message" });
                        var eTitle = p.e("<div>", { "class": "title", html: title });
                        var eText = p.e("<div>", { "class": "text", html: text });
                        var eButton = p.e("<div>", { "class": "button", html: "OK" });
                        eTitle.appendTo(box);
                        eText.appendTo(box);
                        eButton.appendTo(box);

                        eButton.on("click", function ()
                        {
                            box.remove();

                            if (onButton && p.is.function(onButton))
                            {
                                onButton();
                            }
                        });

                        return box;
                    },

                    loadPdfProcessor: function (callback)
                    {
                        var scriptTags = p.e("script");
                        var currentScript = null;
                        scriptTags.each(function ()
                        {
                            if (this.src.contains("magalone."))
                            {
                                currentScript = this.src;
                                return false;
                            }
                        });

                        if (currentScript != null)
                        {
                            p.pager.current_script = currentScript;
                            var currentPath = p.pager.current_script.substr(0, p.pager.current_script.lastIndexOf("/"));
                            var pdfProcessorPath = currentPath + "/processing" + (p.pager.current_script.contains(".min") ? ".min" : "") + ".js";

                            var pdfProcessorScriptElement = document.createElement("script");
                            var pdfProcessorLoaded = false;
                            pdfProcessorScriptElement.onload = function ()
                            {
                                if (!pdfProcessorLoaded)
                                {
                                    callback();
                                }

                                pdfProcessorLoaded = true;
                            };
                            pdfProcessorScriptElement.setAttribute("src", pdfProcessorPath);
                            document.getElementsByTagName('head')[0].appendChild(pdfProcessorScriptElement);
                        }
                    },

                    loadLocale: function (callback)
                    {
                        var scriptTags = p.e("script");
                        var currentScript = null;
                        scriptTags.each(function ()
                        {
                            if (this.src.contains("magalone."))
                            {
                                currentScript = this.src;
                                return false;
                            }
                        });

                        if (currentScript != null)
                        {
                            p.pager.current_script = currentScript;
                            var currentPath = p.pager.current_script.substr(0, p.pager.current_script.lastIndexOf("/"));
                            var localePath = currentPath + "/locale/" + p.reader.settings.language + (p.pager.current_script.contains(".min") ? ".min" : "") + ".js";

                            var localeScriptElement = document.createElement("script");
                            var localeLoaded = false;
                            localeScriptElement.onload = function ()
                            {
                                if (!localeLoaded)
                                {
                                    callback();
                                }

                                localeLoaded = true;
                            };
                            localeScriptElement.setAttribute("src", localePath);
                            document.getElementsByTagName('head')[0].appendChild(localeScriptElement);
                        }
                    },

                    loadAudioPath: function ()
                    {
                        var scriptTags = p.e("script");
                        var currentScript = null;
                        scriptTags.each(function ()
                        {
                            if (this.src.contains("magalone."))
                            {
                                currentScript = this.src;
                                return false;
                            }
                        });

                        if (currentScript != null)
                        {
                            p.pager.current_script = currentScript;
                            var currentPath = p.pager.current_script.substr(0, p.pager.current_script.lastIndexOf("/") - 3) + "/sound/page-flip-";
                            return currentPath;
                        }

                        return "./";
                    },

                    svgLoaded: false,
                    loadSvgFilters: function ()
                    {
                        var invertFilter = '<svg version="1.1" xmlns:svg="http://www.w3.org/2000/svg" height="0"><filter id="invert"><feComponentTransfer><feFuncR type="table" tableValues="1 0"></feFuncR><feFuncG type="table" tableValues="1 0"></feFuncG><feFuncB type="table" tableValues="1 0"></feFuncB></feComponentTransfer></filter></svg>';
                        p.e(invertFilter, { "style": "display:none;" }).appendTo("body");
                        this.svgLoaded = true;
                    },

                    playPageSound: function ()
                    {
                        if (p.reader.sound != null)
                        {
                            p.reader.sound[0].pause();
                            p.reader.sound[0].currentTime = 0;
                            p.reader.sound[0].play();
                        }
                    },

                    get: function (e, defaultValue)
                    {
                        var v = p.reader.container.getAttr("data-" + e);
                        var d = defaultValue === undefined ? null : defaultValue;
                        return v == null ? d : v;
                    },

                    getBoolean: function (e, defaultValue)
                    {
                        var v = this.get(e);
                        var d = defaultValue === undefined ? false : defaultValue;
                        return v == null ? d : v == "true";
                    },

                    lastFullscreenElement: null,
                    onFullscreenChange: function (evt)
                    {
                        var fullscreenElement = document.fullScreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
                        var type = "";
                        if (p.reader.lastFullscreenElement == null)
                        {
                            type = "enter";
                        }
                        else
                        {
                            type = "exit";
                        }

                        p.trigger("fullscreen", [type, fullscreenElement || p.reader.lastFullscreenElement]);
                        p.reader.lastFullscreenElement = fullscreenElement;
                    },

                    init: function ()
                    {
                        var $this = this, temp;
                        this.container = p.e("#reader-container");

                        if (this.container.length > 0)
                        {
                            this.path = this.get("path");
                        }

                        if (this.container.length > 0 && this.path != null && this.path.length > 0)
                        {
                            // Get Config
                            this.settings.language = this.get("language", "en");
                            p.locale.set(this.settings.language);

                            this.settings.start_page = parseInt(this.get("start-page", "1"));
                            this.settings.no_pdf = this.getBoolean("no-pdf", false);

                            this.settings.show_fullscreen = this.getBoolean("show-fullscreen", true);
                            this.settings.hide_in_fullscreen = this.getBoolean("immersive-fullscreen", false);
                            this.settings.show_invert = this.getBoolean("show-invert");

                            this.settings.show_overview = this.getBoolean("show-thumbnails");
                            this.settings.overview_overlay = this.getBoolean("thumbnails-overlay");
                            this.settings.overview_direction = this.get("thumbnails-direction", "bottom");
                            this.settings.overview_size = parseInt(this.get("thumbnails-size", "150"));
                            this.settings.overview_start_open = this.getBoolean("thumbnails-start-open");

                            this.settings.show_zoom = this.getBoolean("show-zoom");
                            this.settings.enable_pinching = this.getBoolean("enable-pinching");
                            this.settings.enable_double_tapping = this.getBoolean("enable-double-click");
                            this.settings.enable_mousewheel_zoom = this.getBoolean("enable-mouse-wheel");
                            this.settings.zoom_wheel_step = parseInt(this.get("zoom-wheel", "10")) / 100;
                            this.settings.zoom_max = parseInt(this.get("zoom-max", "400")) / 100;
                            this.settings.zoom_min = (temp = this.get("zoom-min", "auto")) == "auto" ? "auto" : parseInt(temp) / 100;
                            this.settings.zoom_doubleclick = parseInt(this.get("zoom-doubleclick", "100")) / 100;

                            this.settings.enable_keyboard_navigation = this.getBoolean("enable-keyboard", true);
                            this.settings.enable_swiping = this.getBoolean("enable-swiping", true);
                            this.settings.enable_arrows = this.getBoolean("enable-arrows", true);

                            this.settings.preload = this.getBoolean("preload", true);//!
                            this.settings.show_download = this.getBoolean("show-download", false);
                            this.settings.show_go_to_page = this.getBoolean("show-go-to-page", false);//!

                            this.settings.slideshow_mode = this.getBoolean("slideshow", false);
                            this.settings.slideshow_timing = parseFloat(this.get("slideshow-time", "5"));
                            this.settings.slideshow_controls = this.getBoolean("slideshow-show-controls", false);
                            this.settings.slideshow_pdf = this.getBoolean("slideshow-use-pdf", false);

                            this.settings.small_controls = this.getBoolean("small-controls", false);

                            this.settings.page_sound = parseInt(this.get("page-sound", "0"));
                            this.settings.page_sound_volume = parseInt(this.get("page-sound-volume", "100")) / 100;

                            this.settings.page_mode = this.get("page-mode", "auto");
                            if (this.settings.page_mode != "auto")
                            {
                                if (this.settings.page_mode == "single")
                                {
                                    p.pager.current_mode_manual = true;
                                    p.pager.current_mode = p.pager.constant.SINGLE;
                                }
                                else if (this.settings.page_mode == "double")
                                {
                                    p.pager.current_mode_manual = true;
                                    p.pager.current_mode = p.pager.constant.DOUBLE;
                                }
                            }

                            //this.settings.enable_dragging = this.getBoolean("enable-dragging", true);//!
                            //this.settings.enable_scrollbars = this.getBoolean("enable-scrollbars");//!
                            /*

                            custom_background: null,
                            custom_backgound_mode: null,
                            
                            social_twitter: null,
                            social_facebook: null,
                            social_google: null,
                            social_email: false,

                            enable_printing: false,
                            */

                            // Do inits
                            this.loadLocale(function ()
                            {
                                $this.prepareElements();
                                p.overlays.init();
                                document.addEventListener("fullscreenchange", p.reader.onFullscreenChange);
                                document.addEventListener("mozfullscreenchange", p.reader.onFullscreenChange);
                                document.addEventListener("webkitfullscreenchange", p.reader.onFullscreenChange);
                                document.addEventListener("MSFullscreenChange", p.reader.onFullscreenChange); // CASE SENSITIVE, yes I am serious

                                $this.render_canvas = $this.container.find(".render-canvas");

                                if ($this.settings.enable_scrollbars)
                                {
                                    $this.container.find(".content").addClass("scrollbars");
                                }
                                if ($this.settings.small_controls)
                                    $this.container.find(".controls").addClass("small");

                                if ($this.settings.slideshow_mode)
                                {
                                    p.pager.current_mode_manual = true;
                                    p.pager.current_mode = p.pager.constant.SINGLE;
                                }
                                if ($this.settings.page_sound > 0 && $this.settings.page_sound <= 20)
                                {
                                    try
                                    {
                                        $this.sound = p.e("<audio>", { "preload": "auto" });
                                    } catch (ex)
                                    {
                                        $this.sound = p.e("<audio>");
                                    }
                                    if ($this.sound != null)
                                    {
                                        var path = $this.loadAudioPath();

                                        if ($this.sound[0].canPlayType("audio/mp3"))
                                            var mp3 = p.e("<source>", { "src": path + $this.settings.page_sound + ".mp3", "type": "audio/mp3" }).appendTo($this.sound);
                                        if ($this.sound[0].canPlayType("audio/aac"))
                                            var aac = p.e("<source>", { "src": path + $this.settings.page_sound + ".aac", "type": "audio/aac" }).appendTo($this.sound);
                                        if ($this.sound[0].canPlayType("audio/ogg"))
                                            var ogg = p.e("<source>", { "src": path + $this.settings.page_sound + ".ogg", "type": "audio/ogg" }).appendTo($this.sound);
                                        if ($this.sound[0].canPlayType("audio/wav"))
                                            var wav = p.e("<source>", { "src": path + $this.settings.page_sound + ".wav", "type": "audio/wav" }).appendTo($this.sound);

                                        $this.sound.appendTo($this.container);
                                        try
                                        {
                                            $this.sound[0].volume = $this.settings.page_sound_volume;
                                        }
                                        catch (ex)
                                        {
                                            console.error("AUDIO is not supported by browser");
                                            $this.sound = null;
                                        }
                                    }
                                }

                                $this.checkFileExists($this.path + "/cover_small.jpg",
                                    function (success)
                                    {
                                        if (success)
                                        {
                                            $this.prepareCover();
                                            $this.prepareData();
                                            $this.prepareControls();
                                        }
                                        else
                                        {
                                            p.net.request($this.path + "/upload.php",
                                                               {
                                                                   method: "POST",
                                                                   data: { cmd: "ping" },
                                                                   finished: function (success, data)
                                                                   {
                                                                       if (success && data == "pong")
                                                                       {
                                                                           $this.loadPdfProcessor(function ()
                                                                           {
                                                                               p.processing.init($this.path);
                                                                           });
                                                                       }
                                                                       else
                                                                       {
                                                                           $this.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_UPLOAD_PHP")).appendTo($this.container);
                                                                       }
                                                                   }
                                                               });

                                            /*$this.checkFileExists($this.path + "/full.pdf",
                                                function (success)
                                                {
                                                    if (success)
                                                    {
                                                        p.net.request($this.path + "/upload.php",
                                                            {
                                                                method: "POST",
                                                                data: { cmd: "ping" },
                                                                finished: function (success, data)
                                                                {
                                                                    if (success && data == "pong")
                                                                    {
                                                                        $this.loadPdfProcessor(function ()
                                                                        {
                                                                            p.processing.init($this.path);
                                                                        });
                                                                    }
                                                                    else
                                                                    {
                                                                        $this.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_UPLOAD_PHP")).appendTo($this.container);
                                                                    }
                                                                }
                                                            });
                                                    }
                                                    else
                                                    {
                                                        $this.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_NO_FILES")).appendTo($this.container);
                                                    }
                                                });*/
                                        }
                                    });
                            });
                        }
                    },

                    setProgress: function (e)
                    {
                        var status = p.e("div.status .text");
                        if (e < 0)
                        {
                            status.setHtml(p.locale.getString("LOADING"));
                        }
                        else if (e >= 0 && e < 100)
                        {
                            status.setHtml(e.toFixed(0) + "%");
                        }
                        else if (e == "error")
                        {
                            p.e(".error-overlay").removeClass("hidden");
                            setTimeout(function ()
                            {
                                p.e(".status").addClass("gone");
                            }, 1000);
                        }
                        else
                        {
                            p.e(".finished-overlay").removeClass("hidden");
                            setTimeout(function ()
                            {
                                p.e(".status").addClass("gone");
                            }, 1000);
                        }
                    },

                    prepareControls: function ()
                    {
                        // Make Controls
                        var ctrl_initializers =
                            {
                                "fullscreen": {
                                    selector: ".ctrl.btn.fullscreen",
                                    options: { "class": "ctrl btn fullscreen" },
                                    children:
                                        [
                                            { selector: ".icon.on", options: { "class": "icon on", html: "fullscreen_exit" } },
                                            { selector: ".icon.off", options: { "class": "icon off", html: "fullscreen" } }
                                        ]
                                },
                                "overview": {
                                    selector: ".ctrl.btn.overview",
                                    options: { "class": "ctrl btn overview" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "view_module" } }
                                        ]
                                },
                                "invert": {
                                    selector: ".ctrl.btn.invert",
                                    options: { "class": "ctrl btn invert" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "invert_colors" } }
                                        ]
                                },
                                "zoom-in": {
                                    selector: ".ctrl.btn.zoom-in",
                                    options: { "class": "ctrl btn zoom-in" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "zoom_in" } }
                                        ]
                                },
                                "zoom-out": {
                                    selector: ".ctrl.btn.zoom-out",
                                    options: { "class": "ctrl btn zoom-out" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "zoom_out" } }
                                        ]
                                },
                                "go-back": {
                                    selector: ".ctrl.btn.go-back",
                                    options: { "class": "ctrl btn go-back" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "keyboard_arrow_left" } }
                                        ]
                                },
                                "go-fwd": {
                                    selector: ".ctrl.btn.go-fwd",
                                    options: { "class": "ctrl btn go-fwd" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "keyboard_arrow_right" } }
                                        ]
                                },
                                "download": {
                                    construct: "<a>",
                                    selector: ".ctrl.btn.download",
                                    options: { "class": "ctrl btn download", href: p.pager.getPDFPath(), "target": "_blank" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "file_download" } }
                                        ]
                                },
                                "goto": {
                                    selector: ".ctrl.btn.goto",
                                    options: { "class": "ctrl btn goto" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "input" } }
                                        ]
                                }


                                /// SLIDESHOW
                                ,
                                "ss-back": {
                                    selector: ".ctrl.btn.ss-back",
                                    options: { "class": "ctrl btn ss-back" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "skip_previous" } }
                                        ]
                                },
                                "ss-play": {
                                    selector: ".ctrl.btn.ss-play",
                                    options: { "class": "ctrl btn ss-play" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "play_arrow" } }
                                        ]
                                },
                                "ss-pause": {
                                    selector: ".ctrl.btn.ss-pause",
                                    options: { "class": "ctrl btn ss-pause" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "pause" } }
                                        ]
                                },
                                "ss-fwd": {
                                    selector: ".ctrl.btn.ss-fwd",
                                    options: { "class": "ctrl btn ss-fwd" },
                                    children:
                                        [
                                            { selector: ".icon", options: { "class": "icon", html: "skip_next" } }
                                        ]
                                }
                            };

                        var containers =
                            {
                                "topleft-hor": p.e(".controls .topleft .horizontal"),
                                "topright-hor": p.e(".controls .topright .horizontal"),
                                "bottomleft-hor": p.e(".controls .bottomleft .horizontal"),
                                "bottomright-hor": p.e(".controls .bottomright .horizontal"),
                                "topleft-ver": p.e(".controls .topleft .vertical"),
                                "topright-ver": p.e(".controls .topright .vertical"),
                                "bottomleft-ver": p.e(".controls .bottomleft .vertical"),
                                "bottomright-ver": p.e(".controls .bottomright .vertical"),

                                "top": p.e(".controls .top"),
                                "left": p.e(".controls .left"),
                                "right": p.e(".controls .right"),
                                "bottom": p.e(".controls .bottom")
                            };

                        var tabindex = 1;

                        for (var ctrl in ctrl_initializers)
                        {
                            var target = containers[this.control_assignments[ctrl]] || containers["topleft-hor"];
                            this._prepareElement(ctrl_initializers[ctrl], target).setAttr("tabindex", tabindex++);
                        }

                        // FULLLSCREEN BUTTON
                        if (this.settings.show_fullscreen)
                        {
                            p.e(".ctrl.btn.fullscreen").on("click", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                if (p.is.keyboard_event(e))
                                {
                                    if (e.keyCode != 13 && e.keyCode != 32)
                                    {
                                        return;
                                    }
                                }

                                if (p.fullscreen.isFullscreen)
                                {

                                    p.fullscreen.exit();
                                }
                                else
                                {

                                    p.fullscreen.enter(p.reader.container[0]);
                                }
                            });

                            if (p.fullscreen.isFullscreen)
                            {
                                p.e(".ctrl.btn.fullscreen").addClass("on").removeClass("off");
                            }
                            else
                            {
                                p.e(".ctrl.btn.fullscreen").addClass("off").removeClass("on");
                            }

                            var readerFullscreenChange = function (type, element)
                            {
                                //console.log(type, element);
                                if (p.e(element).getAttr("id") == "reader-container")
                                {
                                    if (type == "exit")
                                    {
                                        p.e(".ctrl.btn:not(.fullscreen)").removeClass("immersive");
                                        p.reader.container.removeClass("fullscreen");
                                        p.pager.adjust({ reload: true });
                                        p.e(".ctrl.btn.fullscreen").addClass("off").removeClass("on");
                                    }
                                    else
                                    {
                                        if (p.reader.settings.hide_in_fullscreen)
                                            p.e(".ctrl.btn:not(.fullscreen)").addClass("immersive");
                                        p.reader.container.addClass("fullscreen");
                                        p.pager.adjust({ reload: true });
                                        p.e(".ctrl.btn.fullscreen").addClass("on").removeClass("off");
                                    }

                                    p.pager.calculateAutozoom();
                                }
                            };

                            p.subscribe("fullscreen", readerFullscreenChange);
                        }
                        else
                        {
                            p.e(".ctrl.btn.fullscreen").addClass("gone");
                        }

                        // OVERVIEW
                        if (this.settings.show_overview)
                        {
                            p.e(".ctrl.btn.overview").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.overview.toggle();
                            });
                        }
                        else
                        {
                            p.e(".ctrl.btn.overview").addClass("gone");
                        }

                        // INVERT

                        if (this.settings.show_invert && !p.browser.isMSIE)
                        {
                            p.e(".ctrl.btn.invert").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.toggleInvert();
                            });
                        }
                        else
                        {
                            p.e(".ctrl.btn.invert").addClass("gone");
                        }

                        // ZOOM

                        if (this.settings.show_zoom)
                        {
                            p.e(".ctrl.btn.zoom-in").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.pager.setZoom(p.pager.current_zoom + p.reader.settings.zoom_button_step);
                                p.pager.adjust({ reload: true });
                            });
                            p.e(".ctrl.btn.zoom-out").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.pager.setZoom(p.pager.current_zoom - p.reader.settings.zoom_button_step);
                                p.pager.adjust({ reload: true });
                            });
                        }
                        else
                        {
                            p.e([".ctrl.btn.zoom-in", ".ctrl.btn.zoom-out"]).addClass("gone");
                        }

                        if (this.settings.enable_arrows)
                        {
                            //var tapLock = false;
                            p.e(".ctrl.btn.go-fwd").on("click tap", function (e)
                            {
                                //if (!tapLock)
                                //{
                                //    tapLock = true;

                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                //p.reader.dbg("fwd-tap");

                                if (p.pager.current_animator == null)
                                    p.pager.goForward();
                                else
                                    p.pager.current_animator.doFullAnimationNext();

                                //    setTimeout(function () { tapLock = false; }, 50);
                                //}
                            });
                            p.e(".ctrl.btn.go-back").on("click tap", function (e)
                            {
                                //if (!tapLock)
                                //{
                                //    tapLock = true;

                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                //p.reader.dbg("back-tap");

                                if (p.pager.current_animator == null)
                                    p.pager.goBack();
                                else
                                    p.pager.current_animator.doFullAnimationPrev();

                                //    setTimeout(function () { tapLock = false; }, 50);
                                //}
                            });
                        }
                        else
                        {
                            p.e([".ctrl.btn.go-fwd", ".ctrl.btn.go-back"]).addClass("gone");
                        }

                        if (this.settings.show_download)
                        {
                            p.e(".ctrl.btn.download").on("click tap", function (e)
                            {
                                //if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                //window.location.assign(p.pager.getPDFPath());
                            });
                        }
                        else
                        {
                            p.e(".ctrl.btn.download").addClass("gone");
                        }

                        if (this.settings.show_go_to_page)
                        {
                            p.e(".ctrl.btn.goto").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                            });
                        }
                        else
                        {
                            p.e(".ctrl.btn.goto").addClass("gone");
                        }

                        if (this.settings.slideshow_mode && this.settings.slideshow_controls)
                        {
                            p.e(".ctrl.btn.ss-back").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.slideshow.prev_manual();
                            });
                            p.e(".ctrl.btn.ss-fwd").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.slideshow.next_manual();
                            });


                            p.e(".ctrl.btn.ss-pause").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.slideshow.pause();
                            });
                            p.e(".ctrl.btn.ss-play").on("click tap", function (e)
                            {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();

                                p.reader.slideshow.play();
                            });

                            p.e(".ctrl.btn.ss-play").addClass("gone");
                        }
                        else
                        {
                            p.e([".ctrl.btn.ss-back", ".ctrl.btn.ss-pause", ".ctrl.btn.ss-play", ".ctrl.btn.ss-fwd"]).addClass("gone");
                        }
                    },

                    slideshow:
                        {
                            timeout: null,
                            play_timeout: function ()
                            {
                                p.pager.goForward(function ()
                                {
                                    p.reader.slideshow.timeout = setTimeout(p.reader.slideshow.play_timeout, p.reader.settings.slideshow_timing * 1000);
                                    if (p.pager.current_page == p.pager.page_count)
                                        p.pager.current_page = 0;
                                });
                            },
                            play: function ()
                            {
                                p.e(".ctrl.btn.ss-play").addClass("gone");
                                p.e(".ctrl.btn.ss-pause").removeClass("gone");
                                p.reader.slideshow.timeout = setTimeout(p.reader.slideshow.play_timeout, p.reader.settings.slideshow_timing * 1000);
                            },
                            pause: function ()
                            {
                                p.e(".ctrl.btn.ss-pause").addClass("gone");
                                p.e(".ctrl.btn.ss-play").removeClass("gone");
                                clearTimeout(p.reader.slideshow.timeout);
                            },
                            next_manual: function ()
                            {
                                p.reader.slideshow.pause();
                                p.pager.goForward();
                            },
                            prev_manual: function ()
                            {
                                p.reader.slideshow.pause();
                                p.pager.goBack();
                            }
                        },

                    overview:
                        {
                            isInited: false,
                            isFirstOpen: true,
                            isOpen: false,
                            container: null,
                            thumbs: [],
                            delta: 0,
                            interval: null,

                            ensureInit: function ()
                            {
                                if (!this.isInited)
                                {
                                    var $this = this,
                                    requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                                    cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                                    this.container = p.e("#reader-container .overviews");
                                    this.container.addClass(p.reader.settings.overview_direction + (p.reader.settings.overview_overlay ? " float" : " solid"));
                                    this.container.addClass("hidden");

                                    switch (p.reader.settings.overview_direction)
                                    {
                                        case "left":
                                        case "right":
                                            this.container.setAttr("style", "width: {0}px".format(p.reader.settings.overview_size));
                                            break;
                                        case "top":
                                        case "bottom":
                                            this.container.setAttr("style", "height: {0}px".format(p.reader.settings.overview_size));
                                            break;
                                    }

                                    this.container.on("wheel", function (e)
                                    {
                                        if (e && e.preventDefault) e.preventDefault();
                                        if (e && e.stopPropagation) e.stopPropagation();

                                        switch (p.reader.settings.overview_direction)
                                        {
                                            case "left":
                                            case "right":
                                                $this.container[0].scrollTop += e.deltaY;
                                                break;
                                            case "top":
                                            case "bottom":
                                                $this.container[0].scrollLeft += e.deltaY;
                                                break;
                                        }
                                    });

                                    var isScrolling = false;
                                    var lastPos = null;
                                    var currentPos = null;
                                    var momentumStep = 1;

                                    var fncGetPos = function (event)
                                    {
                                        if (event.type.startsWith("touch"))
                                        {
                                            if (event.touches.length == 1)
                                            {
                                                return { x: event.touches[0].pageX, y: event.touches[0].pageY };
                                            }
                                            else if (event.touches.length == 2)
                                            {
                                                var a = { x: event.touches[0].pageX, y: event.touches[0].pageY },
                                                    b = { x: event.touches[1].pageX, y: event.touches[1].pageY },
                                                    midpoint = p.math.Midpoint2D(a, b);

                                                return { x: midpoint.x, y: midpoint.y, dist: p.math.Dist2D(a, b) };
                                            }
                                        }
                                        else
                                        {
                                            return { x: event.pageX, y: event.pageY };
                                        }
                                    };

                                    this.container.on("touchstart mousedown", function (e)
                                    {
                                        if (e && e.preventDefault) e.preventDefault();
                                        if (e && e.stopPropagation) e.stopPropagation();

                                        p.reader.overview.delta = 0;
                                        isScrolling = true;
                                        lastPos = fncGetPos(e);
                                        clearInterval(p.reader.overview.interval);
                                        clearTimeout(p.reader.overview.scrollTimeout);
                                    });
                                    this.container.on("touchmove mousemove", function (e)
                                    {
                                        if (e && e.preventDefault) e.preventDefault();
                                        if (e && e.stopPropagation) e.stopPropagation();

                                        //clearInterval(p.reader.overview.interval);
                                        //clearTimeout(p.reader.overview.scrollTimeout);
                                        if (isScrolling)
                                        {
                                            currentPos = fncGetPos(e);

                                            switch (p.reader.settings.overview_direction)
                                            {
                                                case "left":
                                                case "right":
                                                    p.reader.overview.delta = lastPos.y - currentPos.y;
                                                    $this.container[0].scrollTop += p.reader.overview.delta;
                                                    break;

                                                case "top":
                                                case "bottom":
                                                    p.reader.overview.delta = lastPos.x - currentPos.x;
                                                    $this.container[0].scrollLeft += p.reader.overview.delta;
                                                    break;
                                            }

                                            //console.log(delta);

                                            //console.log(lastPos, currentPos);
                                            lastPos = currentPos;
                                            //console.log(lastPos, currentPos);
                                        }
                                    });
                                    this.container.on("touchend mouseup mouseleave", function (e)
                                    {
                                        if (e && e.preventDefault) e.preventDefault();
                                        if (e && e.stopPropagation) e.stopPropagation();
                                        //console.log("end");

                                        isScrolling = false;
                                        if (Math.abs(p.reader.overview.delta) >= 10)
                                        {
                                            momentumStep = Math.abs(p.reader.overview.delta) / (p.pager.is_mobile ? 30 : 60);

                                            var animationCallback = function ()
                                            {
                                                if (Math.abs(p.reader.overview.delta) > 1)
                                                {
                                                    switch (p.reader.settings.overview_direction)
                                                    {
                                                        case "left":
                                                        case "right":
                                                            $this.container[0].scrollTop += p.reader.overview.delta;
                                                            break;

                                                        case "top":
                                                        case "bottom":
                                                            $this.container[0].scrollLeft += p.reader.overview.delta;
                                                            break;
                                                    }

                                                    if (p.reader.overview.delta > 0)
                                                        p.reader.overview.delta -= momentumStep;
                                                    else
                                                        p.reader.overview.delta += momentumStep;

                                                    //console.log(delta); 
                                                    //delta = delta / 4;
                                                    p.reader.overview.interval = requestFrame(animationCallback);
                                                }
                                                else
                                                {
                                                    //clearInterval(p.reader.overview.interval);
                                                    cancelFrame(p.reader.overview.interval);
                                                }
                                            };

                                            p.reader.overview.interval = requestFrame(animationCallback);

                                            /*clearInterval(p.reader.overview.interval);
                                            clearTimeout(p.reader.overview.scrollTimeout);
                                            p.reader.overview.interval = setInterval(function ()
                                            {
                                                if (Math.abs(p.reader.overview.delta) > 1)
                                                {
                                                    switch (p.reader.settings.overview_direction)
                                                    {
                                                        case "left":
                                                        case "right":
                                                            $this.container[0].scrollTop += p.reader.overview.delta;
                                                            break;

                                                        case "top":
                                                        case "bottom":
                                                            $this.container[0].scrollLeft += p.reader.overview.delta;
                                                            break;
                                                    }

                                                    if (p.reader.overview.delta > 0)
                                                        p.reader.overview.delta -= momentumStep;
                                                    else
                                                        p.reader.overview.delta += momentumStep;

                                                    //console.log(delta); 
                                                    //delta = delta / 4;
                                                }
                                                else
                                                {
                                                    clearInterval(p.reader.overview.interval);
                                                }
                                            }, 1000 / (p.pager.is_mobile ? 30 : 60));
                                            */
                                        }
                                    });
                                }
                            },

                            open: function ()
                            {
                                this.ensureInit();

                                if (this.isFirstOpen)
                                {
                                    this.isFirstOpen = false;
                                    var pageSize = p.pager.getPageSize(1, true);
                                    var overviewMargin = 8;
                                    var scaleFactor;
                                    switch (p.reader.settings.overview_direction)
                                    {
                                        case "left":
                                        case "right":
                                            scaleFactor = (p.reader.settings.overview_size - overviewMargin * 2) / pageSize.width;
                                            break;
                                        case "top":
                                        case "bottom":
                                            scaleFactor = (p.reader.settings.overview_size - overviewMargin * 2) / pageSize.height;
                                            break;
                                    }
                                    var thumbSize = { width: pageSize.width * scaleFactor, height: pageSize.height * scaleFactor };

                                    var thumbFnc = function ()
                                    {
                                        if (Math.abs(p.reader.overview.delta) < 10)
                                        {
                                            p.pager.current_page = parseInt(p.e(this).getAttr("data-page"));
                                            p.pager.goToPage(p.pager.current_page);
                                        }
                                    };

                                    for (var i = 0; i < p.pager.page_count; i++)
                                    {
                                        var thumb = p.e("<div>", { "class": "thumb", "data-page": i + 1 });
                                        var loader = p.reader.stageLoader();
                                        loader.load([p.pager.getThumbPath(i + 1)]);

                                        loader.appendTo(thumb);

                                        thumb.setAttr("style", "width: {0}px; height: {1}px;".format(thumbSize.width, thumbSize.height));
                                        thumb.appendTo(this.container);

                                        var waitingForClick = false;

                                        var thumbOnDown = function ()
                                        {
                                            waitingForClick = true;
                                        };
                                        var thumbOnUp = function ()
                                        {
                                            if (waitingForClick)
                                            {
                                                p.pager.current_page = parseInt(p.e(this).getAttr("data-page"));
                                                p.pager.goToPage(p.pager.current_page);
                                                waitingForClick = false;
                                            }
                                        };
                                        var thumbOnCancel = function ()
                                        {
                                            waitingForClick = false;
                                        };

                                        //thumb.on("click tap", thumbFnc);
                                        thumb.on("mousedown touchstart", thumbOnDown);
                                        thumb.on("mouseup touchend", thumbOnUp);
                                        thumb.on("mousemove mousecancel touchmove touchcancel", thumbOnCancel);
                                    }
                                }

                                this.container.removeClass("hidden");
                                p.e("#reader-container .controls").setAttr("style", "{0}: {1}px;".format(p.reader.settings.overview_direction, p.reader.settings.overview_size));
                                if (!p.reader.settings.overview_overlay)
                                    p.pager.content_container.setAttr("style", "{0}: {1}px;".format(p.reader.settings.overview_direction, p.reader.settings.overview_size));

                                this.scrollToCurrentPage();

                                this.isOpen = true;
                            },
                            scrollTimeout: null,
                            scrollToCurrentPage: function ()
                            {
                                var currentThumb = p.e(".thumb[data-page='{0}']".format(p.pager.current_page_firstvalid)),
                                    requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                                    cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                                if (currentThumb && currentThumb.length > 0)
                                {
                                    p.e(".thumb").removeClass("active");

                                    if (p.pager.current_mode == p.pager.constant.SINGLE || p.pager.current_mode == p.pager.constant.SINGLE_REVERSE)
                                        currentThumb.addClass("active");
                                    else
                                        p.e(".thumb[data-page='{0}'], .thumb[data-page='{1}']".format(p.pager.current_page_left, p.pager.current_page_right)).addClass("active");

                                    if (p.reader.settings.overview_direction == "left" || p.reader.settings.overview_direction == "right")
                                        var target = currentThumb[0].offsetTop - ((currentThumb[0].offsetHeight + this.container[0].offsetHeight) / 2) + currentThumb[0].offsetHeight;
                                    else
                                        var target = currentThumb[0].offsetLeft - ((currentThumb[0].offsetWidth + this.container[0].offsetWidth) / 2) + currentThumb[0].offsetWidth;

                                    if (p.pager.current_mode == p.pager.constant.DOUBLE || p.pager.current_mode == p.pager.constant.DOUBLE_REVERSE)
                                        target += ((p.reader.settings.overview_direction == "left" || p.reader.settings.overview_direction == "right") ? currentThumb[0].offsetHeight / 2 : currentThumb[0].offsetWidth / 2) + 16;

                                    var now = 0,
                                        max = 60,
                                        step = Math.abs(this.container[0].scrollTop - target) / max,
                                        $this = this,
                                        dist = target - this.container[0].scrollTop,
                                        start = this.container[0].scrollTop;


                                    if (p.reader.settings.overview_direction == "top" || p.reader.settings.overview_direction == "bottom")
                                    {
                                        dist = target - this.container[0].scrollLeft;
                                        start = this.container[0].scrollLeft;
                                    }

                                    var easeInOutQuad = function (tCurrent, start, change, duration)
                                    {
                                        tCurrent /= duration / 2;
                                        if (tCurrent < 1) return change / 2 * tCurrent * tCurrent + start;
                                        tCurrent--;
                                        return -change / 2 * (tCurrent * (tCurrent - 2) - 1) + start;
                                    };

                                    //console.log(dist, start, this.container[0].scrollLeft);

                                    var stepFnc = function ()
                                    {
                                        if (p.reader.settings.overview_direction == "left" || p.reader.settings.overview_direction == "right")
                                        {
                                            $this.container[0].scrollTop = easeInOutQuad(now, start, dist, max);
                                        }
                                        else
                                        {
                                            $this.container[0].scrollLeft = easeInOutQuad(now, start, dist, max);
                                        }

                                        now++;
                                        if (now < max)
                                            $this.scrollTimeout = requestFrame(stepFnc);
                                        else
                                            cancelFrame($this.scrollTimeout);
                                    };

                                    cancelFrame(this.scrollTimeout);
                                    this.scrollTimeout = requestFrame(stepFnc);
                                }
                            },
                            close: function ()
                            {
                                this.ensureInit();

                                this.container.addClass("hidden");
                                p.pager.content_container.setAttr("style", "");
                                p.e("#reader-container .controls").setAttr("style", "");

                                this.isOpen = false;
                            },
                            toggle: function ()
                            {
                                if (this.isOpen)
                                    this.close();
                                else
                                    this.open();
                            }
                        },

                    prepareData: function ()
                    {
                        p.net.request(this.path + "/data.json", {
                            finished: function (success, data)
                            {
                                if (success)
                                {
                                    p.pager.pages = p.jsonParse(data);
                                    //p.e(".finished-overlay").removeClass("hidden");
                                    p.pager.init();
                                }
                            }
                        });
                    },
                    prepareCover: function ()
                    {
                        var coverLoader = this.stageLoader();
                        coverLoader.addClass("cover-loader");
                        coverLoader.appendTo(".main-loader");
                        coverLoader.load([
                                this.path + "/cover_small.jpg",
                                this.path + "/cover_medium.jpg",
                                this.path + "/cover_big.jpg",
                        ]);
                    },
                    prepareElements: function ()
                    {
                        for (var key in this.elements)
                        {
                            this._prepareElement(this.elements[key], this.container);
                        }
                    },
                    _prepareElement: function (e, parent)
                    {
                        var ele, key, $this = this;
                        ele = parent.find(e.selector);
                        if (ele.length == 0)
                        {
                            ele = p.e(e.construct || "<div>", e.options);
                            ele.appendTo(parent);
                        }

                        if (e["children"] !== void 0)
                        {
                            for (key in e.children)
                                this._prepareElement(e.children[key], ele);
                        }

                        return ele;
                    },


                    make_slider: function (options, fullscreenCheckId)
                    {
                        var slider = p.e("<div>", { "class": "slider", "value": 50 });
                        var track = p.e("<div>", { "class": "track" }).appendTo(slider);
                        var fill = p.e("<div>", { "class": "fill" }).appendTo(track);
                        var thumb = p.e("<div>", { "class": "thumb" }).appendTo(slider);
                        var buffer = p.e("<div>", { "class": "buffer" });

                        var callback = null;
                        var displayCallback = null;
                        var vertical = false;

                        var fncs =
                            {
                                slider:
                                    {
                                        max: options.max || 100,
                                        min: options.min || 0,
                                        value: options.value || 50,
                                        sigfigs: options.sigfigs != undefined ? options.sigfigs : -1,
                                        dragging: false,
                                        update: function (nocallback, fromUser)
                                        {
                                            var $this = fncs.slider;
                                            var percent = p.math.Percentage.XofY($this.value, $this.max);
                                            if (vertical)
                                            {
                                                fill.setStyle("height", percent + "%");
                                                thumb.setStyle("bottom", percent + "%");
                                            }
                                            else
                                            {
                                                fill.setStyle("width", percent + "%");
                                                thumb.setStyle("left", percent + "%");
                                            }

                                            var displayValue = $this.value + 0;
                                            if (displayCallback && p.is.function(displayCallback))
                                                displayValue = displayCallback(displayValue);

                                            thumb.setAttr("value", $this.value);

                                            slider.setAttr("value", $this.value);
                                            slider.setAttr("max", $this.max);
                                            slider.setAttr("min", $this.min);

                                            if (!nocallback && callback && p.is.function(callback))
                                                callback($this.value, !!fromUser);
                                        },
                                        set: function (val)
                                        {
                                            var $this = fncs.slider;
                                            $this.value = val;
                                            $this.update;
                                        },
                                        setBuffer: function (perc)
                                        {
                                            buffer.setStyle("width", (100 - perc) + "%");
                                        },
                                        onStart: function ()
                                        {
                                            var $this = fncs.slider;
                                            $this.dragging = true;
                                            thumb.addClass("pressed");
                                        },
                                        onEnd: function ()
                                        {
                                            var $this = fncs.slider;
                                            $this.dragging = false;
                                            thumb.removeClass("pressed");
                                        },
                                        onDrag: function (e)
                                        {
                                            var $this = fncs.slider;
                                            if ($this.dragging)
                                            {
                                                var pos = $this.getPos(e);
                                                if (vertical)
                                                {
                                                    var height = slider.getHeight();
                                                    $this.value = ((p.math.Percentage.XofY(height - pos.y, height) / 100) * $this.max) + $this.min;
                                                }
                                                else
                                                {
                                                    var width = slider.getWidth();
                                                    $this.value = ((p.math.Percentage.XofY(pos.x, width) / 100) * $this.max) + $this.min;
                                                }

                                                if ($this.sigfigs != -1)
                                                {
                                                    $this.value = $this.value.toFixed($this.sigfigs);
                                                }

                                                $this.value = Math.min($this.max, Math.max($this.min, $this.value));
                                                $this.update(undefined, true);
                                            }
                                        },
                                        getPos: function (event)
                                        {
                                            //debugger;
                                            var offset = slider.getPageXY();
                                            if (event.type.startsWith("touch"))
                                            {
                                                if (event.touches.length == 1)
                                                {
                                                    return { x: event.touches[0].pageX - offset.x, y: event.touches[0].pageY - offset.y };
                                                }
                                            }
                                            else
                                            {
                                                return { x: event.pageX - offset.x, y: event.pageY - offset.y };
                                            }
                                        }
                                    }
                            };


                        if (options)
                        {
                            if (options.dark)
                                slider.addClass("dark");
                            if (options.discrete)
                                slider.addClass("discrete");
                            if (options.callback)
                                callback = options.callback;
                            if (options.displayCallback)
                                displayCallback = options.displayCallback;
                            if (options.vertical)
                                vertical = true;
                            if (options.buffering)
                                buffer.appendTo(track);
                            if (options.buffer)
                                fncs.setBuffer(options.buffer);
                        }

                        if (vertical)
                            slider.addClass("vertical");

                        slider.extend(fncs);
                        slider.slider.update();
                        thumb.on("mousedown touchstart", fncs.slider.onStart);
                        slider.on("mousemove touchmove", fncs.slider.onDrag);
                        p.e("body").on("mouseup touchend", fncs.slider.onEnd);
                        return slider;
                    },

                    stageLoaderId: 0,
                    stageLoader: function ()
                    {
                        var ele = p.e("<div>", { "class": "loader" }),
                            spinner = p.e("<div>", { "class": "spinner" }).appendTo(ele);
                        var thisId = ++p.reader.stageLoaderId;

                        var c =
                            {
                                currentStage: -1,
                                instanceId: 0,
                                sources: [],
                                elements: [],
                                spinner: null,
                                callback: null,
                                loadInstance: null,

                                load: function (sources, callback, suppressLoading)
                                {
                                    //CallTrace(arguments, thisId + "/SL" + (c.instanceId + 1));
                                    //console.log("stageLoader", "load");
                                    if (sources)
                                    {
                                        var allsame = true;

                                        for (var i = 0; i < sources.length; i++)
                                            if (sources[i] != c.sources[i])
                                            {
                                                allsame = false;
                                                //console.log("stageLoader", "new sources");
                                                //console.log("not all same");
                                                //if (c.callback && p.is.function(c.callback))
                                                //{
                                                //    c.callback();
                                                //    c.callback = null;
                                                //}
                                                break;
                                            }

                                        if (allsame)
                                        {
                                            //Trace(["done (same sources)"], "SL");
                                            //console.log("stageLoader", "same sources");
                                            //console.log("all same");
                                            if (callback && p.is.function(callback))
                                            {
                                                callback();
                                            }
                                            return;
                                        }

                                        c.sources = sources;
                                        c.spinner.removeClass("hidden");
                                        for (var i = 0; i < c.elements.length; i++)
                                            c.elements[i].remove();

                                        c.elements = [];

                                        for (var i = 0; i < c.sources.length; i++)
                                            c.elements[i] = p.e("<img>", { "class": suppressLoading && i == 0 ? "" : "loading" }).appendTo(ele);
                                    }
                                    c.callback = callback;
                                    //Trace([c.callback, "assigned", callback], thisId + "/SL" + (c.instanceId + 1));
                                    //c.onLoad();

                                    c.loadInstance = new c.loadEvent(++c.instanceId);
                                    c.currentStage = -1;
                                    c.loadInstance.onLoad();
                                },
                                loadEvent: function (iid)
                                {
                                    var $this = this;
                                    this.id = iid;
                                    this.onLoad = function ()
                                    {
                                        //Trace([$this.id, "onload"], thisId + "/SL");
                                        //Trace([$this.id, "onLoad"], "SL");
                                        if ($this.id != c.instanceId)
                                        {
                                            return;
                                        }
                                        if (c.currentStage >= 0)
                                        {
                                            c.spinner.addClass("hidden");
                                            if (c.elements[c.currentStage])
                                                c.elements[c.currentStage].removeClass("loading");
                                        }

                                        c.currentStage++;

                                        if (c.currentStage < c.sources.length)
                                        {
                                            c.elements[c.currentStage].on("load", $this.onLoad);
                                            c.elements[c.currentStage].setAttr("src", c.sources[c.currentStage]);
                                        }
                                        else
                                        {
                                            //Trace([$this.id, "done", c.callback], thisId + "/SL");
                                            if (c.callback && p.is.function(c.callback))
                                            {
                                                if ($this.id != c.instanceId)
                                                {
                                                    return;
                                                }
                                                c.callback();
                                                c.callback = null;
                                                //Trace([$this.id, "unassigned callback", c.callback], thisId + "/SL");
                                            }
                                        }
                                    };

                                }//,
                                //onLoad: function (iid)
                                //{
                                //    if (c.currentStage >= 0)
                                //    {
                                //        c.spinner.addClass("hidden");
                                //        if (c.elements[c.currentStage])
                                //            c.elements[c.currentStage].removeClass("loading");
                                //    }

                                //    c.currentStage++;

                                //    if (c.currentStage < c.sources.length)
                                //    {
                                //        c.elements[c.currentStage].setAttr("src", c.sources[c.currentStage]);
                                //        c.elements[c.currentStage].on("load", c.onLoad);
                                //    }
                                //    else
                                //    {
                                //        if (c.callback && p.is.function(c.callback))
                                //        {
                                //            c.callback();
                                //            c.callback = null;
                                //        }
                                //    }
                                //}
                            };
                        c.spinner = spinner;
                        exHelp.extend(ele, c);
                        return ele;
                    },

                    isInvertOn: false,
                    toggleInvert: function ()
                    {
                        if (this.isInvertOn)
                        {
                            //p.reader.container.setStyle("filter", "");
                            p.reader.container.removeClass("invert");
                            this.isInvertOn = false;
                        }
                        else
                        {
                            //if (p.browser.isMSIE)
                            //{
                            //    if (!this.svgLoaded)
                            //        this.loadSvgFilters();

                            //    p.reader.container.setStyle("filter", "url(#invert)");
                            //}
                            //else
                            //{
                            //p.reader.container.setStyle("filter", "invert(100%)");
                            //}
                            p.reader.container.addClass("invert");
                            this.isInvertOn = true;
                        }
                    },
                },

            swipe_animator:
                {
                    listen: true,
                    dragging: false,
                    dragged: null,
                    revealed: null,
                    moveStart: null,
                    size: null,
                    last: null,
                    target: null,
                    direction: "none",
                    animationTimeout: null,

                    init: function ()
                    {
                        p.e(document).on("mousedown touchstart", this.listenerStart);
                        p.e(document).on("mousemove touchmove", this.listenerMove);
                        p.e(document).on("mouseup touchend mouseleave touchleave", this.listenerEnd);
                    },

                    destruct: function ()
                    {
                        p.e(document).off("mousedown touchstart", this.listenerStart);
                        p.e(document).off("mousemove touchmove", this.listenerMove);
                        p.e(document).off("mouseup touchend mouseleave touchleave", this.listenerEnd);
                    },

                    intersects: function (pos, rect)
                    {
                        return (pos.x > rect.left && pos.x < rect.right && pos.y > rect.top && pos.y < rect.bottom);
                    },

                    posFromEvent: function (event)
                    {
                        if (event.type.startsWith("touch"))
                        {
                            if (event.touches.length == 1)
                            {
                                return { x: event.touches[0].pageX, y: event.touches[0].pageY };
                            }
                            else if (event.touches.length == 2)
                            {
                                var a = { x: event.touches[0].pageX, y: event.touches[0].pageY },
                                    b = { x: event.touches[1].pageX, y: event.touches[1].pageY },
                                    midpoint = p.math.Midpoint2D(a, b);

                                return { x: midpoint.x, y: midpoint.y, dist: p.math.Dist2D(a, b) };
                            }
                        }
                        else
                        {
                            return { x: event.pageX, y: event.pageY };
                        }
                    },

                    animateRight: function (dist)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant;

                        // Calculations
                        var fullHidden = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                        var fullVisible = 0;
                        var current = fullHidden - dist;

                        var proz = Math.min(1.0, dist / fullHidden);
                        var eased = p.math.easing.easeOutQuad(proz * 100, 0, 100, 100) / 100;

                        // Ensure style
                        clearTimeout($this.animationTimeout);
                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.revealed = p.e([p.pager.holders[CONST.CUR_LEFT], p.pager.holders[CONST.CUR_RIGHT]]),
                            $this.dragged = p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]);
                            p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_LEFT]]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_left + 2))
                                p.e(p.pager.holders[CONST.NEXT_LEFT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.NEXT_LEFT]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right + 2))
                                p.e(p.pager.holders[CONST.NEXT_RIGHT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.NEXT_RIGHT]).addClass("hidden");


                            if (p.pager.showPage(p.pager.current_page_left))
                                p.e(p.pager.holders[CONST.CUR_LEFT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.CUR_LEFT]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right))
                                p.e(p.pager.holders[CONST.CUR_RIGHT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.CUR_RIGHT]).addClass("hidden");
                        }
                        else
                        {
                            $this.revealed = p.pager.holders[CONST.CUR],
                            $this.dragged = p.pager.holders[CONST.NEXT];
                            p.pager.holders[CONST.PREV].addClass("hidden");
                            p.pager.holders[CONST.NEXT].removeClass("hidden");
                        }

                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");
                        p.overlays.setHidden(true);

                        // Animate
                        $this.dragged.setStyle("transform", "translate({0}px, 0)".format(fullHidden - (fullHidden * eased)));
                        $this.revealed.setStyle("transform", "translate(-{0}%, 0)".format(20 * eased));

                        $this.dragged.setStyle("opacity", 1 * p.math.easing.easeOutExpo(proz * 1000, 0, 1, 100));
                        $this.revealed.setStyle("opacity", 10 - p.math.easing.easeOutExpo(proz * 100, 0, 10, 100));
                    },
                    animateLeft: function (dist)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant;

                        // Calculations
                        var fullHidden = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                        var fullVisible = 0;
                        var current = fullHidden - dist;

                        var proz = Math.min(1.0, dist / fullHidden);
                        var eased = p.math.easing.easeOutQuad(proz * 100, 0, 100, 100) / 100;

                        // Ensure style
                        clearTimeout($this.animationTimeout);
                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.revealed = p.e([p.pager.holders[CONST.CUR_LEFT], p.pager.holders[CONST.CUR_RIGHT]]),
                            $this.dragged = p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_RIGHT]]);
                            p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]).addClass("hidden");
                        }
                        else
                        {
                            $this.dragged = p.pager.holders[CONST.PREV],
                            $this.revealed = p.pager.holders[CONST.CUR];
                            p.pager.holders[CONST.PREV].removeClass("hidden");
                            p.pager.holders[CONST.NEXT].addClass("hidden");
                        }

                        $this.dragged.addClass("animate").removeClass("hidden");
                        $this.revealed.addClass("wait").removeClass("hidden");
                        p.overlays.setHidden(true);

                        // Animate
                        $this.dragged.setStyle("transform", "translate(-{0}px, 0)".format(fullHidden - (fullHidden * eased)));
                        $this.revealed.setStyle("transform", "translate({0}%, 0)".format(20 * eased));

                        $this.dragged.setStyle("opacity", 1 * p.math.easing.easeOutExpo(proz * 1000, 0, 1, 100));
                        $this.revealed.setStyle("opacity", 10 - p.math.easing.easeOutExpo(proz * 100, 0, 10, 100));
                    },
                    animateRightTo: function (from, to, callback)
                    {
                        var $this = p.swipe_animator,
                            CONST = p.pager.constant,
                            t = 0,
                            max = 30,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                        var fnc = function ()
                        {
                            $this.animateRight(p.math.easing.easeInOutQuad(t++, from, to - from, max));
                            if (t < max)
                                $this.animationTimeout = requestFrame(fnc);
                            else if (p.is.function(callback))
                            {
                                callback();
                                cancelFrame($this.animationTimeout);
                            }
                        };

                        cancelFrame($this.animationTimeout);
                        $this.animationTimeout = requestFrame(fnc);
                    },
                    animateLeftTo: function (from, to, callback)
                    {
                        var $this = p.swipe_animator,
                            CONST = p.pager.constant,
                            t = 0,
                            max = 30,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                        var fnc = function ()
                        {
                            $this.animateLeft(p.math.easing.easeInOutQuad(t++, from, to - from, max));
                            if (t < max)
                                $this.animationTimeout = requestFrame(fnc);
                            else if (p.is.function(callback))
                            {
                                callback();
                                cancelFrame($this.animationTimeout);
                            }
                        };

                        cancelFrame($this.animationTimeout);
                        $this.animationTimeout = requestFrame(fnc);
                    },

                    listenerStart: function (e)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant;

                        if (!$this.lockAnimation && !p.pager.touchBlocked)
                        {
                            if (p.pager.current_animation == CONST.SWIPE)
                            {
                                if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                                {
                                    var rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                        rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect(),
                                        targetRectLeft = { top: rectLeft.top, left: rectLeft.left, right: rectLeft.left + rectLeft.width * 0.1, bottom: rectLeft.bottom },
                                        targetRectRight = { top: rectRight.top, left: rectRight.right - rectRight.width * 0.1, right: rectRight.right, bottom: rectRight.bottom },
                                        pos = $this.posFromEvent(e);

                                    if ($this.intersects(pos, targetRectRight))
                                    {
                                        // One time calculation
                                        $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                                        $this.target = p.pager.page_container[0].getBoundingClientRect();
                                        $this.target = {
                                            top: $this.target.top + p.pager.current_padding,
                                            left: $this.target.left + p.pager.current_padding,
                                            right: $this.target.right - p.pager.current_padding,
                                            bottom: $this.target.bottom - p.pager.current_padding
                                        };
                                        $this.moveStart = pos;

                                        p.pager.paging_handled_by_animator = true;

                                        $this.startDragRight();
                                    }
                                    else if ($this.intersects(pos, targetRectLeft))
                                    {
                                        // One time calculation
                                        $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                                        $this.target = p.pager.page_container[0].getBoundingClientRect();
                                        $this.target = {
                                            top: $this.target.top + p.pager.current_padding,
                                            left: $this.target.left + p.pager.current_padding,
                                            right: $this.target.right - p.pager.current_padding,
                                            bottom: $this.target.bottom - p.pager.current_padding
                                        };
                                        $this.moveStart = pos;

                                        p.pager.paging_handled_by_animator = true;

                                        $this.startDragLeft();
                                    }
                                }
                                else
                                {
                                    var rect = p.pager.holders[CONST.CUR][0].getBoundingClientRect(),
                                        targetRectLeft = { top: rect.top, left: rect.left, right: rect.left + rect.width * 0.1, bottom: rect.bottom },
                                        targetRectRight = { top: rect.top, left: rect.right - rect.width * 0.1, right: rect.right, bottom: rect.bottom },
                                        pos = $this.posFromEvent(e);

                                    // One time calculation
                                    $this.size = { width: rect.width, height: rect.height };
                                    $this.target = p.pager.page_container[0].getBoundingClientRect();
                                    $this.target = {
                                        top: $this.target.top + p.pager.current_padding,
                                        left: $this.target.left + p.pager.current_padding,
                                        right: $this.target.right - p.pager.current_padding,
                                        bottom: $this.target.bottom - p.pager.current_padding
                                    };
                                    $this.moveStart = pos;

                                    if ($this.intersects(pos, targetRectRight))
                                    {
                                        p.pager.paging_handled_by_animator = true;
                                        $this.startDragRight();
                                    }
                                    else if ($this.intersects(pos, targetRectLeft))
                                    {
                                        p.pager.paging_handled_by_animator = true;
                                        $this.startDragLeft();
                                    }
                                }
                            }
                        }
                    },
                    listenerMove: function (e)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant;
                        if (!$this.lockAnimation && $this.dragging)
                        {
                            var pos = $this.posFromEvent(e);
                            $this.last = pos;
                            if ($this.direction == "right")
                            {
                                var distX = Math.abs($this.target.right - pos.x);

                                $this.animateRight(distX);
                            }
                            else if ($this.direction == "left")
                            {
                                var distX = Math.abs($this.target.left - pos.x);

                                $this.animateLeft(distX);
                            }
                        }
                    },
                    listenerEnd: function (e)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant;

                        if (!$this.lockAnimation && $this.dragging)
                        {
                            p.reader.playPageSound();
                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");
                                    $this.dragged.setStyle("transform", "");
                                    $this.revealed.setStyle("transform", "");
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    $this.lockAnimation = false;
                                    p.overlays.setHidden(false);
                                };

                            if ($this.direction == "right")
                            {
                                var distX = pos != null ? Math.abs($this.target.right - pos.x) : 0;
                                var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                                var triggerDistance = finalDistance / 10;

                                if (distX < finalDistance)
                                {
                                    if (distX >= triggerDistance)
                                    {
                                        $this.animateRightTo(distX, finalDistance, function ()
                                        {
                                            p.pager.goForward(function ()
                                            {
                                                finish();
                                            });
                                        });
                                    }
                                    else
                                    {
                                        $this.animateRightTo(distX, 0, function ()
                                        {
                                            finish();
                                        });
                                    }
                                }
                                else
                                {
                                    p.pager.goForward(function ()
                                    {
                                        finish();
                                    });
                                }
                            }
                            else if ($this.direction == "left")
                            {
                                var distX = pos != null ? Math.abs($this.target.left - pos.x) : 0;
                                var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                                var triggerDistance = finalDistance / 8;

                                if (distX < finalDistance)
                                {
                                    if (distX >= triggerDistance)
                                    {
                                        $this.animateLeftTo(distX, finalDistance, function ()
                                        {
                                            p.pager.goBack(function ()
                                            {
                                                finish();
                                            });
                                        });
                                    }
                                    else
                                    {
                                        $this.animateLeftTo(distX, 0, function ()
                                        {
                                            finish();
                                        });
                                    }
                                }
                                else
                                {
                                    p.pager.goBack(function ()
                                    {
                                        finish();
                                    });
                                }
                            }
                        }

                        $this.dragging = false;
                    },


                    lockAnimation: false,

                    doFullAnimationNext: function (callback)
                    {
                        var $this = p.swipe_animator,
                            CONST = p.pager.constant;

                        if (!$this.lockAnimation && p.pager.can_go_forward)
                        {
                            $this.lockAnimation = true;

                            p.reader.playPageSound();

                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");
                                    $this.dragged.setStyle("transform", "");
                                    $this.revealed.setStyle("transform", "");

                                    if (callback && p.is.function(callback))
                                        callback();

                                    $this.lockAnimation = false;
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    p.overlays.setHidden(false);
                                },
                                rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect();

                            $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                            $this.target = p.pager.page_container[0].getBoundingClientRect();
                            $this.target = {
                                top: $this.target.top + p.pager.current_padding,
                                left: $this.target.left + p.pager.current_padding,
                                right: $this.target.right - p.pager.current_padding,
                                bottom: $this.target.bottom - p.pager.current_padding
                            };

                            var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;

                            $this.direction = "right";

                            $this.animateRightTo(0, finalDistance, function ()
                            {
                                p.pager.goForward(null, function ()
                                {
                                    finish();
                                });
                            });
                        }
                    },
                    doFullAnimationPrev: function (callback)
                    {
                        var $this = p.swipe_animator,
                            CONST = p.pager.constant;

                        if (!$this.lockAnimation && p.pager.can_go_back)
                        {
                            $this.lockAnimation = true;

                            p.reader.playPageSound();

                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");
                                    $this.dragged.setStyle("transform", "");
                                    $this.revealed.setStyle("transform", "");

                                    if (callback && p.is.function(callback))
                                        callback();

                                    $this.lockAnimation = false;
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    p.overlays.setHidden(false);
                                },
                                rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect();

                            $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                            $this.target = p.pager.page_container[0].getBoundingClientRect();
                            $this.target = {
                                top: $this.target.top + p.pager.current_padding,
                                left: $this.target.left + p.pager.current_padding,
                                right: $this.target.right - p.pager.current_padding,
                                bottom: $this.target.bottom - p.pager.current_padding
                            };

                            var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;

                            $this.direction = "left";

                            $this.animateLeftTo(0, finalDistance, function ()
                            {
                                p.pager.goBack(null, function ()
                                {
                                    finish();
                                });
                            });
                        }
                    },

                    startDragRight: function (e)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                        $this.dragging = true;
                        cancelFrame($this.animationTimeout);

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.revealed = p.e([p.pager.holders[CONST.CUR_LEFT], p.pager.holders[CONST.CUR_RIGHT]]),
                            $this.dragged = p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]);
                            p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_LEFT]]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_left + 2))
                                p.e(p.pager.holders[CONST.NEXT_LEFT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.NEXT_LEFT]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right + 2))
                                p.e(p.pager.holders[CONST.NEXT_RIGHT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.NEXT_RIGHT]).addClass("hidden");


                            if (p.pager.showPage(p.pager.current_page_left))
                                p.e(p.pager.holders[CONST.CUR_LEFT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.CUR_LEFT]).addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right))
                                p.e(p.pager.holders[CONST.CUR_RIGHT]).removeClass("hidden");
                            else
                                p.e(p.pager.holders[CONST.CUR_RIGHT]).addClass("hidden");
                        }
                        else
                        {
                            $this.revealed = p.pager.holders[CONST.CUR],
                            $this.dragged = p.pager.holders[CONST.NEXT];
                            p.pager.holders[CONST.PREV].addClass("hidden");
                        }

                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");

                        //$this.dragged.setStyle("opacity", "0");
                        $this.dragged.setStyle("transform", "translate(200%, 0)");
                        $this.revealed.setStyle("transform", "translate(0%, 0)");

                        $this.direction = "right";
                    },
                    startDragLeft: function (e)
                    {
                        var $this = p.swipe_animator, CONST = p.pager.constant,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                        $this.dragging = true;
                        cancelFrame($this.animationTimeout);

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.revealed = p.e([p.pager.holders[CONST.CUR_LEFT], p.pager.holders[CONST.CUR_RIGHT]]),
                            $this.dragged = p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_RIGHT]]);
                            p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]).addClass("hidden");
                        }
                        else
                        {
                            $this.dragged = p.pager.holders[CONST.PREV],
                            $this.revealed = p.pager.holders[CONST.CUR];
                            p.pager.holders[CONST.NEXT].addClass("hidden");
                        }

                        $this.dragged.addClass("animate").removeClass("hidden");
                        $this.revealed.addClass("wait").removeClass("hidden");

                        //$this.dragged.setStyle("opacity", "0");
                        $this.dragged.setStyle("transform", "translate(-200%, 0)");
                        $this.revealed.setStyle("transform", "translate(0%, 0)");

                        $this.direction = "left";
                    }

                },

            flip_animator:
                {
                    listen: true,
                    dragging: false,
                    dragged: null,
                    revealed: null,
                    hidden: null,
                    fullhidden: null,
                    moveStart: null,
                    size: null,
                    last: null,
                    target: null,
                    direction: "none",
                    animationTimeout: null,

                    init: function ()
                    {
                        p.e(document).on("mousedown touchstart", this.listenerStart);
                        p.e(document).on("mousemove touchmove", this.listenerMove);
                        p.e(document).on("mouseup touchend mouseleave touchleave", this.listenerEnd);
                    },

                    destruct: function ()
                    {
                        p.e(document).off("mousedown touchstart", this.listenerStart);
                        p.e(document).off("mousemove touchmove", this.listenerMove);
                        p.e(document).off("mouseup touchend mouseleave touchleave", this.listenerEnd);
                    },

                    intersects: function (pos, rect)
                    {
                        return (pos.x > rect.left && pos.x < rect.right && pos.y > rect.top && pos.y < rect.bottom);
                    },

                    posFromEvent: function (event)
                    {
                        if (event.type.startsWith("touch"))
                        {
                            if (event.touches.length == 1)
                            {
                                return { x: event.touches[0].pageX, y: event.touches[0].pageY };
                            }
                            else if (event.touches.length == 2)
                            {
                                var a = { x: event.touches[0].pageX, y: event.touches[0].pageY },
                                    b = { x: event.touches[1].pageX, y: event.touches[1].pageY },
                                    midpoint = p.math.Midpoint2D(a, b);

                                return { x: midpoint.x, y: midpoint.y, dist: p.math.Dist2D(a, b) };
                            }
                        }
                        else
                        {
                            return { x: event.pageX, y: event.pageY };
                        }
                    },

                    animateRight: function (dist)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant;
                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");
                        p.overlays.setHidden(true);

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            // Ensure style
                            if (p.pager.showPage(p.pager.current_page_left + 2))
                                $this.dragged.removeClass("hidden");
                            else
                                $this.dragged.addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right + 2))
                                $this.revealed.removeClass("hidden");
                            else
                                $this.revealed.addClass("hidden");

                            $this.fullhidden.addClass("hidden");

                            $this.dragged.setStyle("left", "auto");

                            $this.revealed.setStyle("left", "auto");
                            $this.revealed.setStyle("right", p.pager.current_padding + "px");
                            $this.revealed.find(".wrapper").setStyle("left", "auto");
                            $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.dragged.find(".wrapper").setStyle("right", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.hidden.find(".wrapper").setStyle("right", "auto");
                            $this.hidden.find(".wrapper").setStyle("width", $this.size.width + "px");

                            // Animate
                            $this.dragged.setStyle("right", Math.min((p.pager.current_padding + (dist / 2)), $this.size.width + p.pager.current_padding) + "px");
                            $this.dragged.setStyle("width", Math.min((dist / 2), $this.size.width) + "px");

                            $this.hidden.setStyle("width", Math.max(0, $this.size.width - dist) + "px");

                            $this.revealed.setStyle("width", Math.min((dist / 2), $this.size.width) + "px");
                        }
                        else
                        {
                            // Ensure style
                            if (p.pager.showPage(p.pager.current_page + 1))
                                $this.revealed.removeClass("hidden");

                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");

                            // Animate
                            $this.dragged.setStyle("right", Math.min((p.pager.current_padding + (dist)), $this.size.width + p.pager.current_padding) + "px");
                            $this.dragged.setStyle("width", Math.max(($this.size.width - dist), 0) + "px");
                        }

                    },
                    animateLeft: function (dist)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant;

                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");
                        p.overlays.setHidden(true);

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            // Ensure Style
                            if (p.pager.showPage(p.pager.current_page_left - 2))
                                $this.revealed.removeClass("hidden");
                            else
                                $this.revealed.addClass("hidden");

                            if (p.pager.showPage(p.pager.current_page_right - 2))
                                $this.dragged.removeClass("hidden");
                            else
                                $this.dragged.addClass("hidden");

                            $this.dragged.setStyle("right", "auto");
                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.revealed.find(".wrapper").setStyle("right", "auto");
                            $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.hidden.find(".wrapper").setStyle("left", "auto");
                            $this.hidden.find(".wrapper").setStyle("width", $this.size.width + "px");

                            $this.revealed.setStyle("right", "auto");
                            $this.revealed.setStyle("left", p.pager.current_padding + "px");

                            // Animate
                            $this.dragged.setStyle("left", Math.min((p.pager.current_padding + (dist / 2)), $this.size.width + p.pager.current_padding) + "px");
                            $this.dragged.setStyle("width", Math.min((dist / 2), $this.size.width) + "px");

                            $this.hidden.setStyle("width", Math.max(0, $this.size.width - dist) + "px");

                            $this.revealed.setStyle("width", Math.min((dist / 2), $this.size.width) + "px");
                        }
                        else
                        {
                            // Ensure Style
                            if (p.pager.showPage(p.pager.current_page - 1))
                                $this.revealed.removeClass("hidden");
                            else
                                $this.revealed.addClass("hidden");

                            $this.dragged.setStyle("right", p.pager.current_padding + "px");
                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.revealed.find(".wrapper").setStyle("left", "auto");
                            $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");

                            // Animate
                            $this.dragged.setStyle("left", Math.min(p.pager.current_padding + dist, $this.size.width + p.pager.current_padding) + "px");
                            $this.dragged.setStyle("width", Math.max(0, (($this.size.width) - dist)) + "px");
                            $this.revealed.setStyle("width", Math.min(dist, $this.size.width) + "px");
                        }
                    },
                    animateRightTo: function (from, to, callback)
                    {
                        var $this = p.flip_animator,
                            CONST = p.pager.constant,
                            t = 0,
                            max = 30,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                        var fnc = function ()
                        {
                            $this.animateRight(p.math.easing.easeInOutQuad(t++, from, to - from, max));
                            if (t < max)
                                $this.animationTimeout = requestFrame(fnc);
                            else if (p.is.function(callback))
                            {
                                callback();
                                cancelFrame($this.animationTimeout);
                            }
                        };

                        cancelFrame($this.animationTimeout);
                        $this.animationTimeout = requestFrame(fnc);
                    },
                    animateLeftTo: function (from, to, callback)
                    {
                        var $this = p.flip_animator,
                            CONST = p.pager.constant,
                            t = 0,
                            max = 30,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                        var fnc = function ()
                        {
                            $this.animateLeft(p.math.easing.easeInOutQuad(t++, from, to - from, max));
                            if (t < max)
                                $this.animationTimeout = requestFrame(fnc);
                                //$this.animationTimeout = setTimeout(fnc, 300 / max);
                            else if (p.is.function(callback))
                            {
                                callback();
                                cancelFrame($this.animationTimeout);
                            }
                        };

                        //clearTimeout($this.animationTimeout);
                        //fnc();
                        cancelFrame($this.animationTimeout);
                        $this.animationTimeout = requestFrame(fnc);
                    },

                    listenerStart: function (e)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant;
                        if (!$this.lockAnimation && !p.pager.touchBlocked)
                        {
                            if (p.pager.current_animation == CONST.FLIP)
                            {
                                if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                                {
                                    var rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                        rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect(),
                                        targetRectLeft = { top: rectLeft.top, left: rectLeft.left, right: rectLeft.left + rectLeft.width * 0.1, bottom: rectLeft.bottom },
                                        targetRectRight = { top: rectRight.top, left: rectRight.right - rectRight.width * 0.1, right: rectRight.right, bottom: rectRight.bottom },
                                        pos = $this.posFromEvent(e);

                                    if ($this.intersects(pos, targetRectRight) && p.pager.showPage(p.pager.current_page_left + 2))
                                    {
                                        // One time calculation
                                        $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                                        $this.target = p.pager.page_container[0].getBoundingClientRect();
                                        $this.target = {
                                            top: $this.target.top + p.pager.current_padding,
                                            left: $this.target.left + p.pager.current_padding,
                                            right: $this.target.right - p.pager.current_padding,
                                            bottom: $this.target.bottom - p.pager.current_padding
                                        };
                                        $this.moveStart = pos;

                                        p.pager.paging_handled_by_animator = true;

                                        $this.startDragRight();
                                    }
                                    else if ($this.intersects(pos, targetRectLeft) && p.pager.showPage(p.pager.current_page_right - 2))
                                    {
                                        // One time calculation
                                        $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                                        $this.target = p.pager.page_container[0].getBoundingClientRect();
                                        $this.target = {
                                            top: $this.target.top + p.pager.current_padding,
                                            left: $this.target.left + p.pager.current_padding,
                                            right: $this.target.right - p.pager.current_padding,
                                            bottom: $this.target.bottom - p.pager.current_padding
                                        };
                                        $this.moveStart = pos;

                                        p.pager.paging_handled_by_animator = true;

                                        $this.startDragLeft();
                                    }
                                }
                                else
                                {
                                    var rect = p.pager.holders[CONST.CUR][0].getBoundingClientRect(),
                                        targetRectLeft = { top: rect.top, left: rect.left, right: rect.left + rect.width * 0.1, bottom: rect.bottom },
                                        targetRectRight = { top: rect.top, left: rect.right - rect.width * 0.1, right: rect.right, bottom: rect.bottom },
                                        pos = $this.posFromEvent(e);

                                    // One time calculation
                                    $this.size = { width: rect.width, height: rect.height };
                                    $this.target = p.pager.page_container[0].getBoundingClientRect();
                                    $this.target = {
                                        top: $this.target.top + p.pager.current_padding,
                                        left: $this.target.left + p.pager.current_padding,
                                        right: $this.target.right - p.pager.current_padding,
                                        bottom: $this.target.bottom - p.pager.current_padding
                                    };
                                    $this.moveStart = pos;

                                    if ($this.intersects(pos, targetRectRight) && p.pager.showPage(p.pager.current_page + 1))
                                    {
                                        p.pager.paging_handled_by_animator = true;
                                        $this.startDragRight();
                                    }
                                    else if ($this.intersects(pos, targetRectLeft) && p.pager.showPage(p.pager.current_page - 1))
                                    {
                                        p.pager.paging_handled_by_animator = true;
                                        $this.startDragLeft();
                                    }
                                }
                            }
                        }
                    },
                    listenerMove: function (e)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant;
                        if (!$this.lockAnimation && $this.dragging)
                        {
                            var pos = $this.posFromEvent(e);
                            $this.last = pos;
                            if ($this.direction == "right")
                            {
                                var distX = Math.abs($this.target.right - pos.x);

                                $this.animateRight(distX);
                            }
                            else if ($this.direction == "left")
                            {
                                var distX = Math.abs($this.target.left - pos.x);

                                $this.animateLeft(distX);
                            }
                        }
                    },
                    listenerEnd: function (e)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant;

                        if (!$this.lockAnimation && $this.dragging)
                        {
                            p.reader.playPageSound();
                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");

                                    $this.dragged.find(".wrapper").setAttr("style", "");
                                    $this.revealed.find(".wrapper").setAttr("style", "");
                                    $this.hidden.find(".wrapper").setAttr("style", "");
                                    $this.dragged.find(".loader").setAttr("style", "");
                                    $this.revealed.find(".loader").setAttr("style", "");
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    $this.lockAnimation = false;
                                    p.overlays.setHidden(false);
                                };

                            if ($this.direction == "right")
                            {
                                var distX = pos != null ? Math.abs($this.target.right - pos.x) : 0;
                                var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                                var triggerDistance = finalDistance / 10;

                                if (distX < finalDistance)
                                {
                                    if (distX >= triggerDistance)
                                    {
                                        $this.animateRightTo(distX, finalDistance, function ()
                                        {
                                            p.pager.goForward(null, function ()
                                            {
                                                finish();
                                            });
                                        });
                                    }
                                    else
                                    {
                                        $this.animateRightTo(distX, 0, function ()
                                        {
                                            finish();
                                        });
                                    }
                                }
                                else
                                {
                                    p.pager.goForward(null, function ()
                                    {
                                        finish();
                                    });
                                }
                            }
                            else if ($this.direction == "left")
                            {
                                var distX = pos != null ? Math.abs($this.target.left - pos.x) : 0;
                                var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;
                                var triggerDistance = finalDistance / 10;

                                if (distX < finalDistance)
                                {
                                    if (distX >= triggerDistance)
                                    {
                                        $this.animateLeftTo(distX, finalDistance, function ()
                                        {
                                            p.pager.goBack(function ()
                                            {
                                                finish();
                                            });
                                        });
                                    }
                                    else
                                    {
                                        $this.animateLeftTo(distX, 0, function ()
                                        {
                                            finish();
                                        });
                                    }
                                }
                                else
                                {
                                    p.pager.goBack(function ()
                                    {
                                        finish();
                                    });
                                }
                            }
                        }

                        $this.dragging = false;
                    },

                    lockAnimation: false,

                    doFullAnimationNext: function (callback)
                    {
                        var $this = p.flip_animator,
                            CONST = p.pager.constant;

                        //p.reader.dbg("anim-try-next");

                        if (!$this.lockAnimation && p.pager.can_go_forward)
                        {
                            $this.lockAnimation = true;

                            //p.reader.dbg("anim-do-next");

                            p.reader.playPageSound();

                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");

                                    $this.dragged.find(".wrapper").setAttr("style", "");
                                    $this.revealed.find(".wrapper").setAttr("style", "");
                                    $this.hidden.find(".wrapper").setAttr("style", "");
                                    $this.dragged.find(".loader").setAttr("style", "");
                                    $this.revealed.find(".loader").setAttr("style", "");

                                    if (callback && p.is.function(callback))
                                        callback();

                                    $this.lockAnimation = false;
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    p.overlays.setHidden(false);
                                };

                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                var rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                    rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect();

                                $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                            }
                            else
                            {
                                var rect = p.pager.holders[CONST.CUR][0].getBoundingClientRect();
                                $this.size = { width: rect.width, height: rect.height };
                            }

                            $this.target = p.pager.page_container[0].getBoundingClientRect();
                            $this.target =
                                {
                                    top: $this.target.top + p.pager.current_padding,
                                    left: $this.target.left + p.pager.current_padding,
                                    right: $this.target.right - p.pager.current_padding,
                                    bottom: $this.target.bottom - p.pager.current_padding
                                };

                            var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;

                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                $this.dragged = p.pager.holders[CONST.NEXT_LEFT],
                                $this.revealed = p.pager.holders[CONST.NEXT_RIGHT];
                                $this.hidden = p.pager.holders[CONST.CUR_RIGHT];
                                $this.fullhidden = p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_RIGHT]]);

                                if (p.pager.showPage(p.pager.current_page_left + 2))
                                    $this.dragged.removeClass("hidden");
                                if (p.pager.showPage(p.pager.current_page_right + 2))
                                    $this.revealed.removeClass("hidden");

                                $this.fullhidden.addClass("hidden");
                            }
                            else
                            {
                                $this.dragged = p.pager.holders[CONST.CUR],
                                $this.revealed = p.pager.holders[CONST.NEXT];
                                $this.hidden = p.e();
                                $this.fullhidden = p.pager.holders[CONST.PREV];

                                if (p.pager.showPage(p.pager.current_page + 1))
                                    $this.revealed.removeClass("hidden");
                            }

                            $this.dragged.addClass("animate");
                            $this.revealed.addClass("wait");

                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                $this.dragged.setStyle("left", "auto");
                                $this.dragged.setStyle("right", p.pager.current_padding + "px");
                                $this.dragged.setStyle("width", "0px");

                                $this.revealed.setStyle("left", "auto");
                                $this.revealed.setStyle("right", p.pager.current_padding + "px");
                                $this.revealed.setStyle("width", "0px");
                                $this.revealed.find(".wrapper").setStyle("left", "auto");
                                $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                            }
                            else
                            {
                                $this.dragged.setStyle("right", p.pager.current_padding + "px");
                                $this.dragged.setStyle("width", $this.size.width);
                                $this.dragged.find(".wrapper").setStyle("left", "auto");
                                $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                            }

                            $this.direction = "right";

                            $this.animateRightTo(0, finalDistance, function ()
                            {
                                p.pager.goForward(null, function ()
                                {
                                    finish();
                                });
                            });
                        }
                    },
                    doFullAnimationPrev: function (callback)
                    {
                        var $this = p.flip_animator,
                            CONST = p.pager.constant;

                        if (!$this.lockAnimation && p.pager.can_go_back)
                        {
                            $this.lockAnimation = true;

                            p.reader.playPageSound();

                            var pos = $this.last,
                                finish = function ()
                                {
                                    $this.dragged.removeClass("animate");
                                    $this.revealed.removeClass("wait");

                                    $this.dragged.find(".wrapper").setAttr("style", "");
                                    $this.revealed.find(".wrapper").setAttr("style", "");
                                    $this.hidden.find(".wrapper").setAttr("style", "");
                                    $this.dragged.find(".loader").setAttr("style", "");
                                    $this.revealed.find(".loader").setAttr("style", "");

                                    if (callback && p.is.function(callback))
                                        callback();

                                    $this.lockAnimation = false;
                                    p.pager.paging_handled_by_animator = false;
                                    $this.last = null;
                                    p.overlays.setHidden(false);
                                };


                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                var rectLeft = p.pager.holders[CONST.CUR_LEFT][0].getBoundingClientRect(),
                                    rectRight = p.pager.holders[CONST.CUR_RIGHT][0].getBoundingClientRect();

                                $this.size = { width: rectLeft.width || rectRight.width, height: rectLeft.height || rectRight.height };
                            }
                            else
                            {
                                var rect = p.pager.holders[CONST.CUR][0].getBoundingClientRect();
                                $this.size = { width: rect.width, height: rect.height };
                            }

                            $this.target = p.pager.page_container[0].getBoundingClientRect();
                            $this.target = {
                                top: $this.target.top + p.pager.current_padding,
                                left: $this.target.left + p.pager.current_padding,
                                right: $this.target.right - p.pager.current_padding,
                                bottom: $this.target.bottom - p.pager.current_padding
                            };

                            var finalDistance = (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE) ? $this.size.width * 2 : $this.size.width;

                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                $this.dragged = p.pager.holders[CONST.PREV_RIGHT],
                                $this.revealed = p.pager.holders[CONST.PREV_LEFT];
                                $this.hidden = p.pager.holders[CONST.CUR_LEFT];
                                $this.fullhidden = p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]);

                                if (p.pager.showPage(p.pager.current_page_left - 2))
                                    $this.revealed.removeClass("hidden");
                                if (p.pager.showPage(p.pager.current_page_right - 2))
                                    $this.dragged.removeClass("hidden");

                                $this.fullhidden.addClass("hidden");
                            }
                            else
                            {
                                $this.dragged = p.pager.holders[CONST.CUR],
                                $this.revealed = p.pager.holders[CONST.PREV];
                                $this.hidden = p.e();
                                $this.fullhidden = p.pager.holders[CONST.NEXT];

                                if (p.pager.showPage(p.pager.current_page - 1))
                                    $this.revealed.removeClass("hidden");

                                $this.dragged.removeClass("hidden");
                            }

                            $this.dragged.addClass("animate");
                            $this.revealed.addClass("wait");

                            if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            {
                                $this.dragged.setStyle("right", "auto");
                                $this.dragged.setStyle("left", p.pager.current_padding + "px");
                                $this.dragged.setStyle("width", "0px");
                                $this.dragged.find(".wrapper").setStyle("left", "auto");
                                $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");

                                $this.revealed.setStyle("right", "auto");
                                $this.revealed.setStyle("left", p.pager.current_padding + "px");
                                $this.revealed.setStyle("width", "0px");
                            }
                            else
                            {
                                $this.dragged.setStyle("right", p.pager.current_padding + "px");
                                $this.dragged.find(".wrapper").setStyle("left", "auto");
                                $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                                $this.revealed.find(".wrapper").setStyle("left", "auto");
                                $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                            }

                            $this.direction = "left";

                            $this.animateLeftTo(0, finalDistance, function ()
                            {
                                p.pager.goBack(null, function ()
                                {
                                    finish();
                                });
                            });
                        }
                    },

                    startDragRight: function (e)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                        $this.dragging = true;
                        cancelFrame($this.animationTimeout);
                        //p.pager.renderStop();

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.dragged = p.pager.holders[CONST.NEXT_LEFT],
                            $this.revealed = p.pager.holders[CONST.NEXT_RIGHT];
                            $this.hidden = p.pager.holders[CONST.CUR_RIGHT];
                            $this.fullhidden = p.e([p.pager.holders[CONST.PREV_LEFT], p.pager.holders[CONST.PREV_RIGHT]]);

                            if (p.pager.showPage(p.pager.current_page_left + 2))
                                $this.dragged.removeClass("hidden");
                            if (p.pager.showPage(p.pager.current_page_right + 2))
                                $this.revealed.removeClass("hidden");

                            $this.fullhidden.addClass("hidden");
                        }
                        else
                        {
                            $this.dragged = p.pager.holders[CONST.CUR],
                            $this.revealed = p.pager.holders[CONST.NEXT];
                            $this.hidden = p.e();
                            $this.fullhidden = p.pager.holders[CONST.PREV];

                            if (p.pager.showPage(p.pager.current_page + 1))
                                $this.revealed.removeClass("hidden");
                        }

                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.dragged.setStyle("left", "auto");
                            $this.dragged.setStyle("right", p.pager.current_padding + "px");
                            $this.dragged.setStyle("width", "0px");

                            $this.revealed.setStyle("left", "auto");
                            $this.revealed.setStyle("right", p.pager.current_padding + "px");
                            $this.revealed.setStyle("width", "0px");
                            $this.revealed.find(".wrapper").setStyle("left", "auto");
                            $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                        }
                        else
                        {
                            $this.dragged.setStyle("right", p.pager.current_padding + "px");
                            $this.dragged.setStyle("width", $this.size.width);
                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                        }

                        $this.direction = "right";
                    },
                    startDragLeft: function (e)
                    {
                        var $this = p.flip_animator, CONST = p.pager.constant,
                            requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                            cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                        $this.dragging = true;
                        cancelFrame($this.animationTimeout);
                        //p.pager.renderStop();

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.dragged = p.pager.holders[CONST.PREV_RIGHT],
                            $this.revealed = p.pager.holders[CONST.PREV_LEFT];
                            $this.hidden = p.pager.holders[CONST.CUR_LEFT];
                            $this.fullhidden = p.e([p.pager.holders[CONST.NEXT_LEFT], p.pager.holders[CONST.NEXT_RIGHT]]);

                            if (p.pager.showPage(p.pager.current_page_left - 2))
                                $this.revealed.removeClass("hidden");
                            if (p.pager.showPage(p.pager.current_page_right - 2))
                                $this.dragged.removeClass("hidden");

                            $this.fullhidden.addClass("hidden");
                        }
                        else
                        {
                            $this.dragged = p.pager.holders[CONST.CUR],
                            $this.revealed = p.pager.holders[CONST.PREV];
                            $this.hidden = p.e();
                            $this.fullhidden = p.pager.holders[CONST.NEXT];

                            if (p.pager.showPage(p.pager.current_page - 1))
                                $this.revealed.removeClass("hidden");

                            $this.dragged.removeClass("hidden");
                        }

                        $this.dragged.addClass("animate");
                        $this.revealed.addClass("wait");

                        if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            $this.dragged.setStyle("right", "auto");
                            $this.dragged.setStyle("left", p.pager.current_padding + "px");
                            $this.dragged.setStyle("width", "0px");
                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");

                            $this.revealed.setStyle("right", "auto");
                            $this.revealed.setStyle("left", p.pager.current_padding + "px");
                            $this.revealed.setStyle("width", "0px");
                        }
                        else
                        {
                            $this.dragged.setStyle("right", p.pager.current_padding + "px");
                            $this.dragged.find(".wrapper").setStyle("left", "auto");
                            $this.dragged.find(".wrapper").setStyle("width", $this.size.width + "px");
                            $this.revealed.find(".wrapper").setStyle("left", "auto");
                            $this.revealed.find(".wrapper").setStyle("width", $this.size.width + "px");
                        }

                        $this.direction = "left";
                    }
                },

            overlays:
                {
                    elements: [],
                    objects: [],
                    container: null,
                    lastRenderPage: -1,
                    lastRenderZoom: -1,
                    lastRenderMode: -1,

                    init: function ()
                    {
                        this.container = p.e("#reader-container .overlayer");
                        var elements = p.reader.container.find(".overlay"), i = 0, l = elements.length;
                        for (; i < l; i++)
                        {
                            this.parse(elements[i]);
                        }
                        elements.remove();

                    },

                    setHidden: function (hidden)
                    {
                        var $this = p.overlays;

                        if (hidden)
                            $this.container.addClass("hidden");
                        else
                            $this.container.removeClass("hidden");

                    },

                    parse: function (e)
                    {
                        var ele = p.e(e);

                        var data = {
                            html: ele.getHtml().trim(),
                            display: ele.getAttr("data-display"),
                            type: ele.getAttr("data-type"),
                            x: parseInt(ele.getAttr("data-x")),
                            y: parseInt(ele.getAttr("data-y")),
                            width: parseInt(ele.getAttr("data-width")),
                            height: parseInt(ele.getAttr("data-height")),
                            page: parseInt(ele.getAttr("data-page")),
                            openWidth: parseInt(ele.getAttr("data-open-width")),
                            openHeight: parseInt(ele.getAttr("data-open-height")),
                            icon: ele.getAttr("data-icon")
                        };

                        this.elements.push(data);
                    },

                    render: function ()
                    {
                        var $this = p.overlays, i = 0, l = $this.elements.length, CONST = p.pager.constant, pgr = p.pager;

                        if ($this.lastRenderMode != pgr.current_mode || $this.lastRenderPage != pgr.current_page || $this.lastRenderZoom != pgr.current_zoom)
                        {
                            //console.log("Render");
                            $this.lastRenderMode = pgr.current_mode;
                            $this.lastRenderPage = pgr.current_page;
                            $this.lastRenderZoom = pgr.current_zoom;

                            $this.prepare();
                            $this.objects = [];

                            if (p.pager.current_mode == CONST.SINGLE)
                            {
                                var c = $this.container.find(".page");
                                //console.log(c);
                            }
                            else if (p.pager.current_mode == CONST.DOUBLE)
                            {
                                var left = $this.container.find(".left");
                                var right = $this.container.find(".right");
                            }

                            for (; i < l; i++)
                            {
                                var e = $this.elements[i];
                                var o;
                                //console.log(e);

                                if (p.pager.current_mode == CONST.SINGLE)
                                {
                                    if (e.page == p.pager.current_page)
                                    {
                                        o = $this.make(e).appendTo(c);
                                    }
                                }
                                else if (p.pager.current_mode == CONST.DOUBLE)
                                {
                                    if (e.page == p.pager.current_page_left)
                                    {
                                        o = $this.make(e).appendTo(left);
                                    }
                                    else if (e.page == p.pager.current_page_right)
                                    {
                                        o = $this.make(e).appendTo(right);
                                    }
                                }

                                if (o)
                                {
                                    $this.objects.push(o);
                                    //console.log($this.objects);
                                }
                            }
                        }
                    },

                    getAvailableSpace: function ()
                    {
                        var rect = p.math.rect(p.pager.content_container[0].scrollTop,
                            p.pager.content_container[0].scrollLeft,
                            p.reader.container.getHeight() + p.pager.content_container[0].scrollTop,
                            p.reader.container.getWidth() + p.pager.content_container[0].scrollLeft);

                        var topBlocked = false;
                        var leftBlocked = false;
                        var rightBlocked = false;
                        var bottomBlocked = false;

                        if (p.e("#reader-container .controls .top, #reader-container .controls .topleft .horizontal, #reader-container .controls .topright .horizontal").children().length > 0)
                            topBlocked = true;

                        if (p.e("#reader-container .controls .left, #reader-container .controls .topleft .vertical, #reader-container .controls .bottomleft .vertical").children().length > 0)
                            leftBlocked = true;

                        if (p.e("#reader-container .controls .bottom, #reader-container .controls .bottomleft .horizontal, #reader-container .controls .bottomright .horizontal").children().length > 0)
                            bottomBlocked = true;

                        if (p.e("#reader-container .controls .right, #reader-container .controls .topright .vertical, #reader-container .controls .bottomright .vertical").children().length > 0)
                            rightBlocked = true;

                        if (topBlocked) rect.top += p.e("#reader-container .controls .top").getHeight();
                        if (leftBlocked) rect.left += p.e("#reader-container .controls .left").getWidth();
                        if (bottomBlocked) rect.bottom -= p.e("#reader-container .controls .bottom").getHeight();
                        if (rightBlocked) rect.right -= p.e("#reader-container .controls .right").getWidth();

                        if (p.reader.overview.isOpen)
                        {
                            if (p.reader.settings.overview_direction == "top")
                            {
                                rect.top += p.reader.settings.overview_size;
                            }
                            else if (p.reader.settings.overview_direction == "bottom")
                            {
                                rect.bottom -= p.reader.settings.overview_size;
                            }
                            else if (p.reader.settings.overview_direction == "right")
                            {
                                rect.right -= p.reader.settings.overview_size;
                            }
                            else if (p.reader.settings.overview_direction == "left")
                            {
                                rect.left += p.reader.settings.overview_size;
                            }
                        }

                        return rect;
                    },

                    prepare: function ()
                    {
                        var $this = p.overlays, CONST = p.pager.constant;
                        p.pager.touchBlocked = false;
                        $this.container.children().remove();
                        $this.container.setStyle("padding", p.pager.current_padding + "px");
                        if (p.pager.current_mode == CONST.SINGLE)
                        {
                            var size = p.pager.getPageSize(p.pager.current_page);
                            p.e("<div>", { "class": "page", width: size.width + "px", height: size.height + "px" }).appendTo($this.container);
                        }
                        else if (p.pager.current_mode == CONST.DOUBLE)
                        {
                            var sizeLeft = p.pager.getPageSize(p.pager.current_page_left);
                            var sizeRight = p.pager.getPageSize(p.pager.current_page_right);
                            p.e("<div>", { "class": "page left", width: sizeLeft.width + "px", height: sizeLeft.height + "px" }).appendTo($this.container);
                            p.e("<div>", { "class": "page right", width: sizeRight.width + "px", height: sizeRight.height + "px" }).appendTo($this.container);
                        }
                    },
                    make_audio_controls: function (e)
                    {
                        var ele = e[0];
                        var container = p.e("<div>", { "class": "controller flex horizontal" });
                        var playing = false;
                        var play_pause = p.e("<div>", { "class": "icon", "html": "play_arrow" }).appendTo(container);
                        var volume = p.reader.make_slider({
                            "dark": true,
                            "discrete": true,
                            min: 0,
                            max: 100,
                            value: 50,
                            sigfigs: 0,
                            callback: function (vol)
                            {
                                try
                                {
                                    ele.volume = vol / 100;
                                } catch (ex) { }
                            }
                        }).appendTo(container);

                        play_pause.on("click tap", function ()
                        {
                            if (playing)
                            {
                                play_pause.setHtml("play_arrow");

                                try
                                {
                                    ele.pause();
                                } catch (ex) { }
                                playing = false;
                            }
                            else
                            {
                                play_pause.setHtml("pause");
                                try
                                {
                                    ele.play();
                                } catch (ex)
                                {
                                    p.reader.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("UNSUPPORTED_AUDIO")).appendTo(p.reader.container);
                                }
                                playing = true;
                            }
                        });
                        try
                        {
                            ele.volume = 0.5;
                        } catch (ex) { }

                        container.extend({
                            close: function ()
                            {
                                play_pause.setHtml("play_arrow");

                                try
                                {
                                    ele.pause();
                                    playing = false;
                                } catch (ex) { }


                            }
                        });

                        return container;
                    },
                    make_video_controls: function (e, onmeta)
                    {
                        var uid = p.random.guid();
                        p.e(e.getParents()[0]).setAttr("id", uid);

                        var ele = e[0];
                        var container = p.e("<div>", { "class": "controller flex horizontal" });
                        var playing = false;
                        var play_pause = p.e("<div>", { "class": "icon", "html": "play_arrow" }).appendTo(container);
                        var seekbar = p.reader.make_slider({
                            "dark": true,
                            "discrete": false,
                            buffering: true,
                            buffer: 0,
                            min: 0,
                            max: 100,
                            value: 1,
                            callback: function (time, user)
                            {
                                if (fncs)
                                    fncs.player.onSeek(time, user);
                            }
                        }, uid).appendTo(container);
                        var audio = p.e("<div>", { "class": "icon", "html": "volume_up" }).appendTo(container);
                        var audio_bar_container = p.e("<div>", { "class": "hidden_menu flex vertical" }).appendTo(container);
                        var fullscreen = p.e("<div>", { "class": "icon", "html": "fullscreen" }).appendTo(container);

                        var volume = p.reader.make_slider({
                            dark: true,
                            discrete: true,
                            vertical: true,
                            min: 0,
                            max: 100,
                            value: 50,
                            sigfigs: 0,
                            callback: function (vol)
                            {
                                try
                                {
                                    ele.volume = vol / 100;
                                } catch (ex) { }
                            }
                        }, uid).appendTo(audio_bar_container);

                        var fncs = {
                            player:
                                {
                                    playpause: function ()
                                    {
                                        if (playing)
                                        {
                                            fncs.player.pause();
                                        }
                                        else
                                        {
                                            fncs.player.play();
                                        }
                                    },
                                    pause: function ()
                                    {
                                        try
                                        {
                                            ele.pause();
                                        }
                                        catch (ex)
                                        { }
                                        playing = false;
                                    },
                                    play: function ()
                                    {
                                        try
                                        {
                                            ele.play();
                                        }
                                        catch (ex)
                                        {
                                            p.reader.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("UNSUPPORTED_VIDEO")).appendTo(p.reader.container);
                                        }
                                    },
                                    onTime: function ()
                                    {
                                        seekbar.slider.value = ele.currentTime;
                                        seekbar.slider.max = ele.duration;
                                        seekbar.slider.update(true);
                                    },
                                    onSeek: function (time, user)
                                    {
                                        if (user)
                                        {
                                            try
                                            {
                                                ele.currentTime = time;
                                            } catch (ex) { }
                                        }
                                    },
                                    onProgress: function (e)
                                    {
                                        if (ele.buffered.length > 0)
                                        {
                                            //console.log(ele.buffered.start(0), ele.buffered.end(0), ele.duration);
                                            seekbar.slider.setBuffer(p.math.Percentage.XofY(ele.buffered.end(0), ele.duration));
                                        }
                                    },
                                    onState: function ()
                                    {
                                        if (ele.paused)
                                        {
                                            play_pause.setHtml("play_arrow");
                                            playing = false;
                                        }
                                        else
                                        {
                                            play_pause.setHtml("pause");
                                            playing = true;
                                        }
                                    },
                                    onMeta: function ()
                                    {
                                        if (onmeta && p.is.function(onmeta))
                                            onmeta();
                                    },
                                    onFullscreen: function (type, element)
                                    {
                                        if (p.e(element).getAttr("id") == uid)
                                        {
                                            if (type == "exit")
                                            {
                                                fullscreen.setHtml("fullscreen_enter");
                                            }
                                            else
                                            {
                                                fullscreen.setHtml("fullscreen_exit");
                                            }
                                        }
                                    }
                                }
                        };

                        e.on("timeupdate", fncs.player.onTime);
                        e.on("progress", fncs.player.onProgress);
                        e.on("loadedmetadata", fncs.player.onMeta);
                        e.on("pause play ended abort", fncs.player.onState);

                        fullscreen.on("click tap", function fullscreenToggler()
                        {
                            if (p.fullscreen.isFullscreen)
                            {
                                p.fullscreen.exit();
                            }
                            else
                            {
                                p.fullscreen.enter(e.getParents()[0]);
                            }
                        });

                        p.subscribe("fullscreen", fncs.player.onFullscreen);

                        audio.on("mouseenter", function ()
                        {
                            audio_bar_container.toggleClass("open");
                        });
                        audio_bar_container.on("mouseleave", function ()
                        {
                            audio_bar_container.removeClass("open");
                        });


                        play_pause.on("click tap", fncs.player.playpause);

                        try
                        {
                            ele.volume = 0.5;
                        } catch (ex) { }

                        container.extend(fncs);

                        return container;
                    },
                    make_iframe_controls: function (e)
                    {
                        var ele = e[0];
                        var container = p.e("<div>", { "class": "navigator flex horizontal" });
                        var info = p.e("<div>").appendTo(container);
                        var back = p.e("<div>", { "class": "icon", html: "arrow_back" }).appendTo(container);
                        var forward = p.e("<div>", { "class": "icon", html: "arrow_forward" }).appendTo(container);
                        var reload = p.e("<div>", { "class": "icon", html: "refresh" }).appendTo(container);

                        ele.readystatechange = function (evt)
                        {
                            //console.log(evt, ele.readyState);
                        };


                        return container;
                    },
                    make_gallery: function (sources)
                    {
                        var uid = p.random.guid()
                        var container = p.e("<div>", { "class": "container", "id": uid });
                        var arrow_left = p.e("<div>", { "class": "navigation icon left", "html": "keyboard_arrow_left" }).appendTo(container);
                        var arrow_right = p.e("<div>", { "class": "navigation icon right", "html": "keyboard_arrow_right" }).appendTo(container);
                        var fullscreen = p.e("<div>", { "class": "fullscreen icon", "html": "fullscreen_enter" }).appendTo(container);
                        var dots_container = p.e("<div>", { "class": "dots" }).appendTo(container);

                        var loaders = [];
                        var dots = [];

                        for (var i = 0; i < sources.length; i++)
                        {
                            //var src = sources[i];
                            loaders.push(p.reader.stageLoader().appendTo(container));
                            dots.push(p.e("<div>", { "class": "dot" }).appendTo(dots_container));
                        }

                        var fncs =
                            {
                                gallery:
                                    {
                                        hasBeenStarted: false,
                                        index: 0,
                                        max: sources.length - 1,
                                        start: function ()
                                        {
                                            if (!fncs.gallery.hasBeenStarted)
                                            {
                                                fncs.gallery.hasBeenStarted = true;
                                                for (var i = 0; i < sources.length; i++)
                                                {
                                                    var src = sources[i];
                                                    loaders[i].load([src]);
                                                }

                                                loaders[0].addClass("appear");
                                                dots[0].addClass("active");
                                            }
                                        },
                                        next: function ()
                                        {
                                            var $this = fncs.gallery, next = $this.index + 1;
                                            if (next > $this.max)
                                                next = 0;

                                            p.e(loaders).removeClass("vanish appear left right");
                                            loaders[$this.index].addClass("vanish");
                                            loaders[next].addClass("appear right");
                                            $this.index = next;
                                            p.e(dots).removeClass("active");
                                            dots[$this.index].addClass("active");
                                        },
                                        prev: function ()
                                        {
                                            var $this = fncs.gallery, prev = $this.index - 1;
                                            if (prev <= 0)
                                                prev = $this.max;

                                            p.e(loaders).removeClass("vanish appear left right");
                                            loaders[$this.index].addClass("vanish");
                                            loaders[prev].addClass("appear left");
                                            $this.index = prev;
                                            p.e(dots).removeClass("active");
                                            dots[$this.index].addClass("active");
                                        },
                                        onFullscreen: function (type, element)
                                        {
                                            if (p.e(element).getAttr("id") == uid)
                                            {
                                                if (type == "exit")
                                                {
                                                    fullscreen.setHtml("fullscreen_enter");
                                                }
                                                else
                                                {
                                                    fullscreen.setHtml("fullscreen_exit");
                                                }
                                            }
                                        },
                                        fullscreen: function ()
                                        {
                                            if (p.fullscreen.isFullscreen)
                                            {
                                                p.fullscreen.exit();
                                                //p.reader.container.removeClass("child-fullscreen");
                                            }
                                            else
                                            {
                                                p.fullscreen.enter(container[0]);
                                                //p.reader.container.addClass("child-fullscreen");
                                            }
                                        },
                                    }
                            };

                        p.TouchHandler(container,
                            {
                                propagate: false,
                                priority: true,
                                onSwipeLeft: fncs.gallery.next,
                                onSwipeRight: fncs.gallery.prev
                            });

                        p.subscribe("fullscreen", fncs.gallery.onFullscreen);
                        arrow_left.on("click tap", fncs.gallery.prev);
                        arrow_right.on("click tap", fncs.gallery.next);
                        fullscreen.on("click tap", fncs.gallery.fullscreen);

                        container.extend(fncs);
                        return container;
                    },
                    make: function (e)
                    {
                        var ele = p.e("<div>", { "class": "overlay visible " + e.type });
                        var scale = p.pager.current_zoom;

                        var dimmer = p.e("<div>", { "class": "dimmer" }).appendTo(ele);
                        var icon = p.e("<div>", { "class": "icon" }).appendTo(ele);
                        var controls = p.e("<div>", { "class": "controls flex horizontal reverse" }).appendTo(ele);
                        var content = p.e("<div>", { "class": "content" }).appendTo(ele);
                        var wrapper = p.e("<div>", { "class": "wrap" }).appendTo(content);
                        var requireTouch = false;
                        var overflowed = false;

                        var btn_close = p.e("<div>", { "class": "icon close", html: "close" }).appendTo(controls);

                        if (e.display == "area")
                        {
                            ele.addClass("area");
                            ele.setStyle("width", (e.width * scale) + "px");
                            ele.setStyle("height", (e.height * scale) + "px");
                        }
                        else
                        {
                            ele.addClass("pin");
                        }

                        ele.setStyle("left", (e.x * scale) + "px");
                        ele.setStyle("top", (e.y * scale) + "px");

                        // ICON
                        switch (e.type)
                        {
                            case "html":
                                icon.setHtml("code");
                                break;
                            case "image":
                                icon.setHtml("image");
                                break;
                            case "gallery":
                                icon.setHtml("photo_library");
                                break;
                            case "video":
                                icon.setHtml("video_library");
                                break;
                            case "audio":
                                icon.setHtml("library_music");
                                break;
                            case "link":
                                icon.setHtml("link");
                                break;
                            case "page":
                                icon.setHtml("input");
                                break;
                            case "embed":
                                icon.setHtml("web");
                                break;
                        }

                        if (e.icon)
                            icon.setHtml(e.icon);

                        // CONTENT
                        switch (e.type)
                        {
                            case "html":
                                wrapper.setHtml(e.html);
                                break;
                            case "image":
                                var source = p.e(e.html);
                                p.e("<img>", { "src": source.getAttr("src"), "alt": p.locale.getString("IMG_ALT") }).appendTo(wrapper);
                                requireTouch = true;
                                break;
                            case "gallery":
                                var sources = p.e(e.html);
                                var paths = [];
                                sources.each(function ()
                                {
                                    paths.push(p.e(this).getAttr("src"));
                                });
                                var gallery = p.overlays.make_gallery(paths).appendTo(wrapper);

                                e.openWidth = (!isNaN(e.openWidth) ? e.openWidth : 10000);
                                e.openHeight = (!isNaN(e.openHeight) ? e.openHeight : 10000);
                                break;
                            case "audio":
                                var audio = p.e("<audio>");
                                var sources = p.e(e.html).appendTo(audio);
                                var ctrls = p.overlays.make_audio_controls(audio);
                                audio.appendTo(wrapper);
                                ctrls.appendTo(wrapper);
                                break;
                            case "video":
                                var videoWrap = p.e("<div>", { "class": "player" });
                                var videoShield = p.e("<div>", { "class": "shield" }).appendTo(videoWrap);
                                var video = p.e("<video>").appendTo(videoWrap);
                                var sources = p.e(e.html).appendTo(video);
                                var ctrls = p.overlays.make_video_controls(video, function ()
                                {
                                    e.openWidth = (!isNaN(e.openWidth) ? e.openWidth : Math.max(320, video[0].videoWidth));
                                    e.openHeight = (!isNaN(e.openHeight) ? e.openHeight : Math.max(240, video[0].videoHeight));
                                    fncs.adjustSize(e.openWidth, e.openHeight);
                                });
                                videoWrap.appendTo(wrapper);
                                ctrls.appendTo(videoWrap);
                                e.openWidth = (!isNaN(e.openWidth) ? e.openWidth : Math.max(320, video[0].videoWidth));
                                e.openHeight = (!isNaN(e.openHeight) ? e.openHeight : Math.max(240, video[0].videoHeight));

                                p.reader.container.on("keyup", function (evt)
                                {
                                    if (ele.hasClass("open") && (evt.keyCode == 32 || evt.keyCode == 75)) // On space and K
                                    {
                                        if (evt && evt.preventDefault) evt.preventDefault();
                                        if (evt && evt.stopPropagation) evt.stopPropagation();
                                        ctrls.player.playpause();
                                    }
                                });
                                break;
                            case "link":
                            case "page":
                                var source = p.e(e.html);
                                var target = source.getAttr("src");
                                break;
                            case "embed":
                                var source = p.e(e.html);
                                var target = source.getAttr("src");
                                var iframe = p.e("<iframe>").appendTo(wrapper);
                                e.openWidth = (!isNaN(e.openWidth) ? e.openWidth : 10000);
                                e.openHeight = (!isNaN(e.openHeight) ? e.openHeight : 10000);
                                //var controls = p.overlays.make_iframe_controls(iframe).appendTo(controls);
                                break;
                        }

                        var pinchStartWidth, pinchStartHeight, pinchStartRect;
                        var pinchOffsetX, pinchOffsetY;
                        var pinchRelativeScale = 0;
                        var pinchStartFactor = 0;
                        var pinchStart = null;
                        var pinchCurrent = null;
                        var currentZoom = 1.0;
                        var maxZoom = 2.0;
                        var minZoom = 0.1;

                        var fncs =
                            {
                                adjustSize: function (width, height)
                                {
                                    if (ele.hasClass("open"))
                                    {
                                        var relPos = ele.getRelativeXY(".content");
                                        var openWidth = Math.max((width + 8 * 2), 200);
                                        var openHeight = Math.max((height + 8 + 32 + 8), 80);

                                        var projectedRect = p.math.rect(relPos.y, relPos.x, relPos.y + openHeight, relPos.x + openWidth);
                                        var fittedRect = p.math.rect(relPos.y, relPos.x, relPos.y + openHeight, relPos.x + openWidth);
                                        var availableSpace = p.overlays.getAvailableSpace();

                                        var newTop = ((e.y * scale));
                                        var newLeft = ((e.x * scale));
                                        var infiniteLoopSecurityCounterJustInCase = 0; // You never know with floating points

                                        while (!availableSpace.contains(fittedRect))
                                        {
                                            if (fittedRect.height > availableSpace.height)
                                                overflowed = true, fittedRect.height = availableSpace.height;

                                            if (fittedRect.width > availableSpace.width)
                                                overflowed = true, fittedRect.width = availableSpace.width;

                                            if (fittedRect.top < availableSpace.top)
                                                fittedRect.moveTopTo(availableSpace.top);

                                            if (fittedRect.left < availableSpace.left)
                                                fittedRect.moveLeftTo(availableSpace.left);

                                            if (fittedRect.bottom > availableSpace.bottom)
                                                fittedRect.moveTopBy(availableSpace.bottom - fittedRect.bottom);

                                            if (fittedRect.right > availableSpace.right)
                                                fittedRect.moveLeftBy(availableSpace.right - fittedRect.right);

                                            if (infiniteLoopSecurityCounterJustInCase++ > 10)
                                                break;
                                        }

                                        newTop += fittedRect.top - projectedRect.top;
                                        newLeft += fittedRect.left - projectedRect.left;
                                        openWidth = fittedRect.width;
                                        openHeight = fittedRect.height;

                                        //ele.addClass("open" + (overflowed ? " overflow" : ""));
                                        if (overflowed)
                                            ele.addClass("overflow");
                                        else
                                            ele.removeClass("overflow");

                                        ele.setStyle("width", openWidth + "px");
                                        ele.setStyle("height", openHeight + "px");
                                        ele.setStyle("top", newTop + "px");
                                        ele.setStyle("left", newLeft + "px");
                                    }

                                },
                                open: function (evt)
                                {
                                    if (evt && evt.preventDefault) evt.preventDefault();
                                    if (evt && evt.stopPropagation) evt.stopPropagation();
                                    //console.log("open");
                                    if (!ele.hasClass("open"))
                                    {
                                        p.overlays.closeAll();
                                        switch (e.type)
                                        {
                                            case "link":
                                                window.open(target);
                                                break;
                                            case "page":
                                                p.pager.goToPage(p.pager.current_page = parseInt(target));
                                                break;
                                            case "embed":
                                                if (!iframe.getAttr("src"))
                                                    iframe.setAttr("src", target);
                                            default:
                                                p.pager.touchBlocked = true;
                                                if (e.type == "gallery") gallery.gallery.start();
                                                var openWidth = (!isNaN(e.openWidth) ? e.openWidth : wrapper.getWidth());
                                                var openHeight = (!isNaN(e.openHeight) ? e.openHeight : wrapper.getHeight());
                                                ele.addClass("open");
                                                fncs.adjustSize(openWidth, openHeight);
                                                break;
                                        }

                                    }
                                },
                                close: function (evt)
                                {
                                    if (evt && evt.preventDefault) evt.preventDefault();
                                    if (evt && evt.stopPropagation) evt.stopPropagation();
                                    //console.log("close", ele);
                                    if (ele.hasClass("open"))
                                    {
                                        //console.log("closing", ele);
                                        ele.removeClass("open");
                                        p.pager.touchBlocked = false;

                                        if (e.type == "audio") { ctrls.close(); }
                                        if (e.type == "video") { ctrls.player.pause(); }

                                        if (e.display == "area")
                                        {
                                            ele.setStyle("width", (e.width * scale) + "px");
                                            ele.setStyle("height", (e.height * scale) + "px");
                                        }
                                        else
                                        {
                                            ele.setStyle("width", "");
                                            ele.setStyle("height", "");
                                        }

                                        ele.setStyle("left", (e.x * scale) + "px");
                                        ele.setStyle("top", (e.y * scale) + "px");
                                        //console.log("closed", ele);
                                    }
                                },

                                onDrag: function (difference)
                                {
                                    if (ele.hasClass("open") && overflowed)
                                    {
                                        content[0].scrollLeft += difference.x;
                                        content[0].scrollTop += difference.y;
                                    }
                                },
                                /// WHEEL
                                //onWheelStart: function (start)
                                //{
                                //    pinchStartWidth = wrapper.getWidth();
                                //    pinchStartHeight = wrapper.getHeight();
                                //    pinchStart = start;
                                //    pinchStartFactor = pinchStartWidth / content.getWidth();
                                //    pinchOffsetX = (pinchStart.x) + content[0].scrollLeft;
                                //    pinchOffsetY = (pinchStart.y) + content[0].scrollTop;
                                //    pinchStartRect = wrapper.getRelativeBoundingClientRect();

                                //    wrapper.setStyle("transformOrigin", "{0}px {1}px".format(pinchOffsetX, pinchOffsetY));
                                //},
                                //onWheel: function (distDiff, distChange, now)
                                //{
                                //    var zoomTest = currentZoom * distChange;

                                //    if (zoomTest >= minZoom && zoomTest <= maxZoom)
                                //    {
                                //        pinchRelativeScale = distChange;
                                //        pinchCurrent = now;

                                //        wrapper.setStyle("height", "{0}px".format(pinchStartHeight));
                                //        wrapper.setStyle("width", "{0}px".format(pinchStartWidth));
                                //        wrapper.setStyle("transform", "scale({0})".format(pinchRelativeScale));
                                //    }
                                //},
                                //onWheelEnd: function ()
                                //{
                                //    try
                                //    {
                                //        var rect = wrapper.getRelativeBoundingClientRect();
                                //    } catch (ex) { }

                                //    currentZoom = currentZoom * pinchRelativeScale;
                                //    var scrollTop = Math.round(-rect.top), scrollLeft = Math.round(-rect.left);

                                //    content[0].scrollTop = scrollTop;
                                //    content[0].scrollLeft = scrollLeft;
                                //}

                            };



                        if (requireTouch)
                        {
                            //console.log("touch handler");
                            p.TouchHandler(content, {
                                propagate: false,
                                priority: true,
                                onDrag: fncs.onDrag,
                                onWheelStart: fncs.onWheelStart,
                                onWheel: fncs.onWheel,
                                onWheelEnd: fncs.onWheelEnd
                            });
                        }

                        ele.on("click tap", fncs.open);
                        btn_close.on("click tap", fncs.close);

                        ele.extend(fncs);

                        return ele;
                    },
                    closeAll: function ()
                    {
                        var i = 0, l = p.overlays.objects.length;
                        for (; i < l; i++)
                            p.overlays.objects[i].close();
                    }
                },

            pager:
                {
                    pages: null,
                    get page_count() { return Object.keys(this.pages).length; },
                    current_script: null,
                    current_mode: 1, // 1 = single, 2 = double, (3 = single reverse?, 4 = double reverse?, 5 = continuous?)
                    current_mode_manual: false,
                    current_renderer: 1,
                    current_renderer_manual: false,
                    current_zoom: 1.0,
                    current_autozoom: true,
                    current_padding: 20,
                    current_controls: false,
                    current_controls_floating: false,
                    current_animation: 0,
                    current_animator: null,
                    holders: [],
                    loaders: [],
                    page_container: null,
                    content_container: null,
                    pages_uniform: true,
                    pdf_exists: false,
                    pdf_checked: false,
                    pdf_checking: false,
                    pdf_enabled: false,
                    pdf_preparing: false,
                    pdf_loaded: false,
                    pdf_loaded_load: false,
                    pdf_loaded_progess: false,
                    pdf_rendering_slow: false,
                    pdf_last_rendertimes: [],
                    pdf_last_rendertime_index: 0,
                    pdf_last_rendertime_max: 10,
                    is_mobile: false,
                    touchBlocked: false,

                    get pdf_average_rendertimes()
                    {
                        var i = 0, o = 0, c = this.pdf_last_rendertimes.length;
                        for (; i < c; i++)
                            o += this.pdf_last_rendertimes[i];
                        return o / c;
                    },

                    //get paging_handled_by_animator()
                    //{
                    //    return !(this.current_animation == this.constant.NONE);
                    //},
                    paging_handled_by_animator: false,

                    push_pdf_rendertime: function (time)
                    {
                        this.pdf_last_rendertimes[this.pdf_last_rendertime_index++] = time;
                        if (this.pdf_last_rendertime_index >= this.pdf_last_rendertime_max)
                            this.pdf_last_rendertime_index = 0;
                    },

                    last_page: -1,
                    last_page_left: -1,
                    last_page_right: -1,
                    last_autozoom: 1,

                    current_page: 0,
                    get current_page_firstvalid()
                    {
                        if (this.current_page <= 0)
                            return 1;
                        else if (this.current_page > this.page_count)
                            return this.page_count;

                        return this.current_page;
                    },
                    get current_page_left()
                    {
                        if (this.current_page <= 1)
                            this.current_page = 0;
                        else
                        {
                            if (this.current_mode == this.constant.DOUBLE || this.current_mode == this.constant.DOUBLE_REVERSE)
                            {
                                if (this.current_page % 2)
                                    this.current_page--;
                            }
                        }

                        return this.current_page;
                    },
                    get current_page_right()
                    {
                        return this.current_page_left + 1;
                    },
                    get show_page_left()
                    {
                        return this.showPage(this.current_page_left);
                        //return this.current_page_left > 0;
                    },
                    get show_page_right()
                    {
                        return this.showPage(this.current_page_right);
                        //return this.current_page_right <= this.page_count;
                    },

                    get can_go_back()
                    {
                        if (this.current_mode == this.constant.DOUBLE || this.current_mode == this.constant.DOUBLE_REVERSE)
                        {
                            if (Math.min(this.current_page_left, this.current_page_right) <= 1)
                                return false;
                        }
                        else
                        {
                            if (this.current_page <= 1)
                                return false;
                        }

                        return true;
                    },

                    get can_go_forward()
                    {
                        if (this.current_mode == this.constant.DOUBLE || this.current_mode == this.constant.DOUBLE_REVERSE)
                        {
                            if (Math.max(this.current_page_left, this.current_page_right) >= this.page_count)
                                return false;
                        }
                        else
                        {
                            if (this.current_page >= this.page_count)
                                return false;
                        }

                        return true;
                    },

                    showPage: function (page)
                    {
                        return page > 0 && page <= this.page_count;
                    },

                    _lastContentContained: null,
                    _contentContainedInvalidated: true,
                    get contentContained()
                    {
                        if (this._contentContainedInvalidated)
                        {
                            var contentSize = { width: this.page_container.getWidth(), height: this.page_container.getHeight() };
                            var containerSize = { width: p.reader.container.getWidth(), height: p.reader.container.getHeight() };
                            this._lastContentContained = contentSize.width <= containerSize.width && contentSize.height <= containerSize.height;
                            this._contentContainedInvalidated = false;
                        }

                        return this._lastContentContained;
                    },

                    invalidateContentContained: function ()
                    {
                        this._contentContainedInvalidated = true;
                    },

                    constant:
                        {
                            // Modes
                            SINGLE: 1,
                            DOUBLE: 2,
                            SINGLE_REVERSE: 3,
                            DOUBLE_REVERSE: 4,
                            SCROLL: 5,

                            // Canvases
                            PREV_LEFT: 0,
                            PREV_RIGHT: 1,
                            CUR_LEFT: 2,
                            CUR_RIGHT: 3,
                            NEXT_LEFT: 4,
                            NEXT_RIGHT: 5,
                            PREV: 0,
                            CUR: 1,
                            NEXT: 2,

                            // Renderers
                            IMG: 1,
                            PDF: 2,

                            // Animations
                            NONE: 0,
                            FADE: 1,
                            FLIP: 2,
                            SWIPE: 3
                        },

                    ready_for_first_load: false,
                    first_load_done: false,
                    onFirstLoad: function ()
                    {
                        if (!this.first_load_done && this.ready_for_first_load)
                        {
                            this.first_load_done = true;
                            p.e(".main-loader").addClass("hidden");

                            if (p.pager.is_mobile || p.reader.settings.no_pdf)
                                p.reader.setProgress(100);

                            p.pager.setAnimation(p.pager.constant[p.reader.get("animation", "flip").toUpperCase()]);

                            if (p.reader.settings.slideshow_mode)
                            {
                                p.reader.slideshow.play();
                            }
                        }
                    },

                    init: function ()
                    {
                        var $this = this;
                        this.page_container = p.e("#reader-container .content .pages");
                        this.content_container = p.e("#reader-container .content");
                        if (this.pages != null)
                        {
                            this.prepareElements();

                            if (p.reader.settings.overview_start_open)
                                p.reader.overview.open();

                            var pinchStartWidth, pinchStartHeight, pinchStartRect;
                            var pinchOffsetX, pinchOffsetY;
                            var pinchRelativeScale = 0;
                            var pinchStartFactor = 0;
                            var pinchStart = null;
                            var pinchCurrent = null;

                            //console.log(p.reader.container.find(".content"));
                            p.TouchHandler(this.content_container,
                                {
                                    propagate: true,
                                    wheelTick: p.reader.settings.zoom_wheel_step * 10,
                                    onSwipeRight: function ()
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_swiping && !p.pager.paging_handled_by_animator)
                                            {
                                                if (p.pager.current_animator == null)
                                                    p.pager.goBack();
                                                else
                                                    p.pager.current_animator.doFullAnimationPrev();
                                            }
                                    },
                                    onSwipeLeft: function ()
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_swiping && !p.pager.paging_handled_by_animator)
                                            {
                                                if (p.pager.current_animator == null)
                                                    p.pager.goForward();
                                                else
                                                    p.pager.current_animator.doFullAnimationNext();
                                            }
                                    },
                                    onDrag: function (diff)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_dragging)
                                            {
                                                p.pager.content_container[0].scrollLeft += diff.x;
                                                p.pager.content_container[0].scrollTop += diff.y;
                                            }
                                    },
                                    onDoubleTap: function (e)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_double_tapping)
                                            {
                                                if (!$this.current_autozoom)
                                                {
                                                    $this.current_autozoom = true;
                                                    $this.adjust({ reload: true });
                                                }
                                                else
                                                {
                                                    //debugger;
                                                    pinchRelativeScale = 1 / $this.current_zoom;
                                                    var scrollTop = ((((e.y) * pinchRelativeScale)) - (($this.content_container.getHeight() / 2))),
                                                        scrollLeft = ((((e.x) * pinchRelativeScale)) - (($this.content_container.getWidth() / 2)));

                                                    $this.setZoom(p.reader.settings.zoom_doubleclick);
                                                    $this.adjust({
                                                        reload: true,
                                                        scroll:
                                                            {
                                                                top: scrollTop,
                                                                left: scrollLeft
                                                            },
                                                        callback: function ()
                                                        {
                                                            p.pager.content_container[0].scrollLeft = scrollLeft; // (((e.x * pinchRelativeScale)) - (($this.content_container.getWidth() / 2))); // - (p.pager.content_container[0].scrollLeft + $this.current_padding);
                                                            p.pager.content_container[0].scrollTop = scrollTop; //(((e.y * pinchRelativeScale)) - (($this.content_container.getHeight() / 2))); // - (p.pager.content_container[0].scrollTop + $this.current_padding);
                                                        }
                                                    });
                                                }
                                            }
                                    },


                                    /// WHEEL
                                    onWheelStart: function (start)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_mousewheel_zoom)
                                            {
                                                pinchStartWidth = $this.page_container.getWidth();
                                                pinchStartHeight = $this.page_container.getHeight();
                                                pinchStart = start;
                                                pinchStartFactor = pinchStartWidth / $this.content_container.getWidth();
                                                pinchOffsetX = (pinchStart.x) + $this.content_container[0].scrollLeft;
                                                pinchOffsetY = (pinchStart.y) + $this.content_container[0].scrollTop;
                                                pinchStartRect = $this.page_container.getRelativeBoundingClientRect();

                                                //console.log(pinchStart.x, pinchStart.y, $this.content_container[0].scrollLeft, $this.content_container[0].scrollTop);

                                                // Very important to set this here!!!
                                                // On mobile this is an insane performance drain, especially on android
                                                $this.page_container.setStyle("transformOrigin", "{0}px {1}px".format(pinchOffsetX, pinchOffsetY));

                                                //console.log("START", pinchStartRect);
                                            }
                                    },
                                    onWheel: function (distDiff, distChange, now)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_mousewheel_zoom)
                                            {
                                                var zoomTest = p.pager.current_zoom * distChange;
                                                //var zoomTest = Math.min(p.reader.settings.zoom_max, Math.max(p.reader.settings.zoom_min == "auto" ? p.pager.last_autozoom : p.reader.settings.zoom_min, p.pager.current_zoom * distChange));
                                                if (zoomTest < (p.reader.settings.zoom_min == "auto" ? p.pager.last_autozoom : p.reader.settings.zoom_min))
                                                {
                                                    distChange = (p.reader.settings.zoom_min == "auto" ? p.pager.last_autozoom : p.reader.settings.zoom_min) / p.pager.current_zoom;
                                                }
                                                else if (zoomTest > p.reader.settings.zoom_max)
                                                {
                                                    distChange = p.reader.settings.zoom_max / p.pager.current_zoom;
                                                }

                                                pinchRelativeScale = distChange;
                                                pinchCurrent = now;

                                                $this.page_container.setStyle("padding", "{0}px".format($this.current_padding * (1 / pinchRelativeScale)));
                                                $this.page_container.setStyle("height", "{0}px".format(pinchStartHeight));
                                                $this.page_container.setStyle("width", "{0}px".format(pinchStartWidth));
                                                $this.page_container.setStyle("transform", "scale({0})".format(pinchRelativeScale));

                                            }
                                    },
                                    onWheelEnd: function ()
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_mousewheel_zoom)
                                            {
                                                try
                                                {
                                                    var rect = $this.page_container.getRelativeBoundingClientRect();
                                                    //console.log("BEFORE", rect);
                                                } catch (ex) { }

                                                p.pager.setZoom(p.pager.current_zoom * pinchRelativeScale);
                                                var scrollTop = Math.round(-rect.top), scrollLeft = Math.round(-rect.left);
                                                if ($this.current_mode == $this.constant.DOUBLE)
                                                    scrollLeft -= (rect.right - $this.page_container.getRelativeBoundingClientRect().right) / 2;

                                                p.pager.adjust({
                                                    reload: true,
                                                    scroll: { top: scrollTop, left: scrollLeft },
                                                    callback: function ()
                                                    {
                                                        if (rect)
                                                        {
                                                            p.pager.content_container[0].scrollTop = scrollTop;
                                                            p.pager.content_container[0].scrollLeft = scrollLeft;

                                                            //console.log("AFTER", $this.page_container[0].getBoundingClientRect());

                                                            // I can't exactly figure out why we need to correct for the offset only in double sided mode
                                                            // the offset exists in single page mode too, but funnily enough it does not cause any problems there???
                                                            // I'm guessing it has something to do with "margin: 0 auto" and the way elements are centered?
                                                            //if ($this.current_mode == $this.constant.DOUBLE)
                                                            //    p.pager.content_container[0].scrollLeft -= (rect.right - $this.page_container[0].getBoundingClientRect().right) / 2;
                                                        }
                                                        else
                                                        {
                                                            // Terrible fallback
                                                            p.pager.content_container[0].scrollLeft = (((pinchOffsetX * pinchRelativeScale)) - (($this.content_container.getWidth() / 2))) - $this.current_padding;
                                                            p.pager.content_container[0].scrollTop = (((pinchOffsetY * pinchRelativeScale)) - (($this.content_container.getHeight() / 2))) - $this.current_padding;
                                                        }
                                                    }
                                                }
                                                );
                                            }
                                    },


                                    /// PINCH
                                    onPinchStart: function (start)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_pinching)
                                            {
                                                pinchStartWidth = $this.page_container.getWidth();
                                                pinchStartHeight = $this.page_container.getHeight();
                                                pinchStart = start;
                                                pinchStartFactor = pinchStartWidth / $this.content_container.getWidth();
                                                pinchOffsetX = (pinchStart.x) + $this.content_container[0].scrollLeft;
                                                pinchOffsetY = (pinchStart.y) + $this.content_container[0].scrollTop;
                                                pinchStartRect = $this.page_container.getRelativeBoundingClientRect();

                                                //console.log(pinchStart.x, pinchStart.y, $this.content_container[0].scrollLeft, $this.content_container[0].scrollTop);

                                                // Very important to set this here!!!
                                                // On mobile this is an insane performance drain, especially on android
                                                $this.page_container.setStyle("transformOrigin", "{0}px {1}px".format(pinchOffsetX, pinchOffsetY));

                                                //console.log("START", pinchStartRect);
                                            }
                                    },
                                    onPinch: function (distDiff, distChange, now)
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_pinching)
                                            {
                                                var zoomTest = p.pager.current_zoom * distChange;

                                                if (zoomTest >= p.pager.last_autozoom && zoomTest <= p.reader.settings.zoom_max)
                                                {
                                                    pinchRelativeScale = distChange;
                                                    pinchCurrent = now;

                                                    $this.page_container.setStyle("padding", "{0}px".format($this.current_padding * (1 / pinchRelativeScale)));
                                                    $this.page_container.setStyle("height", "{0}px".format(pinchStartHeight));
                                                    $this.page_container.setStyle("width", "{0}px".format(pinchStartWidth));
                                                    $this.page_container.setStyle("transform", "scale({0})".format(pinchRelativeScale));
                                                }

                                                //$this.page_container.setAttr("style",
                                                //    "padding: {0}px; width: {1}px; height: {2}px; transform: scale({3}); transform-origin: {4}px {5}px;"
                                                //    .format(
                                                //        $this.current_padding * (1 / pinchRelativeScale),
                                                //        pinchStartWidth,
                                                //        pinchStartHeight,
                                                //        pinchRelativeScale,
                                                //        pinchOffsetX,
                                                //        pinchOffsetY
                                                //        )
                                                //    );
                                                //console.log("DURING", $this.page_container[0].getBoundingClientRect());
                                            }
                                    },
                                    onPinchEnd: function ()
                                    {
                                        if (!p.pager.touchBlocked)
                                            if (p.reader.settings.enable_pinching)
                                            {
                                                try
                                                {
                                                    var rect = $this.page_container.getRelativeBoundingClientRect();
                                                    //console.log("BEFORE", rect);
                                                } catch (ex) { }

                                                p.pager.setZoom(p.pager.current_zoom * pinchRelativeScale);
                                                var scrollTop = Math.round(-rect.top), scrollLeft = Math.round(-rect.left);
                                                if ($this.current_mode == $this.constant.DOUBLE)
                                                    scrollLeft -= (rect.right - $this.page_container.getRelativeBoundingClientRect().right) / 2;

                                                p.pager.adjust({
                                                    reload: true,
                                                    scroll: { top: scrollTop, left: scrollLeft },
                                                    callback: function ()
                                                    {
                                                        if (rect)
                                                        {
                                                            p.pager.content_container[0].scrollTop = scrollTop;
                                                            p.pager.content_container[0].scrollLeft = scrollLeft;

                                                            //console.log("AFTER", $this.page_container[0].getBoundingClientRect());

                                                            // I can't exactly figure out why we need to correct for the offset only in double sided mode
                                                            // the offset exists in single page mode too, but funnily enough it does not cause any problems there???
                                                            // I'm guessing it has something to do with "margin: 0 auto" and the way elements are centered?
                                                            //if ($this.current_mode == $this.constant.DOUBLE)
                                                            //    p.pager.content_container[0].scrollLeft -= (rect.right - $this.page_container[0].getBoundingClientRect().right) / 2;
                                                        }
                                                        else
                                                        {
                                                            // Terrible fallback
                                                            p.pager.content_container[0].scrollLeft = (((pinchOffsetX * pinchRelativeScale)) - (($this.content_container.getWidth() / 2))) - $this.current_padding;
                                                            p.pager.content_container[0].scrollTop = (((pinchOffsetY * pinchRelativeScale)) - (($this.content_container.getHeight() / 2))) - $this.current_padding;
                                                        }
                                                    }
                                                }
                                                );
                                            }
                                    }
                                });

                            this.is_mobile = p.browser.isMobile;

                            p.e(document).on("keyup", function (e)
                            {
                                if (e.keyCode == 37) //left
                                {
                                    if (p.reader.settings.enable_keyboard_navigation)
                                    {
                                        if (p.pager.current_animator == null)
                                            p.pager.goBack();
                                        else
                                            p.pager.current_animator.doFullAnimationPrev();
                                    }
                                }

                                if (e.keyCode == 39) // right
                                {
                                    if (p.reader.settings.enable_keyboard_navigation)
                                    {
                                        if (p.pager.current_animator == null)
                                            p.pager.goForward();
                                        else
                                            p.pager.current_animator.doFullAnimationNext();
                                    }
                                }

                                if (e.keyCode == 107) // Plus +
                                {
                                    //p.reader.zoomIn();
                                }

                                if (e.keyCode == 109) // Minus -
                                {
                                    //p.reader.zoomOut();
                                }
                            });

                            var resizeTimeout = null;

                            p.pager.content_container.on("resize", function ()
                            {
                                clearTimeout(resizeTimeout);
                                resizeTimeout = setTimeout(function ()
                                {
                                    p.pager.invalidateContentContained();
                                    p.pager.adjust();
                                }, 50);

                            });
                            this.adjust();

                            var lastPageSize = null;
                            for (var i in this.pages)
                            {
                                if (lastPageSize != null)
                                    if (this.pages[i].ref_size.width != lastPageSize.width || this.pages[i].ref_size.height != lastPageSize.height)
                                    {
                                        this.pages_uniform = false;
                                        break;
                                    }

                                lastPageSize = this.pages[i].ref_size;
                            }

                            //this.fixPageNumber(e);
                            this.ready_for_first_load = true;

                            this.current_page = p.reader.settings.start_page;
                            this.goToPage(this.current_page);

                        }
                    },

                    setAnimation: function (e, callback)
                    {
                        var $this = p.pager, CONST = $this.constant;

                        if (!$this.pages_uniform || $this.is_mobile)
                            e = CONST.NONE;

                        p.pager.page_container.removeClass("flip fade swipe");

                        switch ($this.current_animation)
                        {
                            case CONST.FLIP:
                                p.flip_animator.destruct();
                                break;

                            case CONST.FADE:

                                break;

                            case CONST.SWIPE:
                                p.swipe_animator.destruct();

                                break;
                        }

                        $this.current_animator = null;

                        switch (e)
                        {
                            case CONST.FLIP:
                                $this.current_animation = CONST.FLIP;
                                p.reader.settings.preload = true;
                                p.flip_animator.init();
                                p.pager.page_container.addClass("flip");
                                $this.current_animator = p.flip_animator;
                                break;

                            case CONST.FADE:
                                $this.current_animation = CONST.FADE;
                                p.reader.settings.preload = true;
                                p.pager.page_container.addClass("fade");

                                break;

                            case CONST.SWIPE:
                                $this.current_animation = CONST.SWIPE;
                                p.reader.settings.preload = true;
                                p.swipe_animator.init();
                                p.pager.page_container.addClass("swipe");
                                $this.current_animator = p.swipe_animator;
                                break;

                            default:
                                $this.current_animation = CONST.NONE;
                                break;
                        }

                        $this.adjust({ reload: true, callback: callback });
                    },

                    setZoom: function (e, dontFlipAutozoom)
                    {
                        var clampedZoom = Math.min(p.reader.settings.zoom_max, Math.max(p.reader.settings.zoom_min == "auto" ? this.last_autozoom : p.reader.settings.zoom_min, e));

                        this.current_zoom = clampedZoom;
                        p.PDFManager.scale = clampedZoom;

                        if (!dontFlipAutozoom)
                            this.current_autozoom = false;

                        this.invalidateContentContained();
                    },
                    adjust: function (options)
                    {
                        var $this = p.pager,
                            CONST = $this.constant,
                            callback = options ? options.callback : null,
                            reload = options ? options.reload : false;

                        //if ($this.current_animation == CONST.FLIP)
                        //{
                        //    $this.page_container.addClass("effect3d");
                        //}
                        //else
                        //{
                        //    $this.page_container.removeClass("effect3d");
                        //}

                        if (!$this.current_mode_manual)
                        {
                            var calculatedMode = -1;

                            if (p.reader.container.getWidth() > p.reader.container.getHeight())
                                calculatedMode = CONST.DOUBLE;
                            else
                                calculatedMode = CONST.SINGLE;

                            if (calculatedMode != -1 && calculatedMode != $this.current_mode)
                            {
                                //console.log("Switching modes");
                                $this.current_mode = calculatedMode;

                                reload = true;
                            }
                        }

                        if ($this.current_mode == CONST.SINGLE && $this.current_page == 0)
                            $this.current_page = 1;

                        if (!$this.current_renderer_manual)
                        {
                            var calculatedRenderer = -1;
                            if ($this.is_mobile || p.reader.settings.no_pdf)
                            {
                                calculatedRenderer = CONST.IMG;
                            }
                            else if (!p.browser.isMobile && $this.pdf_enabled && $this.pdf_loaded)
                            {
                                calculatedRenderer = CONST.PDF;
                            }
                            else if (!p.browser.isMobile && !$this.pdf_enabled && !$this.pdf_checking && !$this.pdf_preparing)
                            {
                                $this.preparePdf();
                            }

                            if (calculatedRenderer != -1 && calculatedRenderer != $this.current_renderer)
                            {
                                //console.log("Switching Renderers");
                                $this.current_renderer = calculatedRenderer;
                                reload = true;
                            }
                        }

                        if ($this.current_autozoom)
                        {
                            var calculatedZoom = $this.calculateAutozoom();
                            if (calculatedZoom != $this.current_zoom)
                            {
                                //console.log("Switching Zoom");
                                $this.setZoom(calculatedZoom, true);
                                reload = true;
                            }
                        }

                        if (reload)
                        {
                            $this.prepareElements();
                            if (options && options.scroll)
                            {
                                p.pager.content_container[0].scrollLeft = options.scroll.left;
                                p.pager.content_container[0].scrollTop = options.scroll.top;
                            }
                            $this.goToPage($this.current_page, callback, options);
                        }
                    },

                    calculateAutozoom: function ()
                    {
                        var $this = p.pager,
                            CONST = $this.constant,
                            pageSize = $this.getPageSize($this.current_page_firstvalid, true),
                            available_space = {
                                width: p.pager.content_container.getWidth() - ($this.current_padding * 2),
                                height: p.pager.content_container.getHeight() - ($this.current_padding * 2)
                            },
                        required_space = {
                            width: (($this.current_mode == CONST.DOUBLE || $this.current_mode == CONST.DOUBLE_REVERSE) ? (pageSize.width * 2) : (pageSize.width)),
                            height: pageSize.height
                        };

                        var scaleWidth = available_space.width / required_space.width,
                            scaleHeight = available_space.height / required_space.height;

                        //console.log("Scales", scaleWidth, scaleHeight, "Out scale:", scaleWidth > scaleHeight ? scaleHeight : scaleWidth);
                        $this.last_autozoom = scaleWidth > scaleHeight ? scaleHeight : scaleWidth;
                        return $this.last_autozoom;
                    },

                    getFileName: function (page)
                    {
                        return page; //p.md5("ECB042F43mynameismarypoppins" + page).toUpperCase();
                    },
                    getFullPath: function (page)
                    {
                        return p.reader.path + "/images/" + this.getFileName(page) + ".jpg";
                    },
                    getThumbPath: function (page)
                    {
                        return p.reader.path + "/thumbs/" + this.getFileName(page) + ".jpg";
                    },
                    getPDFPath: function ()
                    {
                        return p.reader.path + "/pdf/" + this.getFileName("full") + ".pdf";
                    },
                    getPageSize: function (page, raw)
                    {
                        if (this.pages[page])
                        {
                            if (raw)
                                return { width: this.pages[page].ref_size.width, height: this.pages[page].ref_size.height };

                            return { width: this.pages[page].ref_size.width * this.current_zoom, height: this.pages[page].ref_size.height * this.current_zoom };
                        }

                        return { width: 0, height: 0 };
                    },


                    prepareElements: function ()
                    {
                        var i, CONST = this.constant;
                        //this.page_container.setAttr("style", "padding: {0}px;".format(this.current_padding));

                        if (this.holders.length == 0)
                        {
                            var initialPageSize = this.getPageSize(1);
                            for (i = 0; i < 6; i++)
                            {
                                this.holders[i] = p.e("<div>", { "class": "page" }).appendTo(this.page_container);
                                var wrapper = p.e("<div>", { "class": "wrapper" }).appendTo(this.holders[i]);

                                this.loaders[i] = p.reader.stageLoader().appendTo(wrapper);
                                p.e("<canvas>", { "class": "loading" }).appendTo(wrapper);

                                this.holders[i].setAttr("style", "width: {0}px; height: {1}px;".format(initialPageSize.width, initialPageSize.height));
                            }
                        }

                        if (this.current_mode == CONST.SINGLE || this.current_mode == CONST.SINGLE_REVERSE)
                        {
                            this.page_container.addClass("single").removeClass("double");
                            for (i = 0; i < 6; i++)
                            {
                                this.holders[i].removeClass("previous next left right");

                                if (i == CONST.CUR)
                                    this.holders[i].removeClass("hidden previous next");
                                else if (i == CONST.PREV)
                                    this.holders[i].removeClass("next").addClass("hidden previous");
                                else if (i == CONST.NEXT)
                                    this.holders[i].removeClass("previous").addClass("hidden next");
                                else
                                    this.holders[i].addClass("hidden").removeClass("previous next");
                            }
                        }
                        else if (this.current_mode == CONST.DOUBLE || this.current_mode == CONST.DOUBLE_REVERSE)
                        {
                            this.page_container.addClass("double").removeClass("single");
                            for (i = 0; i < 6; i++)
                            {
                                if (i == CONST.CUR_LEFT || i == CONST.CUR_RIGHT)
                                    this.holders[i].removeClass("previous next");
                                else if (i == CONST.PREV_LEFT || i == CONST.PREV_RIGHT)
                                    this.holders[i].removeClass("next").addClass("previous");
                                else if (i == CONST.NEXT_LEFT || i == CONST.NEXT_RIGHT)
                                    this.holders[i].removeClass("previous").addClass("next");

                                if ((i == CONST.CUR_LEFT /*|| i == CONST.PREV_LEFT || i == CONST.NEXT_LEFT*/) && this.show_page_left)
                                    this.holders[i].removeClass("hidden");
                                else if ((i == CONST.CUR_RIGHT /*|| i == CONST.PREV_RIGHT || i == CONST.NEXT_RIGHT*/) && this.show_page_right)
                                    this.holders[i].removeClass("hidden");
                                else
                                    this.holders[i].addClass("hidden");



                                if (i == CONST.CUR_LEFT || i == CONST.PREV_LEFT || i == CONST.NEXT_LEFT)
                                    this.holders[i].addClass("left").removeClass("right");
                                else if (i == CONST.CUR_RIGHT || i == CONST.PREV_RIGHT || i == CONST.NEXT_RIGHT)
                                    this.holders[i].addClass("right").removeClass("left");
                                else
                                    this.holders[i].removeClass("left right");


                                /////////
                                //if (i == CONST.CUR_LEFT && this.show_page_left || i == CONST.CUR_RIGHT && this.show_page_right)
                                //{
                                //    this.holders[i].removeClass("hidden");
                                //    if (i == CONST.CUR_LEFT)
                                //        this.holders[i].addClass("left");
                                //    else
                                //        this.holders[i].addClass("right");
                                //}
                                //else
                                //    this.holders[i].addClass("hidden");
                            }
                        }
                    },
                    preparePdf: function ()
                    {
                        if (!this.pdf_checked && !this.pdf_checking)
                        {
                            this.pdf_checking = true;
                            p.net.request(this.getPDFPath(),
                                {
                                    method: "HEAD",
                                    finished: function (success, data)
                                    {
                                        p.pager.pdf_exists = success;
                                        p.pager.pdf_checked = true;
                                        p.pager.pdf_checking = false;

                                        if (success)
                                        {
                                            p.pager.pdf_preparing = true;
                                            p.pager.preparePdfJs();
                                        }
                                        else
                                        {
                                            p.pager.pdf_preparing = false;
                                            p.reader.setProgress("error");
                                        }
                                    }
                                });
                        }
                    },
                    preparePdfJs: function ()
                    {
                        var scriptTags = p.e("script");
                        var currentScript = null;
                        scriptTags.each(function ()
                        {
                            if (this.src.contains("magalone."))
                            {
                                currentScript = this.src;
                                return false;
                            }
                        });

                        if (currentScript != null)
                        {
                            p.pager.current_script = currentScript;

                            p.pager.loadPdfJsCompat(function ()
                            {
                                p.pager.loadPdfJsMain(function ()
                                {
                                    p.pager.pdf_preparing = false;
                                    p.pager.pdf_enabled = true;
                                    p.PDFManager.setOnDocumentLoadHandler(p.pager.pdfJsOnLoad);
                                    p.PDFManager.setOnDocumentProgressHandler(p.pager.pdfJsOnProgress);
                                    p.PDFManager.setOnPageLoadHandler(p.pager.pdfJsOnPage);
                                    p.PDFManager.setOnPageRenderHandler(p.pager.pdfJsOnRender);
                                    p.PDFManager.loadFile(p.pager.getPDFPath());
                                });
                            });
                        }
                    },

                    loadPdfJsCompat: function (callback)
                    {
                        var currentPath = p.pager.current_script.substr(0, p.pager.current_script.lastIndexOf("/"));
                        var pdfJsPath = currentPath + "/pdfjs/compatibility" + (p.pager.current_script.contains(".min") ? ".min" : "") + ".js";

                        var pdfJsScriptElement = document.createElement("script");
                        var pdfJsLoaded = false;
                        pdfJsScriptElement.onload = function ()
                        {
                            if (!pdfJsLoaded)
                            {
                                callback();
                            }

                            pdfJsLoaded = true;
                        };
                        pdfJsScriptElement.setAttribute("src", pdfJsPath);
                        document.getElementsByTagName('head')[0].appendChild(pdfJsScriptElement);
                    },
                    loadPdfJsMain: function (callback)
                    {
                        var currentPath = p.pager.current_script.substr(0, p.pager.current_script.lastIndexOf("/"));
                        var pdfJsPath = currentPath + "/pdfjs/pdf" + (p.pager.current_script.contains(".min") ? ".min" : "") + ".js";

                        var pdfJsScriptElement = document.createElement("script");
                        var pdfJsLoaded = false;
                        pdfJsScriptElement.onload = function ()
                        {
                            if (!pdfJsLoaded)
                            {
                                callback();
                            }

                            pdfJsLoaded = true;
                        };
                        pdfJsScriptElement.setAttribute("src", pdfJsPath);
                        document.getElementsByTagName('head')[0].appendChild(pdfJsScriptElement);
                    },

                    goBack: function (callback, onReady)
                    {
                        var $this = p.pager, CONST = $this.constant;

                        switch ($this.current_mode)
                        {
                            case CONST.SINGLE:
                                if ($this.current_page <= 1)
                                    return;

                                $this.current_page--;
                                break;
                            case CONST.SINGLE_REVERSE:
                                break;

                            case CONST.DOUBLE:
                                if ($this.current_page == 0)
                                    return;

                                $this.current_page -= 2;
                                break;
                            case CONST.DOUBLE_REVERSE:
                                break;
                        }

                        $this.goToPage($this.current_page, callback, { onReady: onReady });
                    },
                    goForward: function (callback, onReady)
                    {
                        var $this = p.pager, CONST = $this.constant;

                        switch ($this.current_mode)
                        {
                            case CONST.SINGLE:
                                if ($this.current_page >= $this.page_count)
                                    return;

                                $this.current_page++;
                                break;
                            case CONST.SINGLE_REVERSE:
                                break;

                            case CONST.DOUBLE:
                                if ($this.current_page_left >= $this.page_count || $this.current_page_right >= $this.page_count)
                                    return;

                                $this.current_page += 2;
                                break;
                            case CONST.DOUBLE_REVERSE:
                                break;
                        }

                        $this.goToPage($this.current_page, callback, { onReady: onReady });
                    },

                    /// Rendering
                    goToPage: function (e, callback, options)
                    {
                        var CONST = this.constant;
                        p.reader.overview.scrollToCurrentPage();
                        this.renderStop();
                        //console.trace("Render", callback, options);
                        //debugger;
                        if (this.current_mode == CONST.SINGLE || this.current_mode == CONST.SINGLE_REVERSE)
                        {
                            this.renderSingle(callback, options);

                            if (p.reader.settings.enable_arrows)
                            {
                                if (this.current_page <= 1)
                                    p.e(".ctrl.btn.go-back").addClass("gone");
                                else
                                    p.e(".ctrl.btn.go-back").removeClass("gone");

                                if (this.current_page >= this.page_count)
                                    p.e(".ctrl.btn.go-fwd").addClass("gone");
                                else
                                    p.e(".ctrl.btn.go-fwd").removeClass("gone");
                            }

                        }
                        else if (this.current_mode == CONST.DOUBLE)
                        {
                            this.renderDouble(callback, options);
                            if (p.reader.settings.enable_arrows)
                            {
                                if (this.current_page_left == 0)
                                    p.e(".ctrl.btn.go-back").addClass("gone");
                                else
                                    p.e(".ctrl.btn.go-back").removeClass("gone");

                                if (this.current_page_left == this.page_count || this.current_page_right == this.page_count)
                                    p.e(".ctrl.btn.go-fwd").addClass("gone");
                                else
                                    p.e(".ctrl.btn.go-fwd").removeClass("gone");
                            }
                        }
                        p.overlays.render();
                    },

                    checkAndCallback: function checkAndCallback(cb)
                    {
                        if (cb && p.is.function(cb))
                        {
                            //console.trace("Calling");
                            cb();
                        } else
                        {
                            //console.trace("Not Calling");
                        }

                    },

                    renderStop: function ()
                    {
                        p.PDFQueue.reset();
                        clearTimeout(this.renderTimeout);
                    },
                    renderInstance: 0,
                    renderTimeout: null,
                    renderWaitingTime: 2000,
                    renderSingleSelf: function RENDERER_SinglePage_GenerateSelfVariables(callback)
                    {
                        var self = {};
                        self.callback = callback,
                        self.this = p.pager,
                        self.iid = ++self.this.renderInstance,
                        self.CONST = self.this.constant,
                        self.scrollPerformed = false,
                        self.cur = self.this.current_page_firstvalid,
                        self.next = self.this.current_page_firstvalid + 1,
                        self.prev = self.this.current_page_firstvalid - 1,
                        self.pageSize = self.this.getPageSize(self.cur),
                        self.pageSizeNext = self.this.getPageSize(self.next),
                        self.pageSizePrev = self.this.getPageSize(self.prev),
                        self.canvas = self.this.holders[self.CONST.CUR].find("canvas"),
                        self.canvasNext = self.this.holders[self.CONST.NEXT].find("canvas"),
                        self.canvasPrev = self.this.holders[self.CONST.PREV].find("canvas"),
                        self.containerWidth = self.pageSize.width + self.this.current_padding * 2,
                        self.containerHeight = self.pageSize.height + self.this.current_padding * 2,
                        self.readjust = (Math.round(self.containerHeight) != Math.round(self.this.page_container.getHeight()) || Math.round(self.containerWidth) != Math.round(self.this.page_container.getWidth()));
                        return self;
                    },
                    renderSingle: function RENDERER_SinglePage_Main(callback, options)
                    {
                        var self = p.pager.renderSingleSelf(callback);
                        if (self.readjust && options && options.adjusted)
                            self.readjust = false;
                        if (self.readjust)
                        {
                            self.this.page_container.setAttr("style", "padding: {0}px; width: {1}px; height: {2}px;".format(
                                self.this.current_padding,
                                self.containerWidth,
                                self.containerHeight));

                            if (options && options.scroll && self.scrollPerformed == false)
                            {
                                self.scrollPerformed = true;
                                p.pager.content_container[0].scrollLeft = options.scroll.left;
                                p.pager.content_container[0].scrollTop = options.scroll.top;
                            }

                            var fixedoptions = p.is.object(options) ? options : {};
                            p.extend(fixedoptions, { reload: true, callback: callback, adjusted: true });
                            return setTimeout(function () { p.pager.adjust(fixedoptions); }, 1);
                        }

                        var onRenderedPerformed = false, onReadyPerformed = false;

                        var onRendered = function RENDERER_SinglePage_Main_onRenderedCallback()
                        {
                            if (!onRenderedPerformed)
                            {
                                onRenderedPerformed = true;

                                if (self.this.ready_for_first_load && !self.this.first_load_done)
                                    self.this.onFirstLoad();

                                self.this.checkAndCallback(self.callback);
                                setTimeout(function ()
                                {
                                    self.this.prerenderSingleClean(self);
                                }, 100);
                            }
                        };
                        var onReady = function RENDERER_SinglePage_Main_onReadyCallback()
                        {
                            if (!onReadyPerformed && !onRenderedPerformed)
                            {
                                onReadyPerformed = true;

                                if (options && options.scroll && self.scrollPerformed == false)
                                {
                                    self.scrollPerformed = true;
                                    p.pager.content_container[0].scrollLeft = options.scroll.left;
                                    p.pager.content_container[0].scrollTop = options.scroll.top;
                                }

                                //self.this.prepareElements();
                                setTimeout(function ()
                                {
                                    if (options && options.onReady && p.is.function(options.onReady))
                                        options.onReady();
                                    self.this.prerenderSingleDirty(self);
                                }, 100);
                            }
                        };

                        if (self.this.current_renderer == self.CONST.IMG)
                        {
                            self.this.renderSingleImg(self, onReady, onRendered, options);
                        }
                        else if (self.this.current_renderer == self.CONST.PDF)
                        {
                            self.canvas.addClass("loading");
                            self.this.renderSinglePdf(self, onReady, onRendered, options);
                        }
                    },
                    renderSingleImg: function RENDERER_SinglePage_Image(self, onReady, onFinished, options)
                    {
                        var readyPerformed = false, finalPerformed = false;
                        self.this.holders[self.CONST.CUR].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSize.width, self.pageSize.height));
                        self.this.loaders[self.CONST.CUR].setAttr("style", "");
                        self.this.loaders[self.CONST.CUR].load([self.this.getThumbPath(self.cur)],
                            function RENDERER_SinglePage_Image_ReadyRender()
                            {
                                if (!readyPerformed)
                                {
                                    readyPerformed = true;
                                    self.this.checkAndCallback(onReady);

                                    setTimeout(function ()
                                    {
                                        self.this.loaders[self.CONST.CUR].load([self.this.getThumbPath(self.cur), self.this.getFullPath(self.cur)],
                                        function RENDERER_SinglePage_Image_FinalRender()
                                        {
                                            if (!finalPerformed)
                                            {
                                                finalPerformed = true;
                                                self.this.checkAndCallback(onFinished);
                                            }
                                        });
                                    }, 1);
                                }
                            }, true);
                    },
                    renderSinglePdf: function RENDERER_SinglePage_PDF(self, onReady, onFinished, options)
                    {
                        var readyPerformed = false, finalPerformed = false;
                        self.this.loaders[self.CONST.CUR].setAttr("style", "");
                        self.this.loaders[self.CONST.CUR].load([self.this.getFullPath(self.cur)],
                            function RENDERER_SinglePage_PDF_ReadyRender()
                            {
                                self.this.holders[self.CONST.CUR].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSize.width, self.pageSize.height));
                                if (!readyPerformed)
                                {
                                    readyPerformed = true;
                                    self.this.checkAndCallback(onReady);
                                    self.this.checkAndCallback(onFinished);

                                    self.this.renderTimeout = setTimeout(function ()
                                    {
                                        p.PDFQueue.push(self.canvas, self.cur, function RENDERER_SinglePage_PDF_FinalRender()
                                        {
                                            if (!finalPerformed)
                                            {
                                                finalPerformed = true;
                                                self.canvas.removeClass("loading");
                                                //self.this.checkAndCallback(onFinished);
                                            }
                                        });
                                        p.PDFQueue.start();
                                    }, self.this.renderWaitingTime);
                                }
                            }, true);
                    },
                    prerenderSingleDirty: function RENDERER_SinglePage_Prerender_Dirty(self, callback)
                    {
                        self.this.holders[self.CONST.NEXT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNext.width, self.pageSizeNext.height));
                        self.this.holders[self.CONST.PREV].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrev.width, self.pageSizePrev.height));
                        p.e([self.canvasNext, self.canvasPrev]).addClass("loading");

                        var counter = 0;
                        var target = self.this.showPage(self.next) + self.this.showPage(self.prev);
                        var waitAndCallback = function RENDERER_SinglePage_Prerender_Dirty_Waiter()
                        {
                            if (++counter == target)
                                self.this.checkAndCallback(callback);
                        };

                        if (self.this.showPage(self.next))
                            self.this.loaders[self.CONST.NEXT].load([self.this.getThumbPath(self.next)], waitAndCallback);
                        if (self.this.showPage(self.prev))
                            self.this.loaders[self.CONST.PREV].load([self.this.getThumbPath(self.prev)], waitAndCallback);
                    },
                    prerenderSingleClean: function RENDERER_SinglePage_Prerender_Clean(self, callback)
                    {
                        self.this.holders[self.CONST.NEXT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNext.width, self.pageSizeNext.height));
                        self.this.holders[self.CONST.PREV].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrev.width, self.pageSizePrev.height));
                        p.e([self.canvasNext, self.canvasPrev]).addClass("loading");

                        var counter = 0;
                        var target = self.this.showPage(self.next) + self.this.showPage(self.prev);
                        var waitAndCallback = function RENDERER_SinglePage_Prerender_Clean_Waiter()
                        {
                            if (++counter == target)
                                self.this.checkAndCallback(callback);
                        };

                        //if (self.this.current_renderer == self.CONST.IMG)
                        //{
                        if (self.this.showPage(self.next))
                            self.this.loaders[self.CONST.NEXT].load([self.this.getThumbPath(self.next), self.this.getFullPath(self.next)], waitAndCallback);
                        if (self.this.showPage(self.prev))
                            self.this.loaders[self.CONST.PREV].load([self.this.getThumbPath(self.prev), self.this.getFullPath(self.prev)], waitAndCallback);
                        //}
                        //else if (self.this.current_renderer == self.CONST.PDF)
                        //{
                        //    if (self.this.showPage(self.next))
                        //        p.PDFQueue.push(self.canvasNext, self.next, function RENDERER_SinglePage_Prerender_Clean_PDFNext_Done() { self.canvasNext.removeClass("loading"), waitAndCallback(); }, true);
                        //    if (self.this.showPage(self.prev))
                        //        p.PDFQueue.push(self.canvasPrev, self.prev, function RENDERER_SinglePage_Prerender_Clean_PDFPrev_Done() { self.canvasPrev.removeClass("loading"), waitAndCallback(); }, true);
                        //    p.PDFQueue.start();
                        //}
                    },


                    renderDoubleSelf: function RENDERER_DoublePage_GenerateSelfVariables(callback)
                    {
                        var self = {};
                        self.callback = callback,
                        self.this = p.pager,
                        self.iid = ++self.this.renderInstance,
                        self.CONST = self.this.constant,
                        self.scrollPerformed = false,
                        self.pageSizeLeft = self.this.getPageSize(self.this.current_page_left),
                        self.pageSizeRight = self.this.getPageSize(self.this.current_page_right),
                        self.pageSizePrevLeft = self.this.getPageSize(self.this.current_page_left - 2),
                        self.pageSizePrevRight = self.this.getPageSize(self.this.current_page_right - 2),
                        self.pageSizeNextLeft = self.this.getPageSize(self.this.current_page_left + 2),
                        self.pageSizeNextRight = self.this.getPageSize(self.this.current_page_right + 2),
                        self.canvasLeft = self.this.holders[self.CONST.CUR_LEFT].find("canvas"),
                        self.canvasRight = self.this.holders[self.CONST.CUR_RIGHT].find("canvas"),
                        self.canvasNextLeft = self.this.holders[self.CONST.NEXT_LEFT].find("canvas"),
                        self.canvasNextRight = self.this.holders[self.CONST.NEXT_RIGHT].find("canvas"),
                        self.canvasPrevLeft = self.this.holders[self.CONST.PREV_LEFT].find("canvas"),
                        self.canvasPrevRight = self.this.holders[self.CONST.PREV_RIGHT].find("canvas"),
                        self.left = self.this.current_page_left,
                        self.right = self.this.current_page_right,
                        self.nextLeft = self.this.current_page_left + 2,
                        self.nextRight = self.this.current_page_right + 2,
                        self.prevLeft = self.this.current_page_left - 2,
                        self.prevRight = self.this.current_page_right - 2,
                        self.containerWidth = ((self.pageSizeLeft.width > self.pageSizeRight.width) ? (self.pageSizeLeft.width * 2) : (self.pageSizeRight.width * 2)) + (self.this.current_padding * 2),
                        self.containerHeight = ((self.pageSizeLeft.height > self.pageSizeRight.height) ? self.pageSizeLeft.height : self.pageSizeRight.height) + (self.this.current_padding * 2),
                        self.readjust = (Math.round(self.containerHeight) != Math.round(self.this.page_container.getHeight()) || Math.round(self.containerWidth) != Math.round(self.this.page_container.getWidth()));

                        //console.log(self.containerHeight, self.this.page_container.getHeight(), self.containerWidth, self.this.page_container.getWidth());
                        return self;
                    },
                    renderDouble: function RENDERER_DoublePage_Main(callback, options)
                    {
                        var self = p.pager.renderDoubleSelf(callback);

                        if (self.readjust && options && options.adjusted)
                            self.readjust = false;

                        if (self.readjust)
                        {
                            self.this.page_container.setAttr("style", "padding: {0}px; width: {1}px; height: {2}px;".format(
                                self.this.current_padding,
                                self.containerWidth,
                                self.containerHeight));

                            if (options && options.scroll && self.scrollPerformed == false)
                            {
                                self.scrollPerformed = true;
                                p.pager.content_container[0].scrollLeft = options.scroll.left;
                                p.pager.content_container[0].scrollTop = options.scroll.top;
                            }

                            var fixedoptions = p.is.object(options) ? options : {};
                            p.extend(fixedoptions, { reload: true, callback: callback, adjusted: true });
                            return setTimeout(function () { p.pager.adjust(fixedoptions); }, 1);
                        }

                        var onRenderedPerformed = false, onReadyPerformed = false;

                        var onRendered = function RENDERER_DoublePage_Main_onRenderedCallback()
                        {
                            if (!onRenderedPerformed)
                            {
                                onRenderedPerformed = true;

                                if (self.this.ready_for_first_load && !self.this.first_load_done)
                                    self.this.onFirstLoad();

                                self.this.checkAndCallback(self.callback);
                                setTimeout(function ()
                                {
                                    self.this.prerenderDoubleClean(self);
                                }, 100);
                            }
                        };
                        var onReady = function RENDERER_DoublePage_Main_onReadyCallback()
                        {
                            if (!onReadyPerformed && !onRenderedPerformed)
                            {
                                onReadyPerformed = true;

                                if (options && options.scroll && self.scrollPerformed == false)
                                {
                                    self.scrollPerformed = true;
                                    p.pager.content_container[0].scrollLeft = options.scroll.left;
                                    p.pager.content_container[0].scrollTop = options.scroll.top;
                                }

                                //self.this.prepareElements();
                                setTimeout(function ()
                                {
                                    if (options && options.onReady && p.is.function(options.onReady))
                                        options.onReady();
                                    self.this.prerenderDoubleDirty(self);
                                }, 100);
                            }
                        };

                        if (self.this.current_renderer == self.CONST.IMG)
                        {
                            self.this.renderDoubleImg(self, onReady, onRendered, options);
                        }
                        else if (self.this.current_renderer == self.CONST.PDF)
                        {
                            p.e([self.canvasLeft, self.canvasRight, self.canvasNextLeft, self.canvasNextRight, self.canvasPrevLeft, self.canvasPrevRight]).addClass("loading");
                            self.this.renderDoublePdf(self, onReady, onRendered, options);
                        }
                    },
                    renderDoubleImg: function RENDERER_DoublePage_Image(self, onReady, onFinished, options)
                    {
                        var readyPerformed = false,
                            finalPerformed = false,
                            targetReady = self.this.showPage(self.left) + self.this.showPage(self.right),
                            counterReady = 0,
                            targetFinish = targetReady,
                            counterFinish = 0;
                        var waitReady = function RENDERER_DoublePage_Image_Ready_Waiter()
                        {
                            if (++counterReady == targetReady)
                            {
                                readyPerformed = true;
                                self.this.checkAndCallback(onReady);
                            }
                        };
                        var waitFinish = function RENDERER_DoublePage_Image_Finish_Waiter()
                        {
                            if (++counterFinish == targetFinish)
                            {
                                finalPerformed = true;
                                self.this.checkAndCallback(onFinished);
                            }
                        };
                        var performFinalRender = function ()
                        {
                            setTimeout(function ()
                            {
                                if (self.this.show_page_left)
                                {
                                    self.this.loaders[self.CONST.CUR_LEFT].load([self.this.getThumbPath(self.left), self.this.getFullPath(self.left)],
                                    function RENDERER_DoublePage_Image_FinalRender_Left()
                                    {
                                        if (!finalPerformed)
                                        {
                                            waitFinish();
                                        }
                                    });
                                }
                                if (self.this.show_page_right)
                                {
                                    self.this.loaders[self.CONST.CUR_RIGHT].load([self.this.getThumbPath(self.right), self.this.getFullPath(self.right)],
                                    function RENDERER_DoublePage_Image_FinalRender_Right()
                                    {
                                        if (!finalPerformed)
                                        {
                                            waitFinish();
                                        }
                                    });
                                }
                            }, 1);
                        };


                        if (self.this.show_page_left)
                        {
                            self.this.holders[self.CONST.CUR_LEFT].removeClass("hidden");
                            self.this.holders[self.CONST.CUR_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeLeft.width, self.pageSizeLeft.height));
                            self.this.loaders[self.CONST.CUR_LEFT].setAttr("style", "");
                            self.this.loaders[self.CONST.CUR_LEFT].load([self.this.getThumbPath(self.left)],
                                function RENDERER_DoublePage_Image_ReadyRender()
                                {
                                    if (!readyPerformed)
                                    {
                                        waitReady();

                                        if (readyPerformed)
                                        {
                                            performFinalRender();
                                        }
                                    }
                                }, true);
                        }
                        else
                        {
                            self.this.holders[self.CONST.CUR_LEFT].addClass("hidden");
                        }
                        if (self.this.show_page_right)
                        {
                            self.this.holders[self.CONST.CUR_RIGHT].removeClass("hidden");
                            self.this.holders[self.CONST.CUR_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeRight.width, self.pageSizeRight.height));
                            self.this.loaders[self.CONST.CUR_RIGHT].setAttr("style", "");
                            self.this.loaders[self.CONST.CUR_RIGHT].load([self.this.getThumbPath(self.right)],
                                function RENDERER_DoublePage_Image_ReadyRender()
                                {
                                    if (!readyPerformed)
                                    {
                                        waitReady();

                                        if (readyPerformed)
                                        {
                                            performFinalRender();
                                        }
                                    }
                                }, true);
                        }
                        else
                        {
                            self.this.holders[self.CONST.CUR_RIGHT].addClass("hidden");
                        }
                    },
                    renderDoublePdf: function RENDERER_DoublePage_PDF(self, onReady, onFinished, options)
                    {
                        var readyPerformed = false,
                            hiresPerformed = false,
                            finalPerformed = false,
                            targetReady = self.this.showPage(self.left) + self.this.showPage(self.right),
                            targetFinish = targetReady,
                            counterReady = 0,
                            counterFinish = 0;
                        var waitReady = function RENDERER_DoublePage_PDF_Ready_Waiter()
                        {
                            if (++counterReady == targetReady)
                            {
                                readyPerformed = true;
                                self.this.checkAndCallback(onReady);
                                self.this.checkAndCallback(onFinished);
                            }
                        };
                        var waitFinish = function RENDERER_DoublePage_PDF_Finish_Waiter()
                        {
                            if (++counterFinish == targetFinish)
                            {
                                finalPerformed = true;
                                //self.this.checkAndCallback(onFinished);
                            }
                        };

                        var performFinalRender = function ()
                        {
                            self.this.renderTimeout = setTimeout(function ()
                            {
                                if (self.this.show_page_left)
                                {
                                    p.PDFQueue.push(self.canvasLeft, self.left, function RENDERER_DoublePage_PDF_FinalRender_Left()
                                    {
                                        self.canvasLeft.removeClass("loading");
                                        if (!finalPerformed)
                                        {
                                            waitFinish();
                                        }
                                    });
                                }
                                if (self.this.show_page_right)
                                {
                                    p.PDFQueue.push(self.canvasRight, self.right, function RENDERER_DoublePage_PDF_FinalRender_Right()
                                    {
                                        self.canvasRight.removeClass("loading");
                                        if (!finalPerformed)
                                        {
                                            waitFinish();
                                        }
                                    });
                                }
                                p.PDFQueue.start();
                            }, self.this.renderWaitingTime);
                        };


                        if (self.this.show_page_left)
                        {
                            self.this.holders[self.CONST.CUR_LEFT].removeClass("hidden");
                            self.this.holders[self.CONST.CUR_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeLeft.width, self.pageSizeLeft.height));
                            self.this.loaders[self.CONST.CUR_LEFT].setAttr("style", "");
                            self.this.loaders[self.CONST.CUR_LEFT].load([self.this.getFullPath(self.left)],
                                function RENDERER_DoublePage_PDF_ReadyRender()
                                {
                                    if (!readyPerformed)
                                    {
                                        waitReady();

                                        if (readyPerformed)
                                        {
                                            performFinalRender();
                                        }
                                    }
                                }, true);
                        }
                        else
                        {
                            self.this.holders[self.CONST.CUR_LEFT].addClass("hidden");
                        }
                        if (self.this.show_page_right)
                        {
                            self.this.holders[self.CONST.CUR_RIGHT].removeClass("hidden");
                            self.this.holders[self.CONST.CUR_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeRight.width, self.pageSizeRight.height));
                            self.this.loaders[self.CONST.CUR_RIGHT].setAttr("style", "");
                            self.this.loaders[self.CONST.CUR_RIGHT].load([self.this.getFullPath(self.right)],
                                function RENDERER_DoublePage_PDF_ReadyRender()
                                {
                                    if (!readyPerformed)
                                    {
                                        waitReady();

                                        if (readyPerformed)
                                        {
                                            performFinalRender();
                                        }
                                    }
                                }, true);
                        }
                        else
                        {
                            self.this.holders[self.CONST.CUR_RIGHT].addClass("hidden");
                        }
                    },
                    prerenderDoubleDirty: function RENDERER_DoublePage_Prerender_Dirty(self, callback)
                    {
                        self.this.holders[self.CONST.NEXT_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNextLeft.width, self.pageSizeNextLeft.height));
                        self.this.holders[self.CONST.NEXT_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNextRight.width, self.pageSizeNextRight.height));

                        self.this.holders[self.CONST.PREV_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrevLeft.width, self.pageSizePrevLeft.height));
                        self.this.holders[self.CONST.PREV_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrevRight.width, self.pageSizePrevRight.height));

                        p.e([self.canvasNextLeft, self.canvasNextRight, self.canvasPrevLeft, self.canvasPrevRight]).addClass("loading");

                        var counter = 0;
                        var target = self.this.showPage(self.nextLeft) + self.this.showPage(self.nextRight) + self.this.showPage(self.prevLeft) + self.this.showPage(self.prevRight);
                        var waitAndCallback = function RENDERER_DoublePage_Prerender_Dirty_Waiter()
                        {
                            if (++counter == target)
                                self.this.checkAndCallback(callback);
                        };

                        if (self.this.showPage(self.nextLeft))
                        {
                            self.this.loaders[self.CONST.NEXT_LEFT].load([self.this.getThumbPath(self.nextLeft)], waitAndCallback);
                        }

                        if (self.this.showPage(self.nextRight))
                        {
                            self.this.loaders[self.CONST.NEXT_RIGHT].load([self.this.getThumbPath(self.nextRight)], waitAndCallback);
                        }

                        if (self.this.showPage(self.prevLeft))
                        {
                            self.this.loaders[self.CONST.PREV_LEFT].load([self.this.getThumbPath(self.prevLeft)], waitAndCallback);
                        }

                        if (self.this.showPage(self.prevRight))
                        {
                            self.this.loaders[self.CONST.PREV_RIGHT].load([self.this.getThumbPath(self.prevRight)], waitAndCallback);
                        }
                    },
                    prerenderDoubleClean: function RENDERER_DoublePage_Prerender_Clean(self, callback)
                    {
                        self.this.holders[self.CONST.NEXT_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNextLeft.width, self.pageSizeNextLeft.height));
                        self.this.holders[self.CONST.NEXT_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizeNextRight.width, self.pageSizeNextRight.height));

                        self.this.holders[self.CONST.PREV_LEFT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrevLeft.width, self.pageSizePrevLeft.height));
                        self.this.holders[self.CONST.PREV_RIGHT].setAttr("style", "width: {0}px; height: {1}px;".format(self.pageSizePrevRight.width, self.pageSizePrevRight.height));

                        p.e([self.canvasNextLeft, self.canvasNextRight, self.canvasPrevLeft, self.canvasPrevRight]).addClass("loading");

                        var counter = 0;
                        var target = self.this.showPage(self.nextLeft) + self.this.showPage(self.nextRight) + self.this.showPage(self.prevLeft) + self.this.showPage(self.prevRight);
                        var waitAndCallback = function RENDERER_DoublePage_Prerender_Clean_Waiter()
                        {
                            if (++counter == target)
                                self.this.checkAndCallback(callback);
                        };

                        //if (self.this.current_renderer == self.CONST.IMG)
                        //{
                        if (self.this.showPage(self.nextLeft))
                        {
                            self.this.loaders[self.CONST.NEXT_LEFT].load([self.this.getThumbPath(self.nextLeft), self.this.getFullPath(self.nextLeft)], waitAndCallback);
                        }

                        if (self.this.showPage(self.nextRight))
                        {
                            self.this.loaders[self.CONST.NEXT_RIGHT].load([self.this.getThumbPath(self.nextRight), self.this.getFullPath(self.nextRight)], waitAndCallback);
                        }

                        if (self.this.showPage(self.prevLeft))
                        {
                            self.this.loaders[self.CONST.PREV_LEFT].load([self.this.getThumbPath(self.prevLeft), self.this.getFullPath(self.prevLeft)], waitAndCallback);
                        }

                        if (self.this.showPage(self.prevRight))
                        {
                            self.this.loaders[self.CONST.PREV_RIGHT].load([self.this.getThumbPath(self.prevRight), self.this.getFullPath(self.prevRight)], waitAndCallback);
                        }
                        //}
                        //else if (self.this.current_renderer == self.CONST.PDF)
                        //{
                        //    if (self.this.showPage(self.nextLeft))
                        //        p.PDFQueue.push(self.canvasNextLeft, self.nextLeft, function RENDERER_DoublePage_Prerender_Clean_PDFNextLeft_Done() { self.canvasNextLeft.removeClass("loading"), waitAndCallback(); }, true);
                        //    if (self.this.showPage(self.nextRight))
                        //        p.PDFQueue.push(self.canvasNextRight, self.nextRight, function RENDERER_DoublePage_Prerender_Clean_PDFNextRight_Done() { self.canvasNextRight.removeClass("loading"), waitAndCallback(); }, true);

                        //    if (self.this.showPage(self.prevLeft))
                        //        p.PDFQueue.push(self.canvasPrevLeft, self.prevLeft, function RENDERER_DoublePage_Prerender_Clean_PDFPrevLeft_Done() { self.canvasPrevLeft.removeClass("loading"), waitAndCallback(); }, true);
                        //    if (self.this.showPage(self.prevRight))
                        //        p.PDFQueue.push(self.canvasPrevRight, self.prevRight, function RENDERER_DoublePage_Prerender_Clean_PDFPrevRight_Done() { self.canvasPrevRight.removeClass("loading"), waitAndCallback(); }, true);


                        //    p.PDFQueue.start();
                        //}
                    },

                    pdfJsOnLoad: function (e)
                    {
                        p.pager.pdf_loaded_load = true;

                        p.pager.pdf_loaded = p.pager.pdf_loaded_load && p.pager.pdf_loaded_progess;
                        if (p.pager.pdf_loaded)
                        {
                            p.pager.adjust();
                        }
                    },
                    pdfJsOnProgress: function (e)
                    {
                        var perc = p.math.Percentage.XofY(e.loaded, e.total);
                        p.reader.setProgress(perc);
                        if (perc >= 100)
                        {
                            p.pager.pdf_loaded_progess = true;

                            p.pager.pdf_loaded = p.pager.pdf_loaded_load && p.pager.pdf_loaded_progess;
                            if (p.pager.pdf_loaded)
                            {
                                p.pager.adjust();
                            }
                        }
                    },
                    pdfJsOnPage: function (e)
                    {
                        //console.log(e);
                    },
                    pdfJsOnRender: function (e)
                    {
                        //console.log(e);
                    },
                },

            TouchHandler: function (on, options)
            {
                var SWIPE_THRESHOLD = options.swipeThreshold || 125;
                var MOVE_THRESHOLD = options.moveThreshold || 10;
                var SWIPE_CANCEL = options.swipeCancel || 70;
                var DOUBLETAP_CANCEL = options.doubleTapCancel || 200;
                var WHEEL_CANCEL = options.wheelCancel || 500;
                var WHEEL_TICK = options.wheelTick || 1;
                var DIR_LEFT = 1;
                var DIR_RIGHT = -1;
                var PROPAGATE = true;

                var mStartPoint,
                    mEndPoint,
                    mLastTouch,
                    mIsTouch,
                    mDirection,
                    mDeviation,
                    mDistance,
                    mDragging,
                    mSwiping,
                    mPinching,
                    mWaitingForDoubleTap,
                    mDoubleTapTimeout,
                    mOptimized,
                    mZoomTimeout,
                    mZooming,
                    mCumulZoom = WHEEL_TICK,
                    mLastSrc;

                mOptimized = mPinching = mDragging = mSwiping = mZooming = false;

                var target = p.e(on);
                //console.log("Touch handler on", target);  

                var sign = function (e)
                {
                    return e < 0 ? -1 : 1;
                };

                var isContained = function ()
                {
                    //var res = target[0].scrollHeight <= target.getHeight() || target[0].scrollWidth <= target.getWidth();
                    //if (!res)
                    //    console.log(target[0].scrollHeight, target.getHeight(), target[0].scrollWidth, target.getWidth());
                    return target[0].scrollHeight <= target.getHeight() || target[0].scrollWidth <= target.getWidth();
                };

                var fncDoubleTapCheck = function (e)
                {
                    if (e.type == "mouseleave")
                        return;

                    var src = p.e(e.srcElement);
                    if (!src.getParents().hasClass("ctrl"))
                    {
                        if (mWaitingForDoubleTap)
                        {
                            mWaitingForDoubleTap = false;
                            clearTimeout(mDoubleTapTimeout);
                            if (src.getAttr("id") == mLastSrc.getAttr("id") && src.getAttr("class") == mLastSrc.getAttr("class"))
                            {
                                //debugger;
                                if (options.onDoubleTap && p.is.function(options.onDoubleTap))
                                {
                                    //debugger;
                                    options.onDoubleTap(fncGetPos(e) || mLastTouch || mStartPoint);
                                }
                            }
                        }
                        else
                        {
                            mWaitingForDoubleTap = true;
                            mLastSrc = src;
                            mDoubleTapTimeout = setTimeout(function () { mWaitingForDoubleTap = false; }, DOUBLETAP_CANCEL);
                        }
                    }
                };

                //var debugbox = p.e("<div>", { "class": "debugbox" });
                //debugbox.appendTo(p.reader.container);

                var fncGetPos = function (event)
                {
                    var offset = target.getPageXY();
                    if (event.type.startsWith("touch"))
                    {
                        if (event.touches.length == 1)
                        {
                            return { x: event.touches[0].pageX - offset.x, y: event.touches[0].pageY - offset.y };
                        }
                        else if (event.touches.length == 2)
                        {
                            var a = { x: event.touches[0].pageX - offset.x, y: event.touches[0].pageY - offset.y },
                                b = { x: event.touches[1].pageX - offset.x, y: event.touches[1].pageY - offset.y },
                                midpoint = p.math.Midpoint2D(a, b);

                            return { x: midpoint.x, y: midpoint.y, dist: p.math.Dist2D(a, b) };
                        }
                    }
                    else
                    {
                        return { x: event.pageX - offset.x, y: event.pageY - offset.y };
                    }
                };

                var fncOnDown = function (e)
                {
                    if (!p.e(e.srcElement).getParents().hasClass("ctrl"))
                    {
                        p.pager.content_container[0].focus();

                        if (e && e.preventDefault) e.preventDefault();
                        if (!PROPAGATE && e && e.stopPropagation) e.stopPropagation();

                        mIsTouch = e.type.startsWith("touch");

                        if (mIsTouch && e.touches.length >= 2)
                        {
                            mPinching = true;
                            mSwiping = mDragging = false;
                            mStartPoint = mLastTouch = fncGetPos(e);

                            if (options.onPinchStart && p.is.function(options.onPinchStart))
                            {
                                options.onPinchStart(mStartPoint);
                            }
                        }
                        else if (isContained())
                        {
                            mSwiping = true;
                            mStartPoint = fncGetPos(e);
                        }
                        else
                        {
                            mDragging = true;
                            mLastTouch = fncGetPos(e);
                        }
                    }
                };

                var fncOnMove = function (e)
                {
                    //console.info(e);

                    if (e && e.preventDefault) e.preventDefault();
                    if (!PROPAGATE && e && e.stopPropagation) e.stopPropagation();

                    if (!mOptimized)
                    {
                        target.addClass("speed");
                        mOptimized = true;
                    }

                    if (mPinching)
                    {
                        var current = fncGetPos(e);
                        var difference = current.dist - mStartPoint.dist;
                        var differenceChange = current.dist / mStartPoint.dist;

                        if (options.onPinch && p.is.function(options.onPinch))
                        {
                            options.onPinch(difference, differenceChange, current);
                        }
                    }
                    else if (!isContained() && mDragging)
                    {
                        var current = fncGetPos(e);
                        var difference =
                            {
                                x: mLastTouch.x - current.x,
                                y: mLastTouch.y - current.y
                            };


                        //console.log("scroll");

                        if (options.onDrag && p.is.function(options.onDrag))
                        {
                            options.onDrag(difference);
                        }
                        //mContent.scrollLeft(mContent.scrollLeft() + difference.x);
                        //mContent.scrollTop(mContent.scrollTop() + difference.y);

                        //console.info(difference);
                    }

                    if (mIsTouch || !isContained())
                        mLastTouch = fncGetPos(e);
                };

                var fncOnUp = function (e)
                {
                    //return console.info(e);

                    if (e && e.preventDefault) e.preventDefault();
                    if (!PROPAGATE && e && e.stopPropagation) e.stopPropagation();


                    if (mOptimized)
                    {
                        target.removeClass("speed");
                        mOptimized = false;
                    }

                    if (!mPinching)
                    {
                        fncDoubleTapCheck(e);
                    }

                    if (isContained() && mSwiping)
                    {
                        if (e.type.startsWith("touch") && mLastTouch != null && mLastTouch != undefined)
                            mEndPoint = mLastTouch;
                        else
                            mEndPoint = fncGetPos(e) || mStartPoint;

                        mDistance = p.math.Dist2D(mStartPoint, mEndPoint);
                        mDeviation = Math.abs(mStartPoint.y - mEndPoint.y);
                        mDirection = (mStartPoint.x > mEndPoint.x) ? DIR_LEFT : DIR_RIGHT;

                        if (mDistance > SWIPE_THRESHOLD && mDeviation < SWIPE_CANCEL)
                        {
                            if (mDirection == DIR_LEFT)
                            {
                                if (options.onSwipeLeft && p.is.function(options.onSwipeLeft))
                                {
                                    options.onSwipeLeft();
                                }
                            }
                            else
                            {
                                if (options.onSwipeRight && p.is.function(options.onSwipeRight))
                                {
                                    options.onSwipeRight();
                                }
                            }
                        }
                        mSwiping = false;
                    }
                    else if (mPinching)
                    {
                        if (options.onPinchEnd && p.is.function(options.onPinchEnd))
                        {
                            options.onPinchEnd(mLastTouch);
                        }
                        mPinching = false;
                    }
                    else
                    {
                        mDragging = false;
                    }

                };

                var fncWheel = function (e)
                {
                    if (e && e.preventDefault) e.preventDefault();
                    if (e && e.stopPropagation) e.stopPropagation();

                    if (!mPinching && !mDragging)
                    {
                        if (!mZooming)
                        {
                            mZooming = true;

                            mStartPoint = fncGetPos(e);
                            mCumulZoom = 10;

                            if (options.onWheelStart && p.is.function(options.onWheelStart))
                            {
                                options.onWheelStart(mStartPoint);
                            }
                        }

                        mCumulZoom += (WHEEL_TICK * -sign(e.deltaY));
                        var current = fncGetPos(e);
                        var difference = WHEEL_TICK * sign(e.deltaY);
                        var differenceChange = mCumulZoom / 10;

                        if (options.onWheel && p.is.function(options.onWheel))
                        {
                            options.onWheel(difference, differenceChange, current);
                        }

                        clearTimeout(mZoomTimeout);
                        mZoomTimeout = setTimeout(fncWheelTimeout, WHEEL_CANCEL);
                    }

                };

                var fncWheelTimeout = function ()
                {
                    if (mZooming)
                    {
                        if (options.onWheelEnd && p.is.function(options.onWheelEnd))
                        {
                            options.onWheelEnd(mStartPoint);
                        }
                        mZooming = false;
                    }
                };

                target.on("wheel", fncWheel);
                target.on("mousedown touchstart", fncOnDown);
                target.on("mouseleave mouseup touchend", fncOnUp);
                target.on("mousemove touchmove", fncOnMove);
            },

            PDFQueue:
                {
                    queue: [],
                    current_callback: null,
                    runnning: false,
                    qid: 0,

                    push: function (canvas, page, callback, prerender)
                    {
                        this.queue.push({ canvas: canvas, page: page, callback: callback, prerender: prerender || false, qid: p.PDFQueue.qid });
                    },

                    reset: function ()
                    {
                        this.qid++;
                        this.queue = [];
                    },

                    start: function (callback)
                    {
                        this.current_callback = callback;
                        if (!this.runnning)
                        {
                            this.runnning = true;
                            this._render();
                        }
                    },

                    _render: function ()
                    {
                        var $this = p.PDFQueue, item = $this.queue.pop(), render = false, CONST = p.pager.constant, start = (new Date()).getTime();
                        if (item)
                        {
                            //if (p.pager.current_mode == CONST.SINGLE || p.pager.current_mode == CONST.SINGLE_REVERSE)
                            //    render = item.page == p.pager.current_page_firstvalid;
                            //else if (p.pager.current_mode == CONST.DOUBLE || p.pager.current_mode == CONST.DOUBLE_REVERSE)
                            //    render = (item.page == p.pager.current_page) || (item.page == p.pager.current_page + 1);

                            //render = render || item.prerender;
                            //render = 

                            render = item.qid == p.PDFQueue.qid;

                            if (render)
                            {
                                try
                                {
                                    //console.info("Rendering page", item.page, "on", item.canvas);
                                    p.PDFManager.renderPageOn(item.page, p.reader.render_canvas, function ()
                                    {
                                        p.pager.push_pdf_rendertime((new Date()).getTime() - start);

                                        if (item.qid == p.PDFQueue.qid)
                                        {
                                            var context = item.canvas[0].getContext('2d');
                                            item.canvas[0].width = p.reader.render_canvas[0].width;
                                            item.canvas[0].height = p.reader.render_canvas[0].height;
                                            context.drawImage(p.reader.render_canvas[0], 0, 0);

                                            if (item.callback && p.is.function(item.callback))
                                                item.callback();
                                        }

                                        $this._render();
                                    });

                                    /*
                                    p.PDFManager.renderPageOn(item.page, item.canvas, function ()
                                    {
                                        p.pager.push_pdf_rendertime((new Date()).getTime() - start);

                                        if (item.callback && p.is.function(item.callback))
                                            item.callback();

                                        $this._render();
                                    });
                                    */
                                }
                                catch (ex)
                                {
                                    //console.error("Render failed");
                                    $this._render();
                                }
                            }
                            else
                            {
                                //console.log("Skipping render"); 
                                $this._render();
                            }
                        }
                        else
                        {
                            $this.runnning = false;

                            if ($this.current_callback && p.is.function($this.current_callback))
                                $this.current_callback();
                        }
                    }
                },

            PDFManager:
                {
                    DEBUG_SYMBOL: "PDFM",
                    document: null,
                    pages: {},
                    scale: 1.0,
                    ref_factor: -1,

                    _rendering: false,
                    _loading: 0,

                    get isRendering()
                    {
                        return this._rendering;
                    },

                    get isLoading()
                    {
                        return this._loading > 0;
                    },

                    loadFile: function PDFM_loadFile(e, callback)
                    {
                        this._loading++;
                        PDFJS.getDocument(e, null, null, this.onDocumentProgress).then(function PDFM_loadFile_chain(a)
                        {
                            if (callback && p.is.function(callback))
                                callback(a);

                            p.PDFManager.onDocumentLoad(a);
                        });
                    },
                    getPage: function PDFM_getPage(i, callback)
                    {
                        if (this.pages.hasOwnProperty(i))
                        {
                            if (callback && p.is.function(callback))
                                callback(this.pages[i]);
                        }
                        else
                        {
                            if (this.document != null)
                            {
                                this.document.getPage(parseInt(i)).then(function PDFM_getPage_chain(e)
                                {
                                    if (callback && p.is.function(callback))
                                        callback(e);

                                    p.PDFManager.onPageLoad(e);
                                }, function PDFM_getPage_chainException(ex)
                                {
                                    console.error("GetPageChainException", ex, ex.stack, "for page", i, "Callback on:", callback);
                                }).then(null, function PDFM_getPage_chainException(ex)
                                {
                                    console.error("GetPageUncaughtException", ex, ex.stack, "for page", i, "Callback on:", callback);
                                });
                            }
                        }
                    },
                    renderPageOn: function PDFM_renderPageOn(page, canvas, callback, ignorePageSize)
                    {
                        if (p.isExElement(canvas) == false || canvas.length != 1)
                        {
                            //Trace(["Invalid canvas"], this.DEBUG_SYMBOL, CONSOLE_ERROR);
                            return;
                        }

                        //console.log(page, 0, this.document.numPages);

                        if (page == 0 || page > this.document.numPages)
                        {
                            if (callback && p.is.function(callback))
                                callback();

                            return;
                        }

                        this._rendering = true;

                        var RENDER_CONTEXT =
                            {
                                canvasContext: canvas[0].getContext("2d"),
                                viewport: null
                            };

                        if (this.pages.hasOwnProperty(page))
                        {
                            if (this.ref_factor == -1 && ignorePageSize !== true)
                            {
                                RENDER_CONTEXT.viewport = this.pages[page].getViewport(1.0);
                                var refSize = p.pager.getPageSize(page, true);
                                this.ref_factor = refSize.width / RENDER_CONTEXT.viewport.width;
                            }
                            else if (this.ref_factor == -1 && ignorePageSize == true)
                            {
                                this.ref_factor = 1;
                            }

                            RENDER_CONTEXT.viewport = this.pages[page].getViewport(this.scale * this.ref_factor);
                            canvas[0].width = RENDER_CONTEXT.viewport.width;
                            canvas[0].height = RENDER_CONTEXT.viewport.height;

                            //p.Pager.refSize.width = RENDER_CONTEXT.viewport.width / this.scale;
                            //p.Pager.refSize.height = RENDER_CONTEXT.viewport.height / this.scale;

                            //$("#loader-left")[0].width = RENDER_CONTEXT.viewport.width;
                            //$("#loader-left")[0].height = RENDER_CONTEXT.viewport.height;
                            //$("#loader-right")[0].width = RENDER_CONTEXT.viewport.width;
                            //$("#loader-right")[0].height = RENDER_CONTEXT.viewport.height;
                            try
                            {
                                this.pages[page].render(RENDER_CONTEXT).promise.then(function PDFM_renderPageOn_chain(e)
                                {
                                    p.PDFManager._rendering = false;

                                    if (callback && p.is.function(callback))
                                        callback(e);

                                    p.PDFManager.onPageRender(e);
                                }, function PDFM_renderPageOn_chainException(ex)
                                {
                                    console.error("RenderPageOn_ChainException", ex, ex.stack, "for page", page, "on canvas", canvas, "callback on:", callback);

                                    p.PDFManager._rendering = false;

                                    if (callback && p.is.function(callback))
                                        callback(false);

                                    p.PDFManager.onPageRender(false);
                                }).then(null, function (ex)
                                {
                                    console.error("RenderPageOn_UncaughtException", ex, ex.stack, "for page", page, "on canvas", canvas, "callback on:", callback);

                                    p.PDFManager._rendering = false;

                                    if (callback && p.is.function(callback))
                                        callback(false);

                                    p.PDFManager.onPageRender(false);
                                });
                            }
                            catch (ex)
                            {
                                console.error("RenderPageOn_FatalException", ex, ex.stack, "for page", page, "on canvas", canvas, "callback on:", callback);

                                p.PDFManager._rendering = false;

                                if (callback && p.is.function(callback))
                                    callback(false);

                                p.PDFManager.onPageRender(false);
                            }
                        }
                        else
                        {
                            try
                            {
                                this.getPage(page, function PDFM_renderPageOn_loader()
                                {
                                    p.PDFManager.renderPageOn(page, canvas, callback, ignorePageSize);
                                });
                            }
                            catch (ex)
                            {
                                console.error("GetPageChainException", ex, ex.stack, "for page", page, "Callback on:", callback);
                            }
                        }
                    },

                    //#region Events

                    // #region Handlers

                    _handlerOnDocumentLoad: null,
                    _handlerOnDocumentProgress: null,
                    _handlerOnPageLoad: null,
                    _handlerOnPageRender: null,

                    setOnDocumentLoadHandler: function PDFM_handlerSet_onDocumentLoad(e)
                    {
                        if (e && p.is.function(e))
                            this._handlerOnDocumentLoad = e;
                    },
                    setOnDocumentProgressHandler: function PDFM_handlerSet_onDocumentProgress(e)
                    {
                        if (e && p.is.function(e))
                            this._handlerOnDocumentProgress = e;
                    },
                    setOnPageLoadHandler: function PDFM_handlerSet_onPageLoad(e)
                    {
                        if (e && p.is.function(e))
                            this._handlerOnPageLoad = e;
                    },
                    setOnPageRenderHandler: function PDFM_handlerSet_onPageRender(e)
                    {
                        if (e && p.is.function(e))
                            this._handlerOnPageRender = e;
                    },

                    // #endregion

                    onDocumentLoad: function PDFM_handlerTrigger_onDocumentLoad(e)
                    {
                        var $this = p.PDFManager;
                        $this.document = e;

                        if ($this._handlerOnDocumentLoad != null && p.is.function($this._handlerOnDocumentLoad))
                        {
                            $this._handlerOnDocumentLoad(e);
                        }
                    },
                    onDocumentProgress: function PDFM_handlerTrigger_onDocumentProgress(e)
                    {
                        var $this = p.PDFManager;

                        if (e && e["loaded"] && e["total"])
                        {
                            if (e.loaded >= e.total)
                            {
                                $this._loading--;

                                if ($this._loading < 0)
                                    $this._loading = 0;
                            }
                        }

                        if ($this._handlerOnDocumentProgress != null && p.is.function($this._handlerOnDocumentProgress))
                        {
                            $this._handlerOnDocumentProgress(e);
                        }
                    },
                    onPageLoad: function PDFM_handlerTrigger_onPageLoad(e)
                    {
                        var $this = p.PDFManager;
                        $this.pages[e.pageNumber] = e;

                        if ($this._handlerOnPageLoad != null && p.is.function($this._handlerOnPageLoad))
                        {
                            $this._handlerOnPageLoad(e);
                        }
                    },
                    onPageRender: function PDFM_handlerTrigger_onPageRender(e)
                    {
                        var $this = p.PDFManager;

                        if ($this._handlerOnPageRender != null && p.is.function($this._handlerOnPageRender))
                        {
                            $this._handlerOnPageRender(e);
                        }
                    }

                    //#endregion
                },

            utf8_encode: function (string)
            {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++)
                {
                    var c = string.charCodeAt(n);

                    if (c < 128)
                    {
                        utftext += String.fromCharCode(c);
                    }
                    else if ((c > 127) && (c < 2048))
                    {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else
                    {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }

                return utftext;
            },

            // private method for UTF-8 decoding
            utf8_decode: function (utftext)
            {
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;

                while (i < utftext.length)
                {
                    c = utftext.charCodeAt(i);

                    if (c < 128)
                    {
                        string += String.fromCharCode(c);
                        i++;
                    }
                    else if ((c > 191) && (c < 224))
                    {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    }
                    else
                    {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }

                return string;
            },

            sha1: function (str)
            {
                // http://kevin.vanzonneveld.net
                // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
                // + namespaced by: Michael White (http://getsprink.com)
                // +      input by: Brett Zamir (http://brett-zamir.me)
                // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                // -    depends on: utf8_encode
                // *     example 1: sha1('Kevin van Zonneveld');
                // *     returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
                var rotate_left = function (n, s)
                {
                    var t4 = (n << s) | (n >>> (32 - s));
                    return t4;
                };

                /*var lsb_hex = function (val) { // Not in use; needed?
                    var str="";
                    var i;
                    var vh;
                    var vl;
            
                    for ( i=0; i<=6; i+=2 ) {
                      vh = (val>>>(i*4+4))&0x0f;
                      vl = (val>>>(i*4))&0x0f;
                      str += vh.toString(16) + vl.toString(16);
                    }
                    return str;
                  };*/

                var cvt_hex = function (val)
                {
                    var str = "";
                    var i;
                    var v;

                    for (i = 7; i >= 0; i--)
                    {
                        v = (val >>> (i * 4)) & 0x0f;
                        str += v.toString(16);
                    }
                    return str;
                };

                var blockstart;
                var i, j;
                var W = new Array(80);
                var H0 = 0x67452301;
                var H1 = 0xEFCDAB89;
                var H2 = 0x98BADCFE;
                var H3 = 0x10325476;
                var H4 = 0xC3D2E1F0;
                var A, B, C, D, E;
                var temp;

                str = this.utf8_encode(str);
                var str_len = str.length;

                var word_array = [];
                for (i = 0; i < str_len - 3; i += 4)
                {
                    j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
                    word_array.push(j);
                }

                switch (str_len % 4)
                {
                    case 0:
                        i = 0x080000000;
                        break;
                    case 1:
                        i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
                        break;
                    case 2:
                        i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
                        break;
                    case 3:
                        i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
                        break;
                }

                word_array.push(i);

                while ((word_array.length % 16) != 14)
                {
                    word_array.push(0);
                }

                word_array.push(str_len >>> 29);
                word_array.push((str_len << 3) & 0x0ffffffff);

                for (blockstart = 0; blockstart < word_array.length; blockstart += 16)
                {
                    for (i = 0; i < 16; i++)
                    {
                        W[i] = word_array[blockstart + i];
                    }
                    for (i = 16; i <= 79; i++)
                    {
                        W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
                    }

                    A = H0;
                    B = H1;
                    C = H2;
                    D = H3;
                    E = H4;

                    for (i = 0; i <= 19; i++)
                    {
                        temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B, 30);
                        B = A;
                        A = temp;
                    }

                    for (i = 20; i <= 39; i++)
                    {
                        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B, 30);
                        B = A;
                        A = temp;
                    }

                    for (i = 40; i <= 59; i++)
                    {
                        temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B, 30);
                        B = A;
                        A = temp;
                    }

                    for (i = 60; i <= 79; i++)
                    {
                        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                        E = D;
                        D = C;
                        C = rotate_left(B, 30);
                        B = A;
                        A = temp;
                    }

                    H0 = (H0 + A) & 0x0ffffffff;
                    H1 = (H1 + B) & 0x0ffffffff;
                    H2 = (H2 + C) & 0x0ffffffff;
                    H3 = (H3 + D) & 0x0ffffffff;
                    H4 = (H4 + E) & 0x0ffffffff;
                }

                temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
                return temp.toLowerCase();
            },

            md5: function (string)
            {
                function RotateLeft(lValue, iShiftBits)
                {
                    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
                }

                function AddUnsigned(lX, lY)
                {
                    var lX4, lY4, lX8, lY8, lResult;
                    lX8 = (lX & 0x80000000);
                    lY8 = (lY & 0x80000000);
                    lX4 = (lX & 0x40000000);
                    lY4 = (lY & 0x40000000);
                    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                    if (lX4 & lY4)
                    {
                        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                    }
                    if (lX4 | lY4)
                    {
                        if (lResult & 0x40000000)
                        {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                        } else
                        {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                        }
                    } else
                    {
                        return (lResult ^ lX8 ^ lY8);
                    }
                }

                function F(x, y, z) { return (x & y) | ((~x) & z); }
                function G(x, y, z) { return (x & z) | (y & (~z)); }
                function H(x, y, z) { return (x ^ y ^ z); }
                function I(x, y, z) { return (y ^ (x | (~z))); }

                function FF(a, b, c, d, x, s, ac)
                {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

                function GG(a, b, c, d, x, s, ac)
                {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

                function HH(a, b, c, d, x, s, ac)
                {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

                function II(a, b, c, d, x, s, ac)
                {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

                function ConvertToWordArray(string)
                {
                    var lWordCount;
                    var lMessageLength = string.length;
                    var lNumberOfWords_temp1 = lMessageLength + 8;
                    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                    var lWordArray = Array(lNumberOfWords - 1);
                    var lBytePosition = 0;
                    var lByteCount = 0;
                    while (lByteCount < lMessageLength)
                    {
                        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                        lBytePosition = (lByteCount % 4) * 8;
                        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                        lByteCount++;
                    }
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                    return lWordArray;
                };

                function WordToHex(lValue)
                {
                    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
                    for (lCount = 0; lCount <= 3; lCount++)
                    {
                        lByte = (lValue >>> (lCount * 8)) & 255;
                        WordToHexValue_temp = "0" + lByte.toString(16);
                        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                    }
                    return WordToHexValue;
                };

                function Utf8Encode(string)
                {
                    string = string.replace(/\r\n/g, "\n");
                    var utftext = "";

                    for (var n = 0; n < string.length; n++)
                    {
                        var c = string.charCodeAt(n);

                        if (c < 128)
                        {
                            utftext += String.fromCharCode(c);
                        }
                        else if ((c > 127) && (c < 2048))
                        {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }
                        else
                        {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }
                    }

                    return utftext;
                };

                var x = Array();
                var k, AA, BB, CC, DD, a, b, c, d;
                var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
                var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
                var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
                var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

                string = Utf8Encode(string);

                x = ConvertToWordArray(string);

                a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

                for (k = 0; k < x.length; k += 16)
                {
                    AA = a; BB = b; CC = c; DD = d;
                    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                    a = AddUnsigned(a, AA);
                    b = AddUnsigned(b, BB);
                    c = AddUnsigned(c, CC);
                    d = AddUnsigned(d, DD);
                }

                var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

                return temp.toLowerCase();
            }
        };

    exHelp.extend(reader);
})(window);

exHelp.e(document).on("ready", function ()
{
    exHelp.reader.init();
});

