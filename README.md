# red-loopback
**red-loopback** glues [LoopBack](https://loopback.io/) &amp; [Node-Red](https://nodered.org/) together and provides features on top of it. 

[LoopBack](https://loopback.io/) is great as a node framework. It is built on top of [Express JS](https://expressjs.com/).  
[Node-Red](https://nodered.org/) gives visual flow based interface.And its great for wiring together nodes (*it has tons of ready to use nodes in its catalogue*)  

### Usecases
Theratically, you can write most of your business logic code in Node-RED. But idea is to use flow based approach for side-effects like notifications, alerts, scheduler jobs, dashboard services etc. 

Some of the cases for a hypothatical project management system
* When a task is assigned to a user, he should get email/sms notification.
* When a task is added, subscribing creator & assigner to that task. 
* When a task is updated, sending update notification to subscribed users of that task. 
* Generating weekly summary & emailing all the users of each project
* Dashboard services & Dashboard UI as well

### Loopback Nodes  
red-loopback provides following nodes.
* **Code Block**: For executing any javascript code
* **Operation Hook**: Loopback Model Operation Hook
* **Method Call**: For calling any Loopback Model method
* **Remote Hook**: Enables you to execute a function before or after a remote method is called by a client  
* **Opration Hook**: Observes to models and allows to do something when a model performs a specific operation  
* **End Hook**: Terminates both opration and remote hooks


### Installation

### Examples