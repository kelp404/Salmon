from google.appengine.ext import db
from application import utils
from application.models.datastore.base_model import BaseModel


class ProjectModel(BaseModel):
    title = db.StringProperty(required=True)
    description = db.TextProperty()
    root_ids = db.ListProperty(long, default=[])
    member_ids = db.ListProperty(long, default=[])
    floor_options = db.StringListProperty(default=[], indexed=False)
    room_options = db.StringListProperty(default=[], indexed=False)
    create_time = db.DateTimeProperty(auto_now_add=True)

    def dict(self):
        return {
            'id': self.key().id() if self.has_key() else None,
            'title': self.title,
            'description': self.description,
            'root_ids': self.root_ids,
            'member_ids': self.member_ids,
            'floor_options': self.floor_options,
            'room_options': self.room_options,
            'create_time': utils.get_iso_format(self.create_time),
        }
