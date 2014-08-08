// devices = [];
deviceCount = -1;

disableEventCreate = false;
showPalette = false;

/**
* super simple carousel
* animation between panes happens with css transitions
*/
function Carousel(element) {
    var self = this;
    element = $(element);

    var container = $(">ul", element);
    var panes = $(">ul>li", element);

    var pane_width = 0;
    var pane_count = panes.length;

    var current_pane = 0;


    /**
     * initial
     */
    this.setup = function() {
        setPaneDimensions();

        $(window).on("load resize orientationchange", function() {
            setPaneDimensions();
            //updateOffset();
        })
    };


    /**
     * set the pane dimensions and scale the container
     */
    function setPaneDimensions() {
        pane_width = element.width();
        panes.each(function() {
            $(this).width(pane_width);
        });
        container.width(pane_width*pane_count);
    };


    /**
     * show pane by index
     * @param   {Number}    index
     */
    this.showPane = function( index ) {
        // between the bounds
        index = Math.max(0, Math.min(index, pane_count-1));
        current_pane = index;

        var offset = -((100/pane_count)*current_pane);
        setContainerOffset(offset, true);
    };


    /**
     * show pane by index
     * @param   {Number}    index
     */
    this.getCurrentPane = function() {
        return current_pane;
    };


    function setContainerOffset(percent, animate) {
        container.removeClass("animate");

        if(animate) {
            container.addClass("animate");
        }

        if(Modernizr.csstransforms3d) {
            container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
        }
        else if(Modernizr.csstransforms) {
            container.css("transform", "translate("+ percent +"%,0)");
        }
        else {
            var px = ((pane_width*pane_count) / 100) * percent;
            container.css("left", px+"px");
        }
    }

    this.next = function() { return this.showPane(current_pane+1, true); };
    this.prev = function() { return this.showPane(current_pane-1, true); };



    function handleHammer(ev) {
        // console.log(ev);
        // disable browser scrolling
        ev.gesture.preventDefault();

        if (!disableEventCreate) {

            switch(ev.type) {
                case 'dragright':
                case 'dragleft':
                    // stick to the finger
                    var pane_offset = -(100/pane_count)*current_pane;
                    var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                    // slow down at the first and last pane
                    if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
                        (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
                        drag_offset *= .4;
                    }

                    setContainerOffset(drag_offset + pane_offset);
                    break;

                case 'swipeleft':
                    self.next();
                    ev.gesture.stopDetect();
                    break;

                case 'swiperight':
                    self.prev();
                    ev.gesture.stopDetect();
                    break;

                case 'release':
                    // more then 50% moved, navigate
                    if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                        if(ev.gesture.direction == 'right') {
                            self.prev();
                        } else {
                            self.next();
                        }
                    }
                    else {
                        self.showPane(current_pane, true);
                    }
                    break;
            }

        }
    }

    // Set up touch event handlers (with Hammer.js)
    element.hammer({ drag_lock_to_axis: true }).on("release dragleft dragright swipeleft swiperight", handleHammer);
}

var carousel = new Carousel("#carousel");
carousel.setup();

//------------
// looper.js
//------------

function BehaviorControl(options) {
    var defaults = {
        type: 'none',
        xOffset: 0,
        yOffset: 0,

        events: {}, // Event handlers for interaction (i.e., tap, touch, hold, swipe, etc.)
        draw: null, // Function to draw the control interface

        visible: true
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);
}

/**
 * The main Looper class.
 */
function Looper(options) {
    var defaults = {
        devices: [],
        going: false
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    /** The behavior palette. */
    this.palette = null;

    /** The devices in the local mesh network. */
    this.devices = [];

    /**
     * Add a device to the list of devices in the mesh network.
     */
    function addDevice(options) {
        var defaults = {
            address: null
        };
        var options = options || {};
        var options = $.extend({}, defaults, options);

        deviceCount = deviceCount + 1;

        var overlay = '';
        overlay += '<div id="overlay' + deviceCount + '" style="width: 100%; height: 100%; position: relative; z-index: 5000;">';
        overlay += '<input type="button" value="close" onclick="saveScript();$(\'#overlay' + deviceCount + '\').hide();" />';
        overlay += '</div>';
        // <script>
        //     $('#overlay').hide();
        // </script>


        $('#panes').append('<li class="pane' + deviceCount + '">' + overlay + '<canvas id="canvas' + deviceCount + '" style="width: 100%; height: 100%;"></canvas></li>');
        canvas = "canvas" + deviceCount;

        // Create device object
        var device = new Device({ canvas: canvas, address: options['address'] });
        device.looper = this;
        device.index = deviceCount; // TODO: Replace with node/node UUID
        setupGestures(device);
        this.devices.push(device);

        /**
         * Re-initialize Carousel after adding the new device pane
         */
        this.carousel = new Carousel("#carousel");
        this.carousel.setup();
        // this.carousel.showPane(deviceCount);

        $('#overlay' + deviceCount).hide();
    }
    this.addDevice = addDevice;

    /**
     * Returns the device at the specified index.
     */
    function getDevice(index) {
        this.devices[index];
    }
    this.getDevice = getDevice;

    /**
     * Returns the device at the specified index.
     */
    // function getCurrentDevice() {
    //     this.devices[this.getCurrentPane];
    // }
    // this.getCurrentDevice = getCurrentDevice;

    /**
     * Returns the current device's address.
     */
    // function getCurrentDeviceAddress() {
    //     this.devices[this.getCurrentPane()].address;
    // }
    // this.getCurrentDeviceAddress = getCurrentDeviceAddress;

    function showDeviceByIndex(index) {
        this.carousel.showPane(index + 1);
    }
    this.showDeviceByIndex = showDeviceByIndex;

    function getCurrentPane() {
        return this.carousel.getCurrentPane() - 1;
    }
    this.getCurrentPane = getCurrentPane;
}

function Loop(options) {
    var defaults = {
        behaviors: [],
        going: false,
        position: 0
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.behaviors = options.behaviors; // behaviors on the event loop

    this.position = options.position;
    this.going = options.going;

    function go() {
        this.updateOrdering();
        this.going = true;
    }
    this.go = go;

    function stop() {
        this.going = false;
        this.updateOrdering();

        // Stop all behaviors in the event loop
        for (var i = 0; i < this.behaviors.length; i++) {
            this.behaviors[i].stop();
        }
        this.position = 0; // Reset position
    }
    this.stop = stop;

    function step() {
        if (this.going) {
            var previousEvent = this.behaviors[this.position];
            if (previousEvent !== undefined) {
                previousEvent.stop();
            }

            this.position = (this.position + 1) % this.behaviors.length;
            // console.log('new position = ' + this.position);

            var currentEvent = this.behaviors[this.position];
            currentEvent.go();

            // currentEvent.behavior(); // NOTE: Uncomment this to call the behavior every time it is "going"
        }
    }
    this.step = step;

    /**
     * Re-orders the behaviors in the event loop.
     */
    function updateOrdering() {
        var behaviorSequence = [];

        var eventCount = this.behaviors.length;

        // Populate array for sorting
        for (var i = 0; i < eventCount; i++) {
            var loopEvent = this.behaviors[i];
            if (loopEvent.state === 'SEQUENCED') {
                behaviorSequence.push({
                    event: loopEvent,
                    angle: getAngle(loopEvent.x, loopEvent.y)
                });
            }
        }

        // Perform insertion sort
        var i, j;
        var loopEvent;
        eventCount = behaviorSequence.length;
        for (var i = 0; i < eventCount; i++) {
            loopEvent = behaviorSequence[i];

            for (j = i-1; j > -1 && behaviorSequence[j].angle > loopEvent.angle; j--) {
                behaviorSequence[j+1] = behaviorSequence[j];
            }

            behaviorSequence[j+1] = loopEvent;
        }

        // Update the sequence to the sorted list of behaviors
        var updatedEventLoop = [];
        for (var i = 0; i < behaviorSequence.length; i++) {
            loopEvent = behaviorSequence[i];
            loopEvent.event.options.index = i; // HACK: Update the behavior's index in the loop
            updatedEventLoop.push(loopEvent.event);
        }

        this.behaviors = updatedEventLoop;
    }
    this.updateOrdering = updateOrdering;

    function getAngle(x, y) {
        var deltaX = x - ($(window).width() / 2);
        var deltaY = y - ($(window).height() / 2);
        var angleInRadians = Math.atan2(deltaY, deltaX); // * 180 / PI;
        if (angleInRadians < 0) {
            angleInRadians = Math.PI + (Math.PI + angleInRadians);
        }
        angleInRadians = angleInRadians + (Math.PI / 2); // Offset by (PI / 2) radians
        if (angleInRadians > (2 * Math.PI)) {
            angleInRadians = angleInRadians - (2 * Math.PI);
        }
        return angleInRadians;
    }
    // processing.getAngle;
}

function Behavior(options) {
    var defaults = {
        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        state: 'INVALID', // INVALID, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        behavior: null,
        options: {},
        going: false,
        label: '?'
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.state = options.state;

    this.go = options.go;

    this.label = options.label;

    //this.visible = options.visible;
    this.going = options.going;

    function go() {
        this.going = true;
    }
    this.go = go;

    function stop() {
        this.going = false;
    }
    this.stop = stop;
}

// Add "default" behaviors to palette
/*
processing.behaviorPalette.addBehavior(-100, 0, 'light', function(options) {
    console.log('light on top level');
    setPin(options);
    // TODO: Keep track of state... has this been sent yet?
}, { index: -1, pin: 5, operation: 1, type: 0, mode: 1, value: 1 });
*/
function BehaviorPrototype(options) {
    var defaults = {
        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        // state: 'INVALID', // INVALID, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        // go: null,
        // going: false,
        type: 'none',
        label: '?',
        visible: false,
        procedure: null, // The "template procedure" that describes how to do the behavior.
        options: {}
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.type = options.type; // The type of behavior. This is a unique type identifier.
    this.label = options.label; // The "printable name" for the behavior.

    this.visible = options.visible;

    this.procedure = options.procedure;
    this.options = options.options;

    function setPosition(x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }
    this.setPosition = setPosition;

    function updatePosition() {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }
    this.updatePosition = updatePosition;

    function show() {
        this.visible = true;
    }
    this.show = show;

    function hide() {
        this.visible = false;
    }
    this.hide = hide;
}

// NOTE: The following is one way to do inheritance.
//
// Behavior.prototype.getType = function() {
//   return "Behavior";
// }

// function LightBehavior() {
//   // LightBehavior constructor code goes here 
// }
 
// // Inherit the methods of Behavior (i.e., the base class)
// LightBehavior.prototype = new Behavior();
 
// // Override the parent's getName method
// LightBehavior.prototype.getType = function() {
//     return "LightBehavior";
// }






function BehaviorPalette(options) {
    var defaults = {
        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        // state: 'INVALID', // INVALID, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        // go: null,
        // going: false,
        behaviors: [],
        label: '?',
        visible: false
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.behaviors = options.behaviors;

    // this.state = options.state;

    this.label = options.label;

    this.visible = options.visible;

    function setPosition(x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }
    this.setPosition = setPosition;

    function updatePosition() {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }
    this.updatePosition = updatePosition;

    /**
     * Shows the behavior palette
     */
    function show() {
        this.visible = true;
    }
    this.show = show;

    /**
     * Hides the behavior palette
     */
    function hide() {
        this.visible = false;
    }
    this.hide = hide;

    /**
     * Adds a behavior node to the behavior palette
     */
    this.addBehavior = function(options) {
        var defaults = {
            x: 0,
            y: 0,

            type: 'none',
            label: 'none',

            procedure: null,
            options: null
        };
        var options = options || {};
        var options = $.extend({}, defaults, options);

        // Construct the behavior
        var behavior = new BehaviorPrototype({
            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            type: options.type,
            label: options.label,

            procedure: options.procedure,
            options: options.options,

            qualities: {}  // The "character" of the behavior based on it's type.
        });

        // Specialize the standard behavior constructed above
        // IDEA: Add "behavior.history" to store the history of states (or maybe the state transformations)
        if (behavior.type === 'light') {
            // behavior.qualities = {}; // Add the "character" or characteristic qualities of the behavior based on it's type.
            behavior.qualities = {
                brightness: 0
            };

            behavior.setBrightness = function(options) {
                var defaults = {
                    brightness: 100
                };
                var options = options || {};
                var options = $.extend({}, defaults, options);

                // Change the brightness
                this.qualities.brightness = options['brightness'];
            }

            behavior.onClick = function() {
                if (this.qualities.brightness > 0) {
                    this.qualities.brightness = 0;
                    console.log("off");

                    // Perform behavior
                    //behavior.procedure(behavior.options);
                    updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 0 });
                } else {
                    this.qualities.brightness = 100;
                    console.log("on");

                    // Perform behavior
                    //behavior.procedure(behavior.options);
                    updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 1 });
                }
            }
        }

        console.log(behavior);
        
        this.behaviors.push(behavior); // Add the behavior to the loop.
    }
}

/**
 * Setup screen gesture callback functions.
 */
function setupGestures(device) {

    var currentCanvas = '#' + device.canvas;

    /**
     * Handle "tap" events.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on("tap", function(ev) {
        console.log("'tap' event!");

        var touches = ev.gesture.touches;

        //
        // Get the touched event node, if one exists
        //
        var eventCount = device.processingInstance.loopSequence.behaviors.length;

        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.behaviors[i];
            if ((ev.gesture.center.pageX - 50 < loopEvent.x && loopEvent.x < ev.gesture.center.pageX + 50)
                && (ev.gesture.center.pageY - 50 < loopEvent.y && loopEvent.y < ev.gesture.center.pageY + 50)) {

                // TODO: Handle "tap" event.
            }
        }
    });

    /**
     * Handle "touch" events.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on("touch", function(ev) {
        console.log("'touch' event!");

        var touches = ev.gesture.touches;

        //
        // Check if palette option was selected
        //

        var behaviorPalette = device.processingInstance.behaviorPalette;

        if (behaviorPalette.visible) {

            var behaviorCount = device.processingInstance.behaviorPalette.behaviors.length;
            for(var i = 0; i < behaviorCount; i++) {
                var behavior = device.processingInstance.behaviorPalette.behaviors[i];

                console.log('behavior:')
                console.log(behavior);

                // Check if palette option is touched
                if ((ev.gesture.center.pageX - 50 < behaviorPalette.x + behavior.x && behaviorPalette.x + behavior.x < ev.gesture.center.pageX + 50)
                    && (ev.gesture.center.pageY - 50 < behaviorPalette.y + behavior.y && behaviorPalette.y + behavior.y < ev.gesture.center.pageY + 50)) {

                    // Hide the behavior palette
                    device.processingInstance.behaviorPalette.visible = false;

                    // Create behavior node
                    var nearestPosition = device.processingInstance.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

                    var loopEvent = new Behavior({
                        x: device.processingInstance.behaviorPalette.x + behavior.x,
                        y: device.processingInstance.behaviorPalette.y + behavior.y,
                        xTarget: nearestPosition.x,
                        yTarget: nearestPosition.y
                    });

                    // Update for selected behavior
                    loopEvent.label = behavior.label;
                    loopEvent.procedure = behavior.procedure;
                    loopEvent.options = behavior.options;

                    loopEvent.qualities = behavior.qualities;

                    loopEvent.onClick = behavior.onClick;

                    console.log(loopEvent);

                    // Update the state of the event node
                    loopEvent.state = 'MOVING';
                    device.processingInstance.loopSequence.behaviors.push(loopEvent);
                }

            }
        }

        //
        // Get the touched event node, if one exists
        //
        var eventCount = device.processingInstance.loopSequence.behaviors.length;

        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.behaviors[i];
            if ((ev.gesture.center.pageX - 50 < loopEvent.x && loopEvent.x < ev.gesture.center.pageX + 50)
                && (ev.gesture.center.pageY - 50 < loopEvent.y && loopEvent.y < ev.gesture.center.pageY + 50)) {

                //loopEvent.visible = false;
                loopEvent.state = 'MOVING';
                disableEventCreate = true;

                // Invoke behavior's "on click" behavior.
                loopEvent.onClick();

                console.log("\tevent " + i);
                break;
            }
        }

        ev.gesture.preventDefault();
        ev.stopPropagation();
        ev.gesture.stopPropagation();
        return;
    });

    /**
     * Detect "release" event.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on("release", function(ev) {
        console.log("'release' event!");

        var touches = ev.gesture.touches;

        // Get the touched object, if one exists
        var eventCount = device.processingInstance.loopSequence.behaviors.length;
        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.behaviors[i];

            if (loopEvent.state === 'MOVING') {

                // deltaX = ev.gesture.center.pageX - (screenWidth / 2);
                // deltaY = ev.gesture.center.pageY - (screenHeight / 2);
                // //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                // angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                // x = screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                // y = screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                var distance = device.processingInstance.getDistanceFromEventLoop(loopEvent);

                if (distance < 110) {

                    // Update position of the event node and set as "sequenced"
                    var nearestPosition = device.processingInstance.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);
                    loopEvent.x = nearestPosition.x;
                    loopEvent.y = nearestPosition.y;
                    loopEvent.state = 'SEQUENCED';

                    // Update loop ordering
                    // device.processingInstance.loopSequence.updateOrdering();

                    // TODO: Upload/Submit/Push/Send the update to MCU.

                    // Start the event loop if any behaviors exist
                    var sequence = device.processingInstance.getBehaviorSequence();
                    if (sequence.length > 0) {
                        device.processingInstance.loopSequence.go(); // toggle "go" and "stop"
                    }

                    // Callback to server to update the program
                    loopEvent.procedure(loopEvent.options);

                } else {

                    // TODO: Remove behavior from the behavior loop!

                    console.log("DELETING");

                    // Update position of the event node and set as "floating"
                    loopEvent.state = 'FLOATING';

                    console.log("Deleting " + loopEvent.options.index);

                    deleteBehavior({ index: loopEvent.options.index });

                    // Update loop ordering
                    // device.processingInstance.loopSequence.updateOrdering();

                    // Stop the event loop if no nodes are placed on it
                    var sequence = device.processingInstance.getBehaviorSequence();
                    if (sequence.length == 0) {
                        device.processingInstance.loopSequence.stop();
                    } else {
                        device.processingInstance.loopSequence.go(); // toggle "go" and "stop"
                    }

                    // Push the behavior change to the server
                    // TODO: Remove the behavior from the program
                }

                // TODO: Deploy behavior to device (via HTTP requests).

                disableEventCreate = false;

                break;
            }
        }

        disableEventCreate = false;

        // ev.gesture.preventDefault();
        // ev.stopPropagation();
        // ev.gesture.stopPropagation();
        // return;
    });

    /**
     * Handle "hold" touch event.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0, hold_timeout: 200 }).on("hold", function(ev) {
        console.log("'hold' event!");

        if (!disableEventCreate) {
            disableEventCreate = true;

            var touches = ev.gesture.touches;

            // deltaX = ev.gesture.center.pageX - (screenWidth / 2);
            // deltaY = ev.gesture.center.pageY - (screenHeight / 2);
            // //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
            // angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

            // x = screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
            // y = screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

            // var nearestPosition = device.processingInstance.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

            // Show behavior palette
            device.processingInstance.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
            device.processingInstance.behaviorPalette.show();

            // var nearestPosition = device.processingInstance.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

            // var loopEvent = new Behavior({
            //     x: ev.gesture.center.pageX,
            //     y: ev.gesture.center.pageY,
            //     xTarget: nearestPosition.x,
            //     yTarget: nearestPosition.y
            // });

            // loopEvent.state = 'MOVING';
            // device.processingInstance.loopSequence.behaviors.push(loopEvent);
        }

        ev.gesture.preventDefault();
        ev.stopPropagation();
        ev.gesture.stopPropagation();
        return;
    });
}

/**
 * Add an expressive interface to a device.
 */
function Device(options) {
    var defaults = {
        address: null,
        canvas: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    if (options.canvas === null) {
        alert("No canvas specified.");
        return;
    }

    this.address = options['address'];

    this.canvas = options.canvas;

    // this.disableEventCreate = false;
    this.showPalette = false;
    this.font = null;

    /**
     * Returns the looper associated with the device.
     */
    this.getLooper = function getLooper() {
      return this.looper;
    }

    /**
     * Returns the device at the specified index.
     */
    this.getDevice = function getDevice(index) {
      return this.looper.devices[index];
    }

    /**
     * Returns the device at the specified index.
     */
    this.getAddress = function getAddress() {
      return this.address;
    }

    /**
     * Returns the behavior of the device with the specified index.
     */
    this.getBehaviorSequence = function getBehaviorSequence(deviceIndex) {
      return this.looper.devices[deviceIndex].processingInstance.loopSequence.behaviors;
    }

    /**
     * Processing sketch code
     */
    var deviceSketch = new Processing.Sketch(function(processing) {

        processing.currentTime = 0;
        processing.previousTime = 0;
        processing.stepFrequency = 100;

        var backgroundColor = processing.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        function generateRandomColor(red, green, blue) {
            // Random random = new Random();
            var randomRed = Math.random() * 255;
            var randomGreen = Math.random() * 255;
            var randomBlue = Math.random() * 255;

            // mix the color
            if (red !== null && green !== null && blue !== null) {
                randomRed = (randomRed + red) / 2;
                randomGreen = (randomGreen + green) / 2;
                randomBlue = (randomBlue + blue) / 2;
            }

            // Color color = new Color(red, green, blue);
            var color = { red: randomRed, green: randomGreen, blue: randomBlue };
            return color;
        }
        // var color = generateRandomColor(255, 255, 255);
        // var backgroundColor = processing.color(color.red, color.green, color.blue);
        var backgroundColor = processing.color(240, 241, 240);

        processing.loopSequence = new Loop();

        // Create behavior palette
        processing.behaviorPalette = new BehaviorPalette({
            // x: ev.gesture.center.pageX,
            // y: ev.gesture.center.pageY,
            // xTarget: nearestPosition.x,
            // yTarget: nearestPosition.y,
            visible: false
        });

        /**
         * Setup behavior palette.
         */
        processing.setupBehaviorPalette = function() {

            // Add "default" behaviors to palette
            processing.behaviorPalette.addBehavior({
                type: 'light',
                label: 'light',

                x: -100,
                y: 0,

                procedure: function(options) {
                    console.log('light on top level');
                    setPin(options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    index: -1, pin: 5, operation: 1, type: 0, mode: 1, value: 1
                }
            });

            processing.behaviorPalette.addBehavior({
                type: 'time',
                label: 'time',

                x: 100,
                y: 0,

                procedure: function(options) {
                    console.log('time on top level');
                    delay(options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    index: -1, milliseconds: 1000
                }
            });

            processing.behaviorPalette.addBehavior({
                type: 'input',
                label: 'input',

                x: 0,
                y: 0,

                procedure: function(options) {
                    console.log('input on top level');
                    delay(options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    index: -1, pin: 5, operation: 1, type: 0, mode: 1, value: 0
                }
            });
        }

        /**
         * Override setup function.
         */
        processing.setup = function() {
            processing.size(processing.screenWidth, processing.screenHeight);

            this.font = processing.loadFont("/DidactGothic.ttf");

            this.setupBehaviorPalette();
        }

        /**
         * Override draw function. By default, it will be called 60 times per second.
         */
        processing.draw = function() {

            function drawLoop() {

                processing.pushMatrix();

                // Draw the loop
                processing.strokeWeight(1.0);
                processing.stroke(65, 65, 65);
                processing.noFill();
                processing.smooth();
                processing.arc(processing.screenWidth / 2, processing.screenHeight / 2, 400, 400, (-processing.PI/2) + 0.05*processing.PI, 1.45*processing.PI);

                // Highlight a section of the arc
                /*
                processing.strokeWeight(8.0);
                processing.stroke(65, 65, 65);
                processing.noFill();
                processing.smooth();
                var offset = 0.0;
                var length = 0.15;
                processing.arc(processing.screenWidth / 2, processing.screenHeight / 2, 400, 400, (-processing.PI/2) + ((offset + 0.05) * processing.PI), (-processing.PI/2) + ((offset + 0.05 + length) * processing.PI));
                */

                // Draw the loop's arrowhead to indicate its sequence order
                processing.strokeWeight(1.0);
                processing.stroke(65, 65, 65);
                processing.translate(processing.screenWidth / 2, processing.screenHeight / 2);
                processing.translate(-29, -198);
                processing.rotate(-0.05 * processing.PI);
                processing.line(0, 0, -16, 16);
                processing.line(0, 0, -16, -16);

                processing.popMatrix();
            }

            /**
             * Draw behaviors.
             */
            function drawBehaviors() {

                processing.pushMatrix();

                var eventCount = processing.loopSequence.behaviors.length;
                for (var i = 0; i < eventCount; i++) {
                    var behavior = processing.loopSequence.behaviors[i];

                    processing.updatePosition(behavior);

                    // Draw the event node
                    processing.fill(66, 214, 146);
                    if (behavior.going) {
                        processing.ellipse(behavior.x, behavior.y, 70, 70);

                        // Show the program counter
                        if (behavior.state == 'SEQUENCED') {
                            var angle = getAngle(behavior.x, behavior.y);
                            var nearestX = processing.screenWidth / 2 + (500 / 2) * Math.cos(angle - Math.PI  / 2);
                            var nearestY = processing.screenHeight / 2 + (500 / 2) * Math.sin(angle - Math.PI  / 2);
                            processing.ellipse(nearestX, nearestY, 20, 20);
                        }
                    } else {
                        processing.ellipse(behavior.x, behavior.y, 70, 70);

                        // // Draw options for the sequenced node
                        // if (behavior.state == 'SEQUENCED') {
                        //     processing.ellipse(behavior.x + 40, behavior.y - 40, 30, 30);
                        // }
                    }

                    primaryFont = processing.createFont("/DidactGothic.ttf", 32);
                    processing.textFont(primaryFont, 16);
                    processing.textAlign(processing.CENTER);
                    processing.fill(65, 65, 65);
                    var label = behavior.label;
                    // if (behavior.label === 'light') {
                    //     label = 'light on';
                    // } else if (behavior.label === 'light on') {
                    //     label = 'light off';
                    // } else if (behavior.label === 'light off') {
                    //     label = 'light on';
                    // }
                    processing.text(label, behavior.x, behavior.y + 4);

                    // Draw behaviors
                    if (behavior.label === 'light') {

                        //processing.ellipse(behavior.x, behavior.y, 70, 70);

                        // TODO:/HACK:
                        // Show the program counter
                        if (behavior.state == 'SEQUENCED') {

                            // Slider
                            // Interface properties
                            processing.fill(66, 214, 146);
                            var angle = getAngle(behavior.x, behavior.y);
                            var nearestX = processing.screenWidth / 2 + (530 / 2) * Math.cos(angle - Math.PI  / 2);
                            var nearestY = processing.screenHeight / 2 + (530 / 2) * Math.sin(angle - Math.PI  / 2);
                            // Draw interface
                            processing.line(nearestX + 30, nearestY + 50, nearestX + 30 + 100, nearestY + 50);
                            processing.ellipse(nearestX + 30, nearestY + 50, 20, 20);

                            // Button
                            processing.fill(66, 214, 146);
                            var angle = getAngle(behavior.x, behavior.y);
                            var nearestX = processing.screenWidth / 2 + (530 / 2) * Math.cos(angle - Math.PI  / 2);
                            var nearestY = processing.screenHeight / 2 + (530 / 2) * Math.sin(angle - Math.PI  / 2);
                            processing.ellipse(nearestX, nearestY, 40, 40);

                            primaryFont = processing.createFont("/DidactGothic.ttf", 32);
                            processing.textFont(primaryFont, 16);
                            processing.textAlign(processing.CENTER);
                            processing.fill(65, 65, 65);

                            if (behavior.qualities.brightness === 100) {
                                // Update visual interface
                                processing.text("on", nearestX, nearestY + 4);

                                // TODO: Perform pre-state update procedure

                                // Update behavior qualities
                                behavior.options.value = (behavior.qualities.brightness === 0 ? 0 : 1); // HACK: brightness ranges from 0–100, options.value ranges from 0 to 1
                            } else {
                                processing.text("off", nearestX, nearestY + 4);

                                // TODO: Perform pre-state update procedure

                                // Update behavior qualities
                                behavior.options.value = (behavior.qualities.brightness === 0 ? 0 : 1); // HACK: brightness ranges from 0–100, options.value ranges from 0 to 1
                            }
                        }
                    }

                    // Calculate nearest point on circle
                    //line(behavior.x, behavior.y, screenWidth / 2, screenHeight / 2);
                }

                processing.popMatrix();
            }

            /**
             * Draws the behavior palette.
             */
            function drawBehaviorPalette() {

                processing.behaviorPalette.updatePosition();

                if (processing.behaviorPalette.visible) {
                    drawBehaviors();
                }

                function drawBehaviors() {

                    var behaviorCount = processing.behaviorPalette.behaviors.length;
                    for(var i = 0; i < behaviorCount; i++) {
                        var behavior = processing.behaviorPalette.behaviors[i];

                        processing.pushMatrix();

                        // Draw the palette
                        processing.fill(66, 214, 146);
                        processing.ellipse(processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y, 80, 80);

                        primaryFont = processing.createFont("/DidactGothic.ttf", 32);
                        processing.textFont(primaryFont, 16);
                        processing.textAlign(processing.CENTER);
                        processing.fill(65, 65, 65);
                        processing.text(behavior.label, processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y + 4);

                        processing.popMatrix();
                    }
                }
            }

            /**
             * Updates position of event node.
             */
            function updatePosition(loopEvent) {

                if (loopEvent.x !== loopEvent.xTarget || loopEvent.y !== loopEvent.yTarget) { // FREE
                    //console.log("Rendering ghost");
                }

                if (loopEvent.state === 'MOVING') {

                    // Standard update for a moving event
                    currentMouseX = processing.screenWidth * (processing.deviceCount + 1) + processing.mouseX;
                    loopEvent.x = currentMouseX;
                    loopEvent.y = processing.mouseY;

                    deltaX = currentMouseX - (processing.screenWidth / 2);
                    deltaY = processing.mouseY - (processing.screenHeight / 2);
                    angleInDegrees = Math.atan2(deltaY, deltaX);

                    loopEvent.xTarget = processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                    loopEvent.yTarget = processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                    // Check if under certain distance from the circle (and attach to)
                    var distance = processing.lineDistance(loopEvent.x, loopEvent.y, loopEvent.xTarget, loopEvent.yTarget);

                    if (distance < 110) { // ENTANGLED
                        processing.line(loopEvent.x, loopEvent.y, loopEvent.xTarget, loopEvent.yTarget);

                        // Draw the "would be" position that the event node would occupy
                        processing.fill(66, 214, 146, 50);
                        processing.ellipse(loopEvent.xTarget, loopEvent.yTarget, 50, 50);

                        // Snap to event loop
                        if (!disableEventCreate) {
                            deltaX = processing.mouseX - (processing.screenWidth / 2);
                            deltaY = processing.mouseY - (processing.screenHeight / 2);
                            //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                            angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                            loopEvent.x = processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                            loopEvent.y = processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
                        }
                    }

                } else if (loopEvent.state === 'FLOATING') {
                    processing.fill(66, 214, 146, 50);
                    processing.ellipse(loopEvent.x, loopEvent.y, 70, 70);
                }
            }
            processing.updatePosition = updatePosition;

            /**
             * Returns the sequence of behaviors in the event queue.
             */
            function getBehaviorSequence() {
                var behaviorSequence = [];

                var eventCount = processing.loopSequence.behaviors.length;

                // Populate array for sorting
                for (var i = 0; i < eventCount; i++) {
                    var loopEvent = processing.loopSequence.behaviors[i];
                    if (loopEvent.state === 'SEQUENCED') {
                        
                        behaviorSequence.push({
                            event: loopEvent,
                            angle: processing.getAngle(loopEvent.x, loopEvent.y)
                        });
                    }
                }

                // Perform insertion sort
                var i, j;
                var loopEvent;
                eventCount = behaviorSequence.length;
                for (var i = 0; i < eventCount; i++) {
                    loopEvent = behaviorSequence[i];

                    for (j = i-1; j > -1 && behaviorSequence[j].angle > loopEvent.angle; j--) {
                        behaviorSequence[j+1] = behaviorSequence[j];
                    }

                    behaviorSequence[j+1] = loopEvent;
                }

                console.log(behaviorSequence);

                for (var i = 0; i < behaviorSequence.length; i++) {
                    loopEvent = behaviorSequence[i];

                    console.log(loopEvent);

                    var behaviorScript = loopEvent.event.procedure;
                }

                return behaviorSequence;
            }
            processing.getBehaviorSequence = getBehaviorSequence;

            /**
             * Returns the distance between the two specified points.
             */
            function lineDistance(x1, y1, x2, y2) {
                var xs = 0;
                var ys = 0;

                xs = x2 - x1;
                xs = xs * xs;

                ys = y2 - y1;
                ys = ys * ys;

                return Math.sqrt(xs + ys);
            }
            processing.lineDistance = lineDistance;

            /**
             * Get the (x,y) point on the loop.
             */
            function getPointOnCircle(radius, originX, originY, angle) {

                x = originX + radius * Math.cos(angle);
                y = originY + radius * Math.sin(angle);

                var result = { x: x, y: y };

                return result;
            }

            /**
             * Get the (x,y) point on the loop at the specified angle (in radians).
             */
            function getPosition(angle) {

                var nearestX = processing.screenWidth / 2 + (400 / 2) * Math.cos(angle);
                var nearestY = processing.screenHeight / 2 + (400 / 2) * Math.sin(angle);

                var nearestPosition = {
                    x: nearestX,
                    y: nearestY
                };
                return nearestPosition;
            }
            processing.getPosition = getPosition;

            /**
             * Get the angle.
             */
            function getAngle(x, y) {
                var deltaX = x - (processing.screenWidth / 2);
                var deltaY = y - (processing.screenHeight / 2);
                var angleInRadians = Math.atan2(deltaY, deltaX); // * 180 / PI;
                if (angleInRadians < 0) {
                    angleInRadians = Math.PI + (Math.PI + angleInRadians);
                }
                angleInRadians = angleInRadians + (Math.PI / 2); // Offset by (PI / 2) radians
                if (angleInRadians > (2 * Math.PI)) {
                    angleInRadians = angleInRadians - (2 * Math.PI);
                }
                return angleInRadians;
            }
            processing.getAngle = getAngle;

            /**
             * Returns the coordinates for the point on the loop nearest to the specified point.
             */
            function getNearestPositionOnEventLoop(x, y) {
                var deltaX = x - (processing.screenWidth / 2);
                var deltaY = y - (processing.screenHeight / 2);
                var angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                var nearestX = processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                var nearestY = processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                var nearestPosition = {
                    x: nearestX,
                    y: nearestY
                };
                return nearestPosition;
            }
            processing.getNearestPositionOnEventLoop = getNearestPositionOnEventLoop;

            /**
             * Get the distance to the loop from the given node.
             */
            function getDistanceFromEventLoop(loopEvent) {
                var distance = processing.lineDistance(loopEvent.x, loopEvent.y, loopEvent.xTarget, loopEvent.yTarget);
                return distance;
            }
            processing.getDistanceFromEventLoop = getDistanceFromEventLoop;

            /**
             * Start of actual loop instructions. The things above are definitions.
             */

            // erase background
            processing.background(backgroundColor);

            // step to next node in loop
            processing.currentTime = (new Date()).getTime();
            if (processing.currentTime > (processing.previousTime + processing.stepFrequency)) {
                processing.previousTime = processing.currentTime;
                processing.loopSequence.step();
            }

            drawLoop();
            drawBehaviors();
            drawBehaviorPalette();
        };
    });

    // deviceSketch.options.crispLines = true;
    this.processingInstance = new Processing(canvas, deviceSketch);
    this.processingInstance.canvas = canvas;
    this.processingInstance.deviceCount = deviceCount;
    // this.loopSequence = this.processingInstance.loopSequence;
    console.log(this.processingInstance);
}
