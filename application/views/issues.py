import json
import bleach
from application.exceptions import Http400, Http404
from application.responses import JsonResponse
from application.decorators import authorization
from application.forms.issue_form import IssueForm
from application.models.datastore.user_model import UserPermission
from application.models.datastore.project_model import ProjectModel
from application.models.datastore.issue_model import IssueModel


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issues(request, project_id):
    return JsonResponse({})

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
