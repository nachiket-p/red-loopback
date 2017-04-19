module.exports = function (RED) {

  var loopback = require('loopback');
  var _ = require('lodash');

  function OpHookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      if(msg.endSync) {
        msg.endSync(msg);
      } else {
        const errMsg = "Only needed with OP Hook (sync setting)";
        node.status({ fill: "red", shape: "ring", text: errMsg });
      }
    });

    node.on('close', function () {

    });
  }
  RED.nodes.registerType("OP-hook-end", OpHookEndNode);
  RED.library.register("loopback");
}