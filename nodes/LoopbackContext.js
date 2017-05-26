const shortid = require('shortid');

const Context = function() {
    
    const store = {}

    this.add = function(ctx) {
      const randomId = shortid.generate()
      store[randomId] = ctx
      return randomId
    }

    this.get = function(contextId) {
      return store[contextId]
    }

    this.remove = function(contextId) {
      delete store[contextId]
    }
}

const getContext = function(node) {
   const flowContext = node.context().flow
    let lbContext = flowContext.get('lbContext')
    if(!lbContext) {
      lbContext = new Context()
      flowContext.set('lbContext', lbContext)
    }
    return lbContext
}

module.exports = {getContext: getContext}

// var functions = flow.get("YUFlowFunctions") || {};
// if (functions.context){
//    return msg;
// }
// functions.context = functions.context || {};
// flow.set("YUFlowFunctions", functions);

// if (functions.context.contextstore === undefined){
//    functions.context.contextstore = {};
// }

// functions.context.Add = function(context, id){
//    this.contextstore[id] = context;
//    console.log("Added context " + id);
// }

// functions.context.Get = function(id){
//    //console.log("Get context " + id);
//    return this.contextstore[id];
// }

// functions.context.Remove = function(id){
//    console.log("Remove context " + id);
//    delete this.contextstore[id];
// }

// functions.context.RemoveAll = function(){
//    var keys = Object.keys(this.contextstore);
//    console.log("RemoveAll context: " + util.inspect(keys));
//    this.contextstore = {};
// }

// return msg;