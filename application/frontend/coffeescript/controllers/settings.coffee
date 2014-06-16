angular.module 'salmon.controllers.settings', []

.controller 'SettingsController', ['$scope', '$injector', ($scope, $injector) ->
    $state = $injector.get '$state'
    $state.go 'salmon.settings-projects'
]

.controller 'SettingsProfileController', ['$scope', '$injector', 'profile', ($scope, $injector, profile) ->
    $salmon = $injector.get '$salmon'
    $validator = $injector.get '$validator'

    $scope.profile =
        model: profile
        submit: ($event) ->
            $event.preventDefault()
            $validator.validate($scope, 'profile.model').success ->
                NProgress.start()
                $salmon.api.settings.updateProfile
                    name: $scope.profile.model.name
                .success ->
                    NProgress.done()
                    $salmon.alert.saved()
]

.controller 'SettingsUsersController', ['$scope', '$injector', 'users', ($scope, $injector, users) ->
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'
    $stateParams = $injector.get '$stateParams'
    $validator = $injector.get '$validator'

    $scope.users = users
    $scope.currentUser = $salmon.user
    $scope.isRoot = $salmon.user.permission is 1
    $scope.removeUser = (user, $event) ->
        $event.preventDefault()
        $salmon.alert.confirm "Do you want to delete the user #{user.name}<#{user.email}>?", (result) ->
            return if not result
            NProgress.start()
            $salmon.api.user.removeUser(user.id).success ->
                $state.go $state.current, $stateParams, reload: yes
]
.controller 'SettingsNewUserController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'
    $validator = $injector.get '$validator'
    $state = $injector.get '$state'

    $scope.mode = 'new'
    $scope.user =
        email: ''
    $scope.modal =
        autoShow: yes
        hide: ->
        hiddenCallback: ->
            $state.go 'salmon.settings-users', null, reload: yes
    $scope.submit = ->
        $validator.validate($scope, 'user').success ->
            NProgress.start()
            $salmon.api.user.inviteUser($scope.user.email).success ->
                $scope.modal.hide()
]
.controller 'SettingsUserController', ['$scope', '$injector', 'user', ($scope, $injector, user) ->
    $salmon = $injector.get '$salmon'
    $validator = $injector.get '$validator'
    $state = $injector.get '$state'

    $scope.mode = 'edit'
    $scope.user = user
    $scope.modal =
        autoShow: yes
        hide: ->
        hiddenCallback: ->
            $state.go 'salmon.settings-users', null, reload: yes
    $scope.submit = ->
        $validator.validate($scope, 'user').success ->
            NProgress.start()
            $salmon.api.user.updateUser($scope.user).success ->
                $scope.modal.hide()
]
