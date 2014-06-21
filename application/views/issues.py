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
from application.models.datastore.comment_model import CommentModel
from application import utils


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issues(request, project_id):
    request_dict = request.GET.dict()
    if 'label_ids' in request_dict:
        del request_dict['label_ids']
    form = IssueSearchForm(label_ids=request.GET.getlist('label_ids'), **request_dict)
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if form.keyword.data:
        # search by keyword
        total = 0
        issues = []
    else:
        query = IssueModel.all().filter('project =', project.key())
        # is_close filter
        if form.status.data == 'open':
            query = query.filter('is_close =', False)
        elif form.status.data == 'closed':
            query = query.filter('is_close =', True)

        # floor filter
        if form.floor_lowest.data != 0:
            query = query.filter('floor >=', form.floor_lowest.data)
        if form.floor_highest.data != 0:
            query = query.filter('floor <=', form.floor_highest.data)

        # label filter
        form.label_ids.data = [long(x) for x in form.label_ids.data if x]
        for label_id in form.label_ids.data:
            query = query.filter('label_ids in', [label_id])

        # order
        if form.floor_lowest.data | form.floor_highest.data == 0:
            query = query.order('-create_time')
        else:
            query = query.order('floor').order('-create_time')
        total = query.count()
        issues = query.fetch(utils.default_page_size, form.index.data * utils.default_page_size)
    return JsonResponse(PageList(form.index.data, utils.default_page_size, total, issues))

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issue(request, project_id, issue_id):
    issue = IssueModel.get_by_id(long(issue_id))
    if issue is None:
        raise Http404
    comments = CommentModel.all().filter('issue =', issue.key()).order('create_time').fetch(1000)
    result = issue.dict()
    result['comments'] = [x.dict() for x in comments]
    return JsonResponse(result)

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
        content=bleach.clean(form.content.data),
        label_ids=form.label_ids.data,
        author=request.user,
        project=project,
    )
    issue.put()
    return JsonResponse(issue)
