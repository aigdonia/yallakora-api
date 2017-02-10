!function(){"use strict";function a(a){function b(a,b,c,d){}a.$on("$stateChangeStart",b),a.loadingUser=!1}angular.module("yallakora-admin",["ngSanitize","ui.router","ui.bootstrap","angular-ladda","angular-sweetalert","ui.select2","urlFilter"]).run(a),a.$inject=["$rootScope"]}(),function(){"use strict";function a(a,b){a.otherwise("/"),b.setOption({style:"slide-down"})}angular.module("yallakora-admin").config(a),a.$inject=["$urlRouterProvider","laddaProvider"]}(),function(){"use strict";function a(){return function(a){if(a<0)return"na";var b=_.round(a),c=b.toString();return _.floor(a/1e6)>0?c=_.floor(a/1e6).toString()+"M":_.floor(a/1e3)>0&&(c=_.floor(a/1e3).toString()+"K"),c}}angular.module("yallakora-admin").filter("shortyNumbers",a)}(),function(){"usr strict";angular.module("urlFilter",[]).filter("url",function(){return function(a){return _.startsWith(a,"htt")?"<a href='"+a+"' title='Stream URL'>"+a+"</a>":a}})}(),function(){"use strict";function a(a,b){var c=this;a.listAllChannels().then(function(a){c.channelsList=a}),c.createNewChannel=function(){a.createNewChannel(c.newChannelName).then(function(a){c.channelsList.push(a),c.newChannelName=""})},c.deleteChannel=function(d){b({title:"Delete Channel?",text:'Are you sure you want to delete "'+d.title+'"!',type:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#aaa",confirmButtonText:"Yes, delete it!"}).then(function(){a.deleteChannel(d.name).then(function(a){_.remove(c.channelsList,function(b){return a.name===b.name}),b({title:a+name+" Deleted",type:"success"})}).catch(function(a){b({title:"Failed",text:"Cant be Deleted",type:"error"})})})}}angular.module("yallakora-admin").controller("ChannelsController",a),a.$inject=["ChannelsService","swal"]}(),function(){"use strict";function a(a,b){return this.listAllChannels=function(){var c=a.defer();return b.get("/channels").then(function(a){c.resolve(a.data)}),c.promise},this.createNewChannel=function(c){console.log(c);var d=a.defer();return b.post("/channels",{name:c}).then(function(a){d.resolve(a.data.channel)},function(a){d.reject(a.data)}),d.promise},this.getChannelDetails=function(c){var d=a.defer();return b.get("/channels/"+c).then(function(a){d.resolve(a.data)}),d.promise},this.deleteChannel=function(c){var d=a.defer();return b.delete("/channels/"+c).then(function(a){d.resolve(a.data.channel)},function(a){d.reject(a)}),d.promise},this}angular.module("yallakora-admin").factory("ChannelsService",a),a.$inject=["$q","$http"]}(),function(){"use strict";function a(a){a.state("cast",{url:"/",templateUrl:"modules/cast/home.html",controller:"ChannelsController as ctrl"}).state("channel",{url:"channel/:channel_id",parent:"cast",templateUrl:"modules/cast/channel.html",controller:"SingleChannelController as ctrl"})}angular.module("yallakora-admin").config(a),a.$inject=["$stateProvider"]}(),function(){"use strict";function a(a,b){return this.getAllServers=function(){var c=a.defer();return b.get("/servers").then(function(a){c.resolve(a.data.servers)}),c.promise},this}angular.module("yallakora-admin").factory("StreamServers",a),a.$inject=["$q","$http"]}(),function(){"use strict";function a(a,b,c,d,e,f,g){var h=this;e.getChannelDetails(a.channel_id).then(function(a){h.channelDetails=a.data,h.channelStreams=_.sortBy(a.streams,["status"])}),h.newStreamWizard=function(){var a=c.open({animation:!1,ariaLabelledBy:"modal-title",ariaDescribedBy:"modal-body",templateUrl:"modules/cast/new-stream-modal.html",controller:"StreamModalController",controllerAs:"ctrl",resolve:{channel:function(){return h.channelDetails},serversList:function(){return f.getAllServers().then(function(a){return a})}}});a.result.then(function(a){h.channelStreams.push(a)},function(){d.info("Modal dismissed at: "+new Date)})},h.activateStream=function(a){g.updateStream(a.id,{status:"active"}).then(function(c){a.status=c.status,b({title:"Stream Activate",text:"This stream is now available for public viewers",type:"success",timer:1e3})})},h.deactivateStream=function(a){b({title:"Deactivate Stream!",text:"Are you sure? This will hide it from public viewers",type:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Deactivate"}).then(function(){g.updateStream(a.id,{status:"idle"}).then(function(b){a.status=b.status})})}}function b(a,b,c,d){var e=this;e.channelName=b.name,e.serversList=c,e.newStream={},e.createStream=function(){d.createStream(b.id,e.newStream).then(function(b){a.close(b)})}}angular.module("yallakora-admin").controller("SingleChannelController",a).controller("StreamModalController",b),a.$inject=["$stateParams","swal","$uibModal","$log","ChannelsService","StreamServers","Stream"],b.$inject=["$uibModalInstance","channel","serversList","Stream"]}(),function(){"use strict";function a(a,b){return this.createStream=function(c,d){var e=b.defer(),f={title:d.title};return _.has(d,"stream_url")?f.url=d.stream_url:(f.server=d.server_id,f.channel=d.channel_id),a.post("/channels/"+c+"/stream",f).then(function(a){e.resolve(a.data.stream)}),e.promise},this.updateStream=function(c,d){var e=b.defer();return a.post("/streams/"+c,d).then(function(a){e.resolve(a.data)},function(a){e.reject(a)}),e.promise},this}angular.module("yallakora-admin").factory("Stream",a),a.$inject=["$http","$q"]}(),function(){"use strict";function a(){}angular.module("yallakora-admin").controller("StreamsController",a)}(),angular.module("yallakora-admin").run(["$templateCache",function(a){"use strict";a.put("modules/cast/channel.html",'<h1 ng-bind="::ctrl.channelDetails.name"></h1><div ng-if="ctrl.channelStreams.length &lt;= 0" class="well well-lg"><p>No Streams Here Yet create one now!</p><button ng-click="ctrl.newStreamWizard()" class="btn btn-primary">Create Stream</button></div><div ng-if="ctrl.channelStreams.length &gt; 0" class="panel panel-default"><div class="panel-heading"><span>Streams</span><div class="pull-right"><div ng-click="ctrl.newStreamWizard()" class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-plus"></i></div></div></div><table class="table table-condensed"><thead><tr><th></th><th>Quality</th><th>URL</th><th>Status</th><th></th></tr></thead><tbody><tr ng-repeat="stream in ctrl.channelStreams" ng-class="{\'warning\':(stream.status==\'idle\'), \'danger\':(stream.status==\'blocked\')}"><td></td><td>{{::stream.title}}</td><td ng-bind-html="stream.stream_url || \'NA\' | url"></td><td>{{stream.status}}</td><td width="20%"><div class="btn-group"><a disabled class="btn btn-sm btn-default"><i class="glyphicon glyphicon-refresh"></i></a><a disabled class="btn btn-sm btn-danger"><i class="glyphicon glyphicon-trash"></i></a></div><span> </span><div ng-hide="stream.status==&quot;blocked&quot;" class="btn-group"><a ng-if="stream.status==&quot;idle&quot;" ng-click="ctrl.activateStream(stream)" title="Make Public Channel" class="btn btn-sm btn-success"><i class="glyphicon glyphicon-play"></i></a><a ng-if="stream.status==&quot;active&quot;" ng-click="ctrl.deactivateStream(stream)" title="Make Private Channel" class="btn btn-sm btn-warning"><i class="glyphicon glyphicon-stop"></i></a></div></td></tr></tbody></table></div>'),a.put("modules/cast/channels.html",'<div ng-repeat="channel in ctrl.channelsList"><h3 ng-bind="::channel.name"></h3></div>'),a.put("modules/cast/home.html",'<div class="row"><div class="col-sm-3"><div class="panel panel-default"><div class="panel-heading">Channels</div><ul class="list-group"><li class="list-group-item"><form ng-submit="ctrl.createNewChannel()"><div class="input-group"><input type="text" placeholder="New Channel Name" ng-model="ctrl.newChannelName" class="form-control"><div class="input-group-btn"><button type="submit" class="btn btn-primary"><i class="glyphicon glyphicon-plus"></i></button></div></div></form></li><li ng-repeat="channel in ctrl.channelsList" ui-sref-active="channel-item--active" class="list-group-item channel-item"><a ui-sref="channel({channel_id:channel.name})" class="channel-item__name"><img ng-if="!!channel.logo" alt="ChannelLogo"><span ng-bind="::channel.title"></span></a><a ng-click="ctrl.deleteChannel(channel)" class="channel-item__delete"><i class="glyphicon glyphicon-remove"></i></a></li></ul></div></div><div ui-view="" class="col-sm-9"></div></div>'),a.put("modules/cast/new-stream-modal.html",'<div class="modal-header"><h3 id="modal-title" class="modal-title">Add New Stream</h3></div><div id="modal-body" class="modal-body"><p>Add New Stream for channel \'{{ctrl.channelName}}\'</p><form><div class="form-group"><input placeholder="Stream Title (720p(HD), Low Quality-140p)" ng-model="ctrl.newStream.title" class="form-control input-lg"></div><div class="form-group"><uib-tabset active="active"><uib-tab index="0" heading="Configured Server"><div class="container-fluid"><div class="form-group"><input placeholder="Stream Channel ID" ng-model="ctrl.newStream.channel_id" class="form-control"></div><div class="form-group"><div class="col-sm-12"><select ui-select2="{allowClear:true}" ng-model="ctrl.newStream.server_id" data-placeholder="Select Server or search by server name" ng-required="true"><option ng-repeat="server in ctrl.serversList" value="{{server.id}}">{{server.name}}</option></select></div></div></div></uib-tab><uib-tab index="1" heading="Unkown Server"><div class="container-fluid"><input placeholder="Online Stream URL" ng-model="ctrl.newStream.stream_url" class="form-control"></div></uib-tab></uib-tabset></div></form></div><div class="modal-footer"><button type="button" ng-click="ctrl.createStream()" class="btn btn-primary">Add Stream</button></div>')}]);