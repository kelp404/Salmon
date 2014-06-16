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

.controller 'SettingsProjectsController', ['$scope', '$injector', 'projects', ($scope, $injector, projects) ->
    $salmon = $injector.get '$salmon'

    $scope.options =
        lowest: do ->
            for index in [-10..10] by 1 when index isnt 0
                value: index
                label: if index < 0 then "B#{index * -1}" else index
        highest: do ->
            for index in [1..50] by 1
                value: index
                label: "#{index}"
    $scope.projects = projects
    $scope.removeProject = (project, $event) ->
        $event.preventDefault()
        $salmon.alert.confirm "Do you want to delete the project #{project.title}?", (result) ->
            return if not result
            NProgress.start()
            $salmon.api.project.removeProject(project.id).success ->
                $state.go $state.current, $stateParams, reload: yes
]
.controller 'SettingsNewProjectController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'
    $validator = $injector.get '$validator'
    $state = $injector.get '$state'

    $scope.mode = 'new'
    $scope.project =
        lowest: 1
        highest: 12
        room_options: []
    $scope.modal =
        autoShow: yes
        hide: ->
        hiddenCallback: ->
            $state.go 'salmon.settings-projects', null, reload: yes
    $scope.submit = ->
        $validator.validate($scope, 'project').success ->
            NProgress.start()
            $salmon.api.project.addProject($scope.project).success ->
                $scope.modal.hide()
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
