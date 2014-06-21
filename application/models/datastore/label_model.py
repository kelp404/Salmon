from google.appengine.ext import db
from application import utils
from application.models.datastore.base_model import BaseModel
from application.models.datastore.project_model import ProjectModel


class LabelModel(BaseModel):
    title = db.StringProperty(required=True)
    project = db.ReferenceProperty(reference_class=ProjectModel, required=True)
    create_time = db.DateTimeProperty(auto_now_add=True, indexed=False)

    def dict(self):
        return {
            'id': self.key().id() if self.has_key() else None,
            'title': self.title,
            'create_time': utils.get_iso_format(self.create_time),
        }
