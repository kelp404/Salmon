from wtforms import Form, StringField, BooleanField, validators
from application.forms import ArrayField


class ProjectForm(Form):
    """
    The form for update the project.
    """
    title = StringField(
        validators=[validators.required()],
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    description = StringField(
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    member_ids = ArrayField()
    root_ids = ArrayField()
    floor_options = ArrayField()
    room_options = ArrayField()
