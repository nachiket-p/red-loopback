var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING END-HOOK NODE");

  var loopback = require('loopback');
  var _ = require('lodash');

  function HookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      if (msg.endHook) {
        helper.hookEnd(null, msg)
      } else {
        const errMsg = "Missing end function from msg";
        node.status({ fill: "red", shape: "ring", text: errMsg });
      }
    });
  }
  RED.nodes.registerType("hook-end", HookEndNode);
  RED.library.register("loopback");
}