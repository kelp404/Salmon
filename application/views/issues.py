import json
import bleach
from application.exceptions import Http400, Http404
from application.responses import JsonResponse
from application.decorators import authorization
from application.forms.issue_form import IssueForm, IssueSearchForm
from application.models.dto.page_list import PageList
from application.models.datastore.user_model import UserPermission
from application.models.datastore.project_model import ProjectModel
from application.models.datastore.issue_model import IssueModel
from application import utils


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issues(request, project_id):
    form = IssueSearchForm(**request.GET.dict())
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    query = IssueModel.all()
    total = query.count()
    issues = query.order('create_time').fetch(utils.default_page_size, form.index.data * utils.default_page_size)
    return JsonResponse(PageList(form.index.data, utils.default_page_size, total, issues))

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def add_issue(request, project_id):
    form = IssueForm(**json.loads(request.body))
    if not form.validate():
        raise Http400

    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404

    issue = IssueModel(
        title=form.title.data,
        floor=form.floor.data,
        room=form.room.data,
        content=bleach.clean(form.content.data),
        label_ids=form.label_ids.data,
        author=request.user,
        project=project,
    )
    issue.put()
    return JsonResponse(issue)
