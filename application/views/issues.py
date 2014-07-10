import json
import bleach
from application.exceptions import Http400, Http403, Http404
from application.responses import JsonResponse
from application.decorators import authorization
from application.forms.issue_form import IssueForm, IssueSearchForm
from application.models.dto.page_list import PageList
from application.models.datastore.user_model import UserPermission
from application.models.datastore.project_model import ProjectModel
from application.models.datastore.issue_model import IssueModel
from application.models.datastore.comment_model import CommentModel
from application.models.datastore.label_model import LabelModel
from application import utils


@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issues(request, project_id):
    request_dict = request.GET.dict()
    if 'label_ids' in request_dict:
        del request_dict['label_ids']
    form = IssueSearchForm(label_ids=request.GET.getlist('label_ids'), **request_dict)
    project_id = long(project_id)
    project = ProjectModel.get_by_id(project_id)
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403

    if form.keyword.data:
        # search by keyword
        issues, total = IssueModel.search(
            project_id=project_id,
            keyword=form.keyword.data,
            floor_lowest=None if form.floor_lowest.data == 0 else form.floor_lowest.data,
            floor_highest=None if form.floor_highest.data == 0 else form.floor_highest.data,
            label_ids=form.label_ids.data,
            index=form.index.data,
            size=utils.default_page_size,
        )
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
def count_issues(request, project_id):
    request_dict = request.GET.dict()
    if 'label_ids' in request_dict:
        del request_dict['label_ids']
    form = IssueSearchForm(label_ids=request.GET.getlist('label_ids'), **request_dict)
    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    labels = LabelModel.all().filter('project =', project.key()).fetch(100)

    def append_floor_query(query):
        # floor filter
        if form.floor_lowest.data != 0:
            query = query.filter('floor >=', form.floor_lowest.data)
        if form.floor_highest.data != 0:
            query = query.filter('floor <=', form.floor_highest.data)
        return query
    def append_label_query(query):
        # label filter
        form.label_ids.data = [long(x) for x in form.label_ids.data if x]
        for label_id in form.label_ids.data:
            query = query.filter('label_ids in', [label_id])
        return query
    def append_close_query(query):
        # is_close filter
        if form.status.data == 'open':
            query = query.filter('is_close =', False)
        elif form.status.data == 'closed':
            query = query.filter('is_close =', True)
        return query
    def append_order_query(query):
        # order
        if form.floor_lowest.data | form.floor_highest.data == 0:
            query = query.order('-create_time')
        else:
            query = query.order('floor').order('-create_time')
        return query

    query = IssueModel.all().filter('project =', project.key())
    query = append_floor_query(query)
    query = append_label_query(query)
    query = query.filter('is_close =', True)
    query = append_order_query(query)
    count_closed = query.count()

    query = IssueModel.all().filter('project =', project.key())
    query = append_floor_query(query)
    query = append_label_query(query)
    query = query.filter('is_close =', False)
    query = append_order_query(query)
    count_open = query.count()

    count_labels = {}
    for label in labels:
        query = IssueModel.all().filter('project =', project.key())
        query = append_floor_query(query)
        query = append_close_query(query)
        query = query.filter('label_ids in', [label.key().id()])
        query = append_order_query(query)
        count_labels[str(label.key().id())] = query.count()

    result = {
        'all': count_open + count_closed,
        'open': count_open,
        'closed': count_closed,
        'labels': count_labels,
    }
    return JsonResponse(result)

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issue(request, project_id, issue_id):
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
        raise Http404

    comments = CommentModel.all().filter('issue =', issue.key()).order('create_time').fetch(1000)
    result = issue.dict()
    result['comments'] = [x.dict() for x in comments]
    return JsonResponse(result)

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def update_issue(request, project_id, issue_id):
    form = IssueForm(**json.loads(request.body))
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
        raise Http404

    if issue.is_close != form.is_close.data:
        # close/reopen the issue
        issue.is_close = form.is_close.data
        issue.put()
    else:
        # update the issue
        if request.user.permission != UserPermission.root and\
                not request.user.key().id() in project.root_ids and\
                request.user.key() != issue.author.key():
            raise Http403
        issue.title = form.title.data
        issue.content = bleach.clean(
            form.content.data,
            tags=utils.get_bleach_allow_tags(),
            attributes=utils.get_bleach_allow_attributes(),
            styles=utils.get_bleach_allow_styles(),
        )
        issue.floor = form.floor.data
        issue.label_ids = form.label_ids.data
        issue.put()
    return JsonResponse(issue)

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def add_issue(request, project_id):
    form = IssueForm(**json.loads(request.body))
    if not form.validate():
        raise Http400

    project = ProjectModel.get_by_id(long(project_id))
    if project is None:
        raise Http404
    if request.user.permission != UserPermission.root and\
                    request.user.key().id() not in project.member_ids:
        raise Http403

    issue = IssueModel(
        title=form.title.data,
        floor=form.floor.data,
        content=bleach.clean(
            form.content.data,
            tags=utils.get_bleach_allow_tags(),
            attributes=utils.get_bleach_allow_attributes(),
            styles=utils.get_bleach_allow_styles(),
        ),
        label_ids=form.label_ids.data,
        author=request.user,
        project=project,
    )
    issue.put()
    return JsonResponse(issue)
