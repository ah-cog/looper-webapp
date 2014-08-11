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

        // Check for interaction with interfaces
        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.touch();
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

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                interfaces[i].events.release();
                break;
            }
        }

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

                // Draw based on latest state
                for (var i = 0; i < this.interfaces.length; i++) {
                    this.interfaces[i].draw();
                }

                // processing.popMatrix();
            }

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
        };
    });

    // sketch.options.crispLines = true;
    this.processing = new Processing(canvas, sketch);
    this.processing.canvas = canvas;
    this.processing.deviceCount = deviceCount;
    this.processing.looperInstance = this;
}
