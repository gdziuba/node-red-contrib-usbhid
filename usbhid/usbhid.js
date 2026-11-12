module.exports = function(RED) {

  var HID = require('node-hid');

  function HIDConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.vid = n.vid;
    this.pid = n.pid;
    this.reconnect = n.reconnect !== false;
    this.reconnectInterval = Math.max(0.5, parseFloat(n.reconnectInterval) || 2);
    // console.log(this.vid);
  }

  function usbHIDNode(config) {
    RED.nodes.createNode(this, config);

    this.server = RED.nodes.getNode(config.connection);


    var node = this;
    var device = null;
    var reconnectTimer = null;
    var closed = false;


    function connect() {
    try {


      var intvid = parseInt(node.server.vid, 10);
      var intpid = parseInt(node.server.pid, 10); 

      device = new HID.HID(intvid, intpid);



      node.status({
        fill: "green",
        shape: "dot",
        text: "connected"
      });

    } catch (err) {
      node.status({
        fill: "red",
        shape: "ring",
        text: "disconnected"
      });
      scheduleReconnect();
      return;
    }


    device.on("data", function(data) {
      var message = {
        payload: ""
      };
      message.payload = data;
      node.send([message, null]);
    });


    device.on("error", function(err) {
      var message = {
        payload: ""
      };
      message.payload = err;
      node.send([null, message]);

      try { device.removeAllListeners(); device.close(); } catch (e) {}
      device = null;
      node.status({
        fill: "red",
        shape: "ring",
        text: "disconnected"
      });
      scheduleReconnect();
    });
    }


    function scheduleReconnect() {
      if (closed || reconnectTimer || !node.server || !node.server.reconnect) {
        return;
      }
      reconnectTimer = setTimeout(function() {
        reconnectTimer = null;
        connect();
      }, node.server.reconnectInterval * 1000);
    }


    connect();

    this.on('input', function(msg) {


      if (!device) {
        node.error("HID device not connected", msg);
        return;
      }

      var data = toArray(msg.payload);

      device.write(data);

    });


    this.on('close', function() {
      closed = true;
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      if (device) {
        device.close();
        device = null;
      }
    });


  }


  function toArray(buffer) {
    var view = [];
    for (var i = 0; i < buffer.length; ++i) {
      view.push(buffer[i]);
    }
    return view;
  }


  function getHIDNode(config) {
    RED.nodes.createNode(this, config);

    var node = this;
    this.on('input', function(msg) {

      var devices = HID.devices();
      msg.payload = devices;
      node.send(msg);

    });
  }


  RED.nodes.registerType("getHIDdevices", getHIDNode);
  RED.nodes.registerType("HIDdevice", usbHIDNode);
  RED.nodes.registerType('HIDConfig', HIDConfigNode);
}