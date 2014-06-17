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
    $state = $injector.get '$state'
    $stateParams = $injector.get '$stateParams'

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
    $timeout = $injector.get '$timeout'

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
    $scope.room =
        roomTitle: ''
        addRoomOption: ->
            $validator.validate($scope, 'room').success ->
                $scope.project.room_options.push $scope.room.roomTitle
                $scope.room.roomTitle = ''
                $timeout -> $validator.reset($scope, 'room')
    $scope.submit = ->
        $validator.validate($scope, 'project').success ->
            NProgress.start()
            $scope.project.floor_options = do ->
                result = []
                for index in [$scope.project.lowest..$scope.project.highest] by 1 when index isnt 0
                    if index < 0
                        result.push "B#{index * -1}"
                    else
                        result.push "#{index}"
                result
            $salmon.api.project.addProject($scope.project).success ->
                $scope.modal.hide()
]
.controller 'SettingsProjectController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $salmon = $injector.get '$salmon'
    $validator = $injector.get '$validator'
    $state = $injector.get '$state'
    $timeout = $injector.get '$timeout'

    $scope.mode = 'edit'
    $scope.project = project
    for member in project.members
        member.isRoot = member.id in project.root_ids
    $scope.$watch 'project.members', ->
        root_ids = []
        for member in $scope.project.members when member.isRoot
            root_ids.push member.id
        $scope.project.root_ids = root_ids
    , yes
    $scope.modal =
        autoShow: yes
        hide: ->
        hiddenCallback: ->
            $state.go 'salmon.settings-projects', null, reload: yes
    $scope.submit = ->
        $validator.validate($scope, 'project').success ->
            NProgress.start()
            $salmon.api.project.updateProject($scope.project).success ->
                $scope.modal.hide()
    $scope.memberService =
        email: ''
        invite: ($event) ->
            $event.preventDefault()
            $validator.validate($scope, 'memberService').success ->
                NProgress.start()
                $salmon.api.project.addProjectMember($scope.project.id, $scope.memberService.email).success (member) ->
                    NProgress.done()
                    $scope.project.member_ids.push member.id
                    $scope.project.members.push member
                    $scope.memberService.email = ''
                    $timeout -> $validator.reset $scope, 'memberService'
        removeMember: ($event, memberId) ->
            $event.preventDefault()
            for index in [0...$scope.project.members.length] when $scope.project.members[index].id is memberId
                $scope.project.members.splice index, 1
                break
            for index in [0...$scope.project.member_ids.length] when $scope.project.member_ids[index] is memberId
                $scope.project.member_ids.splice index, 1
                break
            for index in [0...$scope.project.root_ids.length] when $scope.project.root_ids[index] is memberId
                $scope.project.root_ids.splice index, 1
                break
            return
]

.controller 'SettingsUsersController', ['$scope', '$injector', 'users', ($scope, $injector, users) ->
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'
    $stateParams = $injector.get '$stateParams'
    $validator = $injector.get '$validator'

    $scope.users = users
    $scope.currentUser = $salmon.user
    $scope.keyword = $stateParams.keyword
    $scope.removeUser = (user, $event) ->
        $event.preventDefault()
        $salmon.alert.confirm "Do you want to delete the user #{user.name}<#{user.email}>?", (result) ->
            return if not result
            NProgress.start()
            $salmon.api.user.removeUser(user.id).success ->
                $state.go $state.current, $stateParams, reload: yes
    $scope.search = ->
        $state.go 'salmon.settings-users',
            index: 0
            keyword: $scope.keyword
        , reload: yes
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
