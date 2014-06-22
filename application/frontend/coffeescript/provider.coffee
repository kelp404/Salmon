angular.module 'salmon.provider', []

.provider '$salmon', ->
    $injector = null
    $http = null
    $rootScope = null

    # -----------------------------------------------------
    # private methods
    # -----------------------------------------------------
    @setupProviders = (injector) =>
        $injector = injector
        $http = $injector.get '$http'
        $rootScope = $injector.get '$rootScope'
        $rootScope.$confirmModal = {}
        $rootScope.$user = @user


    # -----------------------------------------------------
    # public methods
    # -----------------------------------------------------
    @user = window.user ? {}
    @user.isLogin = @user.id?
    @user.isRoot = @user.permission is 1
    @user.isAdvanced = @user.permission is 3
    @url = window.url

    @alert =
        saved: (message='Saved successful.') ->
            ###
            Pop the message to tell user the data hade been saved.
            ###
            $.av.pop
                title: 'Success'
                message: message
                expire: 3000
        confirm: (message, callback) ->
            $rootScope.$confirmModal.message = message
            $rootScope.$confirmModal.callback = callback
            $rootScope.$confirmModal.isShow = yes

    @http = (args) =>
        $http args
        .error ->
            $.av.pop
                title: 'Server Error'
                message: 'Please try again or refresh this page.'
                template: 'error'
                expire: 3000
            NProgress.done()

    @api =
        settings:
            getProfile: =>
                @http
                    method: 'get'
                    url: '/settings/profile'
            updateProfile: (profile) =>
                ###
                @param profile:
                    name: {string}
                ###
                @http
                    method: 'put'
                    url: '/settings/profile'
                    data: profile
        label:
            getLabels: (projectId) =>
                @http
                    method: 'get'
                    url: "/projects/#{projectId}/labels"
            addLabel: (projectId, label) =>
                @http
                    method: 'post'
                    url: "/projects/#{projectId}/labels"
                    data: label
            removeLabel: (projectId, labelId) =>
                @http
                    method: 'delete'
                    url: "/projects/#{projectId}/labels/#{labelId}"
            updateLabel: (projectId, label) =>
                @http
                    method: 'put'
                    url: "/projects/#{projectId}/labels/#{label.id}"
                    data: label
        issue:
            addIssue: (projectId, issue) =>
                @http
                    method: 'post'
                    url: "/projects/#{projectId}/issues"
                    data: issue
            getIssues: (projectId, index=0, query) =>
                query ?= {}
                query.status ?= 'all'
                @http
                    method: 'get'
                    url: "/projects/#{projectId}/issues"
                    params:
                        index: index
                        keyword: query.keyword
                        status: query.status
                        floor_lowest: query.floor_lowest
                        floor_highest: query.floor_highest
                        label_ids: query.label_ids
            countIssues: (projectId, query) ->
                query ?= {}
                query.status ?= 'all'
                $http
                    method: 'get'
                    url: "/projects/#{projectId}/issues/count"
                    params:
                        status: query.status
                        floor_lowest: query.floor_lowest
                        floor_highest: query.floor_highest
                        label_ids: query.label_ids
            getIssue: (projectId, issueId) =>
                @http
                    method: 'get'
                    url: "/projects/#{projectId}/issues/#{issueId}"
            updateIssue: (projectId, issue) =>
                @http
                    method: 'put'
                    url: "/projects/#{projectId}/issues/#{issue.id}"
                    data: issue
        comment:
            getComments: (projectId, issueId) =>
                @http
                    method: 'get'
                    url: "/projects/#{projectId}/issues/#{issueId}/comments"
            addComment: (projectId, issueId, comment) =>
                @http
                    method: 'post'
                    url: "/projects/#{projectId}/issues/#{issueId}/comments"
                    data: comment
        project:
            getProjects: (index=0, all=no) =>
                @http
                    method: 'get'
                    url: '/settings/projects'
                    params:
                        index: index
                        all: all
            getProject: (projectId) =>
                @http
                    method: 'get'
                    url: "/settings/projects/#{projectId}"
            addProject: (project) =>
                @http
                    method: 'post'
                    url: "/settings/projects"
                    data: project
            removeProject: (projectId) =>
                @http
                    method: 'delete'
                    url: "/settings/projects/#{projectId}"
            updateProject: (project) =>
                @http
                    method: 'put'
                    url: "/settings/projects/#{project.id}"
                    data: project
            addProjectMember: (projectId, email) =>
                @http
                    method: 'post'
                    url: "/settings/projects/#{projectId}/members"
                    data:
                        email: email
        user:
            getUsers: (index=0, keyword) =>
                @http
                    method: 'get'
                    url: '/settings/users'
                    params:
                        index: index
                        keyword: keyword
            getUser: (userId) =>
                @http
                    method: 'get'
                    url: "/settings/users/#{userId}"
            inviteUser: (email) =>
                @http
                    method: 'post'
                    url: '/settings/users'
                    data:
                        email: email
            removeUser: (userId) =>
                @http
                    method: 'delete'
                    url: "/settings/users/#{userId}"
            updateUser: (user) =>
                @http
                    method: 'put'
                    url: "/settings/users/#{user.id}"
                    data: user

    # -----------------------------------------------------
    # $get
    # -----------------------------------------------------
    @$get = ['$injector', ($injector) =>
        @setupProviders $injector

        user: @user
        url: @url
        alert: @alert
        api: @api
    ]
    return
