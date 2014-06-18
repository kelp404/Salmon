from wtforms import Form, StringField, IntegerField, validators
from application.forms import ArrayField
from application import utils


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
    floor_lowest = IntegerField(
        filters=[utils.int_filter],
    )
    floor_highest = IntegerField(
        filters=[utils.int_filter],
    )
    room_options = ArrayField()
