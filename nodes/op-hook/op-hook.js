var loopback = require('loopback');
var _ = require('lodash');
var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING ASYNC NODE");

  function AsyncNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var Model = loopback.findModel(config.modelName);

    if (Model !== undefined) {
      // Remove existing observers if any.
      //helper.removeOldObservers(Model, node.id);
      const observer = new helper.Observer(node.id, Model, function (msg, ctx, next) {
        node.send(msg);
        // return control to loopback application.
        next();
      });
      Model.observe(config.method, observer.observe);

      node.on('close', function () {
        console.log('closing node')
        observer.remove();
      });
      node.status({ fill: "green", shape: "dot", text: "Observing" });
    } else {
      const errMsg = "Model " + config.modelName +  " Not Found";
      node.status({ fill: "red", shape: "ring", text: errMsg });
      node.error({
        message: errMsg
      });
    }
  }
  RED.nodes.registerType("OP-hook", AsyncNode);

}
