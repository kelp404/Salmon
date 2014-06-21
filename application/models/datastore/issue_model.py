from google.appengine.ext import db
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
