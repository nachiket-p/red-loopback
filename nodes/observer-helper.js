
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

  msg.payload = ctx.instance || ctx.data;
  msg.lbctx = ctx //_.merge(msg, _.pick(ctx, props)); //JSON.parse(JSON.stringify(ctx));
  return msg;
}

var Observer = function (Model, methodName, callback) {
  const modelName = Model.modelName
  this.observe = function (ctx, next) {
    const msg = simplifyMsg(ctx, modelName, methodName);
    callback(msg, ctx, next);
  }

  this.remove = function() {
    Model.removeObserver(methodName, this.observe)
  }
}

var RemoteObserver = function (Model, methodName, callback) {
  const modelName = Model.modelName
  this.observe = function (ctx, instance, next) {
    const msg = simplifyMsg(ctx, modelName, methodName);
    callback(msg, ctx, next);
  }

  this.remove = function() {
    Model.removeObserver(methodName, this.observe)
  }
}

function getAppRef(node) {
    const app = node.context().global.get('app');
    if(!app) {
      const errMsg = 'Couldnt find app (loopback app) reference in global context';
      node.status({ fill: "red", shape: "ring", text: errMsg });
      node.error({
        message: errMsg
      });
      throw new Error(errMsg);
    }
    return app;
}

module.exports = {
  simplifyMsg: simplifyMsg,
  props: props,
  Observer: Observer,
  RemoteObserver: RemoteObserver,
  getAppRef
}