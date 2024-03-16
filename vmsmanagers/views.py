from jadi import component

from aj.api.http import url, HttpPlugin
from aj.auth import authorize
from aj.api.endpoint import endpoint, EndpointError

from aj.plugins.conference.orm import ORMmanager
from bson.json_util import dumps, loads
import json
import logging
from bson.objectid import ObjectId


@component(HttpPlugin)
class Handler(HttpPlugin):
    def __init__(self, context):
        self.context = context
        self.orm = ORMmanager(context)
        if self.orm.managerusers.find_one({'name':'vmsuser1'}) is None:
            vmsuser = {"name": "vmsuser1","hostip": "127.0.0.1", "fqdn": "", "amiWriteTimeout": 1000, 
                       "agiprefix": "97", "confprefix": "98", "amdprefix": "96", "password": "vmsuser1", "agiport": 4573}
            self.orm.managerusers.insert_one(vmsuser)

    @url(r'/api/managerusers')
    @endpoint(api=True)
    def handle_api_in_routes(self, http_context):

        if http_context.method == 'GET':
            return(self.getManagerUsers())


        if http_context.method == 'PUT':
            print(f"delete: {http_context.json_body()['config']}")
            managerusers = http_context.json_body()['config']
            for u in self.getManagerUsers()['managerusers']:
                print(f"u obj: {u}")
                if u in managerusers:
                    continue
                else: 
                    print(f"delete: {u}")
                    self.orm.managerusers.delete_one({"_id": ObjectId(u['id'])})
            return(self.getManagerUsers())

        if http_context.method == 'POST':
            managerusers = http_context.json_body()['config']
            print(managerusers)
            for manageruser in managerusers:
                if self.orm.managerusers.find_one({"name": manageruser['name']}) is None:
                    self.orm.managerusers.insert_one(manageruser)
                else:
                    logging.info(f"document exists {manageruser}")
                    updated = self.orm.managerusers.update_one({"_id": ObjectId(manageruser['id'])},{"$set": manageruser})
            return (self.getManagerUsers())
   
    
    def getManagerUsers(self):
        cols = []
        for manageruser in self.orm.managerusers.find({}):
            manageruser["id"] = str(manageruser['_id'])
            del manageruser['_id']
            cols.append(manageruser)

        return {"managerusers": [manageruser for manageruser in cols ]}
    
