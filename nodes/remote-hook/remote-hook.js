var _ = require('lodash');
var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING REMOTE-HOOK NODE");

  function RemoteHookNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    helper.addRemoteObserver(config, node)
  }

  RED.nodes.registerType("remote-hook", RemoteHookNode);
  RED.library.register("loopback");
}
