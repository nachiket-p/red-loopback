var _ = require('lodash');
var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING ASYNC NODE");

  function RemoteHookNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const app = helper.getAppRef(this);
    var Model = app.models[config.modelName];

    if (Model !== undefined) {
      const observer = new helper.RemoteObserver(Model, config.method, function (msg, ctx, next) {
        msg.endSync = function (msg) {
          next();
        }
        node.send(msg);
      });

      if (config.methodType == 'before') {
        Model.beforeRemote(config.method, observer.observe);
      } else {
        Model.afterRemote(config.method, observer.observe);
      }

      node.on('close', function () {
        console.log('closing node')
        observer.remove();
      });
      node.status({ fill: "green", shape: "dot", text: "Observing" });
    } else {
      const errMsg = "Model " + config.modelName + " Not Found";
      node.status({ fill: "red", shape: "ring", text: errMsg });
      node.error({
        message: errMsg
      });
    }
  }

  RED.nodes.registerType("remote-hook", RemoteHookNode);
  RED.library.register("loopback");
}
