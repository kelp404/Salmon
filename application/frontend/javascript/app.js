(function() {
  angular.module('salmon.controllers', ['salmon.controllers.navigation', 'salmon.controllers.index', 'salmon.controllers.login', 'salmon.controllers.settings']);

}).call(this);

(function() {
  angular.module('salmon.controllers.index', []).controller('IndexController', [
    '$scope', '$injector', function($scope, $injector) {
      var $state, $v;
      $v = $injector.get('$v');
      $state = $injector.get('$state');
      if ($v.user.isLogin) {
        return $state.go('v.settings-profile');
      } else {
        return $stae.go('v.login');
      }
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers.login', []).controller('LoginController', [
    '$scope', '$injector', function($scope, $injector) {
      var $salmon;
      $salmon = $injector.get('$salmon');
      return $scope.url = $salmon.url;
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers.navigation', []).controller('NavigationController', [
    '$scope', '$injector', function($scope, $injector) {
      var $salmon;
      $salmon = $injector.get('$salmon');
      $scope.user = $salmon.user;
      $scope.url = $salmon.url;
      return $scope.isRoot = $salmon.user.permission === 1;
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers.settings', []).controller('SettingsController', [
    '$scope', '$injector', function($scope, $injector) {
      var $state;
      $state = $injector.get('$state');
      return $state.go('salmon.settings-projects');
    }
  ]).controller('SettingsProfileController', [
    '$scope', '$injector', 'profile', function($scope, $injector, profile) {
      var $salmon, $validator;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      return $scope.profile = {
        model: profile,
        submit: function($event) {
          $event.preventDefault();
          return $validator.validate($scope, 'profile.model').success(function() {
            NProgress.start();
            return $salmon.api.settings.updateProfile({
              name: $scope.profile.model.name
            }).success(function() {
              NProgress.done();
              return $salmon.alert.saved();
            });
          });
        }
      };
    }
  ]).controller('SettingsProjectsController', [
    '$scope', '$injector', 'projects', function($scope, $injector, projects) {
      var $salmon;
      $salmon = $injector.get('$salmon');
      $scope.options = {
        lowest: (function() {
          var index, _i, _results;
          _results = [];
          for (index = _i = -10; _i <= 10; index = _i += 1) {
            if (index !== 0) {
              _results.push({
                value: index,
                label: index < 0 ? "B" + (index * -1) : index
              });
            }
          }
          return _results;
        })(),
        highest: (function() {
          var index, _i, _results;
          _results = [];
          for (index = _i = 1; _i <= 50; index = _i += 1) {
            _results.push({
              value: index,
              label: "" + index
            });
          }
          return _results;
        })()
      };
      $scope.projects = projects;
      return $scope.removeProject = function(project, $event) {
        $event.preventDefault();
        return $salmon.alert.confirm("Do you want to delete the project " + project.title + "?", function(result) {
          if (!result) {
            return;
          }
          NProgress.start();
          return $salmon.api.project.removeProject(project.id).success(function() {
            return $state.go($state.current, $stateParams, {
              reload: true
            });
          });
        });
      };
    }
  ]).controller('SettingsNewProjectController', [
    '$scope', '$injector', function($scope, $injector) {
      var $salmon, $state, $timeout, $validator;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      $state = $injector.get('$state');
      $timeout = $injector.get('$timeout');
      $scope.mode = 'new';
      $scope.project = {
        lowest: 1,
        highest: 12,
        room_options: []
      };
      $scope.modal = {
        autoShow: true,
        hide: function() {},
        hiddenCallback: function() {
          return $state.go('salmon.settings-projects', null, {
            reload: true
          });
        }
      };
      $scope.room = {
        roomTitle: '',
        addRoomOption: function() {
          return $validator.validate($scope, 'room').success(function() {
            $scope.project.room_options.push($scope.room.roomTitle);
            $scope.room.roomTitle = '';
            return $timeout(function() {
              return $validator.reset($scope, 'room');
            });
          });
        }
      };
      return $scope.submit = function() {
        return $validator.validate($scope, 'project').success(function() {
          NProgress.start();
          $scope.project.floor_options = (function() {
            var index, result, _i, _ref, _ref1;
            result = [];
            for (index = _i = _ref = $scope.project.lowest, _ref1 = $scope.project.highest; _i <= _ref1; index = _i += 1) {
              if (index !== 0) {
                if (index < 0) {
                  result.push("B" + (index * -1));
                } else {
                  result.push("" + index);
                }
              }
            }
            return result;
          })();
          return $salmon.api.project.addProject($scope.project).success(function() {
            return $scope.modal.hide();
          });
        });
      };
    }
  ]).controller('SettingsUsersController', [
    '$scope', '$injector', 'users', function($scope, $injector, users) {
      var $salmon, $state, $stateParams, $validator;
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $stateParams = $injector.get('$stateParams');
      $validator = $injector.get('$validator');
      $scope.users = users;
      $scope.currentUser = $salmon.user;
      $scope.isRoot = $salmon.user.permission === 1;
      return $scope.removeUser = function(user, $event) {
        $event.preventDefault();
        return $salmon.alert.confirm("Do you want to delete the user " + user.name + "<" + user.email + ">?", function(result) {
          if (!result) {
            return;
          }
          NProgress.start();
          return $salmon.api.user.removeUser(user.id).success(function() {
            return $state.go($state.current, $stateParams, {
              reload: true
            });
          });
        });
      };
    }
  ]).controller('SettingsNewUserController', [
    '$scope', '$injector', function($scope, $injector) {
      var $salmon, $state, $validator;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      $state = $injector.get('$state');
      $scope.mode = 'new';
      $scope.user = {
        email: ''
      };
      $scope.modal = {
        autoShow: true,
        hide: function() {},
        hiddenCallback: function() {
          return $state.go('salmon.settings-users', null, {
            reload: true
          });
        }
      };
      return $scope.submit = function() {
        return $validator.validate($scope, 'user').success(function() {
          NProgress.start();
          return $salmon.api.user.inviteUser($scope.user.email).success(function() {
            return $scope.modal.hide();
          });
        });
      };
    }
  ]).controller('SettingsUserController', [
    '$scope', '$injector', 'user', function($scope, $injector, user) {
      var $salmon, $state, $validator;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      $state = $injector.get('$state');
      $scope.mode = 'edit';
      $scope.user = user;
      $scope.modal = {
        autoShow: true,
        hide: function() {},
        hiddenCallback: function() {
          return $state.go('salmon.settings-users', null, {
            reload: true
          });
        }
      };
      return $scope.submit = function() {
        return $validator.validate($scope, 'user').success(function() {
          NProgress.start();
          return $salmon.api.user.updateUser($scope.user).success(function() {
            return $scope.modal.hide();
          });
        });
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.directive', []).directive('salmonLang', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        return attrs.$observe('salmonLang', function(value) {
          if (value) {
            return $(element).text(_(value));
          } else {
            return $(element).text(_($(element).text()));
          }
        });
      }
    };
  }).directive('salmonFocus', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        return $(element).select();
      }
    };
  }).directive('salmonEnter', function() {
    return {

      /*
      Run the AngularJS expression when pressed `Enter`.
       */
      restrict: 'A',
      link: function(scope, element, attrs) {
        return element.bind('keydown keypress', function(e) {
          if (e.which !== 13) {
            return;
          }
          e.preventDefault();
          return scope.$apply(function() {
            return scope.$eval(attrs.salmonEnter, {
              $event: e
            });
          });
        });
      }
    };
  }).directive('salmonModal', function() {
    return {

      /*
      salmon-modal="scope.modal"
      scope.modal:
          autoShow: {bool} If this modal should pop as automatic, it should be yes.
          hide: -> {function} After link, it is a function for hidden the modal.
          hiddenCallback: ($event) -> {function} After the modal hidden, it will be eval.
       */
      restrict: 'A',
      scope: {
        modal: '=salmonModal'
      },
      link: function(scope, element) {
        scope.modal.hide = function() {
          return $(element).modal('hide');
        };
        if (scope.modal.hiddenCallback) {
          $(element).on('hidden.bs.modal', function(e) {
            return scope.$apply(function() {
              return scope.$eval(scope.modal.hiddenCallback, {
                $event: e
              });
            });
          });
        }
        $(element).on('shown.bs.modal', function() {
          var $firstController;
          $firstController = $(element).find('form .form-control:first');
          if ($firstController.length) {
            return $firstController.select();
          } else {
            return $(element).find('form [type=submit]').focus();
          }
        });
        if (scope.modal.autoShow) {
          return $(element).modal('show');
        }
      }
    };
  }).directive('salmonConfirm', [
    '$injector', function($injector) {

      /*
      salmon-confirm="$rootScope.$confirmModal"
       */
      var $timeout;
      $timeout = $injector.get('$timeout');
      return {
        restrict: 'A',
        scope: {
          modal: '=salmonConfirm'
        },
        replace: true,
        templateUrl: '/views/modal/confirm.html',
        link: function(scope, element) {
          var confirmed;
          confirmed = false;
          scope.$watch('modal.isShow', function(newValue, oldValue) {
            if (newValue === oldValue) {
              return;
            }
            if (newValue) {
              $(element).modal('show');
              return confirmed = false;
            }
          });
          scope.confirmed = function() {
            confirmed = true;
            return $timeout(function() {
              return $(element).modal('hide');
            });
          };
          $(element).on('shown.bs.modal', function() {
            return $(element).find('[type=submit]').focus();
          });
          return $(element).on('hidden.bs.modal', function() {
            return scope.$apply(function() {
              scope.modal.isShow = false;
              return scope.modal.callback(confirmed);
            });
          });
        }
      };
    }
  ]).directive('salmonPager', function() {
    return {
      restrict: 'A',
      scope: {
        pageList: '=salmonPager',
        urlTemplate: '@pagerUrlTemplate'
      },
      replace: true,
      template: "<ul ng-if=\"pageList.total > 0\" class=\"pagination pagination-sm\">\n    <li ng-class=\"{disabled: !links.previous.enable}\">\n        <a ng-href=\"{{ links.previous.url }}\">&laquo;</a>\n    </li>\n    <li ng-repeat='item in links.numbers'\n        ng-if='item.show'\n        ng-class='{active: item.isCurrent}'>\n        <a ng-href=\"{{ item.url }}\">{{ item.pageNumber }}</a>\n    </li>\n    <li ng-class=\"{disabled: !links.next.enable}\">\n        <a ng-href=\"{{ links.next.url }}\">&raquo;</a>\n    </li>\n</ul>",
      link: function(scope) {
        var index, _i, _ref, _ref1, _results;
        scope.links = {
          previous: {
            enable: scope.pageList.has_previous_page,
            url: scope.urlTemplate.replace('#{index}', scope.pageList.index - 1)
          },
          numbers: [],
          next: {
            enable: scope.pageList.has_next_page,
            url: scope.urlTemplate.replace('#{index}', scope.pageList.index + 1)
          }
        };
        _results = [];
        for (index = _i = _ref = scope.pageList.index - 3, _ref1 = scope.pageList.index + 3; _i <= _ref1; index = _i += 1) {
          _results.push(scope.links.numbers.push({
            show: index >= 0 && index <= scope.pageList.max_index,
            isCurrent: index === scope.pageList.index,
            pageNumber: index + 1,
            url: scope.urlTemplate.replace('#{index}', index)
          }));
        }
        return _results;
      }
    };
  });

}).call(this);

(function() {
  angular.module('salmon.initial', []).config(function() {
    return NProgress.configure({
      showSpinner: false
    });
  });

}).call(this);

(function() {
  window._ = function(key) {
    var result;
    result = window.languageResource[key];
    if (result != null) {
      return result;
    } else {
      return key;
    }
  };

}).call(this);

(function() {
  angular.module('salmon', ['salmon.initial', 'salmon.router', 'salmon.directive', 'salmon.validations']);

}).call(this);

(function() {
  angular.module('salmon.provider', []).provider('$salmon', function() {
    var $http, $injector, $rootScope, _ref;
    $injector = null;
    $http = null;
    $rootScope = null;
    this.setupProviders = function(injector) {
      $injector = injector;
      $http = $injector.get('$http');
      $rootScope = $injector.get('$rootScope');
      return $rootScope.$confirmModal = {};
    };
    this.user = (_ref = window.user) != null ? _ref : {};
    this.user.isLogin = this.user.id != null;
    this.url = window.url;
    this.alert = {
      saved: function(message) {
        if (message == null) {
          message = 'Saved successful.';
        }

        /*
        Pop the message to tell user the data hade been saved.
         */
        return $.av.pop({
          title: 'Success',
          message: message,
          expire: 3000
        });
      },
      confirm: function(message, callback) {
        $rootScope.$confirmModal.message = message;
        $rootScope.$confirmModal.callback = callback;
        return $rootScope.$confirmModal.isShow = true;
      }
    };
    this.http = (function(_this) {
      return function(args) {
        return $http(args).error(function() {
          $.av.pop({
            title: 'Server Error',
            message: 'Please try again or refresh this page.',
            template: 'error',
            expire: 3000
          });
          return NProgress.done();
        });
      };
    })(this);
    this.api = {
      settings: {
        getProfile: (function(_this) {
          return function() {
            return _this.http({
              method: 'get',
              url: '/settings/profile'
            });
          };
        })(this),
        updateProfile: (function(_this) {
          return function(profile) {

            /*
            @param profile:
                name: {string}
             */
            return _this.http({
              method: 'put',
              url: '/settings/profile',
              data: profile
            });
          };
        })(this)
      },
      project: {
        getProjects: (function(_this) {
          return function(index) {
            if (index == null) {
              index = 0;
            }
            return _this.http({
              method: 'get',
              url: '/settings/projects'
            });
          };
        })(this),
        addProject: (function(_this) {
          return function(project) {
            return _this.http({
              method: 'post',
              url: "/settings/projects",
              data: project
            });
          };
        })(this),
        removeProject: (function(_this) {
          return function(projectId) {
            return _this.http({
              method: 'delete',
              url: "/settings/projects/" + projectId
            });
          };
        })(this)
      },
      user: {
        getUsers: (function(_this) {
          return function(index) {
            if (index == null) {
              index = 0;
            }
            return _this.http({
              method: 'get',
              url: '/settings/users',
              params: {
                index: index
              }
            });
          };
        })(this),
        getUser: (function(_this) {
          return function(userId) {
            return _this.http({
              method: 'get',
              url: "/settings/users/" + userId
            });
          };
        })(this),
        inviteUser: (function(_this) {
          return function(email) {
            return _this.http({
              method: 'post',
              url: '/settings/users',
              data: {
                email: email
              }
            });
          };
        })(this),
        removeUser: (function(_this) {
          return function(userId) {
            return _this.http({
              method: 'delete',
              url: "/settings/users/" + userId
            });
          };
        })(this),
        updateUser: (function(_this) {
          return function(user) {
            return _this.http({
              method: 'put',
              url: "/settings/users/" + user.id,
              data: user
            });
          };
        })(this)
      }
    };
    this.$get = [
      '$injector', (function(_this) {
        return function($injector) {
          _this.setupProviders($injector);
          return {
            user: _this.user,
            url: _this.url,
            alert: _this.alert,
            api: _this.api
          };
        };
      })(this)
    ];
  });

}).call(this);

(function() {
  angular.module('salmon.router', ['salmon.provider', 'salmon.controllers', 'ui.router']).config([
    '$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $urlRouterProvider.otherwise('/');
      $stateProvider.state('salmon', {
        url: '',
        templateUrl: '/views/shared/layout.html'
      });
      $stateProvider.state('salmon.index', {
        url: '/',
        controller: 'IndexController'
      });
      $stateProvider.state('salmon.login', {
        url: '/login',
        resolve: {
          title: function() {
            return 'Login - ';
          }
        },
        templateUrl: '/views/login.html',
        controller: 'LoginController'
      });
      $stateProvider.state('salmon.settings', {
        url: '/settings',
        resolve: {
          title: function() {
            return 'Settings - ';
          }
        },
        controller: 'SettingsController'
      });
      $stateProvider.state('salmon.settings-profile', {
        url: '/settings/profile',
        resolve: {
          title: function() {
            return "" + (_('Profile')) + " - " + (_('Settings')) + " - ";
          },
          profile: [
            '$salmon', function($salmon) {
              return $salmon.api.settings.getProfile().then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/settings/profile.html',
        controller: 'SettingsProfileController'
      });
      $stateProvider.state('salmon.settings-projects', {
        url: '/settings/projects?index',
        resolve: {
          title: function() {
            return "" + (_('Projects')) + " - " + (_('Settings')) + " - ";
          },
          projects: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.project.getProjects($stateParams.index).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/settings/projects.html',
        controller: 'SettingsProjectsController'
      });
      $stateProvider.state('salmon.settings-projects.new', {
        url: '/new',
        resolve: {
          title: function() {
            return "" + (_('Projects')) + " - " + (_('Settings')) + " - ";
          }
        },
        templateUrl: '/views/modal/project.html',
        controller: 'SettingsNewProjectController'
      });
      $stateProvider.state('salmon.settings-users', {
        url: '/settings/users?index',
        resolve: {
          title: function() {
            return "" + (_('Users')) + " - " + (_('Settings')) + " - ";
          },
          users: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.user.getUsers($stateParams.index).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/settings/users.html',
        controller: 'SettingsUsersController'
      });
      $stateProvider.state('salmon.settings-users.new', {
        url: '/new',
        resolve: {
          title: function() {
            return "" + (_('Users')) + " - " + (_('Settings')) + " - ";
          }
        },
        templateUrl: '/views/modal/user.html',
        controller: 'SettingsNewUserController'
      });
      return $stateProvider.state('salmon.settings-users.detail', {
        url: '/:userId',
        resolve: {
          title: function() {
            return "" + (_('Users')) + " - " + (_('Settings')) + " - ";
          },
          user: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.user.getUser($stateParams.userId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/modal/user.html',
        controller: 'SettingsUserController'
      });
    }
  ]).run([
    '$injector', function($injector) {
      var $rootScope, $salmon, $state, $stateParams, changeStartEvent, fromStateName, toStateName;
      $rootScope = $injector.get('$rootScope');
      $stateParams = $injector.get('$stateParams');
      $state = $injector.get('$state');
      $salmon = $injector.get('$salmon');
      $rootScope.$stateParams = $stateParams;
      $rootScope.$state = $state;
      changeStartEvent = null;
      fromStateName = null;
      toStateName = null;
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
        changeStartEvent = window.event;
        fromStateName = fromState.name;
        toStateName = toState.name;
        return NProgress.start();
      });
      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        NProgress.done();
        if (!$salmon.user.isLogin && toState.name !== 'salmon.login') {
          return $state.go('salmon.login');
        }
      });
      $rootScope.$on('$stateChangeError', function(event, toState) {
        NProgress.done();
        if (!$salmon.user.isLogin && toState.name !== 'salmon.login') {
          return $state.go('salmon.login');
        }
      });
      return $rootScope.$on('$viewContentLoaded', function() {
        if ((changeStartEvent != null ? changeStartEvent.type : void 0) === 'popstate') {
          return;
        }
        if ((fromStateName != null) && (toStateName != null)) {
          if (fromStateName.replace(toStateName, '').indexOf('.') === 0) {
            return;
          }
          if (toStateName.replace(fromStateName, '').indexOf('.') === 0) {
            return;
          }
        }
        return window.scrollTo(0, 0);
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.validations', ['validator']).config([
    '$validatorProvider', function($validatorProvider) {
      $validatorProvider.register('required', {
        validator: /.+/,
        error: 'This field is required.'
      });
      return $validatorProvider.register('email', {
        validator: /(^$)|(^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/,
        error: 'This field should be the email.'
      });
    }
  ]);

}).call(this);
