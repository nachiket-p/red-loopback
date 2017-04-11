const RED = require('node-red')
module.exports = function(app){
  const path = "/lbmodels";
  console.log("####### registering @ " + path)
  RED.httpAdmin.get(path, RED.auth.needsPermission('loopback-async.read'), function (req, res) {
    //var globalContext = this.context().global;    
    //const app = globalContext.get('app');
    const models = app.models();
    var modelNames = models.map(function(model){return {name: model.modelName}});
    console.log("FOUND Models: ", modelNames)
    res.json(modelNames);
  });
  console.log("####### registered @ " + path)
}