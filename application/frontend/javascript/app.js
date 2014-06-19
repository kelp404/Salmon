(function() {
  angular.module('salmon.controllers.base', []).controller('BaseController', [
    '$scope', 'projects', function($scope, projects) {
      $scope.allProjects = projects;
      if ($scope.allProjects.items) {
        return $scope.allProjects.current = $scope.allProjects.items[0];
      }
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers', ['salmon.controllers.base', 'salmon.controllers.navigation', 'salmon.controllers.index', 'salmon.controllers.login', 'salmon.controllers.projects', 'salmon.controllers.issues', 'salmon.controllers.settings']);

}).call(this);

(function() {
  angular.module('salmon.controllers.index', []).controller('IndexController', [
    '$scope', '$injector', function($scope, $injector) {
      var $salmon, $state;
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      if (!$salmon.user.isLogin) {
        $state.go('salmon.login');
      }
      if ($scope.allProjects.items.length) {
        return $state.go('salmon.issues', {
          projectId: $scope.allProjects.items[0].id
        });
      }
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers.issues', []).controller('IssuesController', [
    '$scope', '$injector', 'project', function($scope, $injector, project) {
      return $scope.allProjects.current = project;
    }
  ]).controller('NewIssueController', [
    '$scope', '$injector', 'project', function($scope, $injector, project) {
      var $salmon, $state, $validator;
      $validator = $injector.get('$validator');
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $scope.allProjects.current = project;
      $scope.floorOptions = (function() {
        var index, _i, _ref, _ref1, _results;
        _results = [];
        for (index = _i = _ref = project.floor_lowest, _ref1 = project.floor_highest; _i <= _ref1; index = _i += 1) {
          if (index !== 0) {
            _results.push({
              label: index < 0 ? "B" + (index * -1) : "" + index,
              value: index
            });
          }
        }
        return _results;
      })();
      $scope.issue = {
        title: '',
        floor: $scope.floorOptions[0].value,
        room: project.room_options[0]
      };
      return $scope.submit = function($event) {
        $event.preventDefault();
        return $validator.validate($scope, 'issue').success(function() {
          NProgress.start();
          return $salmon.api.issue.addIssue(project.id, $scope.issue).success(function() {
            return $state.go('salmon.issues', {
              projectId: project.id,
              index: 0
            }, {
              reload: true
            });
          });
        });
      };
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
      return $scope.url = $salmon.url;
    }
  ]);

}).call(this);

(function() {
  angular.module('salmon.controllers.projects', []);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
      var $salmon, $state, $stateParams;
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $stateParams = $injector.get('$stateParams');
      $scope.user = $salmon.user;
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
        floor_lowest: 1,
        floor_highest: 12,
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
          return $salmon.api.project.addProject($scope.project).success(function() {
            return $scope.modal.hide();
          });
        });
      };
    }
  ]).controller('SettingsProjectController', [
    '$scope', '$injector', 'project', function($scope, $injector, project) {
      var $salmon, $state, $timeout, $validator, member, _i, _len, _ref, _ref1;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      $state = $injector.get('$state');
      $timeout = $injector.get('$timeout');
      $scope.mode = 'edit';
      $scope.project = project;
      _ref = project.members;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        member = _ref[_i];
        member.isRoot = (_ref1 = member.id, __indexOf.call(project.root_ids, _ref1) >= 0);
      }
      $scope.$watch('project.members', function() {
        var root_ids, _j, _len1, _ref2;
        root_ids = [];
        _ref2 = $scope.project.members;
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          member = _ref2[_j];
          if (member.isRoot) {
            root_ids.push(member.id);
          }
        }
        return $scope.project.root_ids = root_ids;
      }, true);
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
      $scope.submit = function() {
        return $validator.validate($scope, 'project').success(function() {
          NProgress.start();
          return $salmon.api.project.updateProject($scope.project).success(function() {
            return $scope.modal.hide();
          });
        });
      };
      return $scope.memberService = {
        email: '',
        invite: function($event) {
          $event.preventDefault();
          return $validator.validate($scope, 'memberService').success(function() {
            NProgress.start();
            return $salmon.api.project.addProjectMember($scope.project.id, $scope.memberService.email).success(function(member) {
              NProgress.done();
              $scope.project.member_ids.push(member.id);
              $scope.project.members.push(member);
              $scope.memberService.email = '';
              return $timeout(function() {
                return $validator.reset($scope, 'memberService');
              });
            });
          });
        },
        removeMember: function($event, memberId) {
          var index, _j, _k, _l, _ref2, _ref3, _ref4;
          $event.preventDefault();
          for (index = _j = 0, _ref2 = $scope.project.members.length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; index = 0 <= _ref2 ? ++_j : --_j) {
            if (!($scope.project.members[index].id === memberId)) {
              continue;
            }
            $scope.project.members.splice(index, 1);
            break;
          }
          for (index = _k = 0, _ref3 = $scope.project.member_ids.length; 0 <= _ref3 ? _k < _ref3 : _k > _ref3; index = 0 <= _ref3 ? ++_k : --_k) {
            if (!($scope.project.member_ids[index] === memberId)) {
              continue;
            }
            $scope.project.member_ids.splice(index, 1);
            break;
          }
          for (index = _l = 0, _ref4 = $scope.project.root_ids.length; 0 <= _ref4 ? _l < _ref4 : _l > _ref4; index = 0 <= _ref4 ? ++_l : --_l) {
            if (!($scope.project.root_ids[index] === memberId)) {
              continue;
            }
            $scope.project.root_ids.splice(index, 1);
            break;
          }
        }
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
      $scope.keyword = $stateParams.keyword;
      $scope.removeUser = function(user, $event) {
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
      return $scope.search = function() {
        return $state.go('salmon.settings-users', {
          index: 0,
          keyword: $scope.keyword
        }, {
          reload: true
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
  }).directive('salmonRedactor', function() {
    return {

      /*
      Redactor.
       */
      restrict: 'A',
      require: 'ngModel',
      scope: {
        ngModel: '=ngModel'
      },
      link: function(scope, element, attrs) {
        var options;
        options = scope.$eval(attrs.salmonRedactor);
        options.lang = (function() {
          var lang, result;
          lang = {
            'zh-tw': 'zh_tw'
          };
          result = lang[_('code')];
          if (result) {
            return result;
          } else {
            return _('code');
          }
        })();
        return $(element).redactor(options);
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
    this.user.isRoot = this.user.permission === 1;
    this.user.isAdvanced = this.user.permission === 3;
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
      issue: {
        addIssue: (function(_this) {
          return function(projectId, issue) {
            return _this.http({
              method: 'post',
              url: "/projects/" + projectId + "/issues",
              data: issue
            });
          };
        })(this)
      },
      project: {
        getProjects: (function(_this) {
          return function(index, all) {
            if (index == null) {
              index = 0;
            }
            if (all == null) {
              all = false;
            }
            return _this.http({
              method: 'get',
              url: '/settings/projects',
              params: {
                index: index,
                all: all
              }
            });
          };
        })(this),
        getProject: (function(_this) {
          return function(projectId) {
            return _this.http({
              method: 'get',
              url: "/settings/projects/" + projectId
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
        })(this),
        updateProject: (function(_this) {
          return function(project) {
            return _this.http({
              method: 'put',
              url: "/settings/projects/" + project.id,
              data: project
            });
          };
        })(this),
        addProjectMember: (function(_this) {
          return function(projectId, email) {
            return _this.http({
              method: 'post',
              url: "/settings/projects/" + projectId + "/members",
              data: {
                email: email
              }
            });
          };
        })(this)
      },
      user: {
        getUsers: (function(_this) {
          return function(index, keyword) {
            if (index == null) {
              index = 0;
            }
            return _this.http({
              method: 'get',
              url: '/settings/users',
              params: {
                index: index,
                keyword: keyword
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
        resolve: {
          projects: [
            '$salmon', function($salmon) {
              return $salmon.api.project.getProjects(0, true).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/shared/layout.html',
        controller: 'BaseController'
      });
      $stateProvider.state('salmon.index', {
        url: '/',
        templateUrl: '/views/index.html',
        controller: 'IndexController'
      });
      $stateProvider.state('salmon.login', {
        url: '/login',
        resolve: {
          title: function() {
            return "" + (_('Sign in')) + " - ";
          }
        },
        templateUrl: '/views/login.html',
        controller: 'LoginController'
      });
      $stateProvider.state('salmon.issues', {
        url: '/projects/:projectId/issues?index',
        resolve: {
          title: function() {
            return "" + (_('Issues')) + " - ";
          },
          project: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.project.getProject($stateParams.projectId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/issue/list.html',
        controller: 'IssuesController'
      });
      $stateProvider.state('salmon.issues-new', {
        url: '/projects/:projectId/issues/new',
        resolve: {
          title: function() {
            return "" + (_('Issues')) + " - ";
          },
          project: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.project.getProject($stateParams.projectId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/issue/new.html',
        controller: 'NewIssueController'
      });
      $stateProvider.state('salmon.settings', {
        url: '/settings',
        resolve: {
          title: function() {
            return "" + (_('Settings')) + " - ";
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
      $stateProvider.state('salmon.settings-projects.detail', {
        url: '/:projectId',
        resolve: {
          title: function() {
            return "" + (_('Projects')) + " - " + (_('Settings')) + " - ";
          },
          project: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.project.getProject($stateParams.projectId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/modal/project.html',
        controller: 'SettingsProjectController'
      });
      $stateProvider.state('salmon.settings-users', {
        url: '/settings/users?index?keyword',
        resolve: {
          title: function() {
            return "" + (_('Users')) + " - " + (_('Settings')) + " - ";
          },
          users: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.user.getUsers($stateParams.index, $stateParams.keyword).then(function(response) {
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
