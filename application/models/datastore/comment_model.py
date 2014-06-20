from google.appengine.ext import db
from application import utils
from application.models.datastore.base_model import BaseModel
from application.models.datastore.user_model import UserModel
from application.models.datastore.issue_model import IssueModel


class CommentModel(BaseModel):
    comment = db.TextProperty()
    author = db.ReferenceProperty(reference_class=UserModel, required=True)
    issue = db.Reference(reference_class=IssueModel, required=True)
    create_time = db.DateTimeProperty(auto_now_add=True)

    def dict(self):
        return {
            'id': self.key().id() if self.has_key() else None,
            'comment': self.comment,
            'author': self.author.dict(),
            'create_time': utils.get_iso_format(self.create_time),
        }
