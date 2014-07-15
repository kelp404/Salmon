describe 'salmon.directive', ->
    beforeEach module('salmon')
    beforeEach ->
        # mock NProgress
        window.NProgress =
            start: ->
            done: ->
            configure: ->

    mackUiRouter = ($httpBackend) ->
        $httpBackend.whenGET('/views/shared/layout.html').respond ''
        $httpBackend.whenGET('/views/login.html').respond ''
        $httpBackend.whenGET('/views/index.html').respond ''

    describe 'salmon-focus', ->
        $scope = null
        $compile = null
        template = """<input id="fake" salmon-focus></input>"""

        beforeEach inject ($injector) ->
            $rootScope = $injector.get '$rootScope'
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
        it 'salmon-focus will call $().select()', ->
            spyOn($.fn, 'select').and.callFake ->
                expect($(@).attr('id')).toEqual 'fake'
            $compile(template) $scope
            expect($.fn.select).toHaveBeenCalled()

    describe 'salmon-enter', ->
        $scope = null
        $compile = null
        template = """<input id="fake" salmon-enter="enter($event)"></input>"""

        beforeEach inject ($httpBackend) ->
            mackUiRouter $httpBackend
        beforeEach inject ($injector) ->
            $rootScope = $injector.get '$rootScope'
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
        it 'salmon-enter will be called when keypress enter', ->
            enterSpy = jasmine.createSpy 'enterSpy'
            $scope.enter = ($event) ->
                enterSpy($event)
            view = $compile(template) $scope
            e = $.Event 'keypress'
            e.which = 13
            spyOn e, 'preventDefault'
            $(view).trigger e
            expect(enterSpy).toHaveBeenCalledWith e
            expect(e.preventDefault).toHaveBeenCalled()

    describe 'salmon-modal', ->
        $scope = null
        $compile = null
        template = """
            <div id="salmon-modal" class="modal fade" salmon-modal="modal">
                <div class="modal-dialog">
                    <form class="modal-content form-horizontal">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title">Modal</h4>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="col-sm-2 control-label" for="input-title">Title</label>
                                <div class="col-sm-10">
                                    <input ng-model="title" class="form-control" id="input-title" type="text"/>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button ng-click="submit()"
                                    type="submit" class="btn btn-default"><i class="fa fa-check fa-fw"></i> Save</button>
                        </div>
                    </form>
                </div>
            </div>
            """

        beforeEach inject ($httpBackend) ->
            mackUiRouter $httpBackend
        beforeEach inject ($injector) ->
            $rootScope = $injector.get '$rootScope'
            $scope = $rootScope.$new()
            $compile = $injector.get '$compile'
            # scope
            $scope.modal =
                autoShow: yes
                hide: ->
                hiddenCallback: ->
        it 'salmon-modal will call $(element).modal("show") when autoShow is yes', ->
            spyOn($.fn, 'modal').and.callFake ->
                expect(@.attr('id')).toEqual 'salmon-modal'
            $compile(template) $scope
            expect($.fn.modal).toHaveBeenCalledWith 'show'
        it 'salmon-modal will focus the first element when modal.shown', ->
            spyOn($.fn, 'select').and.callFake ->
                expect(@.attr('id')).toEqual 'input-title'
            $compile(template) $scope
            expect($.fn.select).toHaveBeenCalled()
        it '$scope.modal.hide() will call $(element).modal("hide")', ->
            $compile(template) $scope
            spyOn($.fn, 'modal').and.callFake ->
                expect(@.attr('id')).toEqual 'salmon-modal'
            $scope.modal.hide()
            expect($.fn.modal).toHaveBeenCalledWith 'hide'
        it '$scope.modal.hiddenCallback() will be called after modal("hide")', ->
            hiddenSpy = jasmine.createSpy 'hiddenSpy'
            $compile(template) $scope
            $scope.modal.hiddenCallback = ->
                hiddenSpy()
            $scope.modal.hide()
            expect(hiddenSpy).toHaveBeenCalled()
