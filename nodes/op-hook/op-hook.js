var helper = require('../observer-helper');
const LoopbackContext = require('../LoopbackContext')
module.exports = function (RED) {
  console.log("REGISTERING OP-HOOK NODE");

  function OpHookNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const app = helper.getAppRef(this);
    var Model = app.models[config.modelName];

    if (Model !== undefined) {
      const observer = new helper.OperationObserver(Model, config.method, function (msg, ctx, next) {
        const lbContext = LoopbackContext.getContext(node)
        const contextId = lbContext.add(ctx)
        msg.lbContextId = contextId
        msg.endHook = function (err, msg) {
          const lbData = msg.payload.lbData;
          if (lbData && (lbData.instance || lbData.data)) {
            if (lbData.instance)
              _.merge(lbContext.instance, lbData.instance)
            if (lbData.data)
              _.merge(lbContext.data, lbData.data)
          }
          lbContext.remove(contextId)
          next(err);
        }
        node.send(msg);
      });

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
