from django.conf.urls import patterns, url
from application.exceptions import *
from application.dispatches import api_dispatch, dispatch
from application.views.base import base_view
from application.views.settings import *
from application.views.users import *
from application.views.projects import *
from application.views.issues import *
from application.views.labels import *


# error handlers
handler403 = permission_denied
handler404 = page_not_found
handler500 = server_error


# routers
urlpatterns = patterns('',
    url(r'^$', dispatch(GET=base_view)),
    url(r'^login$', dispatch(GET=base_view)),


    # /projects/<project_id>
    url(r'^projects/(?P<project_id>[0-9]{1,32})$', api_dispatch(
        GET=base_view,
    )),
    # /projects/<project_id>/labels
    url(r'^projects/(?P<project_id>[0-9]{1,32})/labels$', api_dispatch(
        GET=get_labels,
        POST=add_label,
    )),
    # /projects/<project_id>/labels/<label_id>
    url(r'^projects/(?P<project_id>[0-9]{1,32})/labels/(?P<label_id>[0-9]{1,32})$', api_dispatch(
        PUT=update_label,
        DELETE=delete_label,
    )),
    # /projects/<project_id>/issues
    url(r'^projects/(?P<project_id>[0-9]{1,32})/issues$', api_dispatch(
        GET=get_issues,
        POST=add_issue,
    )),
    # /projects/<project_id>/issues/<issue_id>
    url(r'^projects/(?P<project_id>[0-9]{1,32})/issues/(?P<issue_id>[0-9]{1,32})$', api_dispatch(
        GET=get_issue,
        PUT=update_issue,
    )),
    # /projects/<project_id>/issues/count
    url(r'^projects/(?P<project_id>[0-9]{1,32})/issues/count$', api_dispatch(
        GET=count_issues,
    )),
    # /projects/<project_id>/issues/new
    url(r'^projects/(?P<project_id>[0-9]{1,32})/issues/new$', api_dispatch(
        GET=base_view,
    )),

    # /settings
    url(r'^settings$', dispatch(
        GET=base_view,
    )),
    # /settings/profile
    url(r'^settings/profile$', api_dispatch(
        GET=get_profile,
        PUT=update_profile,
    )),
    # /settings/projects
    url(r'^settings/projects$', api_dispatch(
        GET=get_projects,
        POST=add_project,
    )),
    # /settings/projects/new
    url(r'^settings/projects/new$', dispatch(
        GET=base_view,
    )),
    # /settings/projects/<project_id>
    url(r'^settings/projects/(?P<project_id>[0-9]{1,32})$', api_dispatch(
        GET=get_project,
        PUT=update_project,
        DELETE=delete_project,
    )),
    # /settings/projects/<project_id>/members
    url(r'^settings/projects/(?P<project_id>[0-9]{1,32})/members$', api_dispatch(
        POST=add_project_member,
    )),
    # /settings/users
    url(r'^settings/users$', api_dispatch(
        GET=get_users,
        POST=invite_user,
    )),
    # /settings/users/new
    url(r'^settings/users/new$', dispatch(
        GET=base_view,
    )),
    # /settings/users/<user_id>
    url(r'^settings/users/(?P<user_id>[0-9]{1,32})$', api_dispatch(
        GET=get_user,
        PUT=update_user,
        DELETE=delete_user,
    )),
)
