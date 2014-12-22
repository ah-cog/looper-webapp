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



    function handleHammer (ev) {
        // console.log(ev);
        // disable browser scrolling
        ev.gesture.preventDefault();

        if (!disableEventCreate && !looper.getCurrentDevice().processing.draggingCanvas) {

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
function setupGestures (device) {

    var currentCanvas = '#' + device.canvas;

    /**
     * Handle "tap" events.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on("tap", function(ev) {
        console.log("'tap' event!");

        var touches = ev.gesture.touches;

        // Update the previous touch state history
        // device.touch = { touching: true, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, touch: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
        device.touch.touching = true;
        device.touch.holding = false;
        device.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
        device.touch.touch = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

        //
        // Get the touched event node, if one exists
        //
        var eventCount = device.processing.loopSequence.behaviors.length;

        for (var i = 0; i < eventCount; i++) {
            var loopBehavior = device.processing.loopSequence.behaviors[i];
            if ((ev.gesture.center.pageX - 50 < loopBehavior.x && loopBehavior.x < ev.gesture.center.pageX + 50)
                && (ev.gesture.center.pageY - 50 < loopBehavior.y && loopBehavior.y < ev.gesture.center.pageY + 50)) {

                // TODO: Handle "tap" event.
            }
        }

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY));
            // if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
            // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;

            // Map raw touch coordinates onto the current device's Processing rendering context coordinates
            var newX = (ev.gesture.center.pageX - $(window).width() / 2);
            var newY = (ev.gesture.center.pageY - ($(window).height() / 2));

            //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            if (interfaces[i].touches(newX, newY)) {
                interfaces[i].events.tap();
                break;
            }
        }
    });

    /**
     * Handle "touch" events.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on ("touch", function(ev) {
        console.log("'touch' event!");

        var touches = ev.gesture.touches;

        console.log (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
        console.log (device.processing.mouseY);

        // Save mouse touch location
        device.processing.mouse_x = (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
        device.processing.mouse_y = device.processing.mouseY;

        // Store previous offset
        device.processing.xOffsetPrevious = device.processing.xOffset;
        device.processing.yOffsetPrevious = device.processing.yOffset;

        // Update the previous touch state history
        // device.touch = { touching: true, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, touch: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
        device.touch.touching = true;
        device.touch.holding = false;
        device.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
        device.touch.touch = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

        device.processing.draggingCanvas = false; // device.touch.draggingCanvas = false;

        // console.log ("here!!");
        // console.log (((ev.gesture.center.pageX - device.processing.centerX) / device.processing.scaleFactor) + device.processing.previousCenterX);

        var touchingCanvas = true;

        // Check for interaction with interfaces
        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
            // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;
            // Map raw touch coordinates onto the current device's Processing rendering context coordinates
            var newX = (ev.gesture.center.pageX - $(window).width() / 2);
            var newY = (ev.gesture.center.pageY - ($(window).height() / 2));

            //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            if (interfaces[i].touches (newX, newY)) {
                interfaces[i].events.touch();
                touchingCanvas = false; // Flag that an interface is being touched
                break;
            }
        }

        if (touchingCanvas) {
            //device.touch.draggingCanvas = true;
            device.processing.draggingCanvas = true;
        }

        // if (!disableEventCreate) {
        //     disableEventCreate = true;

        //     var touches = ev.gesture.touches;

        //     if (device.processing.behaviorPalette == null) {
        //         console.log("looperInstance = ");
        //         console.log(device.processing.looperInstance);
        //         device.processing.behaviorPalette = new BehaviorPalette({ looperInstance: device });
        //         device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
        //         device.processing.behaviorPalette.updatePosition();
        //         device.processing.setupBehaviorPalette();
        //         console.log(device.processing.behaviorPalette);
        //     }

        //     // Show behavior palette
        //     // device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
        //     device.processing.behaviorPalette.show();
        //     console.log(device.processing.behaviorPalette);
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

        console.log ("Processing (mouseX, mouseY): " + device.processing.mouseX + ", " + device.processing.mouseY);

        // console.log (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
        // console.log (device.processing.mouseY);

        var screenMouseX = ((looper.getCurrentPane() + 1) * device.processing.screenWidth) + device.processing.mouseX;
        var screenMouseY = device.processing.mouseY;
        console.log ("Screen (mouseX, mouseY), calculated: " + screenMouseX + ", " + screenMouseY);

        var canvasMouseX = ((looper.getCurrentPane()) * device.processing.screenWidth) + device.processing.mouseX + (device.processing.xOffsetOrigin);
        var canvasMouseY = device.processing.mouseY - (device.processing.yOffsetOrigin);
        console.log ("Canvas (mouseX, mouseY), calculated: " + canvasMouseX + ", " + canvasMouseY);

        console.log ("zoomFactor: " + device.processing.zoomFactor);
        var pannedCanvasMouseX = (1 + (1 - device.processing.zoomFactor)) * (((looper.getCurrentPane()) * device.processing.screenWidth) + (device.processing.mouseX + device.processing.xOffsetOrigin - device.processing.xOffset));
        var pannedCanvasMouseY = (1 + (1 - device.processing.zoomFactor)) *  (device.processing.mouseY - (device.processing.yOffsetOrigin) - (device.processing.yOffset));
        console.log ("Panned canvas (mouseX, mouseY), calculated: " + pannedCanvasMouseX + ", " + pannedCanvasMouseY);

        if (device.processing.draggingCanvas == true) {
            //device.touch.draggingCanvas = true;
            device.processing.draggingCanvas = false;

            // Save mouse touch location
            var currentMouseX = (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
            var currentMouseY = device.processing.mouseY;

            // Store previous offset
            device.processing.xOffset = currentMouseX - device.processing.mouse_x + device.processing.xOffsetPrevious;
            device.processing.yOffset = currentMouseY - device.processing.mouse_y + device.processing.yOffsetPrevious;
        }

        // Update the previous touch state history
        // device.touch = { touching: false, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, release: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
        device.touch.touching = false;
        device.touch.holding = false;
        device.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
        device.touch.release = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

        // Check for touches on interfaces
        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            // if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
            // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;
            // Map raw touch coordinates onto the current device's Processing rendering context coordinates
            var newX = (ev.gesture.center.pageX - $(window).width() / 2);
            var newY = (ev.gesture.center.pageY - ($(window).height() / 2));

            //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            if (interfaces[i].touches(newX, newY)) {
                interfaces[i].events.release();
                break;
            }
        }

        // Check if the touch was momentary
        if (device.touch.release.t - device.touch.touch.t < 200) {
            // TODO: Create a "none" behavior
        }

        // ev.gesture.preventDefault();
        // ev.stopPropagation();
        // ev.gesture.stopPropagation();
        // return;
    });

    /**
     * Handle "hold" touch event.
     */
    $(currentCanvas).hammer ({ drag_max_touches: 0, hold_timeout: 200 }).on ("hold", function (ev) {
        console.log("'hold' event!");

        // Update the previous touch state history
        // device.touch = { touching: true, holding: true, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
        device.touch.touching = true;
        device.touch.holding = true;
        device.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

        // If the canvas is being dragged, cancel the drag since a hold is detected
        if (device.processing.draggingCanvas) {
            device.processing.draggingCanvas = false;
        }

        for (var i = 0; i < interfaces.length; i++) {
            console.log(interfaces[i]);
            // if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
            // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;
            // Map raw touch coordinates onto the current device's Processing rendering context coordinates
            var newX = (ev.gesture.center.pageX - $(window).width() / 2);
            var newY = (ev.gesture.center.pageY - ($(window).height() / 2));

            //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
            if (interfaces[i].touches(newX, newY)) {
                //looper.interfaces[i].events.hold();
                interfaces[i].events.release ();
                break;
            }
        }



        // Check if "behavior palette" was requested
        if (!disableEventCreate) {
            disableEventCreate = true;

            var touches = ev.gesture.touches;

            if (device.processing.behaviorPalette == null) {
                console.log("looperInstance = ");
                console.log(device.processing.looperInstance);
                device.processing.behaviorPalette = new BehaviorPalette ({ superstructure: device });
                // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
                // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;
                //device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
                //device.processing.mouse_x = (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
                //device.processing.mouse_y = device.processing.mouseY;
                console.log("MAKING BEHAVIOR PALETTE AT: ");
                console.log (device.processing.mouse_x);
                console.log (device.processing.mouseY);
                device.processing.behaviorPalette.setPosition (device.processing.mouse_x - ($(window).width() / 2), device.processing.mouseY - ($(window).height() / 2));
                device.processing.behaviorPalette.updatePosition ();
                device.processing.setupBehaviorPalette ();
                console.log (device.processing.behaviorPalette);

                // Center behavior palette on screen and zoom in on it
                // looper.zoomIn ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, factor: 2.0 });
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
function Looper (options) {
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
        var device = new LooperInstance ({ canvas: canvas, address: options['address'] });
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
        var currentDeviceIndex = this.getCurrentPane ();
        return this.devices[currentDeviceIndex];
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

    // Attaches an interface to the currently selected Looper instance.
    this.attachInterface = function (options) {

        var currentLooper = this.getCurrentDevice ();
        currentLooper.attachInterface (options);
    }

    // Returns the interface of the currently selected Looper instance.
    this.getInterface = function (options) {
        var currentLooper = this.getCurrentDevice ();
        return currentLooper.getInterface (options);
    }

    this.zoomIn = function (options) {

        // var looper = this.getCurrentDevice ();
        // looper.processing.zoomFactor = options['factor']; // Math.pow(options['factor'], 1);
        // // looper.processing.previousCenterX = looper.processing.centerX;
        // // looper.processing.previousCenterY = looper.processing.centerY;
        // // looper.processing.centerX = options['x'];
        // // looper.processing.centerY = options['y'];

        // // looper.processing.unscaleFactor = looper.processing.unscaleFactor * looper.processing.zoomFactor;

        // looper.processing.translate (looper.processing.xOrigin, looper.processing.yOrigin);

        // looper.processing.scale (looper.processing.zoomFactor * looper.processing.scaleFactor);

        // var xTranslate = -( options['x'] / looper.processing.scaleFactor + looper.processing.xOrigin - options['x'] / ( looper.processing.scaleFactor * looper.processing.zoomFactor ));
        // var yTranslate = -( options['y'] / looper.processing.scaleFactor + looper.processing.yOrigin - options['y'] / ( looper.processing.scaleFactor * looper.processing.zoomFactor ));
        // looper.processing.translate (xTranslate, yTranslate);

        // looper.processing.xOrigin = ( options['x'] / looper.processing.scaleFactor + looper.processing.xOrigin - options['x'] / ( looper.processing.scaleFactor * looper.processing.zoomFactor ) );
        // looper.processing.yOrigin = ( options['y'] / looper.processing.scaleFactor + looper.processing.yOrigin - options['y'] / ( looper.processing.scaleFactor * looper.processing.zoomFactor ) );
        // looper.processing.scaleFactor = looper.processing.scaleFactor * looper.processing.zoomFactor;

        var looper = this.getCurrentDevice ();
        looper.processing.zoomFactor = Math.pow(options['factor'], 1);
        looper.processing.previousCenterX = looper.processing.centerX;
        looper.processing.previousCenterY = looper.processing.centerY;
        looper.processing.centerX = options['x'];
        looper.processing.centerY = options['y'];

        looper.processing.unscaleFactor = looper.processing.unscaleFactor * looper.processing.zoomFactor;

        looper.processing.translate (looper.processing.previousCenterX, looper.processing.previousCenterY);
        // this.translate (this.screenWidth / 2, this.screenHeight / 2);
        looper.processing.scale (looper.processing.zoomFactor * looper.processing.scaleFactor);
        looper.processing.translate (-1 * looper.processing.centerX, -1 * looper.processing.centerY);
    }

    this.zoomOut = function (options) {
        var looper = this.getCurrentDevice ();

        looper.processing.translate (-1 * looper.processing.centerX, -1 * looper.processing.centerY);
        // this.translate (this.screenWidth / 2, this.screenHeight / 2);
        //looper.processing.scale (looper.processing.zoomFactor * looper.processing.scaleFactor);
        looper.processing.scale (0.5);
        looper.processing.translate (looper.processing.previousCenterX, looper.processing.previousCenterY);
        
    }

    // this.zoomOut = function (options) {
    //     var looper = this.getCurrentDevice ();
    //     looper.processing.zoomFactor = Math.pow(options['factor'], -1); // looper.processing.scaleFactor / options['factor'];
    //     looper.processing.previousCenterX = looper.processing.centerX;
    //     looper.processing.previousCenterY = looper.processing.centerY;
    //     looper.processing.centerX = options['x'];
    //     looper.processing.centerY = options['y'];

    //     // Math.pow(scaleFactor,clicks);
    //     looper.processing.translate (looper.processing.previousCenterX, looper.processing.previousCenterY);
    //     // this.translate (this.screenWidth / 2, this.screenHeight / 2);
    //     looper.processing.scale (looper.processing.zoomFactor * looper.processing.scaleFactor);
    //     looper.processing.translate (-1 * looper.processing.centerX, -1 * looper.processing.centerY);
    // }
}

function Loop (options) {
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

function Behavior (options) {

    var defaults = {
        superstructure: null,

        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        state: 'PROTOTYPE', // NONE, PROTOTYPE, FLOATING, MOVING, ENTANGLED, SEQUENCED
        //visible: true
        procedure: null,
        options: {},
        going: false,
        label: '?',

        uuid: null // NOTE: This is set after receiving a response from Looper (containing the Behavior's UUID set by Looper.)
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.uuid = options.uuid;

    this.procedure = options.procedure;
    this.options = options.options;
    this.options.behavior = this; // Set the behavior associated with the procedure and options

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.state = options.state;

    this.go = options.go;

    this.label = options.label;

    //this.visible = options.visible;
    this.going = options.going;

    this.go = function () {
        this.going = true;
    }

    this.stop = function () {
        this.going = false;
    }



    // console.log ("BLEH!");
    // console.log (options.superstructure);
    // console.log (this.superstructure);

    //this.looperInstance = options.looperInstance;
    this.superstructure = options.superstructure; // The superstructure is the structure that semantically contains this structure as a component. The superstructure may also contain structure other this one.
    this.substructures = []; // The substructures are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getSuperstructure = function (options) {
        return this.superstructure;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getSubstructure = function (options) {
        return this.substructure;
    }

    //! Returns the Looper for which the structure was created.
    //!
    // this.getLooper = function (options) {
    //     return this.superstructure;
    // }

    //! Attaches an interface to this structure, enabling it to be rendered.
    //!
    this.attachInterface = function (options) {

        // Create and attach the specified interface to this structure
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        // If no default interface has been specified, set the one that was just added as the default.
        if (this.interface === null) {
            this.interface = this.interfaces[0];
        }
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    //! TODO: Rename this to "fabricate", "visualize", "render", or something else that's more general that makes sense for any kind of representation, including but not limited to 2D screens and 3D headsets (i.e., VR).
    //!
    this.draw = function (options) {
        // console.log ("drawing behavior");
        //var interface = this.getInterface ();
        if (this.interface !== undefined && this.interface !== null) {

            // Draw this structure
            this.interface.draw ();

            // Draw the substructure
            for (var i = 0; i < this.substructures.length; i++) {
                this.substructures[i].draw ();
            }
        }
    }
}

interfaces = []; // TODO: Move this into Looper class?
function Interface (options) {
    var defaults = {
        // parent: null,
        structure: null,

        type: 'none',

        xOrigin: 0,
        yOrigin: 0,
        x: 100,
        y: 100,
        xOffset: 0,
        yOffset: 0,
        xTarget: 0,
        yTarget: 0,

        // TODO: state: {},
        events: {}, // Event handlers for interaction (i.e., tap, touch, hold, swipe, etc.)
        update: null, // Function to update the state of the interface
        draw: null, // Function to draw the control interface

        visible: true,

        processing: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    //this.parent = options.parent; // The interface's "parent" that it represents graphically
    this.structure = options.structure;

    this.interfaces = []; // The interface's within this interface (if any), i.e., hierarchical/fractal interface.

    this.xOrigin = options.xOrigin;
    this.yOrigin = options.yOrigin;
    this.x = options.x;
    this.y = options.y;
    this.xOffset = options.xOffset;
    this.yOffset = options.yOffset;
    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.processing = options.processing;
    this.events = options.events;
    this.update = options.update;
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

    // TODO: this.attachInterface = function (options, name/tag, condition) {
    this.attachInterface = function (options) {

        // Attach the specified interface to the specified object
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        return newInterface;
    }

    // Add interface to list of interfaces
    // interfaces.push (this);
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

function BehaviorPalette (options) {

    var defaults = {
        //looperInstance: null,
        superstructure: null,

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

    console.log ("CREATING BehaviorPalette");
    console.log (options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.behaviors = options.behaviors;

    // this.state = options.state;

    this.label = options.label;

    this.visible = options.visible;

    this.setPosition = function (x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }

    this.updatePosition = function () {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }

    //this.looperInstance = options.looperInstance;
    this.superstructure = options.superstructure; // The superstructure is the structure that semantically contains this structure as a component. The superstructure may also contain structure other this one.
    this.substructures = []; // The substructures are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    // Add this structure to the superstructure's substructure.
    if (this.superstructure !== undefined && this.superstructure !== null) {
        this.superstructure.substructures.push (this);
    }

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getSuperstructure = function (options) {
        return this.superstructure;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getSubstructure = function (options) {
        return this.substructures;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getLooper = function (options) {
        return this.superstructure;
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    //! TODO: Rename this to "fabricate", "visualize", "render", or something else that's more general that makes sense for any kind of representation, including but not limited to 2D screens and 3D headsets (i.e., VR).
    //!
    this.draw = function (options) {
        // console.log ("drawing palette");
        //var interface = this.getInterface ();
        if (this.interface !== undefined && this.interface !== null) {

            // Draw this structure
            this.interface.draw ();
        }

        // Draw the substructure
        for (var i = 0; i < this.substructures.length; i++) {
            this.substructures[i].draw ();
        }
    }

    // console.log("!!!!!");
    // console.log(this.looperInstance);

    /**
     * Adds a behavior node to the behavior palette
     */
    this.addBehavior = function (options) {
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

        // Set the parent to the behavior palette
        //options.parent = this;
        options.superstructure = this;

        console.log("ADDING BEHAVIOR");
        console.log(options);

        // Construct the behavior
        var behavior = new Behavior ({
            // parent: options.parent,
            superstructure: options.superstructure,

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

        // Add the Behavior to the palette's substructure
        this.substructures.push (behavior);

        // Attach Interface to behavior
        behavior.attachInterface ({

            // parent: behavior, // The "entity" that this interface represents visually.
            structure: behavior,

            processing: this.superstructure.processing,

            // xOrigin: superstructure.x,
            // yOrigin: superstructure.y,
            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            touches: function (x, y) {
                console.log ("touches");
                console.log ("x: " + x + ", y: " + y);
                console.log ("x': " + (x - $(window).width() / 2) + ", y': " + (y - ($(window).height() / 2)));
                console.log ("this.x: " + this.x + ", this.y: " + this.y);
                var radius = 50;
                console.log(x, y, this.x, this.y);
                console.log ("structure:");
                console.log (this.structure);
                console.log (this.structure.superstructure);
                if ((this.x - radius < x && this.x + radius > x) && (this.y - radius < y && this.y + radius > y)) {
                // if ((x - radius < this.processing.behaviorPalette.x + this.x && this.processing.behaviorPalette.x + this.x < x + radius)
                //     && (y - radius < this.processing.behaviorPalette.y + this.y && this.processing.behaviorPalette.y + this.y < y + radius)) {

                    return true;
                }

                return false;
            },

            draw: function() {

                // update:
                if (looper.getCurrentDevice ().touch.touching === true) {
                    if (looper.getCurrentDevice ().touch.behavior === behavior) {
                        if (behavior.state === 'SEQUENCED') {

                            var distance = Math.sqrt ( Math.pow ((looper.getCurrentDevice ().touch.current.x) - (looper.getCurrentDevice ().touch.touch.x), 2) + Math.pow ((looper.getCurrentDevice ().touch.current.y) - (looper.getCurrentDevice ().touch.touch.y), 2) );
                                
                            if (distance > 25) {
                                behavior.state = 'MOVING';
                            }

                        }
                    }
                }
                
                // Update the behavior's position if it's moving
                if (behavior.state === 'MOVING') {

                    var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop (behavior.interface.processing.mouseX, behavior.interface.processing.mouseY);

                    console.log ("Nearest Position: " + nearestPosition.x + ", " + nearestPosition.y);
                    
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



                // if (this.processing.behaviorPalette.visible) {
                if (behavior.state === 'PROTOTYPE') {

                    //this.processing.behaviorPalette.updatePosition();
                    // this.processing.updatePosition(behavior);

                    this.processing.pushMatrix();

                    // Draw the behavior
                    //this.processing.fill(66, 214, 146);
                    this.processing.fill(255, 255, 255);
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
                        currentMouseX = (behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX) - (behavior.interface.processing.screenWidth / 2);
                        currentMouseY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);

                        console.log ("MIXEE");
                        console.log (behavior.interface.processing.mouseX);
                        console.log (behavior.interface.processing.mouseY);

                        behavior.interface.x = currentMouseX;
                        behavior.interface.y = currentMouseY;

                        // behavior.interface.x = ((behavior.interface.x - behavior.interface.processing.previousCenterX) / behavior.interface.processing.scaleFactor) + behavior.interface.processing.centerX;
                        // behavior.interface.y = ((behavior.interface.y - behavior.interface.processing.previousCenterY) / behavior.interface.processing.scaleFactor) + behavior.interface.processing.centerY;

                        // console.log ('behavior.interface.x:');
                        // console.log (behavior.interface.x);
                        // console.log ('behavior.interface.y:');
                        // console.log (behavior.interface.y);

                        deltaX = currentMouseX - (behavior.interface.processing.screenWidth / 2);
                        deltaY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);
                        angleInDegrees = Math.atan2(deltaY, deltaX);

                        behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                        behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                        // this.processing.behaviorPalette.updatePosition();
                        // this.processing.updatePosition(behavior);

                        // Check if under certain distance from the circle (and attach to)
                        // var newX = ((ev.gesture.center.pageX - device.processing.previousCenterX) / device.processing.scaleFactor) + device.processing.centerX;
                        // var newY = ((ev.gesture.center.pageY - device.processing.previousCenterY) / device.processing.scaleFactor) + device.processing.centerY;
                        var distance = this.processing.lineDistance(this.x, this.y, this.xTarget, this.yTarget);

                        // console.log("distance = ");
                        // console.log(distance);

                        if (distance < 110) { // ENTANGLED
                            this.processing.line (this.x, this.y, this.xTarget, this.yTarget);

                            // Draw the "would be" position that the event node would occupy
                            this.processing.fill (66, 214, 146, 50);
                            this.processing.ellipse (behavior.interface.xTarget, behavior.interface.yTarget, 50, 50);

                            // Snap to event loop
                            if (!disableEventCreate) {
                                deltaX = this.processing.mouseX - (this.processing.screenWidth / 2);
                                deltaY = this.processing.mouseY - (this.processing.screenHeight / 2);
                                //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                                angleInDegrees = Math.atan2 (deltaY, deltaX); // * 180 / PI;

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

                    //if (behavior.state === 'SEQUENCED') {
                    if (behavior.state === 'FOCUS') {

                        // TODO: Zoom in on behavior and lay out its properties on the side of it

                        behavior.properties = [
                            {
                                name: 'note',
                                minimum: 31,
                                maximum: 4978,
                                callback: function () { 
                                    console.log("NOTE");
                                    console.log (this);
                                    console.log (this.interface.value + " (scaled)");
                                    updateBehavior ({ type: 'sound', uuid: 691, note: parseInt (this.interface.value), duration: 1000 });
                                }
                            },
                            {
                                name: 'volume',
                                minimum: 0,
                                maximum: 100,
                                callback: function () { 
                                    console.log("VOLUME");
                                    console.log (this);
                                    console.log (this.interface.value + " (scaled)");
                                    updateBehavior ({ type: 'sound', uuid: 691, note: parseInt (this.interface.value), duration: 1000 });
                                }
                            }
                        ];

                        for (var i = 0; i < behavior.properties.length; i++) {

                            // slider = new Slider ({ superstructure: looper.getCurrentDevice() });
                            if (behavior.sliders === undefined || behavior.sliders === null) {
                                behavior.sliders = {};
                            }

                            if (behavior.sliders.hasOwnProperty (behavior.properties[i].name) === false) {
                                // console.log ("EH?");
                                // console.log (behavior);
                                newSlider = new Slider ({ superstructure: behavior, xOrigin: behavior.interface.x, yOrigin: behavior.interface.y, properties: behavior.properties[i] });
                                newSlider.x = 0;
                                newSlider.yTarget = 0 + i * 50;
                                // behavior.sliders.push (newSlider);
                                behavior.sliders[(behavior.properties[i].name)] = newSlider;

                                // if (behavior.slider1 === undefined || behavior.slider === null) {
                                //     // console.log ("EH?");
                                //     // console.log (behavior);
                                //     behavior.slider1 = new Slider ({ superstructure: behavior, xOrigin: behavior.interface.x, yOrigin: behavior.interface.y, properties: behavior.properties[1] });
                                //     console.log(behavior.slider1);
                                //     behavior.slider1.x = 0;
                                //     behavior.slider1.yTarget = 0 + i * 50;
                                // }
                            }

                            // Draw sub-interfaces!
                            for (var j = 0; j < behavior.interface.interfaces.length; j++) {
                                behavior.interface.interfaces[j].xOrigin = behavior.interface.x;
                                behavior.interface.interfaces[j].yOrigin = behavior.interface.y;
                                behavior.interface.interfaces[j].draw ();
                            }

                        }
                    }

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

                    looper.getCurrentDevice ().touch.behavior = behavior;

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

                        if (behavior.interface.processing.behaviorPalette != null) {

                            // Remove interfaces associated with the removed behaviors
                            var interfaceCount = interfaces.length;
                            // var interfaceCount = behavior.interface.processing.loopSequence.behaviors.length;
                            // console.log("interfaceCount = " + interfaceCount);
                            for (var i = 0; i < interfaceCount; ) {

                                console.log(interfaces[i]);

                                if (interfaces[i].structure.state === 'PROTOTYPE') {

                                    // Remove from structure
                                    // TODO: interfaces[i].structure.deleteInterface ();
                                    interfaces[i].structure.interface = null;

                                    // Remove from global array
                                    // TODO: Clean this up so it's not a global array! Eliminate the global array!
                                    interfaces.splice (i, 1);
                                    interfaceCount--;
                                    console.log("removing...");
                                    continue;                                
                                }

                                i++;
                            }

                            // Destroy behavior palette!
                            // TODO: Make sure deleting the behavior palette doesn't ruin the structure/substructure tree.
                            behavior.interface.processing.behaviorPalette = null;
                        }

                        if (behavior.interface.processing.behaviorPalette === null) {

                            // Zoom out to default perspective
                            //looper.zoomOut ({ x: behavior.interface.processing.screenWidth / 2, y: behavior.interface.processing.screenHeight / 2, factor: 2.0 });
                            // looper.zoomIn ({ x: 0, y: 0, factor: 0.5 });
                        }


                        // Add behavior to the Looper
                        behavior.interface.processing.loopSequence.behaviors.push (behavior);

                    } else if (behavior.state === 'FLOATING') {

                        behavior.state = 'MOVING';

                    } else if (behavior.state === 'SEQUENCED') {

                        // var distance = Math.sqrt ( Math.pow ((looper.getCurrentDevice ().touch.current.x) - (looper.getCurrentDevice ().touch.touch.x), 2) + Math.pow ((looper.getCurrentDevice ().touch.current.y) - (looper.getCurrentDevice ().touch.touch.y), 2) );
                        
                        // if (distance > 25) {
                        //     behavior.state = 'MOVING';
                        // }

                    }

                    // var distance = Math.sqrt ( Math.pow ((looper.getCurrentDevice ().touch.current.x) - (looper.getCurrentDevice ().touch.touch.x), 2) + Math.pow ((looper.getCurrentDevice ().touch.current.y) - (looper.getCurrentDevice ().touch.touch.y), 2) );
                        
                    // if (distance > 25) {
                    //     behavior.state = 'MOVING';
                    // }

                    // if (behavior.state === 'MOVING') {

                    //     var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop(behavior.interface.processing.mouseX, behavior.interface.processing.mouseY);
                        
                    //     behavior.interface.xTarget = nearestPosition.x;
                    //     behavior.interface.yTarget = nearestPosition.y;

                    //     // behavior.interface.processing.updatePosition(behavior);

                    //     // // Standard update for a moving event
                    //     // currentMouseX = behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX;
                    //     // behavior.interface.x = currentMouseX;
                    //     // behavior.interface.y = behavior.interface.processing.mouseY;

                    //     // deltaX = currentMouseX - (behavior.interface.processing.screenWidth / 2);
                    //     // deltaY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);
                    //     // angleInDegrees = Math.atan2(deltaY, deltaX);

                    //     // behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                    //     // behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                    //     // behavior.state = 'MOVING';

                    // }
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
                                behavior.interface.processing.loopSequence.go (); // toggle "go" and "stop"
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

                            // console.log("Deleting " + behavior.options.index);

                            //deleteBehavior({ index: behavior.options.index });
                            deleteBehavior ({ uuid: behavior.uuid });

                            // Update loop ordering
                            // device.processing.loopSequence.updateOrdering();

                            // Stop the event loop if no nodes are placed on it
                            var sequence = behavior.interface.processing.getBehaviorSequence();
                            if (sequence.length == 0) {
                                behavior.interface.processing.loopSequence.stop ();
                            } else {
                                behavior.interface.processing.loopSequence.go (); // toggle "go" and "stop"
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

                                    if (interfaces[i].structure !== undefined && interfaces[i].structure !== null) {
                                        if (interfaces[i].structure.state === 'PROTOTYPE') {

                                            // Remove from structure
                                            // TODO: interfaces[i].structure.deleteInterface ();
                                            interfaces[i].structure.interface = null;

                                            // Remove from global array
                                            // TODO: Clean this up so it's not a global array! Eliminate the global array!
                                            interfaces.splice (i, 1);
                                            interfaceCount--;
                                            console.log("removing...");
                                            continue;                                
                                        }
                                    }

                                    i++;
                                }

                                // Destroy behavior palette!
                                // TODO: Make sure deleting the behavior palette doesn't ruin the structure/substructure tree.
                                behavior.interface.processing.behaviorPalette = null;
                            }

                            // if (behavior.interface.processing.behaviorPalette === null) {
                            //     // Zoom out
                            //     // Center behavior palette on screen and zoom in on it
                            //     behavior.interface.processing.scaleFactor = 1.0;
                            //     behavior.interface.processing.previousCenterX = behavior.interface.processing.centerX;
                            //     behavior.interface.processing.previousCenterY = behavior.interface.processing.centerY;
                            //     behavior.interface.processing.centerX = ev.gesture.center.pageX;
                            //     behavior.interface.processing.centerY = ev.gesture.center.pageY;
                            // }
                        }

                    } else if (behavior.state === 'SEQUENCED') {

                        disableEventCreate = true;
                        behavior.state = 'FOCUS';

                    } else if (behavior.state === 'FOCUS') {

                        disableEventCreate = false;
                        behavior.state = 'SEQUENCED';
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
function LooperInstance (options) {

    var defaults = {
        address: null,
        canvas: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.interface = null; // The current interface to draw. Users can customize and share their Looper interface designs and use each others' designs.
    this.interfaces = []; // References to the interfaces associated with this Looper instance.

    if (options.canvas === null) {
        alert("No canvas specified.");
        return;
    }

    this.touch = { touch: { x: null, y: null }, current: { x: null, y: null }, release: { x: null, y: null } };

    this.address = options['address'];

    this.canvas = options.canvas;

    // this.disableEventCreate = false;
    this.showPalette = false;
    this.font = null;

    /**
     * Returns the looper associated with the device.
     */
    this.getLooper = function () {
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
    this.getBehaviorSequence = function getBehaviorSequence (deviceIndex) {
      return this.looper.devices[deviceIndex].processing.loopSequence.behaviors;
    }

    

    //this.looperInstance = options.looperInstance;
    this.superstructure = options.looperInstance; // The superstructure is the structure that semantically contains this structure as a component. The superstructure may also contain structure other this one.
    this.substructures = []; // The substructures are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getSuperstructure = function (options) {
        return this.superstructure;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getSubstructure = function (options) {
        return this.substructure;
    }

    //! Returns the Looper for which the structure was created.
    //!
    // this.getLooper = function (options) {
    //     return this.superstructure;
    // }

    //! Attaches an interface to this structure, enabling it to be rendered.
    //!
    this.attachInterface = function (options) {

        // Create and attach the specified interface to this structure
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        // If no default interface has been specified, set the one that was just added as the default.
        if (this.interface === null) {
            this.interface = this.interfaces[0];
        }
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    //! TODO: Rename this to "fabricate", "visualize", "render", or something else that's more general that makes sense for any kind of representation, including but not limited to 2D screens and 3D headsets (i.e., VR).
    //!
    this.draw = function (options) {
        // console.log ("this.draw");

        // console.log (this);

        // var interface = this.getInterface ();
        // console.log ("INTERFACE!: ");
        // console.log (interface);

        // console.log (this.interface);

        // Draw this structure
        if (this.interface !== undefined && this.interface !== null) {
            this.interface.draw ();
        }

        // console.log (this.substructures);

        // Draw the substructure
        for (var i = 0; i < this.substructures.length; i++) {
            this.substructures[i].draw ();
        }
    }

    // TODO:
    // - setInterface (options) : allows switching the interface to visualize Looper and its tools.

    /**
     * Processing sketch code
     */
    var sketch = new Processing.Sketch (function (processing) {

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
        var color = { red: 255, green: 255, blue: 255 }; // generateRandomColor(255, 255, 255);
        var backgroundColor = processing.color(color.red, color.green, color.blue);
        // var backgroundColor = processing.color(240, 241, 240);

        processing.loopSequence = new Loop();

        // Create behavior palette
        processing.behaviorPalette = null; // new BehaviorPalette({ looperInstance: this.looperInstance });

        /**
         * Setup behavior palette.
         */
        processing.setupBehaviorPalette = function() {

            // TODO: Move "addBehavior" to looperInstance
            // TODO: Refactor setupBehaviorPalette to be part of Behavior class constructor, adding behaviors from the looperInstance (from previous TODO)

            // Add "default" behaviors to palette
            processing.behaviorPalette.addBehavior ({
                type: 'light',
                label: 'on',

                x: processing.behaviorPalette.x + -100,
                y: processing.behaviorPalette.y + 0,

                procedure: function(options) {
                    console.log('light on top level');
                    // setPin(options);
                    // createBehavior ({ type: 'output' });
                    createBehavior (options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    type: 'output'
                    // index: -1, type: 'output', pin: 5, operation: 1, type: 0, mode: 1, value: 1
                }
            });

            processing.behaviorPalette.addBehavior ({
                type: 'time',
                label: 'delay',

                x: processing.behaviorPalette.x + 100,
                y: processing.behaviorPalette.y + 0,

                procedure: function(options) {
                    console.log('time on top level');
                    // delay(options);
                    createBehavior (options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    type: 'delay', milliseconds: 1000
                    // index: -1, type: 'delay', milliseconds: 1000
                }
            });

            // processing.behaviorPalette.addBehavior ({
            //     type: 'sound',
            //     label: 'sound',

            //     x: processing.behaviorPalette.x + 0,
            //     y: processing.behaviorPalette.y + 0,

            //     procedure: function(options) {
            //         console.log('sound on top level');
            //         // setPin(options);
            //         // createBehavior ({ type: 'output' });
            //         createBehavior (options);
            //         // TODO: Keep track of state... has this been sent yet?
            //     },
            //     options: {
            //         type: 'sound', note: '1047', duration: '500'
            //         // index: -1, type: 'output', pin: 5, operation: 1, type: 0, mode: 1, value: 1
            //     }
            // });

            processing.behaviorPalette.addBehavior ({
                type: 'light',
                label: 'off',

                x: processing.behaviorPalette.x + 0,
                y: processing.behaviorPalette.y + 0,

                procedure: function(options) {
                    console.log('light off top level');
                    // setPin(options);
                    // createBehavior ({ type: 'output' });
                    createBehavior (options);
                    // TODO: Keep track of state... has this been sent yet?
                },
                options: {
                    type: 'output',
                    data: 'off'
                    // index: -1, type: 'output', pin: 5, operation: 1, type: 0, mode: 1, value: 1
                }
            });

            // processing.behaviorPalette.addBehavior({
            //     type: 'input',
            //     label: 'input',

            //     x: processing.behaviorPalette.x + 0,
            //     y: processing.behaviorPalette.y + 0,

            //     procedure: function(options) {
            //         console.log('input on top level');
            //         // delay(options);
            //         createBehavior (options);
            //         // TODO: Keep track of state... has this been sent yet?
            //     },
            //     options: {
            //         type: 'input'
            //         // index: -1, pin: 5, operation: 1, type: 0, mode: 1, value: 0
            //     }
            // });
        }

        processing.keyPressed = function() {
            // console.log ("keyPressed " + processing.key);

            if (processing.key == 101) { // e
                console.log ("zoom in");
                processing.zoomFactor += 0.1;
            } else if (processing.key == 113) { // q
                console.log ("zoom out");
                processing.zoomFactor -= 0.1;
            } else if (processing.key == 119) { // w
                console.log ("pan up");

                // mouse = new PVector(mouseX, mouseY);
                // poffset.set(offset);
                processing.mouse_x = processing.mouseX;
                processing.mouse_y = processing.mouseY;
                processing.xOffsetPrevious = processing.xOffset;
                processing.yOffsetPrevious = processing.yOffset;

                // offset.x = mouseX - mouse.x + poffset.x;
                // offset.y = mouseY - mouse.y + poffset.y;
                processing.yOffset = 10 + processing.yOffsetPrevious;

                console.log (processing.yOffset);

            } else if (processing.key == 97) { // a
                console.log ("pan left");
            } else if (processing.key == 115) { // s
                console.log ("pan down");

                // mouse = new PVector(mouseX, mouseY);
                // poffset.set(offset);
                processing.mouse_x = processing.mouseX;
                processing.mouse_y = processing.mouseY;
                processing.xOffsetPrevious = processing.xOffset;
                processing.yOffsetPrevious = processing.yOffset;

                // offset.x = mouseX - mouse.x + poffset.x;
                // offset.y = mouseY - mouse.y + poffset.y;
                processing.yOffset = -10 + processing.yOffsetPrevious;
            } else if (processing.key == 100) { // d
                console.log ("pan right");
            }
        }

        /**
         * Override setup function.
         */
        processing.setup = function() {
            this.size (this.screenWidth, this.screenHeight);

            this.font = this.loadFont("/DidactGothic.ttf");

            this.xOffsetOrigin = this.screenWidth / 2;
            this.yOffsetOrigin = this.screenHeight / 2;

            // processing.xOrigin = 0.0;
            // processing.yOrigin = 0.0;
            processing.xOffset = 0.0;
            processing.yOffset = 0.0;
            processing.xOffsetPrevious = 0.0;
            processing.yOffsetPrevious = 0.0;
            // processing.translate (processing.xOrigin, processing.yOrigin);
            // processing.scale (processing.scaleOrigin);

            processing.scaleFactor = 1.0;
            processing.zoomFactor = 1.0;
            // processing.previousCenterX = processing.xOrigin; // this.screenWidth / 2;
            // processing.previousCenterY = processing.yOrigin; // this.screenHeight / 2;
            // processing.centerX = processing.xOrigin; // this.screenWidth / 2;
            // processing.centerY = processing.yOrigin; // this.screenHeight / 2;

            // processing.translate (processing.xOrigin, processing.yOrigin);
            // processing.scale (processing.scaleOrigin);
            // processing.translate (-1 * processing.xOrigin, -1 * processing.yOrigin);

            // looper.processing.translate (looper.processing.previousCenterX, looper.processing.previousCenterY);
            // // this.translate (this.screenWidth / 2, this.screenHeight / 2);
            // looper.processing.scale (looper.processing.zoomFactor * looper.processing.scaleFactor);
            // looper.processing.translate (-1 * looper.processing.centerX, -1 * looper.processing.centerY);
        }

        processing.drawLoop = function() {

            // // Everything must be drawn relative to center
            // this.translate (this.screenWidth / 2, this.screenHeight / 2);
            // // Use scale for 2D "zoom"
            // this.scale (this.zoomFactor);
            // // The offset (note how we scale according to the zoom)
            // this.translate (this.xOffset/this.zoomFactor, this.yOffset/this.zoomFactor);

            // var scale = 1.3;
            // this.scale(scale);
            // // console.log ((((this.screenWidth * scale) - this.screenWidth) / 2));
            // this.translate (((this.screenWidth - (this.screenWidth * scale)) / 2), 0);

            this.pushMatrix();

            // Draw the loop
            this.strokeWeight (1.0);
            this.stroke (65, 65, 65);
            this.noFill ();
            this.smooth ();
            this.arc (0, 0, 400, 400, (-this.PI / 2) + 0.05 * this.PI, 1.45 * this.PI);

            this.popMatrix();

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

            this.pushMatrix();

            // Draw the loop's arrowhead to indicate its sequence order
            this.strokeWeight(1.0);
            this.stroke(65, 65, 65);
            // this.translate(this.screenWidth / 2, this.screenHeight / 2);
            this.translate(-29, -198);
            this.rotate(-0.05 * this.PI);
            this.line(0, 0, -16, 16);
            this.line(0, 0, -16, -16);

            this.popMatrix();
        }

        /**
         * Override draw function. By default, it will be called 60 times per second.
         */
        processing.draw = function() {

            // Check if canvas is being dragged
            // TODO: Move this into the canvas object's "on drag" callback (which has yet to be made)
            if (this.draggingCanvas === true) {

                // Save mouse touch location
                var currentMouseX = (((looper.getCurrentPane() + 1) * $(window).width()) + this.mouseX);
                var currentMouseY = this.mouseY;

                // Store previous offset
                this.xOffset = currentMouseX - this.mouse_x + this.xOffsetPrevious;
                this.yOffset = currentMouseY - this.mouse_y + this.yOffsetPrevious;
            }




            this.pushMatrix();

            // Everything must be drawn relative to center
            this.translate (this.xOffsetOrigin, this.yOffsetOrigin);
            // Use scale for 2D "zoom"
            this.scale (this.zoomFactor);
            // The offset (note how we scale according to the zoom)
            this.translate (this.xOffset/this.zoomFactor, this.yOffset/this.zoomFactor);

            // // Update the previous touch state history
            // console.log (looper.getCurrentDevice().touch.touch);
            // console.log (looper.getCurrentDevice().touch.current);
            // // console.log (looper.getCurrentDevice().touch.release);
            // console.log ("\n");


            // Update the position that was last touched in the user is touching
            if (looper.getCurrentDevice ().touch.touching === true) {
                var mouseX = looper.getCurrentDevice ().processing.screenWidth * (looper.getCurrentDevice ().processing.deviceCount + 1) + looper.getCurrentDevice ().processing.mouseX;
                var mouseY = looper.getCurrentDevice ().processing.mouseY;
                looper.getCurrentDevice ().touch.current = { x: mouseX, y: mouseY };
            }







            // this.xOrigin = 0;
            // this.yOrigin = 0;
            // this.translate (this.xOrigin, this.yOrigin);

            /**
             * Draw behaviors.
             */
            function drawInterfaces () {

                // processing.pushMatrix();

                // console.log (processing.looperInstance.interfaces);

                // Draw based on latest state
                //for (var i = 0; i < this.interfaces.length; i++) {
                // for (var i = 0; i < looper.getCurrentDevice ().interfaces.length; i++) {
                //     processing.looperInstance.interfaces[i].draw();
                //     //this.interfaces[i].draw();
                // }

                processing.looperInstance.draw ();

                // processing.popMatrix();
            }

            /**
             * Returns the sequence of behaviors in the event queue.
             */
            function getBehaviorSequence () {
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
                // console.log("lineDistance");

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
            function getAngle (x, y) {
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
            function getNearestPositionOnEventLoop (x, y) {
                // x = x + processing.screenWidth;
                console.log ("Get nearest to: " + x + ", " + y);

                var deltaX = x - (processing.screenWidth / 2);
                var deltaY = y - (processing.screenHeight / 2);
                var angleInDegrees = Math.atan2(deltaY, deltaX); // * 180 / PI;

                // var nearestX = processing.screenWidth / 2 + (400 / 2) * Math.cos (angleInDegrees);
                // var nearestY = processing.screenHeight / 2 + (400 / 2) * Math.sin (angleInDegrees);
                var nearestX = 0 + (400 / 2) * Math.cos (angleInDegrees);
                var nearestY = 0 + (400 / 2) * Math.sin (angleInDegrees);

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

            this.drawLoop(); // TODO: Make Interface for this! Then remove!

            drawInterfaces();

            this.popMatrix();
        };
    });

    // sketch.options.crispLines = true;
    this.processing = new Processing (canvas, sketch);
    this.processing.canvas = canvas;
    this.processing.deviceCount = deviceCount;
    this.processing.looperInstance = this;
}