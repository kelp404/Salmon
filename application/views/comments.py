import json
import bleach
from application import utils
from application.decorators import authorization
from application.exceptions import Http400, Http403, Http404
from application.responses import JsonResponse
from application.forms.comment_form import CommentForm
from application.models.datastore.user_model import UserPermission
from application.models.datastore.project_model import ProjectModel
from application.models.datastore.issue_model import IssueModel
from application.models.datastore.comment_model import CommentModel


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_comments(request, project_id, issue_id):
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403
    issue = IssueModel.get_by_id(long(issue_id))
    if issue is None:
        raise Http404
    if issue.project.key() != project.key():
        raise Http403

    comments = CommentModel.all().filter('issue =', issue.key()).order('create_time').fetch(1000)
    return JsonResponse([x.dict() for x in comments])

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def add_comment(request, project_id, issue_id):
    form = CommentForm(**json.loads(request.body))
    if not form.validate():
        raise Http400
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403
    issue = IssueModel.get_by_id(long(issue_id))
    if issue is None:
        raise Http404
    if issue.project.key() != project.key():
        raise Http403

    comment = CommentModel(
        comment=bleach.clean(
            form.comment.data,
            tags=utils.get_bleach_allow_tags(),
            attributes=utils.get_bleach_allow_attributes(),
            styles=utils.get_bleach_allow_styles(),
        ),
        author=request.user,
        issue=issue,
    )
    comment.put()
    return JsonResponse(comment)
