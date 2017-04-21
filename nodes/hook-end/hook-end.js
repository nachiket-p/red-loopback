module.exports = function (RED) {

  var loopback = require('loopback');
  var _ = require('lodash');

  function HookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      if (msg.endSync) {
        msg.endSync(msg);
      } else {
        const errMsg = "Missing end function from msg";
        node.status({ fill: "red", shape: "ring", text: errMsg });
      }
    });

    node.on('close', function () {

    });
  }
  RED.nodes.registerType("hook-end", HookEndNode);
  RED.library.register("loopback");
}