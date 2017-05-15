module.exports = function (RED) {
  "use strict";

  var loopback = require('loopback');
  var _ = require('lodash');
  var helper = require('../observer-helper');

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

  function MethodNode(config) {
    console.log("CREATING");
    RED.nodes.createNode(this, config);
    var node = this;
    var modelName = config.modelname;
    var methodType = config.methodType;
    var method = methodType == 'instance' ? config.instanceMethod : config.staticMethod;
    var params = config.params;

    const app = helper.getAppRef(this);
    var Model = app.models[modelName];

    if (Model !== undefined) {
      this.status({ fill: "green", shape: "dot", text: "Model Found" });
    } else {
      helper.showError(node, 'Model not found: ' + modelName)
      return;
    }

    node.on('input', function (msg) {
      var methodFunc;
      var methodContext;
      
      if (methodType == 'instance') {
        var instancePath = RED.util.evaluateNodeProperty(config.instancePath, 'msg', node, msg);
        if (!instancePath) {
          helper.showError(node, 'Instance NOT Found.')
          return;
        }
        methodFunc = instancePath[method]
        methodContext = instancePath
      }
      else { //FOR STATIC
        methodFunc = Model[method]
        methodContext = Model
      }

      if (!methodFunc) {
        helper.showError(node, methodType + ' method not found: ' + method)
        return;
      }


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
        var param = params[i], value;
        value = RED.util.evaluateNodeProperty(param.value, param.valueType, node, msg);
        args.push(value);
      }
      console.log("calling loopback-method with ARGS: ", args)
      args.push(callbackFunc);
      methodFunc.apply(methodContext, args)
    });
  }
  console.log("REGISTERING CALL METHOD")
  RED.nodes.registerType("call-method", MethodNode);
  RED.library.register("loopback");
}