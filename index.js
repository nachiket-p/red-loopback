const path = require('path')
const RED = require("node-red");
const adminServicesInit = require("./admin-services")

function init(app, server, redConfig) {
  if(!redConfig.functionGlobalContext) {
    redConfig.functionGlobalContext = {};
  } else if(redConfig.functionGlobalContext.app) {
    throw new Error("functionGlobalContext.app cannot be used, as its used for looback app instance in this library")
  }
  redConfig.functionGlobalContext.app = app  // enables global context
  // Initialise the runtime with a server and settings
  RED.init(server,redConfig);
  app.use(redConfig.httpAdminRoot,RED.httpAdmin);
  app.use(redConfig.httpNodeRoot,RED.httpNode);

  adminServicesInit(app);
  return RED;
}

//FIXME: Make it work as component
// module.exports = function(app, config) {
//   var version = app.loopback.version;
//   console.log('LoopBack v:', version, config);
//   if(config.red.nodesDir) {
//     config.red.nodesDir = path.join(process.cwd(), '/red-loopback/nodes')
//   }
  
//   return init(app, app, config.red)
// }

module.exports = function(app, server, redConfig){
  return init(app, server, redConfig)
}
