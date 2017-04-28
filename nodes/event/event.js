var helper = require('../observer-helper');

module.exports = function (RED) {
  console.log("REGISTERING EVENT NODE");

  function EventNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const app = helper.getAppRef(this);
    var Model = app.models[config.modelName];

    if (Model !== undefined) {
      const observer = new helper.EventObserver(Model, config.method, function (msg) {
        node.send(msg);
      });
      console.log("### OBERSERINVBG ON: " + config.method + " OF " + config.modelName)

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
  
  RED.nodes.registerType("event", EventNode);
  RED.library.register("loopback");
}
