from jadi import component

from aj.api.http import url, HttpPlugin
from aj.auth import authorize
from aj.api.endpoint import endpoint, EndpointError
from .orm import ORMmanager
from bson.json_util import dumps, loads
import json
import logging
from bson.objectid import ObjectId

@component(HttpPlugin)
class Handler(HttpPlugin):
    def __init__(self, context):
        self.context = context
        self.orm = ORMmanager(context)

    # Register URL for this api
    @url(r'/api/confs')
    # Set the right permissions if necessary, see main.py to activate it.
    #@authorize('my_plugin:show')
    @endpoint(api=True)
    def handle_api_vms_conference(self, http_context):

        if http_context.method == 'GET':
            return(self.getConfs())

        if http_context.method == 'PUT':
            print(f"delete: {http_context.json_body()['config']}")
            confs = http_context.json_body()['config']
            for u in self.getConfs()['confs']:
                print(f"u obj: {u}")
                if u in confs:
                    continue
                else: 
                    print(f"delete: {u}")
                    self.orm.conferences.delete_one({"_id": ObjectId(u['id'])})
            return(self.getConfs())

        if http_context.method == 'POST':
            confs = http_context.json_body()['config']
            print(confs)
            for conf in confs:
                if self.orm.conferences.find_one({"number": conf['number']}) is None:
                    self.orm.conferences.insert_one(conf)
                else:
                    logging.info(f"document exists {conf}")
                    updated = self.orm.conferences.update_one({"_id": ObjectId(conf['id'])},{"$set": conf})
            return (self.getConfs())
    
    def getConfs(self):
        cols = []
        for conf in self.orm.conferences.find({}):
            conf["id"] = str(conf['_id'])
            del conf['_id']
            cols.append(conf)

        return {"confs": [conf for conf in cols ]}
            



                
                    

