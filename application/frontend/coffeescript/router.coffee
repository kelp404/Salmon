angular.module 'salmon.router', [
    'salmon.provider'
    'salmon.controllers'
    'ui.router'
]

.config ['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) ->

    # html5 mode
    $locationProvider.html5Mode yes

    # redirect other urls
    $urlRouterProvider.otherwise '/'

    # ---------------------------------------------------------
    #
    # ---------------------------------------------------------
    $stateProvider.state 'salmon',
        url: ''
        resolve:
            projects: ['$salmon', ($salmon) ->
                if not $salmon.user.isLogin
                    return items: []
                $salmon.api.project.getProjects(0, yes).then (response) ->
                    response.data
            ]
        templateUrl: '/views/shared/layout.html'
        controller: 'BaseController'

    # ---------------------------------------------------------
    # /
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.index',
        url: '/'
        templateUrl: '/views/index.html'
        controller: 'IndexController'

    # ---------------------------------------------------------
    # /login
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.login',
        url: '/login'
        resolve:
            title: -> "#{_ 'Sign in'} - "
        templateUrl: '/views/login.html'
        controller: 'LoginController'

    # ---------------------------------------------------------
    # /projects/{projectId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.project',
        url: '/projects/:projectId'
        resolve:
            title: -> "#{_ 'Issues'} - "
            project: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProject($stateParams.projectId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/project/detail.html'
        controller: 'ProjectController'


    # ---------------------------------------------------------
    # /projects/{projectId}/issues
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.project.issues',
        url: '/issues?index?keyword?status?floor_lowest?floor_highest?label_ids'
        resolve:
            title: -> "#{_ 'Issues'} - "
            issues: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.issue.getIssues $stateParams.projectId, $stateParams.index,
                    keyword: $stateParams.keyword
                    status: $stateParams.status
                    floor_lowest: $stateParams.floor_lowest
                    floor_highest: $stateParams.floor_highest
                    label_ids: $stateParams.label_ids?.split(',')
                .then (response) ->
                    response.data
            ]
        templateUrl: '/views/issue/list.html'
        controller: 'IssuesController'
    # ---------------------------------------------------------
    # /projects/{projectId}/issues/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.project.issues-new',
        url: '/issues/new'
        resolve:
            title: -> "#{_ 'Issue'} - "
            issue: -> null
        templateUrl: '/views/issue/edit.html'
        controller: 'EditIssueController'
    # ---------------------------------------------------------
    # /projects/{projectId}/issues/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.project.issues-edit',
        url: '/issues/:issueId/edit'
        resolve:
            title: -> "#{_ 'Issue'} - "
            issue: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.issue.getIssue($stateParams.projectId, $stateParams.issueId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/issue/edit.html'
        controller: 'EditIssueController'
    # ---------------------------------------------------------
    # /projects/{projectId}/issues/{issueId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.project.issue',
        url: '/issues/:issueId'
        resolve:
            title: -> "#{_ 'Issue'} - "
            issue: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.issue.getIssue($stateParams.projectId, $stateParams.issueId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/issue/detail.html'
        controller: 'IssueController'

    # ---------------------------------------------------------
    # /settings
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings',
        url: '/settings'
        resolve:
            title: -> "#{_ 'Settings'} - "
        controller: 'SettingsController'

    # ---------------------------------------------------------
    # /settings/profile
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-profile',
        url: '/settings/profile'
        resolve:
            title: -> "#{_ 'Profile'} - #{_ 'Settings'} - "
            profile: ['$salmon', ($salmon) ->
                $salmon.api.settings.getProfile().then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/profile.html'
        controller: 'SettingsProfileController'

    # ---------------------------------------------------------
    # /settings/projects
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-projects',
        url: '/settings/projects?index'
        resolve:
            title: -> "#{_ 'Projects'} - #{_ 'Settings'} - "
            projects: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProjects($stateParams.index).then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/projects.html'
        controller: 'SettingsProjectsController'
    # ---------------------------------------------------------
    # /settings/projects/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-projects.new',
        url: '/new'
        resolve:
            title: -> "#{_ 'Projects'} - #{_ 'Settings'} - "
        templateUrl: '/views/modal/project.html'
        controller: 'SettingsNewProjectController'
    # ---------------------------------------------------------
    # /settings/projects/{projectId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-projects.detail',
        url: '/:projectId'
        resolve:
            title: -> "#{_ 'Projects'} - #{_ 'Settings'} - "
            project: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProject($stateParams.projectId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/modal/project.html'
        controller: 'SettingsProjectController'

    # ---------------------------------------------------------
    # /settings/users
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users',
        url: '/settings/users?index?keyword'
        resolve:
            title: -> "#{_ 'Users'} - #{_ 'Settings'} - "
            users: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.user.getUsers($stateParams.index, $stateParams.keyword).then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/users.html'
        controller: 'SettingsUsersController'
    # ---------------------------------------------------------
    # /settings/users/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users.new',
        url: '/new'
        resolve:
            title: -> "#{_ 'Users'} - #{_ 'Settings'} - "
        templateUrl: '/views/modal/user.html'
        controller: 'SettingsNewUserController'
    # ---------------------------------------------------------
    # /settings/users/{userId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users.detail',
        url: '/:userId'
        resolve:
            title: -> "#{_ 'Users'} - #{_ 'Settings'} - "
            user: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.user.getUser($stateParams.userId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/modal/user.html'
        controller: 'SettingsUserController'
]

.run ['$injector', ($injector) ->
    $rootScope = $injector.get '$rootScope'
    $stateParams = $injector.get '$stateParams'
    $state = $injector.get '$state'
    $salmon = $injector.get '$salmon'

    $rootScope.$stateParams = $stateParams
    $rootScope.$state = $state

    # ui.router state change event
    changeStartEvent = null
    fromStateName = null
    toStateName = null
    $rootScope.$on '$stateChangeStart', (event, toState, toParams, fromState) ->
        changeStartEvent = window.event
        fromStateName = fromState.name
        toStateName = toState.name
        NProgress.start()
        $rootScope.$broadcast $salmon.broadcastChannel.hideNavBar
    $rootScope.$on '$stateChangeSuccess', (event, toState) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
    $rootScope.$on '$stateChangeError', (event, toState, toParams, fromState, fromParams) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
        # send error log
        delete toState.resolve
        delete fromState.resolve
        document =
            'toState': toState
            'toParams': toParams
            'fromState': fromState
            'fromParams': fromParams
        victorique.send
            title: "state change error to #{toState.url}"
            user: "#{$salmon.user.name} <#{$salmon.user.email}>"
            document: document
    $rootScope.$on '$viewContentLoaded', ->
        return if changeStartEvent?.type is 'popstate'
        if fromStateName? and toStateName?
            return if fromStateName.replace(toStateName, '').indexOf('.') is 0
            return if toStateName.replace(fromStateName, '').indexOf('.') is 0
        window.scrollTo 0, 0
]
