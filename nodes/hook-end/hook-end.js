module.exports = function (RED) {
  console.log("REGISTERING END-HOOK NODE");

  var loopback = require('loopback');
  var _ = require('lodash');

  function HookEndNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      if (msg.endHook) {
        //TEMP FIX FOR REQ/RES CLONE ISSUE - https://github.com/node-red/node-red/issues/97
        msg.lbctx.req = msg.req;
        msg.lbctx.res = msg.res;
        delete msg.req;
        delete msg.res;
        msg.endHook(msg);
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