import pymongo
from jadi import service, component, interface, Context
import logging

@service
class ORMService(object):
    def __init__(self, context):
        self.context = context

@interface
class ABManager(object):
    def __init__(self, context):
        pass

@component(ABManager)
class ORMmanager(ABManager):
    def __init__(self, context):
        self.mongoclient = pymongo.MongoClient('localhost')
        self.vmsdb = self.mongoclient.vmsdb
        self.conferences = self.vmsdb.conferences
        self.sipusers = self.vmsdb.sipusers
        self.spans = self.vmsdb.spans
        self.sipwlines = self.vmsdb.sipwlines
        self.inroutes = self.vmsdb.inroutes
        self.channels = self.vmsdb.channels
        self.bargeextens = self.vmsdb.bargeextens
        self.config = self.vmsdb.config
        self.managerusers = self.vmsdb.managerusers
        self.outroutes = self.vmsdb.outroutes
        
        logging.info("ORMmanager Init")
    