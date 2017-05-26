
var loopback = require('loopback');
var _ = require('lodash');
var async = require('async');
var props = ['instance', 'currentInstance', 'data', 'hookState', 'where', 'query', 'isNewInstance', 'options'];

function simplifyMsg(ctx, modelName, methodName) {
  var msg = {};

  if (ctx.Model !== undefined) {
    msg.text = ctx.Model.definition.name + '.' + methodName + ' triggered';
    msg.modelName = ctx.Model.definition.name;
  }
  msg.lbctx = _.clone(ctx);
  delete msg.lbctx.app;

  msg.payload = ctx.instance || ctx.data;
  return msg;
}

const MAP = {
  'before delete': 'before save',
  'after delete': 'after save',
}
var OperationObserver = function (Model, methodName, callback) {
  // mixins handling 
  let deleteField = '_isDeleted';
  const mixin = Model.settings.mixins;
  const hasSoftDelete = mixin ? mixin.SoftDelete : false;
  if(hasSoftDelete && (typeof mixin.SoftDelete == 'object') && mixin.SoftDelete._isDeleted) {
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
  if(hasSoftDelete && MAP[methodName]) {
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

var RemoteObserver = function (Model, methodName, callback) {
  const modelName = Model.modelName;
  let isActive = true;
  this.observe = function (ctx, instance, next) {
    console.log("Model: ", instance, " Methode name", methodName);
    //NOTE: If marked as notActive, do not execute anything for this Remote Observer instance. 
    if (!isActive) {
      next();
      return;
    }
    if (instance instanceof Function) {
      next = instance
    }

    var req = ctx.req;
    var res = ctx.res;
    ctx.req = ctx.res = null;
    const msg = simplifyMsg(ctx, modelName, methodName);
    //TEMP FIX FOR REQ/RES CLONE ISSUE - https://github.com/node-red/node-red/issues/97
    msg.req = req;
    msg.res = res;
    ctx.req = req;
    ctx.res = res;

    callback(msg, ctx, next);
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

module.exports = {
  simplifyMsg: simplifyMsg,
  props: props,
  OperationObserver: OperationObserver,
  EventObserver: EventObserver,
  RemoteObserver: RemoteObserver,
  hookEnd: hookEnd,
  showError: showError,
  getAppRef,
}