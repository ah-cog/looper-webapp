//
// pixel.js
//
// Description: Interface for interacting with an embedded device's server.
//
// TODO: Move to another file that only includes the library to a client's server.
//

// Library:
//
// Utilities: 
// - post (Utility for HTTP POSTs)
// - get (Utility for HTTP GETs)
//
// Interface:
//   /pin
//   /delay
//   /erase
//
//   /analog-pin
//   /digital-pin
//   /pwm (needed in addition to analog?)
//   /behavior (POST to upload, GET to download)
//   /memorize or /remember (store in memory for later recall)
//   /report or /recall (store in recall from memory)
//   /module/color (of module)
//   /module/orientation
//   /debug/firmware
//   /debug/log
//
// - setColor/getColor (of module)
// - getNeighbors
// - getBehavior
//
// Candidates for Interface:
//
//   /in or /input
//   /out or /output
//   /store or /push
//   /load or /pop
//   /call or /remember
//   /upload (submit JSON code) [Alternatives: behavior, firmware, sketch, code]
//   /download
//   /sync
//   /action (behavior consists of one or more actions)

// function LooperInstance() {
//     // TODO: Implement device... add post, get, pin, pwm, etc. so they can be called for this device!
// }


/**
 * Send a POST request to the specified address.
 */
// function post(address, params, callback) {
//     var http = new XMLHttpRequest();
//     // var address = "http://physical.computer/pin";
//     // var params = "pin=" + pin + "&operation=" + operation + "&type=" + type + "&mode=" + mode + "&value=" + value + "";
//     var uri = address.concat('?', params);
    
//     http.open("POST", uri, true);

//     // Send the proper header information along with the request
//     http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
//     http.onreadystatechange = function() { // Call a function when the state changes.
//         if(http.readyState == 4 && http.status == 200) {
//            callback(); // The callback function
//         }
//     }
//     http.send(params);
// }

// TODO: function pin(index, pin, operation, type, mode, value) { /* ... */ }
//function pin(index, pin, operation, type, mode, value) {
function message (options) { // function text (options) {
    var defaults = {
        content: ""
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    //var deviceUri = "http://" + deviceAddresses[looper.getCurrentPane()];
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat ("/message");
    var params = "content=" + options['content'];
    url = url.concat ('?', params);
    
    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
           console.log(http.responseText);
        } else if(http.readyState == 4 && http.status == 201) {
            console.log("Message successfully sent.");

            // TODO: Get response from message

            // console.log(http.getResponseHeader('Location'));

            // var behaviorUri = http.getResponseHeader ('Location');
            // var behaviorUuid = behaviorUri.split ("/")[2];

            // console.log ("UUID: " + behaviorUuid);

            // // Update the behavior's UUID
            // options.behavior.uuid = behaviorUuid;

            // console.log (options.behavior);

            // TODO: Assign UUID to behavior in Looper for subsequent calls.
        }
    }
    http.send(params);
}

/**
 * Send a GET request to the specified address.
 */
// function get(address, params, callback) {
//     var http = new XMLHttpRequest();
//     // var address = "http://physical.computer/pin";
//     // var params = "pin=" + pin + "&operation=" + operation + "&type=" + type + "&mode=" + mode + "&value=" + value + "";
//     var uri = address.concat('?', params);
    
//     http.open("GET", uri, true);

//     // Send the proper header information along with the request
//     http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
//     http.onreadystatechange = function() { // Call a function when the state changes.
//         if(http.readyState == 4 && http.status == 200) {
//            callback(); // The callback function
//         }
//     }
//     http.send(params);
// }

function deleteBehavior2(options) {
    var defaults = {
        index: -1
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/behavior");
    var params = "index=" + options['index'] + "";
    url = url.concat('?', params);
    
    http.open("DELETE", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
           console.log(http.responseText);
        }
    }
    http.send(params);
}

// TODO: function pin(index, pin, operation, type, mode, value) { /* ... */ }
function updateBehavior2(options) {
    var defaults = {
        index: -1,
        pin: -1,
        operation: 0,
        type: 0,
        mode: 0,
        value: 0
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/pin");
    var params = "index=" + options['index'] + "&pin=" + options['pin'] + "&operation=" + options['operation'] + "&type=" + options['type'] + "&mode=" + options['mode'] + "&value=" + options['value'] + "";
    url = url.concat('?', params);
    
    http.open("PUT", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
           console.log(http.responseText);
        }
    }
    http.send(params);
}

// TODO: function pin(index, pin, operation, type, mode, value) { /* ... */ }
//function pin(index, pin, operation, type, mode, value) {
function createBehavior(options) {
    var defaults = {
        type: "output",
        pin: 5,
        signal: "digital",
        data: "on"
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    // console.log ("Behavior?: " + options.behavior);

    var http = new XMLHttpRequest();
    //var deviceUri = "http://" + deviceAddresses[looper.getCurrentPane()];
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/behavior");
    var params = "";
    if (options['type'] == "input" || options['type'] == "output") {
        params = "type=" + options['type'] + "&pin=" + options['pin'] + "&signal=" + options['signal'] + "&data=" + options['data'];
    } else if (options['type'] == "delay") {
        params = "type=" + options['type'] + "&milliseconds=" + options['milliseconds'];
    } else if (options['type'] == "sound") {
        params = "type=" + options['type'] + "&note=" + options['note'] + "&duration=" + options['duration'];
    }
    url = url.concat('?', params);
    
    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
           console.log(http.responseText);
        } else if(http.readyState == 4 && http.status == 201) {
            console.log("Behavior created successfully.");
            console.log(http.getResponseHeader('Location'));

            var behaviorUri = http.getResponseHeader ('Location');
            var behaviorUuid = behaviorUri.split ("/")[2];

            console.log ("UUID: " + behaviorUuid);

            // Update the behavior's UUID
            options.behavior.uuid = behaviorUuid;

            console.log (options.behavior);

            // TODO: Assign UUID to behavior in Looper for subsequent calls.
        }
    }
    http.send(params);
}

function getBehavior (options, callback) {
    var defaults = {
        uuid: -1
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/behavior");
    var params = "uuid=" + options['uuid'];
    url = url.concat('?', params);
    
    http.open("GET", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log("Behavior got successfully.");
            console.log(http.responseText);

            // TODO: Update the behavior's state based on the response behavior data.

            // if (callback !== undefined) {
            //     callback(); // The callback function
            // }
        } else if(http.readyState == 4 && http.status == 404) {
            console.log("Behavior NOT got.");
            console.log(http.responseText);
        }
    }
    http.send(params);
}

function updateBehavior (options) {
    var defaults = {
        uuid: -1,
        type: 'output',
        pin: 5,
        signal: 'digital',
        data: 'off'
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    //var deviceUri = "http://" + deviceAddresses[looper.getCurrentPane()];
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/behavior");
    var params = "";
    if (options['type'] == "input" || options['type'] == "output") {
        params = "uuid=" + options['uuid'] + "&pin=" + options['pin'] + "&signal=" + options['signal'] + "&data=" + options['data'];
    } else if (options['type'] == "delay") {
        params = "uuid=" + options['uuid'] + "&milliseconds=" + options['milliseconds'];
    } else if (options['type'] == "sound") {
        params = "uuid=" + options['uuid'] + "&note=" + options['note'] + "&duration=" + options['duration'];
    }
    url = url.concat('?', params);
    
    http.open("PUT", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log("Behavior updated successfully.");
            console.log(http.responseText);
        } else if(http.readyState == 4 && http.status == 404) {
            console.log("Behavior NOT updated.");
            console.log(http.responseText);
        }
    }
    http.send(params);
}

function deleteBehavior (options) {
    var defaults = {
        uuid: -1
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/behavior");
    var params = "uuid=" + options['uuid'] + "";
    url = url.concat('?', params);
    
    http.open("DELETE", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log("Behavior deleted successfully.");
            console.log(http.responseText);
            // TODO: Update behavior's UUID and state!
        } else if(http.readyState == 4 && http.status == 401) {
            console.log("Behavior NOT deleted.");
            console.log(http.responseText);
        }
    }
    http.send(params);
}

// TODO: function pin(index, pin, operation, type, mode, value) { /* ... */ }
//function pin(index, pin, operation, type, mode, value) {
function setPin(options) {
    var defaults = {
        index: -1,
        pin: -1,
        operation: 0,
        type: 0,
        mode: 0,
        value: 0
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    //var deviceUri = "http://" + deviceAddresses[looper.getCurrentPane()];
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/pin");
    var params = "index=" + options['index'] + "&pin=" + options['pin'] + "&operation=" + options['operation'] + "&type=" + options['type'] + "&mode=" + options['mode'] + "&value=" + options['value'] + "";
    url = url.concat('?', params);
    
    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
           console.log(http.responseText);
        }
    }
    http.send(params);
}

function getPin(options, callback) {
    var defaults = {
        index: -1,
        pin: -1,
        operation: 1,
        type: 0,
        mode: 0,
        value: 0
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/pin");
    var params = "index=" + options['index'] + "&pin=" + options['pin'] + "&operation=" + options['operation'] + "&type=" + options['type'] + "&mode=" + options['mode'] + "&value=" + options['value'] + "";
    url = url.concat('?', params);
    
    http.open("GET", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {

            // TODO: Update the "local" Pixel reflection (i.e., the one cached in the browser)

            if (callback !== undefined) {
                callback(); // The callback function
            }
        }
    }
    http.send(params);
}

function getPins(options, callback) {
    var defaults = {
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/pins");
    var params = "";
    url = url.concat('?', params);
    
    http.open("GET", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // http.setRequestHeader('Access-Control-Allow-Origin', '*');
    http.setRequestHeader('X-PINGOTHER', 'pingpong');
    
    http.onreadystatechange = function() { // Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {

            // TODO: Update the "local" Pixel reflection (i.e., the one cached in the browser)

            console.log(http.responseText);
            
            if (callback !== undefined) {
                callback(); // The callback function
            }
        }
    }
    http.send(params);
}

function delay(options) {
    var defaults = {
        index: -1,
        milliseconds: 1000
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/delay");
    var params = "index=" + options['index'] + "&milliseconds=" + options['milliseconds'] + "";
    url = url.concat('?', params);

    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(params);
}

function erase(options) {
    var defaults = {
        // TODO: List default parameter values here.
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/erase");
    var params = "";

    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(params);
}

function reboot(options) {
    var defaults = {
        // TODO: List default parameter values here.
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    var http = new XMLHttpRequest();
    var deviceUri = "http://" + looper.devices[looper.getCurrentPane()].address;
    var url = deviceUri.concat("/reboot");
    var params = "";

    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(params);
}