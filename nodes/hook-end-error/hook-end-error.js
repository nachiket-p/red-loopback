var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING END-HOOK NODE");
  
  function HookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function (msg) {
      var message = config.message;
      if (config.messageType === 'msg') {
        message = RED.util.evaluateNodeProperty(config.message, config.messageType, node, msg);
      }
      const err = {
        message: message,
        statusCode: config.errorCode
      }

      if (msg.endHook) {
        helper.hookEnd(err, msg)
      } else {
        const errMsg = "Missing end function from msg";
        node.status({ fill: "red", shape: "ring", text: errMsg });
      }
    });
  }
  RED.nodes.registerType("hook-end-error", HookEndNode);
  RED.library.register("loopback");
}