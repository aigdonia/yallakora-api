(function(){
  'use strict';

  angular.module('yallakora-admin', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'angular-ladda',
    'angular-sweetalert',
    'ui.select2',
    'urlFilter',
    'ngFileUpload'
  ])
  .run(runApp);

  runApp.$inject = ['$rootScope'];

  function runApp($rootScope){
    // this should take care of the site title on changing routes
    $rootScope.$on('$stateChangeStart', keepSiteTitleUpdated);
    $rootScope.loadingUser = false;

    function keepSiteTitleUpdated(e, toState, toParams, fromState){
      // TODO
    }
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
  .config( configureApp );

  configureApp.$inject = ['$urlRouterProvider', '$httpProvider', 'laddaProvider'];
  function configureApp($urlRouterProvider, $httpProvider, laddaProvider){
    // set default fallaback route to go to home
    $urlRouterProvider.otherwise('/');

    // configuring button load effect
    laddaProvider.setOption({
      style: 'slide-down'
    });

    var baseURL = "http://localhost:3002";
    // set baseURL to
    $httpProvider.interceptors.push(function($q){
      return {
        'request': function(config) {
          if (config.url.indexOf('/') === 0) {
            config.url = baseURL + config.url;
          }
          return config;
        }
      };
    });
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .filter('shortyNumbers', shortyNumbersFilter);

  function shortyNumbersFilter(){
    return function(number){
      if(number < 0)
        return 'na';
      var integerNumber = _.round(number); // this is integer now, no kidding
      var text = integerNumber.toString();
      if(_.floor(number/1000000) > 0) {
        text = _.floor(number/1000000).toString() + 'M';
      } else if(_.floor(number/1000) > 0) {
        text = _.floor(number/1000).toString() + 'K';
      }
      return text;
    };
  }
})();

(function(){
  'usr strict';

  angular.module('urlFilter',[])
    .filter('url', function(){
      return function(text){
        // check if this is a url
        if( _.startsWith(text, 'htt') )
          return "<a href='"+text+"' title='Stream URL'>"+text+"</a>";
        else
          return text;
      };
    });
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .controller('ChannelsController', ChannelsController);

  ChannelsController.$inject = ['ChannelsService', 'swal'];

  function ChannelsController(ChannelsService, swal){
    var vm = this;
    ChannelsService.listAllChannels().then(function(channels){
      vm.channelsList = channels;
    });

    vm.createNewChannel = function(){
      ChannelsService.createNewChannel(vm.newChannelName)
        .then(function(newChannel){
          vm.channelsList.push(newChannel);
          vm.newChannelName = '';
        });
    };

    vm.deleteChannel = function(channel){
      swal({
          title: 'Delete Channel?',
          text: 'Are you sure you want to delete "'+channel.title+'"!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#aaa',
          confirmButtonText: 'Yes, delete it!'
      }).then(function(){
        ChannelsService.deleteChannel(channel.name)
          .then(function(channel){
            _.remove(vm.channelsList, function(_ch){ return channel.name === _ch.name; });
            swal({
              title: channel.name+' Deleted',
              type: 'success'
            });
          })
          .catch(function(error){
            swal({
              title: 'Failed',
              text: 'Cant be Deleted',
              type: 'error'
            });
          });
      });
    };
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .factory('ChannelsService', ChannelsService);

  ChannelsService.$inject = ['$q', '$http'];

  function ChannelsService($q, $http){
    this.listAllChannels = function(){
      var defer = $q.defer();
      $http.get('/channels')
        .then(function(response){
          defer.resolve(response.data);
        });
      return defer.promise;
    };

    this.createNewChannel = function(channelName){
      console.log(channelName);
      var defer = $q.defer();
      $http.post('/channels', {'name':channelName})
        .then(function(response){
          defer.resolve(response.data.channel);
        },function(response){
          defer.reject(response.data);
        });

      return defer.promise;
    };

    this.getChannelDetails = function(channelID){
      var defer = $q.defer();
      $http.get('/channels/'+channelID).then(function(response){
        defer.resolve(response.data);
      });
      return defer.promise;
    };

    this.deleteChannel = function(channelID){
      var defer = $q.defer();
      $http.post('/channels/'+channelID+'/remove')
        .then(function(response){
          defer.resolve(response.data.channel);
        }, function(error){
          defer.reject(error);
        });

      return defer.promise;
    };
    return this;
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .config( routes );

  routes.$inject= ['$stateProvider'];

  function routes($stateProvider){
    $stateProvider
      .state('cast',{
        url:'/',
        templateUrl: 'modules/cast/home.html',
        controller: 'ChannelsController as ctrl'
      })
      .state('channel', {
        url: 'channel/:channel_id',
        parent: 'cast',
        templateUrl: 'modules/cast/channel.html',
        controller: 'SingleChannelController as ctrl'
      });
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .factory('StreamServers', StreamServersFactory);

  StreamServersFactory.$inject = ['$q', '$http'];
  function StreamServersFactory($q, $http){
    this.getAllServers = function(){
      var defer = $q.defer();
      $http.get('/servers')
        .then(function(response){
          defer.resolve(response.data.servers);
        });
      return defer.promise;
    };
    return this;
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .controller('SingleChannelController', SingleChannelController)
    .controller('StreamModalController', StreamModalController);

  SingleChannelController.$inject = ['$stateParams', 'swal', '$uibModal', '$log', 'Upload', 'ChannelsService', 'StreamServers', 'Stream'];
  StreamModalController.$inject = ['$uibModalInstance', 'channel', 'qualities','serversList', 'Stream'];

  function SingleChannelController($stateParams, swal, $uibModal, $log, Upload, ChannelsService, StreamServers, Stream){
    var vm = this;
    ChannelsService.getChannelDetails($stateParams.channel_id).then(function(channelDetails){
      vm.channelDetails = channelDetails.data;
      vm.channelStreams = _.sortBy(channelDetails.streams, ['status']);
    });

    vm.newStreamWizard = function(){
      // var parentElem = parentSelector ?
      // angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
      var modalInstance = $uibModal.open({
        animation: false,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'modules/cast/new-stream-modal.html',
        controller: 'StreamModalController',
        controllerAs: 'ctrl',
        resolve: {
          channel: function(){ return vm.channelDetails; },
          qualities: function(){
            return Stream.getQualities().then(function(qualities){
              return qualities;
            });
          },
          serversList: function(){
            return StreamServers.getAllServers().then(function(servers){
              return servers;
            });
          }
        }
      });

      modalInstance.result.then(function (newStream) {
        vm.channelStreams.push(newStream);
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    vm.activateStream = function(stream){
      Stream.updateStream(stream.id, {'status':'active'}).
        then(function(newStream){
          stream.status = newStream.status;
          swal({
            'title': 'Stream Activate',
            'text': 'This stream is now available for public viewers',
            'type': 'success',
            'timer': 1000
          });
        });
    };

    vm.deactivateStream = function(stream){
      swal({
        title: 'Deactivate Stream!',
        text: 'Are you sure? This will hide it from public viewers',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Deactivate'
      }).then(function(){
        Stream.updateStream(stream.id, {'status':'idle'}).
          then(function(newStream){
            stream.status = newStream.status;
          });
      });
    };

    vm.enableEdit = function(stream){
      stream.enableEdit = true;
    };

    vm.updateStreamChannel = function(stream){
      Stream.updateStream(stream.id, {'server_channel':stream.server_channel}).
        then(function(newStream){
          stream.server_channel = newStream.server_channel;
          swal({
            'title': 'Stream Channel Changed',
            'text': 'Stream Channel is updated',
            'type': 'success',
            'timer': 1000
          });
          stream.enableEdit = false;
        });
    };

    vm.deleteStream = function(stream){
      swal({
        title: 'Remove Stream!',
        text: 'This will delete the stream and can\'t UNDO',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete'
      }).then(function(){
        Stream.deleteStream(stream)
          .then(function(deletedStream){
            _.remove(vm.channelStreams, function(s){ return s.id === deletedStream.id; });
          });
      });
    };

    vm.updateLogo = function(file){
      Upload.upload({
        url:'/channels/'+vm.channelDetails.name+'/logo',
        data: {file: file}
      }).then(function(response){});
    };

    vm.url = function(stream){
      return _.replace(stream.server.embded_pattern,'{CH}', stream.server_channel).replace('{W}','500').replace('{H}','400');
    };
  }

  function StreamModalController($uibModalInstance, channel, qualities,serversList, Stream){
    var vm = this;
    vm.channelName = channel.title;
    vm.serversList = serversList;
    vm.qualityList = qualities;
    vm.newStream = {};

    vm.createStream = function(){
      Stream.createStream(channel.name, vm.newStream)
        .then(function(stream){
          $uibModalInstance.close(stream);
        });
    };
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .factory('Stream', StreamService);

  StreamService.$inject = ['$http', '$q'];

  function StreamService($http, $q){
    this.createStream = function(channel_id, attributes){
      var defer = $q.defer();
      var newStream = {
        title: attributes.title,
        quality: attributes.quality
      };
      if( _.has(attributes, 'stream_url') ){
        newStream.url = attributes.stream_url;
      } else {
        newStream.server = attributes.server_id;
        newStream.channel = attributes.channel_id;
      }

      $http.post('/channels/'+channel_id+'/stream', newStream)
        .then(function(response){
          defer.resolve(response.data.stream);
        });

      return defer.promise;
    };

    this.updateStream = function(stream_id, updates){
      var defer = $q.defer();
      $http.post('/streams/'+stream_id, updates)
        .then(function(response){
          defer.resolve(response.data);
        }, function(error){
          defer.reject(error);
        });

      return defer.promise;
    };

    this.getQualities = function(){
      var defer = $q.defer();
      $http.get('/lookups/quality')
        .then(function(response){
          console.log(response.data);
          return defer.resolve(response.data.quality);
        });
      return defer.promise;
    };

    this.deleteStream = function(stream){
      var defer = $q.defer();

      $http.post('/streams/'+stream.id+'/remove')
        .then(function(response){
          defer.resolve(response.data.stream);
        }, function(error){
          defer.reject(error);
        });
      return defer.promise;
    };
    return this;
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .controller('StreamsController', StreamsController);

  function StreamsController(){
    var vm = this;
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .config( routes );

  routes.$inject = ['$stateProvider'];

  function routes($stateProvider){
    $stateProvider
      .state('users', {
        url: '/users',
        templateUrl: 'modules/users/home.html',
      });
  }
})();

(function(){
  'use strict';

  angular.module('yallakora-admin')
    .controller('UsersController', UsersController);

  UsersController.$inject = [];

  function UsersController(){
    var vm = this;
    vm.usersList = [
      {
        id: 1,
        email: 'aigdonia@gmail.com',
      },
      {
        id: 2,
        email: 'aigdonia@gmail.com',
      },
      {
        id: 3,
        email: 'aigdonia@gmail.com',
      },
      {
        id: 4,
        email: 'aigdonia@gmail.com',
      },
    ];
  }
})();

angular.module('yallakora-admin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('modules/cast/channel.html',
    "<div class=\"panel panel-default channel-title-panel\"><div class=\"panel-body\"><div ng-class=\"{&quot;hydrated&quot;:!!ctrl.channelDetails.logo}\" ng-model=\"ctrl.logo\" name=\"logo\" ngf-pattern=\"'image/png'\" ngf-accept=\"'image/png'\" ngf-max-size=\"1MB\" ngf-min-height=\"100\" ngf-drag-over-class=\"'dragover'\" ngf-resize=\"{height: 100}\" ngf-select=\"ctrl.updateLogo($file)\" ngf-drop=\"ctrl.updateLogo($file)\" ngf-thumbnail=\"ctrl.logo || '/thumb.jpg'\" ngf-as-background=\"true\" class=\"uploader\"><span ng-if=\"!(ctrl.channelDetails.logo || ctrl.logo)\">Select Logo</span><img ng-if=\"!!ctrl.channelDetails.logo &amp;&amp; !ctrl.logo\" ng-src=\"{{ctrl.channelDetails.logo}}\"></div><h1 ng-bind=\"::ctrl.channelDetails.title\"></h1></div></div><div ng-if=\"ctrl.channelStreams.length &lt;= 0\" class=\"well well-lg\"><p>No Streams Here Yet create one now!</p><button ng-click=\"ctrl.newStreamWizard()\" class=\"btn btn-primary\">Create Stream</button></div><div ng-if=\"ctrl.channelStreams.length &gt; 0\" class=\"panel panel-default\"><div class=\"panel-heading\"><span>Streams</span><div class=\"pull-right\"><div ng-click=\"ctrl.newStreamWizard()\" class=\"btn btn-primary btn-sm\"><i class=\"glyphicon glyphicon-plus\"></i></div></div></div><table class=\"table table-condensed\"><thead><tr><th></th><th>Title</th><th>Quality</th><th>Status</th><th>Server</th><th>Channel/URL</th><th></th></tr></thead><tbody><tr ng-repeat=\"stream in ctrl.channelStreams\" ng-class=\"{'warning':(stream.status=='idle'), 'danger':(stream.status=='blocked')}\"><td></td><td>{{::stream.title}}</td><td>{{::stream.quality}}</td><td> <div ng-class=\"{'label-success':stream.status==='active','label-danger':stream.status=='blocked'}\" class=\"label label-default\">{{stream.status}}</div></td><td ng-bind=\"stream.server.name || &quot;NA&quot;\"></td><td><div ng-if=\"!!stream.server_channel\"><form ng-submit=\"ctrl.updateStreamChannel(stream)\"><div class=\"input-group\"><input type=\"text\" placeholder=\"Stream Channel\" ng-model=\"stream.server_channel\" ng-disabled=\"!stream.enableEdit\" class=\"form-control\"><span class=\"input-group-btn\"><button type=\"button\" ng-click=\"ctrl.enableEdit(stream)\" ng-disabled=\"!!stream.enbleEdit\" class=\"btn btn-default\">Edit</button></span></div></form></div><span ng-if=\"!!stream.stream_url\" ng-bind-html=\"stream.stream_url || &quot;NA&quot; | url\"></span></td><td width=\"20%\"><div class=\"btn-group\"><a tooltip-placement=\"top\" uib-tooltip=\"{{ctrl.url(stream)}}\" href=\"{{ctrl.url(stream)}}\" target=\"_blank\" class=\"btn btn-sm btn-default\"><i class=\"glyphicon glyphicon-eye-open\"></i></a><a disabled title=\"Edit Stream Server\" class=\"btn btn-sm btn-default\"><i class=\"glyphicon glyphicon-edit\"></i></a><a ng-click=\"ctrl.deleteStream(stream)\" class=\"btn btn-sm btn-danger\"><i class=\"glyphicon glyphicon-trash\"></i></a></div><span> </span><div ng-hide=\"stream.status==&quot;blocked&quot;\" class=\"btn-group\"><a ng-if=\"stream.status==&quot;idle&quot;\" ng-click=\"ctrl.activateStream(stream)\" title=\"Make Public Channel\" class=\"btn btn-sm btn-success\"><i class=\"glyphicon glyphicon-play\"></i></a><a ng-if=\"stream.status==&quot;active&quot;\" ng-click=\"ctrl.deactivateStream(stream)\" title=\"Make Private Channel\" class=\"btn btn-sm btn-warning\"><i class=\"glyphicon glyphicon-stop\"></i></a></div></td></tr></tbody></table></div>"
  );


  $templateCache.put('modules/cast/channels.html',
    "<div ng-repeat=\"channel in ctrl.channelsList\"><h3 ng-bind=\"::channel.name\"></h3></div>"
  );


  $templateCache.put('modules/cast/home.html',
    "<div class=\"row\"><div class=\"col-sm-3\"><div class=\"panel panel-default\"><div class=\"panel-heading\">Channels</div><ul class=\"list-group\"><li class=\"list-group-item\"><form ng-submit=\"ctrl.createNewChannel()\"><div class=\"input-group\"><input type=\"text\" placeholder=\"New Channel Name\" ng-model=\"ctrl.newChannelName\" class=\"form-control\"><div class=\"input-group-btn\"><button type=\"submit\" class=\"btn btn-primary\"><i class=\"glyphicon glyphicon-plus\"></i></button></div></div></form></li><li ng-repeat=\"channel in ctrl.channelsList\" ui-sref-active=\"channel-item--active\" class=\"list-group-item channel-item\"><a ui-sref=\"channel({channel_id:channel.name})\" class=\"channel-item__name\"><img ng-if=\"!!channel.logo\" alt=\"ChannelLogo\" ng-src=\"{{channel.logo}}\"><span ng-bind=\"::channel.title\"></span></a><a ng-click=\"ctrl.deleteChannel(channel)\" class=\"channel-item__delete\"><i class=\"glyphicon glyphicon-remove\"></i></a></li></ul></div></div><div ui-view=\"\" class=\"col-sm-9\"></div></div>"
  );


  $templateCache.put('modules/cast/new-stream-modal.html',
    "<div class=\"modal-header\"><h3 id=\"modal-title\" class=\"modal-title\">Add New Stream</h3></div><div id=\"modal-body\" class=\"modal-body\"><p>Add New Stream for channel '{{ctrl.channelName}}'</p><form><div class=\"form-group\"><input placeholder=\"Stream Title (720p(HD), Low Quality-140p)\" ng-model=\"ctrl.newStream.title\" class=\"form-control input-lg\"></div><div class=\"form-group\"><div class=\"col-sm-12\"><select ui-select2=\"{allowClear:true}\" ng-model=\"ctrl.newStream.quality\" placeholder=\"Select Server or search by server name\" ng-required=\"true\"><option ng-repeat=\"quality in ctrl.qualityList\" value=\"{{quality.title}}\">{{quality.title}}</option></select></div></div><div></div><div class=\"form-group\"><uib-tabset active=\"active\"><uib-tab index=\"0\" heading=\"Configured Server\"><div class=\"container-fluid\"><div class=\"form-group\"><input placeholder=\"Stream Channel ID\" ng-model=\"ctrl.newStream.channel_id\" class=\"form-control\"></div><div class=\"form-group\"><div class=\"col-sm-12\"><select ui-select2=\"{allowClear:true}\" ng-model=\"ctrl.newStream.server_id\" data-placeholder=\"Select Server or search by server name\" ng-required=\"true\"><option ng-repeat=\"server in ctrl.serversList\" value=\"{{server.id}}\">{{server.name}}</option></select></div></div></div></uib-tab><uib-tab index=\"1\" heading=\"Unkown Server\"><div class=\"container-fluid\"><input placeholder=\"Online Stream URL\" ng-model=\"ctrl.newStream.stream_url\" class=\"form-control\"></div></uib-tab></uib-tabset></div></form></div><div class=\"modal-footer\"><button type=\"button\" ng-click=\"ctrl.createStream()\" class=\"btn btn-primary\">Add Stream</button></div>"
  );


  $templateCache.put('modules/users/home.html',
    "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-md-offset-2 col-md-8\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><span>Users</span><div class=\"pull-right\"><button class=\"btn btn-primary btn-sm\">New User</button></div></div><div class=\"panel-body\"><table class=\"table\"><thead><tr><th> </th><th>User Email</th><th></th></tr></thead><tbody><tr><td><input type=\"checkbox\"></td><td>aigdonia@gmail.com</td><td><center><div class=\"btn-group\"><a disabled title=\"Update Password\" class=\"btn btn-sm btn-default\"><i class=\"glyphicon glyphicon-lock\"></i></a><a disabled class=\"btn btn-sm btn-danger\"><i class=\"glyphicon glyphicon-trash\"></i></a></div></center></td></tr></tbody></table></div></div></div></div></div>"
  );

}]);
