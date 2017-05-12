var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING END-HOOK NODE");
  
  function HookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var messageType = config.messageType;
    var message = config.message;
    var statusCode = config.errorCode;

    node.on('input', function (msg) {
      if (messageType === 'msg') {
        message = RED.util.evaluateNodeProperty(message, messageType, node, msg);
      }
      const err = {
        message: message,
        statusCode: statusCode
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