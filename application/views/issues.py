import json
from application.responses import JsonResponse
from application.decorators import authorization
from application.models.datastore.user_model import UserPermission

@authorization(UserPermission.root, UserPermission.advanced, UserPermission.normal)
def get_issues(request, project_id):
    return JsonResponse({})
