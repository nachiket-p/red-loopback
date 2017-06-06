var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING OP-HOOK NODE");

  function OpHookNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    helper.addOperationObserver(config, node)
  }

  RED.nodes.registerType("OP-hook", OpHookNode);
  RED.library.register("loopback");
}
