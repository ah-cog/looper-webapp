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
        // var eventCount = device.processing.loopSequence.behaviors.length;

        // for (var i = 0; i < eventCount; i++) {
        //     var loopBehavior = device.processing.loopSequence.behaviors[i];
        //     if ((ev.gesture.center.pageX - 50 < loopBehavior.x && loopBehavior.x < ev.gesture.center.pageX + 50)
        //         && (ev.gesture.center.pageY - 50 < loopBehavior.y && loopBehavior.y < ev.gesture.center.pageY + 50)) {

        //         // TODO: Handle "tap" event.
        //     }
        // }

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY));
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.tap();
                break;
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



        // Check for interaction with interfaces
        console.log("INTERFACES");
        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.touch();
                break;
            }
        }

        // var behaviorPalette = device.processing.behaviorPalette;

        // if (behaviorPalette.visible) {

        //     var behaviorCount = device.processing.behaviorPalette.behaviors.length;
        //     for(var i = 0; i < behaviorCount; i++) {
        //         var behavior = device.processing.behaviorPalette.behaviors[i];

        //         console.log('behavior:')
        //         console.log(behavior);

        //         // Check if palette option is touched
        //         if ((ev.gesture.center.pageX - 50 < behaviorPalette.x + behavior.x && behaviorPalette.x + behavior.x < ev.gesture.center.pageX + 50)
        //             && (ev.gesture.center.pageY - 50 < behaviorPalette.y + behavior.y && behaviorPalette.y + behavior.y < ev.gesture.center.pageY + 50)) {

        //             // Hide the behavior palette
        //             device.processing.behaviorPalette.visible = false;

        //             // Create behavior node
        //             var nearestPosition = device.processing.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

        //             var loopBehavior = new Behavior({
        //                 x: device.processing.behaviorPalette.x + behavior.x,
        //                 y: device.processing.behaviorPalette.y + behavior.y,
        //                 xTarget: nearestPosition.x,
        //                 yTarget: nearestPosition.y
        //             });
        //             // loopBehavior.attachInterface({
        //             //     processing: device.processing,
        //             //     touches: function(x, y) {
        //             //         return true;
        //             //     },
        //             //     // draw: {

        //             //     // },
        //             //     events: {
        //             //         tap: function() {

        //             //         },
        //             //         touch: function() {
        //             //             //loopBehavior.visible = false;
        //             //             loopBehavior.state = 'MOVING';
        //             //             disableEventCreate = true;

        //             //             // Invoke behavior's "on click" behavior.
        //             //             loopBehavior.onClick();

        //             //             console.log("\teventED!!");
        //             //         },
        //             //         hold: function() {

        //             //         },
        //             //         release: function() {

        //             //         }
        //             //     }
        //             // });

        //             // Update for selected behavior
        //             loopBehavior.label = behavior.label;
        //             loopBehavior.procedure = behavior.procedure;
        //             loopBehavior.options = behavior.options;

        //             loopBehavior.qualities = behavior.qualities;

        //             loopBehavior.onClick = behavior.onClick;

        //             console.log(loopBehavior);

        //             // Update the state of the event node
        //             loopBehavior.state = 'MOVING';
        //             device.processing.loopSequence.behaviors.push(loopBehavior);
        //         }

        //     }
        // }

        //
        // Get the touched event node, if one exists
        //
        // var eventCount = device.processing.loopSequence.behaviors.length;

        // for (var i = 0; i < eventCount; i++) {
        //     var loopBehavior = device.processing.loopSequence.behaviors[i];
        //     if ((ev.gesture.center.pageX - 50 < loopBehavior.x && loopBehavior.x < ev.gesture.center.pageX + 50)
        //         && (ev.gesture.center.pageY - 50 < loopBehavior.y && loopBehavior.y < ev.gesture.center.pageY + 50)) {

        //         //loopBehavior.visible = false;
        //         loopBehavior.state = 'MOVING';
        //         disableEventCreate = true;

        //         // Invoke behavior's "on click" behavior.
        //         loopBehavior.onClick();

        //         console.log("\tevent " + i);
        //         break;
        //     }
        // }

        // // Check for interaction with interfaces
        // for (var i = 0; i < interfaces.length; i++) {
        //     console.log(interfaces[i]);
        //     if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
        //         interfaces[i].events.touch();
        //         break;
        //     }
        // }

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

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.release();
                break;
            }
        }

        // Get the touched object, if one exists
        // var eventCount = device.processing.loopSequence.behaviors.length;
        // for (var i = 0; i < eventCount; i++) {
        //     var loopBehavior = device.processing.loopSequence.behaviors[i];

        //     if (loopBehavior.state === 'MOVING') {

        //         // deltaX = ev.gesture.center.pageX - (screenWidth / 2);
        //         // deltaY = ev.gesture.center.pageY - (screenHeight / 2);
        //         // //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
        //         // angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

        //         // x = screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
        //         // y = screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

        //         var distance = device.processing.getDistanceFromEventLoop(loopBehavior);

        //         if (distance < 110) {

        //             // Update position of the event node and set as "sequenced"
        //             var nearestPosition = device.processing.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);
        //             loopBehavior.x = nearestPosition.x;
        //             loopBehavior.y = nearestPosition.y;
        //             loopBehavior.state = 'SEQUENCED';

        //             // Update loop ordering
        //             // device.processing.loopSequence.updateOrdering();

        //             // TODO: Upload/Submit/Push/Send the update to MCU.

        //             // Start the event loop if any behaviors exist
        //             var sequence = device.processing.getBehaviorSequence();
        //             if (sequence.length > 0) {
        //                 device.processing.loopSequence.go(); // toggle "go" and "stop"
        //             }

        //             // Callback to server to update the program
        //             loopBehavior.procedure(loopBehavior.options);

        //         } else {

        //             // TODO: Remove behavior from the behavior loop!

        //             console.log("DELETING");

        //             // Update position of the event node and set as "floating"
        //             loopBehavior.state = 'FLOATING';

        //             console.log("Deleting " + loopBehavior.options.index);

        //             deleteBehavior({ index: loopBehavior.options.index });

        //             // Update loop ordering
        //             // device.processing.loopSequence.updateOrdering();

        //             // Stop the event loop if no nodes are placed on it
        //             var sequence = device.processing.getBehaviorSequence();
        //             if (sequence.length == 0) {
        //                 device.processing.loopSequence.stop();
        //             } else {
        //                 device.processing.loopSequence.go(); // toggle "go" and "stop"
        //             }

        //             // Push the behavior change to the server
        //             // TODO: Remove the behavior from the program
        //         }

        //         // TODO: Deploy behavior to device (via HTTP requests).

        //         disableEventCreate = false;

        //         break;
        //     }
        // }

        // disableEventCreate = false;

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

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.release();
                break;
            }
        }

        if (!disableEventCreate) {
            disableEventCreate = true;

            var touches = ev.gesture.touches;

            // deltaX = ev.gesture.center.pageX - (screenWidth / 2);
            // deltaY = ev.gesture.center.pageY - (screenHeight / 2);
            // //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
            // angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

            // x = screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
            // y = screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

            // var nearestPosition = device.processing.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

            if (device.processing.behaviorPalette == null) {
                console.log("looperInstance = ");
                console.log(device.processing.looperInstance);
                device.processing.behaviorPalette = new BehaviorPalette({ looperInstance: device });
                device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
                device.processing.behaviorPalette.updatePosition();
                device.processing.setupBehaviorPalette();
                console.log(device.processing.behaviorPalette);
            }

            // Show behavior palette
            // device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
            device.processing.behaviorPalette.show();
            console.log(device.processing.behaviorPalette);
            // device.processing.behaviorPalette.interface.draw();

            // var nearestPosition = device.processing.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

            // var loopBehavior = new Behavior({
            //     x: ev.gesture.center.pageX,
            //     y: ev.gesture.center.pageY,
            //     xTarget: nearestPosition.x,
            //     yTarget: nearestPosition.y
            // });

            // loopBehavior.state = 'MOVING';
            // device.processing.loopSequence.behaviors.push(loopBehavior);
        }

        ev.gesture.preventDefault();
        ev.stopPropagation();
        ev.gesture.stopPropagation();
        return;
    });
}

//------------
// looper.js
//------------

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
    this.addDevice = function(options) {
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
        var device = new LooperInstance({ canvas: canvas, address: options['address'] });
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

    /**
     * Returns the device at the specified index.
     */
    this.getDevice = function(index) {
        return this.devices[index];
    }

    /**
     * Returns the device at the specified index.
     */
    this.getCurrentDevice = function() {
        return this.devices[this.getCurrentPane];
    }

    /**
     * Returns the current device's address.
     */
    this.getCurrentDeviceAddress = function() {
        return this.devices[this.getCurrentPane()].address;
    }

    this.showDeviceByIndex = function(index) {
        this.carousel.showPane(index + 1);
    }

    this.getCurrentPane = function() {
        return this.carousel.getCurrentPane() - 1;
    }
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
            var loopBehavior = this.behaviors[i];
            if (loopBehavior.state === 'SEQUENCED') {
                behaviorSequence.push({
                    event: loopBehavior,
                    angle: getAngle(loopBehavior.x, loopBehavior.y)
                });
            }
        }

        // Perform insertion sort
        var i, j;
        var loopBehavior;
        eventCount = behaviorSequence.length;
        for (var i = 0; i < eventCount; i++) {
            loopBehavior = behaviorSequence[i];

            for (j = i-1; j > -1 && behaviorSequence[j].angle > loopBehavior.angle; j--) {
                behaviorSequence[j+1] = behaviorSequence[j];
            }

            behaviorSequence[j+1] = loopBehavior;
        }

        // Update the sequence to the sorted list of behaviors
        var updatedEventLoop = [];
        for (var i = 0; i < behaviorSequence.length; i++) {
            loopBehavior = behaviorSequence[i];
            loopBehavior.event.options.index = i; // HACK: Update the behavior's index in the loop
            updatedEventLoop.push(loopBehavior.event);
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
        state: 'PROTOTYPE', // NONE, PROTOTYPE, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        procedure: null,
        options: {},
        going: false,
        label: '?'
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.procedure = options.procedure;
    this.options = options.options;

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



    this.attachInterface = function(options) {

        // Attach the specified interface to the specified object
        this.interface = new Interface(options);
    }
}

interfaces = []; // TODO: Move this into Looper class?
function Interface(options) {
    var defaults = {
        parent: null,
        type: 'none',
        x: 100,
        y: 100,
        xOffset: 0,
        yOffset: 0,
        xTarget: 0,
        yTarget: 0,

        events: {}, // Event handlers for interaction (i.e., tap, touch, hold, swipe, etc.)
        draw: null, // Function to draw the control interface

        visible: true,

        processing: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.parent = options.parent;

    this.x = options.x;
    this.y = options.y;
    this.xOffset = options.xOffset;
    this.yOffset = options.yOffset;
    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.processing = options.processing;
    this.events = options.events;
    this.draw = options.draw;
    this.touches = options.touches;

    this.setPosition = function(x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }

    this.updatePosition = function() {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }

    this.show = function() {
        this.visible = true;
    }

    this.hide = function() {
        this.visible = false;
    }

    // Add interface to list of interfaces
    interfaces.push(this);
}

// function BehaviorPrototype(options) {
//     var defaults = {
//         x: null,
//         y: null,
//         xTarget: null,
//         yTarget: null,
//         // state: 'NONE', // NONE, FLOATING, MOVING, ENTANGLED, SEQUENCED
//         //visible: true
//         // go: null,
//         // going: false,
//         type: 'none',
//         label: '?',
//         visible: false,
//         procedure: null, // The "template procedure" that describes how to do the behavior.
//         options: {}
//     };
//     var options = options || {};
//     var options = $.extend({}, defaults, options);

//     this.x = options.x;
//     this.y = options.y;

//     this.xTarget = options.xTarget;
//     this.yTarget = options.yTarget;

//     this.type = options.type; // The type of behavior. This is a unique type identifier.
//     this.label = options.label; // The "printable name" for the behavior.

//     this.visible = options.visible;

//     this.procedure = options.procedure;
//     this.options = options.options;

//     function setPosition(x, y) {
//         this.xTarget = x;
//         this.yTarget = y;
//     }
//     this.setPosition = setPosition;

//     function updatePosition() {
//         this.x = this.xTarget;
//         this.y = this.yTarget;
//     }
//     this.updatePosition = updatePosition;

//     function show() {
//         this.visible = true;
//     }
//     this.show = show;

//     function hide() {
//         this.visible = false;
//     }
//     this.hide = hide;
// }

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
        looperInstance: null,
        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        // state: 'NONE', // NONE, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        // go: null,
        // going: false,
        behaviors: [],
        label: '?',
        visible: false
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.looperInstance = options.looperInstance;

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

    console.log("!!!!!");
    console.log(this.looperInstance);

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

        console.log("ADDING BEHAVIOR");
        console.log(options);

        // Construct the behavior
        var behavior = new Behavior({
            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            type: options.type,
            label: options.label,

            state: 'PROTOTYPE', // Set state to prototype (i.e., showing up in the palette, still a "template")

            procedure: options.procedure,
            options: options.options,

            // TODO: Remove 'qualities'. Instead, make 'state' an object that can have multiple properties.
            //qualities: {}  // The "character" of the behavior based on it's type.
            qualities: options.qualities
        });

        // Attach Interface to behavior
        behavior.attachInterface({

            parent: behavior,

            processing: this.looperInstance.processing,

            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            touches: function(x, y) {
                var radius = 50;
                console.log(x, y, this.x, this.y);
                if ((this.x - radius < x && this.x + radius > x) && (this.y - radius < y && this.y + radius > y)) {
                // if ((x - radius < this.processing.behaviorPalette.x + this.x && this.processing.behaviorPalette.x + this.x < x + radius)
                //     && (y - radius < this.processing.behaviorPalette.y + this.y && this.processing.behaviorPalette.y + this.y < y + radius)) {

                    return true;
                }

                return false;
            },

            draw: function() {

                // if (this.processing.behaviorPalette.visible) {
                if (behavior.state === 'PROTOTYPE') {

                    //this.processing.behaviorPalette.updatePosition();
                    // this.processing.updatePosition(behavior);

                    this.processing.pushMatrix();

                    // Draw the behavior
                    this.processing.fill(66, 214, 146);
                    this.processing.ellipse(this.x, this.y, 80, 80);

                    primaryFont = this.processing.createFont("/DidactGothic.ttf", 32);
                    this.processing.textFont(primaryFont, 16);
                    this.processing.textAlign(this.processing.CENTER);
                    this.processing.fill(65, 65, 65);
                    this.processing.text(behavior.label, this.x, this.y + 4);

                    this.processing.popMatrix();

                } else if (behavior.state === 'FLOATING') {

                    this.processing.fill(66, 214, 146, 50);
                    this.processing.ellipse(behavior.interface.x, behavior.interface.y, 70, 70);

                } else {

                    this.processing.pushMatrix();

                    if (behavior.state === 'MOVING') {

                        // Standard update for a moving event
                        currentMouseX = behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX;
                        behavior.interface.x = currentMouseX;
                        behavior.interface.y = behavior.interface.processing.mouseY;

                        deltaX = currentMouseX - (behavior.interface.processing.screenWidth / 2);
                        deltaY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);
                        angleInDegrees = Math.atan2(deltaY, deltaX);

                        behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                        behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                        // this.processing.behaviorPalette.updatePosition();
                        // this.processing.updatePosition(behavior);

                        // Check if under certain distance from the circle (and attach to)
                        var distance = this.processing.lineDistance(this.x, this.y, this.xTarget, this.yTarget);

                        console.log("distance = ");
                        console.log(distance);

                        if (distance < 110) { // ENTANGLED
                            this.processing.line(this.x, this.y, this.xTarget, this.yTarget);

                            // Draw the "would be" position that the event node would occupy
                            this.processing.fill(66, 214, 146, 50);
                            this.processing.ellipse(behavior.interface.xTarget, behavior.interface.yTarget, 50, 50);

                            // Snap to event loop
                            if (!disableEventCreate) {
                                deltaX = this.processing.mouseX - (this.processing.screenWidth / 2);
                                deltaY = this.processing.mouseY - (this.processing.screenHeight / 2);
                                //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                                angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                                // behavior.interface.x = this.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                                // behavior.interface.y = this.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
                                behavior.interface.x = this.xTarget;
                                behavior.interface.y = this.yTarget;
                            }
                        }
                    }

                    // Draw the behavior
                    this.processing.fill(66, 214, 146);
                    this.processing.ellipse(this.x, this.y, 80, 80);

                    primaryFont = this.processing.createFont("/DidactGothic.ttf", 32);
                    this.processing.textFont(primaryFont, 16);
                    this.processing.textAlign(this.processing.CENTER);
                    this.processing.fill(65, 65, 65);
                    this.processing.text(behavior.label, this.x, this.y + 4);

                    this.processing.popMatrix();

                }



                    // processing.updatePosition(behavior);

                    // // Draw the event node
                    // processing.fill(66, 214, 146);
                    // if (behavior.going) {
                    //     processing.ellipse(behavior.x, behavior.y, 70, 70);

                    //     // Show the program counter
                    //     if (behavior.state == 'SEQUENCED') {
                    //         var angle = getAngle(behavior.x, behavior.y);
                    //         var nearestX = processing.screenWidth / 2 + (500 / 2) * Math.cos(angle - Math.PI  / 2);
                    //         var nearestY = processing.screenHeight / 2 + (500 / 2) * Math.sin(angle - Math.PI  / 2);
                    //         processing.ellipse(nearestX, nearestY, 20, 20);
                    //     }
                    // } else {
                    //     processing.ellipse(behavior.x, behavior.y, 70, 70);

                    //     // // Draw options for the sequenced node
                    //     // if (behavior.state == 'SEQUENCED') {
                    //     //     processing.ellipse(behavior.x + 40, behavior.y - 40, 30, 30);
                    //     // }
                    // }
            },

            events: {
                tap: function() {
                    console.log("tap Behavior");
                },

                touch: function() {
                    console.log("touch Behavior");

                    disableEventCreate = true;

                //     //loopBehavior.visible = false;
                // loopBehavior.state = 'MOVING';
                // disableEventCreate = true;

                // // Invoke behavior's "on click" behavior.
                // loopBehavior.onClick();

                // console.log("\tevent " + i);

                    if (behavior.state === 'PROTOTYPE') {

                        // console.log("touched PROTOTYPE Behavior. Setting to MOVING.");
                        behavior.state = 'MOVING';

                        // Hide the behavior palette
                        behavior.interface.processing.behaviorPalette.visible = false;

                        behavior.interface.processing.loopSequence.behaviors.push(behavior);

                    } else if (behavior.state === 'FLOATING') {

                        behavior.state = 'MOVING';

                    } else if (behavior.state === 'SEQUENCED') {

                        behavior.state = 'MOVING';

                    }

                    if (behavior.state === 'MOVING') {

                        var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop(behavior.interface.processing.mouseX, behavior.interface.processing.mouseY);
                        
                        behavior.interface.xTarget = nearestPosition.x;
                        behavior.interface.yTarget = nearestPosition.y;

                        // behavior.interface.processing.updatePosition(behavior);

                        // // Standard update for a moving event
                        // currentMouseX = behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX;
                        // behavior.interface.x = currentMouseX;
                        // behavior.interface.y = behavior.interface.processing.mouseY;

                        // deltaX = currentMouseX - (behavior.interface.processing.screenWidth / 2);
                        // deltaY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);
                        // angleInDegrees = Math.atan2(deltaY, deltaX);

                        // behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                        // behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                        // behavior.state = 'MOVING';

                    }
                },

                hold: function() {
                    console.log("hold Behavior");
                },

                release: function() {
                    console.log("release Behavior");
                    console.log(behavior);

                    if (behavior.state === 'PROTOTYPE') {

                        console.log("RELEASING PROTOTYPE!");
                        // behavior.state = 'MOVING';
                        console.log(behavior.state);

                    }

                    if (behavior.state === 'MOVING') {

                        // deltaX = ev.gesture.center.pageX - (screenWidth / 2);
                        // deltaY = ev.gesture.center.pageY - (screenHeight / 2);
                        // //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                        // angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                        // x = screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                        // y = screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                        console.log("MOVING PROTOTYPE!");
                        console.log(behavior);
                        console.log(behavior.interface.processing);
                        var distance = behavior.interface.processing.getDistanceFromEventLoop(behavior.interface);
                        console.log(distance);

                        if (distance < 110) {

                            // Update position of the event node and set as "sequenced"
                            //var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop(behavior.interface.processing.mouseX, behavior.interface.processing.mouseY);
                            //var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop(behavior.interface.processing.mouseX, behavior.interface.processing.mouseY);
                            // behavior.interface.x = nearestPosition.x;
                            // behavior.interface.y = nearestPosition.y;
                            behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                            behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
                            behavior.interface.x = behavior.interface.xTarget;
                            behavior.interface.y = behavior.interface.yTarget;
                            behavior.state = 'SEQUENCED';

                            // Update loop ordering
                            // device.processing.loopSequence.updateOrdering();

                            // TODO: Upload/Submit/Push/Send the update to MCU.

                            // Start the event loop if any behaviors exist
                            var sequence = behavior.interface.processing.getBehaviorSequence();
                            if (sequence.length > 0) {
                                behavior.interface.processing.loopSequence.go(); // toggle "go" and "stop"
                            }

                            // Callback to server to update the program
                            console.log(behavior);
                            behavior.procedure(behavior.options);

                        } else {

                            // TODO: Remove behavior from the behavior loop!

                            console.log("DELETING");

                            // Update position of the event node and set as "floating"
                            behavior.state = 'FLOATING';

                            console.log(behavior);

                            console.log("Deleting " + behavior.options.index);

                            deleteBehavior({ index: behavior.options.index });

                            // Update loop ordering
                            // device.processing.loopSequence.updateOrdering();

                            // Stop the event loop if no nodes are placed on it
                            var sequence = behavior.interface.processing.getBehaviorSequence();
                            if (sequence.length == 0) {
                                behavior.interface.processing.loopSequence.stop();
                            } else {
                                behavior.interface.processing.loopSequence.go(); // toggle "go" and "stop"
                            }

                            // Push the behavior change to the server
                            // TODO: Remove the behavior from the program
                        }

                        // TODO: Deploy behavior to device (via HTTP requests).

                        disableEventCreate = false;

                        if (!disableEventCreate) {
                            if (behavior.interface.processing.behaviorPalette != null) {

                                // var behaviorCount = behavior.interface.processing.behaviorPalette.behaviors.length;
                                // // var behaviorCount = behavior.interface.processing.loopSequence.behaviors.length;
                                // console.log("behaviorCount = " + behaviorCount);
                                // for (var i = 0; i < behaviorCount; ) {

                                //     console.log(behavior.interface.processing.behaviorPalette.behaviors[i].state);

                                //     if (behavior.interface.processing.behaviorPalette.behaviors[i].state === 'PROTOTYPE') {
                                //         behavior.interface.processing.behaviorPalette.behaviors.splice(i, 1);
                                //         behaviorCount--;
                                //         console.log("removing...");
                                //         continue;                                
                                //     }

                                //     i++;
                                // }

                                // Remove interfaces associated with the removed behaviors
                                var interfaceCount = interfaces.length;
                                // var interfaceCount = behavior.interface.processing.loopSequence.behaviors.length;
                                console.log("interfaceCount = " + interfaceCount);
                                for (var i = 0; i < interfaceCount; ) {

                                    console.log(interfaces[i]);

                                    if (interfaces[i].parent.state === 'PROTOTYPE') {
                                        interfaces.splice(i, 1);
                                        interfaceCount--;
                                        console.log("removing...");
                                        continue;                                
                                    }

                                    i++;
                                }

                                // Destroy behavior palette!
                                behavior.interface.processing.behaviorPalette = null;
                            }
                        }

                        // break;
                    }
                }
            }
        });



        // Specialize the standard behavior constructed above
        // IDEA: Add "behavior.history" to store the history of states (or maybe the state transformations)
        // if (behavior.type === 'light') {
        //     // behavior.qualities = {}; // Add the "character" or characteristic qualities of the behavior based on it's type.
        //     behavior.qualities = {
        //         brightness: 0
        //     };

        //     behavior.setBrightness = function(options) {
        //         var defaults = {
        //             brightness: 100
        //         };
        //         var options = options || {};
        //         var options = $.extend({}, defaults, options);

        //         // Change the brightness
        //         this.qualities.brightness = options['brightness'];
        //     }

        //     behavior.onClick = function() {
        //         if (this.qualities.brightness > 0) {
        //             this.qualities.brightness = 0;
        //             console.log("off");

        //             // Perform behavior
        //             //behavior.procedure(behavior.options);
        //             updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 0 });
        //         } else {
        //             this.qualities.brightness = 100;
        //             console.log("on");

        //             // Perform behavior
        //             //behavior.procedure(behavior.options);
        //             updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 1 });
        //         }
        //     }
        // }

        console.log(behavior);
        
        this.behaviors.push(behavior); // Add the behavior to the loop.
    }

    // this.attachInterface = function(options) {

    //     console.log("FANGS! FANGS! FANGS! FANGS! FANGS!");

    //     // Attach the specified interface to the specified object
    //     this.interface = new Interface(options);

    //     console.log(this.interface);
    // }
}

/**
 * Add an expressive interface to a device.
 */
function LooperInstance(options) {
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
      return this.looper.devices[deviceIndex].processing.loopSequence.behaviors;
    }

    /**
     * Processing sketch code
     */
    var sketch = new Processing.Sketch(function(processing) {

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
        processing.behaviorPalette = null; // new BehaviorPalette({ looperInstance: this.looperInstance });

        // processing.behaviorPalette.attachInterface({

        //     processing: processing,

        //     touches: function(x, y) {

        //         console.log(x + ", " + y);
        //         console.log(processing.behaviorPalette.visible);

        //         if (processing.behaviorPalette.visible) {

        //             var behaviorCount = processing.behaviorPalette.behaviors.length;
        //             for(var i = 0; i < behaviorCount; i++) {
        //                 var behavior = processing.behaviorPalette.behaviors[i];

        //                 console.log('behavior:');
        //                 console.log(behavior);

        //                 console.log("x,y: " + x + ", " + y);
        //                 console.log("this.x,this.y: " + behavior.x + ", " + behavior.y);

        //                 // Check if palette option is touched
        //                 if ((x - 50 < processing.behaviorPalette.x + behavior.x && processing.behaviorPalette.x + behavior.x < x + 50)
        //                     && (y - 50 < processing.behaviorPalette.y + behavior.y && processing.behaviorPalette.y + behavior.y < y + 50)) {
        //                 // if ((x - 50 < this.x && this.x < x + 50) && (y - 50 < this.y && this.y < y + 50)) {
        //                     return true;
        //                 }

        //             }
        //         }

        //         return false;
        //     },

        //     draw: function() {

        //         processing.behaviorPalette.updatePosition();

        //         if (processing.behaviorPalette.visible) {
        //             var behaviorCount = processing.behaviorPalette.behaviors.length;
        //             for(var i = 0; i < behaviorCount; i++) {
        //                 var behavior = processing.behaviorPalette.behaviors[i];

        //                 processing.pushMatrix();

        //                 // Draw the palette
        //                 processing.fill(66, 214, 146);
        //                 processing.ellipse(processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y, 80, 80);

        //                 primaryFont = processing.createFont("/DidactGothic.ttf", 32);
        //                 processing.textFont(primaryFont, 16);
        //                 processing.textAlign(processing.CENTER);
        //                 processing.fill(65, 65, 65);
        //                 processing.text(behavior.label, processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y + 4);

        //                 processing.popMatrix();
        //             }
        //         }

        //     },

        //     events: {
        //         tap: function() {
        //             console.log("tap");
        //         },
        //         touch: function() {

        //             console.log("touch!!!!!");


        //             if (processing.behaviorPalette.visible) {

        //     var behaviorCount = processing.behaviorPalette.behaviors.length;
        //     for(var i = 0; i < behaviorCount; i++) {
        //         var behavior = processing.behaviorPalette.behaviors[i];

        //         console.log('behavior:')
        //         console.log(behavior);

        //         // HACK/TODO: In the palette, add the actual behaviors, then the behaviors' interfaces can respond to the events individually! they have different faces!

        //         // Check if palette option is touched
        //         if ((ev.gesture.center.pageX - 50 < processing.behaviorPalette.x + behavior.x && behaviorPalette.x + behavior.x < ev.gesture.center.pageX + 50)
        //             && (ev.gesture.center.pageY - 50 < processing.behaviorPalette.y + behavior.y && behaviorPalette.y + behavior.y < ev.gesture.center.pageY + 50)) {

        //             // Hide the behavior palette
        //             processing.behaviorPalette.visible = false;

        //             // Create behavior node
        //             var nearestPosition = processing.getNearestPositionOnEventLoop(x, y);

        //             var loopBehavior = new Behavior({
        //                 x: processing.behaviorPalette.x + behavior.x,
        //                 y: processing.behaviorPalette.y + behavior.y,
        //                 xTarget: nearestPosition.x,
        //                 yTarget: nearestPosition.y
        //             });
        //             // loopBehavior.attachInterface({
        //             //     processing: d.processing,
        //             //     touches: function(x, y) {
        //             //         return true;
        //             //     },
        //             //     // draw: {

        //             //     // },
        //             //     events: {
        //             //         tap: function() {

        //             //         },
        //             //         touch: function() {
        //             //             //loopBehavior.visible = false;
        //             //             loopBehavior.state = 'MOVING';
        //             //             disableEventCreate = true;

        //             //             // Invoke behavior's "on click" behavior.
        //             //             loopBehavior.onClick();

        //             //             console.log("\teventED!!");
        //             //         },
        //             //         hold: function() {

        //             //         },
        //             //         release: function() {

        //             //         }
        //             //     }
        //             // });

        //             // Update for selected behavior
        //             loopBehavior.label = behavior.label;
        //             loopBehavior.procedure = behavior.procedure;
        //             loopBehavior.options = behavior.options;

        //             loopBehavior.qualities = behavior.qualities;

        //             loopBehavior.onClick = behavior.onClick;

        //             console.log(loopBehavior);

        //             // Update the state of the event node
        //             loopBehavior.state = 'MOVING';
        //             processing.loopSequence.behaviors.push(loopBehavior);
        //         }

        //     }
        // }

        //             // // Hide the behavior palette
        //             //         processing.behaviorPalette.visible = false;

        //             //         // Create behavior node
        //             //         var nearestPosition = processing.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

        //             //         var loopBehavior = new Behavior({
        //             //             x: processing.behaviorPalette.x + behavior.x,
        //             //             y: processing.behaviorPalette.y + behavior.y,
        //             //             xTarget: nearestPosition.x,
        //             //             yTarget: nearestPosition.y
        //             //         });
        //             //         // loopBehavior.attachInterface({
        //             //         //     processing: device.processing,
        //             //         //     touches: function(x, y) {
        //             //         //         return true;
        //             //         //     },
        //             //         //     // draw: {

        //             //         //     // },
        //             //         //     events: {
        //             //         //         tap: function() {

        //             //         //         },
        //             //         //         touch: function() {
        //             //         //             //loopBehavior.visible = false;
        //             //         //             loopBehavior.state = 'MOVING';
        //             //         //             disableEventCreate = true;

        //             //         //             // Invoke behavior's "on click" behavior.
        //             //         //             loopBehavior.onClick();

        //             //         //             console.log("\teventED!!");
        //             //         //         },
        //             //         //         hold: function() {

        //             //         //         },
        //             //         //         release: function() {

        //             //         //         }
        //             //         //     }
        //             //         // });

        //             //         // Update for selected behavior
        //             //         loopBehavior.label = behavior.label;
        //             //         loopBehavior.procedure = behavior.procedure;
        //             //         loopBehavior.options = behavior.options;

        //             //         loopBehavior.qualities = behavior.qualities;

        //             //         loopBehavior.onClick = behavior.onClick;

        //             //         console.log(loopBehavior);

        //             //         // Update the state of the event node
        //             //         loopBehavior.state = 'MOVING';
        //             //         processing.loopSequence.behaviors.push(loopBehavior);


        //             // // //loopBehavior.visible = false;
        //             // // loopBehavior.state = 'MOVING';
        //             // // disableEventCreate = true;

        //             // // // Invoke behavior's "on click" behavior.
        //             // // loopBehavior.onClick();

        //             // // console.log("\teventED!!");
        //         },
        //         hold: function() {
        //             console.log("hold");
        //         },
        //         release: function() {
        //             console.log("release");
        //         }
        //     }
        // });

        /**
         * Setup behavior palette.
         */
        processing.setupBehaviorPalette = function() {

            // Add "default" behaviors to palette
            processing.behaviorPalette.addBehavior({
                type: 'light',
                label: 'light',

                x: processing.behaviorPalette.x + -100,
                y: processing.behaviorPalette.y + 0,

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

                x: processing.behaviorPalette.x + 100,
                y: processing.behaviorPalette.y + 0,

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

                x: processing.behaviorPalette.x + 0,
                y: processing.behaviorPalette.y + 0,

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

            // this.setupBehaviorPalette();
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

                // processing.pushMatrix();

                // var eventCount = processing.loopSequence.behaviors.length;
                // for (var i = 0; i < eventCount; i++) {
                //     var behavior = processing.loopSequence.behaviors[i];

                //     processing.updatePosition(behavior);

                //     // Draw the event node
                //     processing.fill(66, 214, 146);
                //     if (behavior.going) {
                //         processing.ellipse(behavior.x, behavior.y, 70, 70);

                //         // Show the program counter
                //         if (behavior.state == 'SEQUENCED') {
                //             var angle = getAngle(behavior.x, behavior.y);
                //             var nearestX = processing.screenWidth / 2 + (500 / 2) * Math.cos(angle - Math.PI  / 2);
                //             var nearestY = processing.screenHeight / 2 + (500 / 2) * Math.sin(angle - Math.PI  / 2);
                //             processing.ellipse(nearestX, nearestY, 20, 20);
                //         }
                //     } else {
                //         processing.ellipse(behavior.x, behavior.y, 70, 70);

                //         // // Draw options for the sequenced node
                //         // if (behavior.state == 'SEQUENCED') {
                //         //     processing.ellipse(behavior.x + 40, behavior.y - 40, 30, 30);
                //         // }
                //     }

                //     primaryFont = processing.createFont("/DidactGothic.ttf", 32);
                //     processing.textFont(primaryFont, 16);
                //     processing.textAlign(processing.CENTER);
                //     processing.fill(65, 65, 65);
                //     var label = behavior.label;
                //     // if (behavior.label === 'light') {
                //     //     label = 'light on';
                //     // } else if (behavior.label === 'light on') {
                //     //     label = 'light off';
                //     // } else if (behavior.label === 'light off') {
                //     //     label = 'light on';
                //     // }
                //     processing.text(label, behavior.x, behavior.y + 4);

                //     // Draw behaviors
                //     if (behavior.label === 'light') {

                //         //processing.ellipse(behavior.x, behavior.y, 70, 70);

                //         // TODO:/HACK:
                //         // Show the program counter
                //         if (behavior.state == 'SEQUENCED') {

                //             // Slider
                //             // Interface properties
                //             processing.fill(66, 214, 146);
                //             var angle = getAngle(behavior.x, behavior.y);
                //             var nearestX = processing.screenWidth / 2 + (530 / 2) * Math.cos(angle - Math.PI  / 2);
                //             var nearestY = processing.screenHeight / 2 + (530 / 2) * Math.sin(angle - Math.PI  / 2);
                //             // Draw interface
                //             processing.line(nearestX + 30, nearestY + 50, nearestX + 30 + 100, nearestY + 50);
                //             processing.ellipse(nearestX + 30, nearestY + 50, 20, 20);

                //             // Button
                //             processing.fill(66, 214, 146);
                //             var angle = getAngle(behavior.x, behavior.y);
                //             var nearestX = processing.screenWidth / 2 + (530 / 2) * Math.cos(angle - Math.PI  / 2);
                //             var nearestY = processing.screenHeight / 2 + (530 / 2) * Math.sin(angle - Math.PI  / 2);
                //             processing.ellipse(nearestX, nearestY, 40, 40);

                //             primaryFont = processing.createFont("/DidactGothic.ttf", 32);
                //             processing.textFont(primaryFont, 16);
                //             processing.textAlign(processing.CENTER);
                //             processing.fill(65, 65, 65);

                //             if (behavior.qualities.brightness === 100) {
                //                 // Update visual interface
                //                 processing.text("on", nearestX, nearestY + 4);

                //                 // TODO: Perform pre-state update procedure

                //                 // Update behavior qualities
                //                 behavior.options.value = (behavior.qualities.brightness === 0 ? 0 : 1); // HACK: brightness ranges from 0–100, options.value ranges from 0 to 1
                //             } else {
                //                 processing.text("off", nearestX, nearestY + 4);

                //                 // TODO: Perform pre-state update procedure

                //                 // Update behavior qualities
                //                 behavior.options.value = (behavior.qualities.brightness === 0 ? 0 : 1); // HACK: brightness ranges from 0–100, options.value ranges from 0 to 1
                //             }
                //         }
                //     }

                //     // Calculate nearest point on circle
                //     //line(behavior.x, behavior.y, screenWidth / 2, screenHeight / 2);
                // }

                // Update state
                // if (!disableEventCreate) {
                //     if (device.processing.behaviorPalette != null) {

                //         var behaviorCount = device.processing.behaviorPalette.behaviors.length;
                //         console.log("behaviorCount = " + behaviorCount);
                //         for (var i = 0; i < behaviorCount; ) {

                //             if (device.processing.behaviorPalette.behaviors[i].state === 'PROTOTYPE') {
                //                 device.processing.behaviorPalette.behaviors.splice(i, 1);
                //                 behaviorCount--;
                //                 continue;                                
                //             }

                //             i++;
                //         }

                //         // console.log("looperInstance = ");
                //         // console.log(device.processing.looperInstance);
                //         // device.processing.behaviorPalette = new BehaviorPalette({ looperInstance: device });
                //         // device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
                //         // device.processing.behaviorPalette.updatePosition();
                //         // device.processing.setupBehaviorPalette();
                //         // console.log(device.processing.behaviorPalette);

                //         // Destroy behavior palette!
                //         device.processing.behaviorPalette = null;
                //     }
                // }

                // Draw based on latest state
                for (var i = 0; i < this.interfaces.length; i++) {
                    this.interfaces[i].draw();
                }

                // processing.popMatrix();
            }

            // /**
            //  * Draws the behavior palette.
            //  */
            // function drawBehaviorPalette() {

            //     processing.behaviorPalette.updatePosition();

            //     if (processing.behaviorPalette.visible) {
            //         drawBehaviors();
            //     }

            //     function drawBehaviors() {

            //         var behaviorCount = processing.behaviorPalette.behaviors.length;
            //         for(var i = 0; i < behaviorCount; i++) {
            //             var behavior = processing.behaviorPalette.behaviors[i];

            //             processing.pushMatrix();

            //             // Draw the palette
            //             processing.fill(66, 214, 146);
            //             processing.ellipse(processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y, 80, 80);

            //             primaryFont = processing.createFont("/DidactGothic.ttf", 32);
            //             processing.textFont(primaryFont, 16);
            //             processing.textAlign(processing.CENTER);
            //             processing.fill(65, 65, 65);
            //             processing.text(behavior.label, processing.behaviorPalette.x + behavior.x, processing.behaviorPalette.y + behavior.y + 4);

            //             processing.popMatrix();
            //         }
            //     }
            // }

            /**
             * Updates position of event node.
             */
            // processing.updatePosition = function(loopBehavior) {

            //     if (loopBehavior.x !== loopBehavior.xTarget || loopBehavior.y !== loopBehavior.yTarget) { // FREE
            //         //console.log("Rendering ghost");
            //     }

            //     // if (loopBehavior.state === 'MOVING') {

            //     //     // Standard update for a moving event
            //     //     currentMouseX = processing.screenWidth * (processing.deviceCount + 1) + processing.mouseX;
            //     //     loopBehavior.interface.x = currentMouseX;
            //     //     loopBehavior.interface.y = processing.mouseY;

            //     //     deltaX = currentMouseX - (processing.screenWidth / 2);
            //     //     deltaY = processing.mouseY - (processing.screenHeight / 2);
            //     //     angleInDegrees = Math.atan2(deltaY, deltaX);

            //     //     loopBehavior.interface.xTarget = processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
            //     //     loopBehavior.interface.yTarget = processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

            //     //     // Check if under certain distance from the circle (and attach to)
            //     //     var distance = processing.lineDistance(loopBehavior.interface.x, loopBehavior.interface.y, loopBehavior.interface.xTarget, loopBehavior.interface.yTarget);

            //     //     if (distance < 110) { // ENTANGLED
            //     //         processing.line(loopBehavior.interface.x, loopBehavior.interface.y, loopBehavior.interface.xTarget, loopBehavior.interface.yTarget);

            //     //         // Draw the "would be" position that the event node would occupy
            //     //         processing.fill(66, 214, 146, 50);
            //     //         processing.ellipse(loopBehavior.interface.xTarget, loopBehavior.interface.yTarget, 50, 50);

            //     //         // Snap to event loop
            //     //         if (!disableEventCreate) {
            //     //             deltaX = processing.mouseX - (processing.screenWidth / 2);
            //     //             deltaY = processing.mouseY - (processing.screenHeight / 2);
            //     //             //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
            //     //             angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

            //     //             loopBehavior.interface.x = processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
            //     //             loopBehavior.interface.y = processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
            //     //         }
            //     //     }

            //     // }
            //     // else if (loopBehavior.state === 'FLOATING') {
            //     //     processing.fill(66, 214, 146, 50);
            //     //     processing.ellipse(loopBehavior.interface.x, loopBehavior.interface.y, 70, 70);
            //     // }
            // }

            /**
             * Returns the sequence of behaviors in the event queue.
             */
            function getBehaviorSequence() {
                var behaviorSequence = [];

                var eventCount = processing.loopSequence.behaviors.length;

                // Populate array for sorting
                for (var i = 0; i < eventCount; i++) {
                    var loopBehavior = processing.loopSequence.behaviors[i];
                    if (loopBehavior.state === 'SEQUENCED') {
                        
                        behaviorSequence.push({
                            event: loopBehavior,
                            angle: processing.getAngle(loopBehavior.x, loopBehavior.y)
                        });
                    }
                }

                // Perform insertion sort
                var i, j;
                var loopBehavior;
                eventCount = behaviorSequence.length;
                for (var i = 0; i < eventCount; i++) {
                    loopBehavior = behaviorSequence[i];

                    for (j = i-1; j > -1 && behaviorSequence[j].angle > loopBehavior.angle; j--) {
                        behaviorSequence[j+1] = behaviorSequence[j];
                    }

                    behaviorSequence[j+1] = loopBehavior;
                }

                console.log(behaviorSequence);

                for (var i = 0; i < behaviorSequence.length; i++) {
                    loopBehavior = behaviorSequence[i];

                    console.log(loopBehavior);

                    var behaviorScript = loopBehavior.event.procedure;
                }

                return behaviorSequence;
            }
            processing.getBehaviorSequence = getBehaviorSequence;

            /**
             * Returns the distance between the two specified points.
             */
            processing.lineDistance = function(x1, y1, x2, y2) {
                console.log("lineDistance");

                var xs = 0;
                var ys = 0;

                xs = x2 - x1;
                xs = xs * xs;

                ys = y2 - y1;
                ys = ys * ys;

                return Math.sqrt(xs + ys);
            }

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
            processing.getDistanceFromEventLoop = function(loopBehavior) {
                console.log("getDistanceFromEventLoop");
                console.log(loopBehavior);
                var distance = processing.lineDistance(loopBehavior.x, loopBehavior.y, loopBehavior.xTarget, loopBehavior.yTarget);
                return distance;
            }

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
            // drawBehaviorPalette();
        };
    });

    // sketch.options.crispLines = true;
    this.processing = new Processing(canvas, sketch);
    this.processing.canvas = canvas;
    this.processing.deviceCount = deviceCount;
    this.processing.looperInstance = this;

    // console.log("looperInstance = ");
    // console.log(this.processing.looperInstance);
    // this.processing.behaviorPalette = new BehaviorPalette({ looperInstance: this });
    // this.processing.setupBehaviorPalette();
    // console.log(this.processing.behaviorPalette);

    console.log("FUN!");
    console.log(this.processing.looperInstance);

    // iface = new Interface({ processing: this.processing });



    // this.loopSequence = this.processing.loopSequence;
    // console.log(this.processing);
}
