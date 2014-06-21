import json
from django.http.response import HttpResponse
from application.decorators import authorization
from application.exceptions import Http400, Http403, Http404
from application.responses import JsonResponse
from application.forms.label_form import LabelForm
from application.models.datastore.user_model import UserPermission
from application.models.datastore.label_model import LabelModel
from application.models.datastore.project_model import ProjectModel


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def add_label(request, project_id):
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    form = LabelForm(**json.loads(request.body))
    if not form.validate():
        raise Http400
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    label = LabelModel(
        title=form.title.data,
        project=project,
    )
    label.put()
    return JsonResponse(label)

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_labels(request, project_id):
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403
    labels = LabelModel.all().filter('project =', project.key()).order('title').fetch(100)
    return JsonResponse([x.dict() for x in labels])

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def delete_label(request, project_id, label_id):
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    label = LabelModel.get_by_id(long(label_id))
    label.delete()
    return HttpResponse()

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def update_label(request, project_id, label_id):
    form = LabelForm(**json.loads(request.body))
    if not form.validate():
        raise Http400
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.root_ids:
        raise Http403
    label = LabelModel.get_by_id(long(label_id))
    label.title = form.title.data
    label.put()
    return JsonResponse(label)
