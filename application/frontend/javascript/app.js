(function() {
  angular.module('salmon.controllers.base', []).controller('BaseController', [
    '$scope', '$injector', 'projects', function($scope, $injector, projects) {
      var $rootScope;
      $rootScope = $injector.get('$rootScope');
      $rootScope.$projects = projects;
      if ($scope.$projects.items) {
        return $scope.$projects.current = $scope.$projects.items[0];
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
      if ($scope.$projects.items.length) {
        return $state.go('salmon.project', {
          projectId: $scope.$projects.items[0].id
        });
      }
    }
  ]);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('salmon.controllers.issues', []).controller('IssuesController', [
    '$scope', '$injector', 'issues', function($scope, $injector, issues) {
      var $salmon, $timeout, $validator, countIssues, firstLabelId, issue, _i, _len, _ref;
      $validator = $injector.get('$validator');
      $salmon = $injector.get('$salmon');
      $timeout = $injector.get('$timeout');
      $scope.issues = issues;
      _ref = $scope.issues.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        issue = _ref[_i];
        issue.floorText = issue.floor < 0 ? "B" + (issue.floor * -1) : "" + issue.floor;
        issue.labels = (function() {
          var label, result, _j, _len1, _ref1, _ref2;
          result = [];
          _ref1 = $scope.$projects.current.labels;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            label = _ref1[_j];
            if (_ref2 = label.id, __indexOf.call(issue.label_ids, _ref2) >= 0) {
              result.push(label);
            }
          }
          return result;
        })();
      }
      countIssues = function() {
        var _ref1;
        if ($scope.$stateParams.keyword) {
          return $scope.$parent.count = null;
        } else {
          return $salmon.api.issue.countIssues($scope.$projects.current.id, {
            status: $scope.$stateParams.status,
            floor_lowest: $scope.$stateParams.floor_lowest,
            floor_highest: $scope.$stateParams.floor_highest,
            label_ids: (_ref1 = $scope.$stateParams.label_ids) != null ? _ref1.split(',') : void 0
          }).success(function(result) {
            return $scope.$parent.count = result;
          });
        }
      };
      countIssues();
      $scope.keyword = $scope.$stateParams.keyword;
      $scope.search = function($event, keyword) {
        $event.preventDefault();
        $scope.$stateParams.keyword = keyword;
        $scope.$stateParams.index = 0;
        return $scope.$state.go($scope.$state.current, $scope.$stateParams);
      };
      $scope.updateStatusFilter = function(status) {
        $scope.$stateParams.status = status;
        $scope.$stateParams.index = 0;
        return $scope.$state.go($scope.$state.current, $scope.$stateParams);
      };
      $scope.showDetail = function(projectId, issueId) {
        return $scope.$state.go('salmon.project.issue', {
          projectId: projectId,
          issueId: issueId
        });
      };
      $scope.floorOptions = {
        lowest: $scope.$stateParams.floor_lowest,
        highest: $scope.$stateParams.floor_highest,
        target: $scope.$stateParams.floor_lowest
      };
      $scope.$watch('floorOptions', function(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        if (newValue.target !== oldValue.target) {
          $scope.floorOptions.lowest = newValue.target;
          $scope.floorOptions.highest = newValue.target;
        }
        $scope.$stateParams.floor_lowest = $scope.floorOptions.lowest;
        $scope.$stateParams.floor_highest = $scope.floorOptions.highest;
        $scope.$stateParams.index = 0;
        return $scope.$state.go($scope.$state.current, $scope.$stateParams);
      }, true);
      $scope.multiService = {
        all: false,
        checked: [],
        closeIssues: function() {
          var index, _j, _ref1, _results;
          _results = [];
          for (index = _j = 0, _ref1 = $scope.issues.items.length; _j < _ref1; index = _j += 1) {
            if (!$scope.multiService.checked[index]) {
              continue;
            }
            issue = $scope.issues.items[index];
            issue.is_close = true;
            _results.push($salmon.api.issue.updateIssue($scope.$projects.current.id, issue));
          }
          return _results;
        },
        buttonEnabled: function() {
          var index, _j, _ref1;
          for (index = _j = 0, _ref1 = $scope.issues.items.length; _j < _ref1; index = _j += 1) {
            if ($scope.multiService.checked[index]) {
              return true;
            }
          }
          return false;
        }
      };
      $scope.$watch('multiService.all', function(value) {
        var index, _j, _k, _ref1, _ref2, _results, _results1;
        if (value) {
          _results = [];
          for (index = _j = 0, _ref1 = $scope.issues.items.length; _j < _ref1; index = _j += 1) {
            _results.push($scope.multiService.checked[index] = true);
          }
          return _results;
        } else {
          _results1 = [];
          for (index = _k = 0, _ref2 = $scope.issues.items.length; _k < _ref2; index = _k += 1) {
            _results1.push($scope.multiService.checked[index] = false);
          }
          return _results1;
        }
      });
      if ($scope.$stateParams.label_ids == null) {
        firstLabelId = '';
      } else if (typeof $scope.$stateParams.label_ids === 'string') {
        firstLabelId = $scope.$stateParams.label_ids * 1;
      } else {
        firstLabelId = $scope.$stateParams.label_ids[0];
      }
      $scope.labelService = {
        newLabel: '',
        manageMode: false,
        labels: [],
        label: firstLabelId,
        manageLabels: function() {
          var changedLabels, label, newLabels, x, _j, _k, _len1, _len2, _ref1, _ref2;
          if (this.manageMode) {
            changedLabels = {};
            _ref1 = this.labels;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              x = _ref1[_j];
              changedLabels["" + x.id] = x.title;
            }
            newLabels = [];
            _ref2 = $scope.$projects.current.labels;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              label = _ref2[_k];
              if (changedLabels["" + label.id] != null) {
                if (label.title !== changedLabels["" + label.id] && changedLabels["" + label.id]) {
                  label.title = changedLabels["" + label.id];
                  $salmon.api.label.updateLabel($scope.$projects.current.id, label);
                }
                newLabels.push(label);
              } else {
                $salmon.api.label.removeLabel($scope.$projects.current.id, label.id);
              }
            }
            $scope.$projects.current.labels = newLabels;
          } else {
            this.labels = angular.copy($scope.$projects.current.labels);
          }
          return this.manageMode = !this.manageMode;
        },
        isActive: function(labelId) {
          var _ref1;
          labelId = "" + labelId;
          if ($scope.$stateParams.label_ids == null) {
            return false;
          } else if (typeof $scope.$stateParams.label_ids === 'string') {
            return ((_ref1 = $scope.$stateParams.label_ids) != null ? _ref1.indexOf(labelId) : void 0) >= 0;
          } else {
            return __indexOf.call($scope.$stateParams.label_ids, labelId) >= 0;
          }
        },
        updateLabelFilter: function(labelId, $event) {

          /*
          If the label is exist it will be remove form the filter, else it will be added into the filter.
           */
          var exist, index, _base, _j, _ref1;
          $event.preventDefault();
          labelId = "" + labelId;
          if ((_base = $scope.$stateParams).label_ids == null) {
            _base.label_ids = [];
          }
          if (typeof $scope.$stateParams.label_ids === 'string') {
            $scope.$stateParams.label_ids = $scope.$stateParams.label_ids.split(',');
          }
          exist = false;
          for (index = _j = 0, _ref1 = $scope.$stateParams.label_ids.length; _j <= _ref1; index = _j += 1) {
            if ($scope.$stateParams.label_ids[index] === labelId) {
              $scope.$stateParams.label_ids.splice(index, 1);
              exist = true;
              break;
            }
          }
          if (!exist) {
            $scope.$stateParams.label_ids.push(labelId);
          }
          $scope.$stateParams.index = 0;
          return $scope.$state.go($scope.$state.current, $scope.$stateParams);
        },
        addLabel: function() {
          return $validator.validate($scope, 'labelService').success(function() {
            NProgress.start();
            return $salmon.api.label.addLabel($scope.$projects.current.id, {
              title: $scope.labelService.newLabel
            }).success(function() {
              return $salmon.api.label.getLabels($scope.$projects.current.id).success(function(result) {
                NProgress.done();
                countIssues();
                $scope.$projects.current.labels = result;
                $scope.labelService.newLabel = '';
                return $timeout(function() {
                  return $validator.reset($scope, 'labelService');
                });
              });
            });
          });
        }
      };
      return $scope.$watch('labelService.label', function(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        $scope.$stateParams.label_ids = [newValue];
        $scope.$stateParams.index = 0;
        return $scope.$state.go($scope.$state.current, $scope.$stateParams);
      });
    }
  ]).controller('EditIssueController', [
    '$scope', '$injector', 'issue', function($scope, $injector, issue) {
      var $salmon, $state, $validator;
      $validator = $injector.get('$validator');
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $scope.floorOptions = (function() {
        var index, _i, _ref, _ref1, _results;
        _results = [];
        for (index = _i = _ref = $scope.$projects.current.floor_lowest, _ref1 = $scope.$projects.current.floor_highest; _i <= _ref1; index = _i += 1) {
          if (index !== 0) {
            _results.push({
              label: index < 0 ? "B" + (index * -1) : "" + index,
              value: index
            });
          }
        }
        return _results;
      })();
      if (issue != null) {
        $scope.mode = 'edit';
        $scope.issue = issue;
      } else {
        $scope.mode = 'new';
        $scope.issue = {
          title: '',
          floor: $scope.floorOptions[0].value,
          label_ids: []
        };
      }
      $scope.isActiveLabel = function(labelId) {
        return __indexOf.call($scope.issue.label_ids, labelId) >= 0;
      };
      $scope.toggleLabel = function(labelId, $event) {
        var exist, index, _i, _ref;
        $event.preventDefault();
        exist = false;
        for (index = _i = 0, _ref = $scope.issue.label_ids.length; _i <= _ref; index = _i += 1) {
          if ($scope.issue.label_ids[index] === labelId) {
            $scope.issue.label_ids.splice(index, 1);
            exist = true;
            break;
          }
        }
        if (!exist) {
          return $scope.issue.label_ids.push(labelId);
        }
      };
      return $scope.submit = function($event) {
        $event.preventDefault();
        return $validator.validate($scope, 'issue').success(function() {
          NProgress.start();
          if ($scope.mode === 'new') {
            return $salmon.api.issue.addIssue($scope.$projects.current.id, $scope.issue).success(function() {
              return $state.go('salmon.project.issues', {
                projectId: $scope.$projects.current.id,
                index: 0
              });
            });
          } else {
            return $salmon.api.issue.updateIssue($scope.$projects.current.id, $scope.issue).success(function() {
              return $state.go('salmon.project.issue', {
                projectId: $scope.$projects.current.id,
                issueId: $scope.issue.id
              });
            });
          }
        });
      };
    }
  ]).controller('IssueController', [
    '$scope', '$injector', 'issue', function($scope, $injector, issue) {
      var $salmon, $state;
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $scope.issue = issue;
      $scope.issue.floorText = issue.floor < 0 ? "B" + (issue.floor * -1) : "" + issue.floor;
      $scope.issue.labels = (function() {
        var label, result, _i, _len, _ref, _ref1;
        result = [];
        _ref = $scope.$projects.current.labels;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          label = _ref[_i];
          if (_ref1 = label.id, __indexOf.call(issue.label_ids, _ref1) >= 0) {
            result.push(label);
          }
        }
        return result;
      })();
      $scope.comment = {
        newComment: '',
        submit: function() {
          if (!$scope.comment.newComment) {
            return;
          }
          NProgress.start();
          return $salmon.api.comment.addComment($scope.$projects.current.id, issue.id, {
            comment: $scope.comment.newComment
          }).success(function() {
            $scope.comment.newComment = '';
            return $salmon.api.comment.getComments($scope.$projects.current.id, issue.id).success(function(result) {
              NProgress.done();
              return $scope.issue.comments = result;
            });
          });
        }
      };
      $scope.closeIssue = function() {
        var issueClone;
        NProgress.start();
        issueClone = angular.copy($scope.issue);
        issueClone.is_close = true;
        return $salmon.api.issue.updateIssue($scope.$projects.current.id, issueClone).success(function() {
          NProgress.done();
          return $scope.issue.is_close = true;
        });
      };
      return $scope.reopenIssue = function() {
        var issueClone;
        NProgress.start();
        issueClone = angular.copy($scope.issue);
        issueClone.is_close = false;
        return $salmon.api.issue.updateIssue($scope.$projects.current.id, issueClone).success(function() {
          NProgress.done();
          return $scope.issue.is_close = false;
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
      return $scope.url = $salmon.url;
    }
  ]);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('salmon.controllers.projects', []).controller('ProjectController', [
    '$scope', 'project', function($scope, project) {
      var _ref;
      $scope.$projects.current = project;
      $scope.$projects.current.isRoot = (_ref = $scope.$user.id, __indexOf.call(project.root_ids, _ref) >= 0);
      $scope.$projects.current.floor_options = (function() {
        var index, _i, _ref1, _ref2, _results;
        _results = [];
        for (index = _i = _ref1 = project.floor_lowest, _ref2 = project.floor_highest; _i <= _ref2; index = _i += 1) {
          if (index !== 0) {
            _results.push({
              value: "" + index,
              label: index < 0 ? "B" + (index * -1) : index
            });
          }
        }
        return _results;
      })();
      if ($scope.$state.current.name === 'salmon.project') {
        return $scope.$state.go('salmon.project.issues');
      }
    }
  ]);

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
      var $salmon, $state, $stateParams, project, _i, _len, _ref, _ref1;
      $salmon = $injector.get('$salmon');
      $state = $injector.get('$state');
      $stateParams = $injector.get('$stateParams');
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
      _ref = $scope.projects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        project = _ref[_i];
        project.isRoot = (_ref1 = $scope.$user.id, __indexOf.call(project.root_ids, _ref1) >= 0);
      }
      return $scope.removeProject = function(project, $event) {
        $event.preventDefault();
        return $salmon.alert.confirm("" + (_('Do you want to delete the project ')) + project.title + "?", function(result) {
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
        isRoot: true
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
      var $salmon, $state, $timeout, $validator, member, _i, _len, _ref, _ref1, _ref2;
      $salmon = $injector.get('$salmon');
      $validator = $injector.get('$validator');
      $state = $injector.get('$state');
      $timeout = $injector.get('$timeout');
      $scope.mode = 'edit';
      $scope.project = project;
      $scope.project.isRoot = (_ref = $scope.$user.id, __indexOf.call(project.root_ids, _ref) >= 0);
      _ref1 = project.members;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        member = _ref1[_i];
        member.isRoot = (_ref2 = member.id, __indexOf.call(project.root_ids, _ref2) >= 0);
      }
      $scope.$watch('project.members', function() {
        var root_ids, _j, _len1, _ref3;
        root_ids = [];
        _ref3 = $scope.project.members;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          member = _ref3[_j];
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
          var index, _j, _k, _l, _ref3, _ref4, _ref5;
          $event.preventDefault();
          for (index = _j = 0, _ref3 = $scope.project.members.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; index = 0 <= _ref3 ? ++_j : --_j) {
            if (!($scope.project.members[index].id === memberId)) {
              continue;
            }
            $scope.project.members.splice(index, 1);
            break;
          }
          for (index = _k = 0, _ref4 = $scope.project.member_ids.length; 0 <= _ref4 ? _k < _ref4 : _k > _ref4; index = 0 <= _ref4 ? ++_k : --_k) {
            if (!($scope.project.member_ids[index] === memberId)) {
              continue;
            }
            $scope.project.member_ids.splice(index, 1);
            break;
          }
          for (index = _l = 0, _ref5 = $scope.project.root_ids.length; 0 <= _ref5 ? _l < _ref5 : _l > _ref5; index = 0 <= _ref5 ? ++_l : --_l) {
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
      $scope.keyword = $stateParams.keyword;
      $scope.removeUser = function(user, $event) {
        $event.preventDefault();
        return $salmon.alert.confirm("" + (_('Do you want to delete the user ')) + user.name + "<" + user.email + ">?", function(result) {
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
        return $validator.validate($scope, 'new').success(function() {
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
        return $validator.validate($scope, 'edit').success(function() {
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
        var disableWatch, options;
        disableWatch = false;
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
        options.changeCallback = function(html) {
          if (scope.$root.$$phase) {
            return;
          }
          disableWatch = true;
          return scope.$apply(function() {
            return scope.ngModel = html;
          });
        };
        options.buttons = ['html', 'formatting', 'bold', 'italic', 'deleted', 'unorderedlist', 'orderedlist', 'outdent', 'indent', 'image', 'file', 'link', 'alignment', 'horizontalrule'];
        $(element).redactor(options);
        $(element).next('textarea').on('input propertychange', function() {
          if (scope.$root.$$phase) {
            return;
          }
          disableWatch = true;
          return scope.$apply(function() {
            return scope.ngModel = $(element).next('textarea').val();
          });
        });
        return scope.$watch('ngModel', function(value) {
          if (value == null) {
            return;
          }
          if (disableWatch) {
            disableWatch = false;
            return;
          }
          return $(element).redactor('set', value);
        });
      }
    };
  }).directive('salmonIssueContent', function() {
    return {
      restrict: 'A',
      scope: {
        html: '=salmonIssueContent'
      },
      link: function(scope, element) {
        $(element).html(scope.html);
        return $(element).find('img').addClass('img-responsive');
      }
    };
  }).directive('salmonMailTo', function() {
    return {
      restrict: 'A',
      scope: {
        email: '=salmonMailTo'
      },
      link: function(scope, element) {
        $(element).attr('target', '_blank');
        return scope.$watch('email', function(value) {
          return $(element).attr('href', "https://mail.google.com/mail/?view=cm&fs=1&to=" + value);
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
  }).directive('salmonNavCollapseButton', [
    '$injector', function($injector) {
      var $salmon;
      $salmon = $injector.get('$salmon');
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          return scope.$on($salmon.broadcastChannel.hideNavBar, function() {
            if ($(attrs.target).hasClass('in')) {
              return $(element).click();
            }
          });
        }
      };
    }
  ]).directive('salmonConfirm', [
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
  ]).directive('salmonPager', [
    '$injector', function($injector) {
      var $timeout;
      $timeout = $injector.get('$timeout');
      return {
        restrict: 'A',
        scope: {
          pageList: '=salmonPager',
          urlTemplate: '@pagerUrlTemplate'
        },
        replace: true,
        template: "<ul ng-if=\"pageList.total > 0\" class=\"pagination pagination-sm\">\n    <li ng-class=\"{disabled: !links.previous.enable}\">\n        <a ng-href=\"{{ links.previous.url }}\">&laquo;</a>\n    </li>\n    <li ng-repeat='item in links.numbers'\n        ng-if='item.show'\n        ng-class='{active: item.isCurrent}'>\n        <a ng-href=\"{{ item.url }}\">{{ item.pageNumber }}</a>\n    </li>\n    <li ng-class=\"{disabled: !links.next.enable}\">\n        <a ng-href=\"{{ links.next.url }}\">&raquo;</a>\n    </li>\n</ul>",
        link: function(scope) {
          scope.queryString = location.search.replace(/index=\d/, '');
          scope.queryString = scope.queryString.replace('?', '');
          scope.$watch('queryString', function() {
            var index, _i, _ref, _ref1, _results;
            scope.links = {
              previous: {
                enable: scope.pageList.has_previous_page,
                url: "" + (scope.urlTemplate.replace('#{index}', scope.pageList.index - 1)) + scope.queryString
              },
              numbers: [],
              next: {
                enable: scope.pageList.has_next_page,
                url: "" + (scope.urlTemplate.replace('#{index}', scope.pageList.index + 1)) + scope.queryString
              }
            };
            _results = [];
            for (index = _i = _ref = scope.pageList.index - 3, _ref1 = scope.pageList.index + 3; _i <= _ref1; index = _i += 1) {
              _results.push(scope.links.numbers.push({
                show: index >= 0 && index <= scope.pageList.max_index,
                isCurrent: index === scope.pageList.index,
                pageNumber: index + 1,
                url: "" + (scope.urlTemplate.replace('#{index}', index)) + scope.queryString
              }));
            }
            return _results;
          });
          return $timeout(function() {
            scope.queryString = location.search.replace(/index=\d/, '');
            return scope.queryString = scope.queryString.replace('?', '');
          });
        }
      };
    }
  ]);

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
    var result, _ref;
    result = (_ref = window.languageResource) != null ? _ref[key] : void 0;
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
    this.setupProviders = (function(_this) {
      return function(injector) {
        $injector = injector;
        $http = $injector.get('$http');
        $rootScope = $injector.get('$rootScope');
        $rootScope.$confirmModal = {};
        $rootScope.$user = _this.user;
        return $rootScope.$loadings = {
          hasAny: function() {
            var key;
            for (key in this) {
              if (key !== 'hasAny') {
                return true;
              }
            }
            return false;
          }
        };
      };
    })(this);
    this.user = (_ref = window.user) != null ? _ref : {};
    this.user.isLogin = this.user.id != null;
    this.user.isRoot = this.user.permission === 1;
    this.user.isAdvanced = this.user.permission === 3;
    this.url = window.url;
    this.broadcastChannel = {
      hideNavBar: '$hideNavBar'
    };
    this.alert = {
      saved: function(message) {
        if (message == null) {
          message = _('Saved successful.');
        }

        /*
        Pop the message to tell user the data hade been saved.
         */
        return $.av.pop({
          title: _('Success'),
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
    this.httpId = 0;
    this.http = (function(_this) {
      return function(args) {
        var httpId;
        httpId = _this.httpId++;
        $rootScope.$loadings[httpId] = {
          method: args.method,
          url: args.url
        };
        return $http(args).success(function() {
          return delete $rootScope.$loadings[httpId];
        }).error(function(data, status, headers, config) {
          var document, _ref1;
          delete $rootScope.$loadings[httpId];
          NProgress.done();
          $.av.pop({
            title: 'Server Error',
            message: 'Please try again or refresh this page.',
            template: 'error',
            expire: 3000
          });
          if ((_ref1 = config.data) != null) {
            delete _ref1.password;
          }
          document = {
            'Request Headers': config.headers,
            'Request Params': config.params,
            'Response Status': status
          };
          return victorique.send({
            title: "" + config.method + " " + location.origin + config.url + " failed",
            user: "" + _this.user.name + " <" + _this.user.email + ">",
            document: document
          });
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
      label: {
        getLabels: (function(_this) {
          return function(projectId) {
            return _this.http({
              method: 'get',
              url: "/projects/" + projectId + "/labels"
            });
          };
        })(this),
        addLabel: (function(_this) {
          return function(projectId, label) {
            return _this.http({
              method: 'post',
              url: "/projects/" + projectId + "/labels",
              data: label
            });
          };
        })(this),
        removeLabel: (function(_this) {
          return function(projectId, labelId) {
            return _this.http({
              method: 'delete',
              url: "/projects/" + projectId + "/labels/" + labelId
            });
          };
        })(this),
        updateLabel: (function(_this) {
          return function(projectId, label) {
            return _this.http({
              method: 'put',
              url: "/projects/" + projectId + "/labels/" + label.id,
              data: label
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
        })(this),
        getIssues: (function(_this) {
          return function(projectId, index, query) {
            if (index == null) {
              index = 0;
            }
            if (query == null) {
              query = {};
            }
            if (query.status == null) {
              query.status = 'all';
            }
            return _this.http({
              method: 'get',
              url: "/projects/" + projectId + "/issues",
              params: {
                index: index,
                keyword: query.keyword,
                status: query.status,
                floor_lowest: query.floor_lowest,
                floor_highest: query.floor_highest,
                label_ids: query.label_ids
              }
            });
          };
        })(this),
        countIssues: function(projectId, query) {
          if (query == null) {
            query = {};
          }
          if (query.status == null) {
            query.status = 'all';
          }
          return $http({
            method: 'get',
            url: "/projects/" + projectId + "/issues/count",
            params: {
              status: query.status,
              floor_lowest: query.floor_lowest,
              floor_highest: query.floor_highest,
              label_ids: query.label_ids
            }
          });
        },
        getIssue: (function(_this) {
          return function(projectId, issueId) {
            return _this.http({
              method: 'get',
              url: "/projects/" + projectId + "/issues/" + issueId
            });
          };
        })(this),
        updateIssue: (function(_this) {
          return function(projectId, issue) {
            return _this.http({
              method: 'put',
              url: "/projects/" + projectId + "/issues/" + issue.id,
              data: issue
            });
          };
        })(this)
      },
      comment: {
        getComments: (function(_this) {
          return function(projectId, issueId) {
            return _this.http({
              method: 'get',
              url: "/projects/" + projectId + "/issues/" + issueId + "/comments"
            });
          };
        })(this),
        addComment: (function(_this) {
          return function(projectId, issueId, comment) {
            return _this.http({
              method: 'post',
              url: "/projects/" + projectId + "/issues/" + issueId + "/comments",
              data: comment
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
            broadcastChannel: _this.broadcastChannel,
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
              if (!$salmon.user.isLogin) {
                return {
                  items: []
                };
              }
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
      $stateProvider.state('salmon.project', {
        url: '/projects/:projectId',
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
        templateUrl: '/views/project/detail.html',
        controller: 'ProjectController'
      });
      $stateProvider.state('salmon.project.issues', {
        url: '/issues?index?keyword?status?floor_lowest?floor_highest?label_ids',
        resolve: {
          title: function() {
            return "" + (_('Issues')) + " - ";
          },
          issues: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              var _ref;
              return $salmon.api.issue.getIssues($stateParams.projectId, $stateParams.index, {
                keyword: $stateParams.keyword,
                status: $stateParams.status,
                floor_lowest: $stateParams.floor_lowest,
                floor_highest: $stateParams.floor_highest,
                label_ids: (_ref = $stateParams.label_ids) != null ? _ref.split(',') : void 0
              }).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/issue/list.html',
        controller: 'IssuesController'
      });
      $stateProvider.state('salmon.project.issues-new', {
        url: '/issues/new',
        resolve: {
          title: function() {
            return "" + (_('Issue')) + " - ";
          },
          issue: function() {
            return null;
          }
        },
        templateUrl: '/views/issue/edit.html',
        controller: 'EditIssueController'
      });
      $stateProvider.state('salmon.project.issues-edit', {
        url: '/issues/:issueId/edit',
        resolve: {
          title: function() {
            return "" + (_('Issue')) + " - ";
          },
          issue: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.issue.getIssue($stateParams.projectId, $stateParams.issueId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/issue/edit.html',
        controller: 'EditIssueController'
      });
      $stateProvider.state('salmon.project.issue', {
        url: '/issues/:issueId',
        resolve: {
          title: function() {
            return "" + (_('Issue')) + " - ";
          },
          issue: [
            '$salmon', '$stateParams', function($salmon, $stateParams) {
              return $salmon.api.issue.getIssue($stateParams.projectId, $stateParams.issueId).then(function(response) {
                return response.data;
              });
            }
          ]
        },
        templateUrl: '/views/issue/detail.html',
        controller: 'IssueController'
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
        NProgress.start();
        return $rootScope.$broadcast($salmon.broadcastChannel.hideNavBar);
      });
      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        NProgress.done();
        if (!$salmon.user.isLogin && toState.name !== 'salmon.login') {
          return $state.go('salmon.login');
        }
      });
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
        var document;
        NProgress.done();
        if (!$salmon.user.isLogin && toState.name !== 'salmon.login') {
          $state.go('salmon.login');
        }
        delete toState.resolve;
        delete fromState.resolve;
        document = {
          'toState': toState,
          'toParams': toParams,
          'fromState': fromState,
          'fromParams': fromParams
        };
        return victorique.send({
          title: "state change error to " + toState.url,
          user: "" + $salmon.user.name + " <" + $salmon.user.email + ">",
          document: document
        });
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
        error: _('This field is required.')
      });
      return $validatorProvider.register('email', {
        validator: /(^$)|(^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/,
        error: _('This field should be the email.')
      });
    }
  ]);

}).call(this);

(function() {
  window.victorique = {
    send: function(args) {
      if (args == null) {
        args = {};
      }
      return $.ajax({
        method: 'get',
        dataType: 'jsonp',
        url: 'https://victorique-demo.appspot.com/api/applications/24c1ce30-f9f5-11e3-99ab-4bfec4a2f6a3/logs',
        data: {
          title: args.title,
          user: args.user,
          document: JSON.stringify(args.document)
        }
      });
    }
  };

}).call(this);
