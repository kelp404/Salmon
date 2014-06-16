import json
from django.http.response import HttpResponse
from application import utils
from application.exceptions import Http400, Http403, Http404
from application.responses import JsonResponse
from application.decorators import authorization
from application.forms.search_form import SearchForm
from application.forms.project_form import ProjectForm
from application.forms.user_form import UserForm
from application.models.dto.page_list import PageList
from application.models.datastore.user_model import UserModel, UserPermission
from application.models.datastore.project_model import ProjectModel


@authorization(UserPermission.root, UserPermission.normal)
def get_projects(request):
    form = SearchForm(**request.GET.dict())
    if form.all.data:
        index = 0
        size = 1000
    else:
        index = form.index.data
        size = utils.default_page_size

    query = ProjectModel.all().order('title')
    if request.user.permission != UserPermission.root:
        query = query.filter('member_ids in', [request.user.key().id()])
    total = query.count()
    projects = query.fetch(size, index * size)
    return JsonResponse(PageList(index, size, total, projects))

@authorization(UserPermission.root, UserPermission.normal)
def get_project(request, application_id):
    project = ProjectModel.get_by_id(long(application_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403
    result = project.dict()
    result['members'] = [x.dict() for x in UserModel.get_by_id(project.member_ids) if not x is None]
    return JsonResponse(result)

@authorization(UserPermission.root, UserPermission.normal)
def add_project_member(request, application_id):
    form = UserForm(name='invite', **json.loads(request.body))
    if not form.validate():
        raise Http400
    project = ProjectModel.get_by_id(long(application_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    user = UserModel.invite_user(request, form.email.data)
    project.member_ids.append(user.key().id())
    project.save()
    return JsonResponse(user)

@authorization(UserPermission.root, UserPermission.normal)
def add_project(request):
    form = ProjectForm(**json.loads(request.body))
    if not form.validate():
        raise Http400

    project = ProjectModel(
        title=form.title.data,
        description=form.description.data,
        root_ids=[request.user.key().id()],
        member_ids=[request.user.key().id()],
        floor_options=form.floor_options.data,
        room_options=form.room_options.data,
    )
    project.put()
    return JsonResponse(project)

@authorization(UserPermission.root, UserPermission.normal)
def update_project(request, application_id):
    form = ProjectForm(**json.loads(request.body))
    if not form.validate():
        raise Http400

    project = ProjectModel.get_by_id(long(application_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    project.title = form.title.data
    project.description = form.description.data
    project.member_ids = form.member_ids.data
    project.root_ids = form.root_ids.data
    project.floor_options = form.floor_options.data
    project.room_options = form.room_options.data
    project.put()
    return JsonResponse(project)

@authorization(UserPermission.root, UserPermission.normal)
def delete_project(request, application_id):
    project = ProjectModel.get_by_id(long(application_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    project.delete()
    return HttpResponse()
