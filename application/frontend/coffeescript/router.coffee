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
    # /projects/{projectId}/issues
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.issues',
        url: '/projects/:projectId/issues?index?status'
        resolve:
            title: -> "#{_ 'Issues'} - "
            project: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProject($stateParams.projectId).then (response) ->
                    response.data
            ]
            issues: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.issue.getIssues(
                    $stateParams.projectId
                    $stateParams.index
                    $stateParams.status
                ).then (response) ->
                    response.data
            ]
        templateUrl: '/views/issue/list.html'
        controller: 'IssuesController'
    # ---------------------------------------------------------
    # /projects/{projectId}/issues/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.issues-new',
        url: '/projects/:projectId/issues/new'
        resolve:
            title: -> "#{_ 'Issues'} - "
            project: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProject($stateParams.projectId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/issue/new.html'
        controller: 'NewIssueController'
    # ---------------------------------------------------------
    # /projects/{projectId}/issues/{issueId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.issues-detail',
        url: '/projects/:projectId/issues/:issueId'
        resolve:
            title: -> "#{_ 'Issues'} - "
            project: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProject($stateParams.projectId).then (response) ->
                    response.data
            ]
            issue: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                null
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
    $rootScope.$on '$stateChangeSuccess', (event, toState) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
    $rootScope.$on '$stateChangeError', (event, toState) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
    $rootScope.$on '$viewContentLoaded', ->
        return if changeStartEvent?.type is 'popstate'
        if fromStateName? and toStateName?
            return if fromStateName.replace(toStateName, '').indexOf('.') is 0
            return if toStateName.replace(fromStateName, '').indexOf('.') is 0
        window.scrollTo 0, 0
]
