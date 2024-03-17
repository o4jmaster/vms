import pymongo
from jadi import service, component, interface, Context
import logging

defaultconfig = {'confbridge_record_interval': 60, 'syslog_servers': [{'host': '192.168.3.234', 'port': '514'}], 'ard_off_hook_bits': '0101', 'dtmf_length': 5, 'channels_reconnect_interval': 1, 'ard_off_hook_enable_immediate': False, 
                 'enable_mrdwink_forwarding': '', 'enable_sip': True, 'syslog_server': '', 'S3enabled': False, 'enabled_codecs': ['g722', 'alaw', 'ulaw', 'g726', 'gsm', 'g729'], 
                 'last_request_timestamp': 1677156364075, 'snmp_trap_port': 162, 'dtmf_callerPrefix': '', 'bindaddr': '0.0.0.0', 'last_saved_timestamp': 1677156516300, 'global_ring_timeout': 100000000, 'snmp_trap_server': '', 'version_number': '', 
                 'enable_channels_reconnect_interval': 60, 'snmp_community_name': 'nsmero', 'confbridge_record_location': '/var/spool/asterisk/monitor', 'syslog_level': 21, 'softswitch_check_interval': 2, 'enable_mrdwink_extension': '', 'tcpbindaddr': '0.0.0.0'}


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
        self.getConfig()
    
    def getConfig(self):
        if self.config.find_one({'id': 100}) is None:
            self.config.insert_one({'id': 100})
            for k,v in defaultconfig.items():
                self.config.update_one({'id': 100},{"$set": {k: v}})
        return self.config.find_one({'id': 100})
    