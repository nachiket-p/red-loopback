
var loopback = require('loopback');
var _ = require('lodash');
var async = require('async');
var props = ['instance', 'currentInstance', 'data', 'hookState', 'where', 'query', 'isNewInstance', 'options'];
const LoopbackContext = require('./LoopbackContext')

function simplifyMsg(ctx, modelName, methodName) {
  var msg = {};

  if (ctx.Model !== undefined) {
    msg.text = ctx.Model.definition.name + '.' + methodName + ' triggered';
    msg.modelName = ctx.Model.definition.name;
  }

  //msg.lbctx = _.clone(ctx);
  //delete msg.lbctx.app;

  msg.payload = {
    lbdata: ctx.instance || ctx.data || ctx.args.data
  }
  return msg;
}

const MAP = {
  'before delete': 'before save',
  'after delete': 'after save',
}
var OperationObserver = function (Model, methodName, methodType, callback) {
  // mixins handling 
  let deleteField = '_isDeleted';
  const mixin = Model.settings.mixins;
  const hasSoftDelete = mixin ? mixin.SoftDelete : false;
  if (hasSoftDelete && (typeof mixin.SoftDelete == 'object') && mixin.SoftDelete._isDeleted) {
    deleteField = Model.settings.mixins.SoftDelete._isDeleted;
  }

  const modelName = Model.modelName
  this.observe = function (ctx, next) {
    const data = ctx.isNewInstance ? ctx.instance : ctx.data;
    if (hasSoftDelete && data) {
      if (!MAP[methodName]) {
        if (data[deleteField]) {
          next();
          return;
        }
      } else {
        if (!data[deleteField]) {
          next();
          return;
        }
      }
    }
    const msg = simplifyMsg(ctx, modelName, methodName);
    callback(msg, ctx, next);
  }

  let actualMethod = methodName
  if (hasSoftDelete && MAP[methodName]) {
    actualMethod = MAP[methodName]
  }
  Model.observe(actualMethod, this.observe);

  this.remove = function () {
    Model.removeObserver(actualMethod, this.observe)
  }
}

var EventObserver = function (Model, methodName, callback) {
  const modelName = Model.modelName
  this.observe = function (instance) {
    const msg = {
      text: modelName + '.' + methodName + ' triggered',
      modelName: modelName,
      payload: instance
    }
    callback(msg);
  }
  Model.addListener(methodName, this.observe);

  this.remove = function () {
    Model.removeListener(methodName, this.observe)
  }
}

var RemoteObserver = function (Model, methodName, methodType, callback) {
  const modelName = Model.modelName;
  let isActive = true;
  this.observe = function (ctx, instance, next) {
    console.log("Model: ", instance, ", Methode name: ", methodName, ", Method Type: ", methodType);
    //NOTE: If marked as notActive, do not execute anything for this Remote Observer instance. 
    if (!isActive) {
      next();
      return;
    }
    if (instance instanceof Function) {
      next = instance
    }
    const msg = simplifyMsg(ctx, modelName, methodName);
    callback(msg, ctx, next);
  }

  if (methodType == 'before') {
    Model.beforeRemote(methodName, this.observe);
  } else {
    Model.afterRemote(methodName, this.observe);
  }
  this.remove = function () {
    //NOTE: There are no methods available to remove Remote Observer in LoopBack 3.6.0
    //Model.removeObserver(methodName, this.observe)
    isActive = false;
  }
}

function getAppRef(node) {
  const app = node.context().global.get('app');
  if (!app) {
    const errMsg = 'Couldnt find app (loopback app) reference in global context';
    node.status({ fill: "red", shape: "ring", text: errMsg });
    node.error({
      message: errMsg
    });
    throw new Error(errMsg);
  }
  return app;
}

const hookEnd = function (err, msg) {
  msg.endHook(err, msg);
}

const showError = function (node, msg) {
  node.status({ fill: "red", shape: "ring", text: msg });
  node.error({
    message: msg
  });
}

const _createObserver = (config, node, Observer) => {
  const app = getAppRef(node);
  var Model = app.models[config.modelName];

  if (Model !== undefined) {
    const observer = new Observer(Model, config.method, config.methodType, function (msg, ctx, next) {
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
    showError(node, errMsg)
  }
}

module.exports = {
  simplifyMsg: simplifyMsg,
  props: props,
  EventObserver: EventObserver,
  hookEnd: hookEnd,
  showError: showError,
  addOperationObserver: (config, node) => {
    _createObserver(config, node, OperationObserver)
  },
  addRemoteObserver: (config, node) => {
    _createObserver(config, node, RemoteObserver)
  },
  getAppRef,
}