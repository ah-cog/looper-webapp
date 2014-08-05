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

// TODO: Define a domain-specific language for the microcontroller.
function saveScript() {
    // var script = "" + firepadDevice.firepad.getText();
    // firepadEvent.behavior = eval('(' + script + ')');
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
        events: [],
        going: false,
        position: 0
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.events = options.events; // events on the event loop

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

        // Stop all events in the event loop
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].stop();
        }
        this.position = 0; // Reset position
    }
    this.stop = stop;

    function step() {
        if (this.going) {
            var previousEvent = this.events[this.position];
            if (previousEvent !== undefined) {
                previousEvent.stop();
            }

            this.position = (this.position + 1) % this.events.length;
            // console.log('new position = ' + this.position);

            var currentEvent = this.events[this.position];
            currentEvent.go();

            // currentEvent.behavior(); // NOTE: Uncomment this to call the behavior every time it is "going"
        }
    }
    this.step = step;

    /**
     * Re-orders the events in the event loop.
     */
    function updateOrdering() {
        var eventSequence = [];

        var eventCount = this.events.length;

        // Populate array for sorting
        for (var i = 0; i < eventCount; i++) {
            var loopEvent = this.events[i];
            if (loopEvent.state === 'SEQUENCED') {
                eventSequence.push({
                    event: loopEvent,
                    angle: getAngle(loopEvent.x, loopEvent.y)
                });
            }
        }

        // Perform insertion sort
        var i, j;
        var loopEvent;
        eventCount = eventSequence.length;
        for (var i = 0; i < eventCount; i++) {
            loopEvent = eventSequence[i];

            for (j = i-1; j > -1 && eventSequence[j].angle > loopEvent.angle; j--) {
                eventSequence[j+1] = eventSequence[j];
            }

            eventSequence[j+1] = loopEvent;
        }

        // Update the sequence to the sorted list of behaviors
        var updatedEventLoop = [];
        for (var i = 0; i < eventSequence.length; i++) {
            loopEvent = eventSequence[i];
            loopEvent.event.options.index = i; // HACK: Update the behavior's index in the loop
            updatedEventLoop.push(loopEvent.event);
        }

        this.events = updatedEventLoop;
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

function Event(options) {
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

function Behavior(options) {
    var defaults = {
        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        // state: 'INVALID', // INVALID, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        // go: null,
        // going: false,
        label: '?',
        visible: false,
        script: null, // The script to do the behavior. The "script" to run to execute the behavior.
        options: {}
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.label = options.label;

    this.visible = options.visible;

    this.script = options.script;
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
    function addBehavior(x, y, label, script, options) {
        var behavior = new Behavior({
            x: x, // was ev.gesture.center.pageX,
            y: y, // was ev.gesture.center.pageY,
            xTarget: x,
            yTarget: y,
            label: label,

            // e.g.,
            // script: function() {
            //     console.log("DOING " + this.label);
            // }
            script: script,
            options: options
        });
        console.log(behavior.script);
        console.log(behavior.options);
        this.behaviors.push(behavior);
    }
    this.addBehavior = addBehavior;
}

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
        var eventCount = device.processingInstance.loopSequence.events.length;

        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.events[i];
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

                // Check if palette option is touched
                if ((ev.gesture.center.pageX - 50 < behaviorPalette.x + behavior.x && behaviorPalette.x + behavior.x < ev.gesture.center.pageX + 50)
                    && (ev.gesture.center.pageY - 50 < behaviorPalette.y + behavior.y && behaviorPalette.y + behavior.y < ev.gesture.center.pageY + 50)) {

                    // Hide the behavior palette
                    device.processingInstance.behaviorPalette.visible = false;

                    // Create behavior node
                    var nearestPosition = device.processingInstance.getNearestPositionOnEventLoop(ev.gesture.center.pageX, ev.gesture.center.pageY);

                    var loopEvent = new Event({
                        x: device.processingInstance.behaviorPalette.x + behavior.x,
                        y: device.processingInstance.behaviorPalette.y + behavior.y,
                        xTarget: nearestPosition.x,
                        yTarget: nearestPosition.y
                    });

                    // Update for selected behavior
                    loopEvent.label = behavior.label;
                    loopEvent.behavior = behavior.script;
                    loopEvent.options = behavior.options;

                    console.log(loopEvent);

                    // Update the state of the event node
                    loopEvent.state = 'MOVING';
                    device.processingInstance.loopSequence.events.push(loopEvent);
                }

            }
        }

        //
        // Get the touched event node, if one exists
        //
        var eventCount = device.processingInstance.loopSequence.events.length;

        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.events[i];
            if ((ev.gesture.center.pageX - 50 < loopEvent.x && loopEvent.x < ev.gesture.center.pageX + 50)
                && (ev.gesture.center.pageY - 50 < loopEvent.y && loopEvent.y < ev.gesture.center.pageY + 50)) {

                //loopEvent.visible = false;
                loopEvent.state = 'MOVING';
                disableEventCreate = true;

                console.log("\tevent " + i);
                break;
            }
        }

        //
        // Check of "go" button touched
        //

        // if ((ev.gesture.center.pageX - 50 < (device.processingInstance.screenWidth / 2) && (device.processingInstance.screenWidth / 2) < ev.gesture.center.pageX + 50)
        //     && (ev.gesture.center.pageY - 50 < (device.processingInstance.screenHeight - 100) && (device.processingInstance.screenHeight - 100) < ev.gesture.center.pageY + 50)) {

        //     var sequence = device.processingInstance.getBehaviorSequence();

        //     // Start the event loop if any events exist
        //     if (sequence.length > 0) {
        //         //console.log("go");
        //         device.processingInstance.loopSequence.toggle(); // toggle "go" and "stop"
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

        // Get the touched object, if one exists
        var eventCount = device.processingInstance.loopSequence.events.length;
        for (var i = 0; i < eventCount; i++) {
            var loopEvent = device.processingInstance.loopSequence.events[i];

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

                    // Start the event loop if any events exist
                    var sequence = device.processingInstance.getBehaviorSequence();
                    if (sequence.length > 0) {
                        device.processingInstance.loopSequence.go(); // toggle "go" and "stop"
                    }

                    // Callback to server to update the program
                    loopEvent.behavior(loopEvent.options);

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

            // var loopEvent = new Event({
            //     x: ev.gesture.center.pageX,
            //     y: ev.gesture.center.pageY,
            //     xTarget: nearestPosition.x,
            //     yTarget: nearestPosition.y
            // });

            // loopEvent.state = 'MOVING';
            // device.processingInstance.loopSequence.events.push(loopEvent);
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

    function getLooper() {
      return this.looper;
    }
    this.getLooper = getLooper;

    /**
     * Returns the device at the specified index.
     */
    function getDevice(index) {
      return this.looper.devices[index];
    }
    this.getDevice = getDevice;

    /**
     * Returns the device at the specified index.
     */
    function getAddress() {
      return this.address;
    }
    this.getAddress = getAddress;

    /**
     * Returns the behavior of the device with the specified index.
     */
    function getBehaviorSequence(deviceIndex) {
      return this.looper.devices[deviceIndex].processingInstance.loopSequence.events;
    }
    this.getBehaviorSequence = getBehaviorSequence;

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
            // yTarget: nearestPosition.y
            visible: false
        });

        /**
         * Setup behavior palette.
         */
        processing.setupBehaviorPalette = function() {
            // Add "default" behaviors to palette
            processing.behaviorPalette.addBehavior(-100, 0, 'light', function(options) {
                console.log('light on top level');
                setPin(options);
                // TODO: Keep track of state... has this been sent yet?
            }, { index: -1, pin: 13, operation: 1, type: 0, mode: 1, value: 1 });

            processing.behaviorPalette.addBehavior(100, 0, 'time', function(options) {
                console.log('delay top level');
                delay(options);
            }, { index: -1, milliseconds: 1000 });
            
            processing.behaviorPalette.addBehavior(0, 0, 'motion', function(options) {
                console.log('light off top level');

                setPin(options);
            }, { index: -1, pin: 13, operation: 1, type: 0, mode: 1, value: 0 });
        }

        /**
         * Override setup function.
         */
        processing.setup = function() {
            processing.size(processing.screenWidth, processing.screenHeight);

            this.font = processing.loadFont("http://physical.computer/DidactGothic.ttf");

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

                var eventCount = processing.loopSequence.events.length;
                for (var i = 0; i < eventCount; i++) {
                    var behavior = processing.loopSequence.events[i];

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

                    primaryFont = processing.createFont("http://physical.computer/DidactGothic.ttf", 32);
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

                        primaryFont = processing.createFont("http://physical.computer/DidactGothic.ttf", 32);
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
             * @param  {[type]} loopEvent [description]
             * @return {[type]}           [description]
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
             * Returns the sequence of events in the event queue.
             * @return {[type]} [description]
             */
            function getBehaviorSequence() {
                var eventSequence = [];

                var eventCount = processing.loopSequence.events.length;

                // Populate array for sorting
                for (var i = 0; i < eventCount; i++) {
                    var loopEvent = processing.loopSequence.events[i];
                    if (loopEvent.state === 'SEQUENCED') {
                        
                        eventSequence.push({
                            event: loopEvent,
                            angle: processing.getAngle(loopEvent.x, loopEvent.y)
                        });
                    }
                }

                // Perform insertion sort
                var i, j;
                var loopEvent;
                eventCount = eventSequence.length;
                for (var i = 0; i < eventCount; i++) {
                    loopEvent = eventSequence[i];

                    for (j = i-1; j > -1 && eventSequence[j].angle > loopEvent.angle; j--) {
                        eventSequence[j+1] = eventSequence[j];
                    }

                    eventSequence[j+1] = loopEvent;
                }

                console.log(eventSequence);

                for (var i = 0; i < eventSequence.length; i++) {
                    loopEvent = eventSequence[i];

                    console.log(loopEvent);

                    var behaviorScript = loopEvent.event.behavior;
                }

                return eventSequence;
            }
            processing.getBehaviorSequence = getBehaviorSequence;

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

            function getPointOnCircle(radius, originX, originY, angle) {
                //var radius = 50;
                //var originX = 400;
                //var originY = 400;
                //var angle = 40;

                x = originX + radius * Math.cos(angle);
                y = originY + radius * Math.sin(angle);

                var result = { x: x, y: y };

                return result;
            }

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

            function getDistanceFromEventLoop(loopEvent) {
                var distance = processing.lineDistance(loopEvent.x, loopEvent.y, loopEvent.xTarget, loopEvent.yTarget);
                return distance;
            }
            processing.getDistanceFromEventLoop = getDistanceFromEventLoop;

            /** Start of actual loop instructions. The things above are definitions. */

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
