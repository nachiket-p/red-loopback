var loopback = require('loopback');
var _ = require('lodash');
const INDEX = (obj, is, value) => {
  if (typeof is === 'string') {
    return INDEX(obj, is.split('.'), value)
  } else if (is.length == 1 && value !== undefined) {
    return obj[is[0]] = value
  } else if (is.length == 0) {
    return obj
  } else {
    return INDEX(obj[is[0]], is.slice(1), value)
  }
}

module.exports = function (RED) {
  function MethodNode(config) {
    console.log("CREATING");
    RED.nodes.createNode(this, config);
    var node = this;
    var modelName = config.modelname;
    var method = config.method;
    var params = config.params;

    var globalContext = this.context().global;
    var loopbackApp = globalContext.get("app");
    var Model = loopbackApp.models[modelName];

    if (Model !== undefined) {
      this.status({ fill: "green", shape: "dot", text: "Model Found" });
      if (!method || !Model[method]) {
        this.status({ fill: "red", shape: "ring", text: "Method undefined" });
        node.error({
          message: 'Method Undefined'
        });
        return;
      }
    } else {
      this.status({ fill: "red", shape: "ring", text: "Model undefined" });
      node.error({
        message: 'Model Undefined'
      });
      return;
    }

    node.on('input', function (msg) {
      var callbackFunc = function (error, result) {
        if (error) {
          node.error({
            message: error.message
          });
        }
         msg.payload = {
            error: error,
            result: result
          }
          return node.send(msg);
      }
      var args = [];
      console.log("calling loopback-method with params", params, msg)
      for (var i = 0; i < params.length; i++) {
        var param = params[i];
        args.push(INDEX(msg, param));
      }
      console.log("calling loopback-method with ARGS: ", args)
      args.push(callbackFunc);
      var methodCall = Model[method];
      methodCall.apply(Model, args)
    });
  }
  RED.nodes.registerType("call-method", MethodNode);
}