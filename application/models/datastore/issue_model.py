from google.appengine.ext import db
from google.appengine.api import search
from application import utils
from application.models.datastore.base_model import BaseModel
from application.models.datastore.user_model import UserModel
from application.models.datastore.project_model import ProjectModel


class IssueModel(BaseModel):
    title = db.StringProperty(required=True, indexed=False)
    floor = db.IntegerProperty(required=True)
    content = db.TextProperty()
    label_ids = db.ListProperty(long, default=[])
    author = db.ReferenceProperty(reference_class=UserModel, required=True)
    project = db.ReferenceProperty(reference_class=ProjectModel, required=True)
    is_close = db.BooleanProperty(default=False)
    create_time = db.DateTimeProperty(auto_now_add=True)

    def dict(self):
        return {
            'id': self.key().id() if self.has_key() else None,
            'title': self.title,
            'floor': self.floor,
            'content': self.content,
            'label_ids': self.label_ids,
            'author': self.author.dict(),
            'is_close': self.is_close,
            'create_time': utils.get_iso_format(self.create_time),
        }

    @classmethod
    def search(cls, project_id, keyword, index, size, floor_lowest=None, floor_highest=None, label_ids=[]):
        """
        Search issues with keyword.
        :param project_id: {long} The project id.
        :param keyword: {string} The keyword.
        :param index: {int} The page index.
        :param size: {int} The page size.
        :param floor_lowest: {int}
        :param floor_highest: {int}
        :param label_ids: {list}
        :return: ({list}, {int})
            The IssueModel list.
            The number found.
        """
        plus, minus = utils.parse_keyword(keyword)
        query_string = ''
        if len(plus) > 0:
            keyword = ' '.join(plus)
            query_string += '((title:{1}) OR (content:{1}))'.replace('{1}', keyword)
        if len(minus) > 0:
            keyword = ' '.join(minus)
            query_string += ' NOT ((title:{1}) OR (content:{1}))'.replace('{1}', keyword)
        if not floor_lowest is None:
            query_string += ' AND (floor >= %s)' % floor_lowest
        if not floor_highest is None:
            query_string += ' AND (floor <= %s)' % floor_highest
        for label_id in label_ids:
            if label_id:
                query_string += ' AND (label_ids:%s)' % label_id

        create_time_desc = search.SortExpression(
            expression='create_time',
            direction=search.SortExpression.DESCENDING,
            default_value=0,
        )
        options = search.QueryOptions(
            offset=size * index,
            limit=size,
            sort_options=search.SortOptions(expressions=[create_time_desc], limit=1000),
            returned_fields=['doc_id'],
        )
        query = search.Query(query_string=query_string, options=options)
        search_result = utils.get_index_issues(project_id).search(query)
        total = search_result.number_found
        issues = IssueModel.get_by_id([long(x.doc_id) for x in search_result])
        return [x for x in issues if not x is None], total

    def put(self, **kwargs):
        super(IssueModel, self).put(**kwargs)
        index = utils.get_index_issues(self.project.key().id())
        document = search.Document(
            doc_id=str(self.key().id()),
            fields=[
                search.TextField(name='title', value=self.title),
                search.NumberField(name='floor', value=self.floor),
                search.HtmlField(name='content', value=self.content),
                search.TextField(name='label_ids', value=','.join([str(x) for x in self.label_ids])),
                search.AtomField(name='is_close', value=str(self.is_close)),
                search.DateField(name='create_time', value=self.create_time),
            ]
        )
        index.put(document)
    def delete(self, **kwargs):
        index = utils.get_index_issues(self.project.key().id())
        index.delete(str(self.key().id()))
        super(IssueModel, self).delete(**kwargs)
