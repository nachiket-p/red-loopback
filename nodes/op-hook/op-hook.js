var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING OP-HOOK NODE");

  function OpHookNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const app = helper.getAppRef(this);
    var Model = app.models[config.modelName];

    if (Model !== undefined) {
      const observer = new helper.Observer(Model, config.method, function (msg, ctx, next) {
        msg.endHook = function (msg) {
          next();
        }
        node.send(msg);
      });
      Model.observe(config.method, observer.observe);

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
  
  RED.nodes.registerType("OP-hook", OpHookNode);
  RED.library.register("loopback");
}
