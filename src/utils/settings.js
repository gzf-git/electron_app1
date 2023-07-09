var changes = function (obj) {
    var arr = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            arr.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return arr.join("&");
}

function removeCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    var cookieStr = "";
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) {
            document.cookie = c + ';expires=' + new Date(0).toUTCString()
        } else {
            cookieStr += c;
            cookieStr += ";";
        }
        document.cookie = cookieStr;
    }
}

function guid2() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

let requests = {

    get: (url, headers, params) => {

        const { net } = require('electron')
        const request = net.request(url + '?' + changes(params));
        //结束请求，不然没有响应数据
        request.end();
    }
}


class sls_log {
    constructor() {
        this.url = 'https://byering-log.cn-hangzhou.log.aliyuncs.com/logstores/rpa/track';
        this.params = {
            'monitor_account': '',
            'nickname': '',
            'task': 'LETTER',
            'levelName': 'INFO',
            'APIVersion': '0.6.0',
            'env': '',
            'msg': ''
        };
    }

    info(msg) {
        this.params.levelName = 'INFO'
        this.params.msg = msg
        requests.get(this.url, {}, this.params)
    }

    warning(msg) {
        this.params.levelName = 'WARN'
        this.params.msg = msg
        requests.get(this.url, {}, this.params)
    }

    error(msg) {
        this.params.levelName = 'ERROR'
        this.params.msg = msg
        this.get(this.url, {}, this.params)
    }

    get(url, headers, params) {
        const { net } = require('electron')
        const request = net.request(url + '?' + changes(params));
        //结束请求，不然没有响应数据
        request.end();
    }
}


let log = new sls_log()


class Api {
    constructor() {
        this.HEART_BEAT_URL = undefined;
        this.DATA = undefined;
    }

    heartBeat(postUrl) {

        const { net } = require('electron')
        // 非异步

        const request = net.request(this.HEART_BEAT_URL);
        //结束请求，不然没有响应数据
        request.end();
        return new Promise((resolve, reject) => {
            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    resolve(chunk.toString())
                })
            })
        })
    }

    ack() { }
}

let api = new Api()


class Settings {


    constructor(glv) {
        //
        // glv: 全局参数
        // profile: 环境 pre pro test
        // monitor_account: 监控账号
        // uid: 请求token参数
        this.DEVICE_TYPE = 'windows',
            this.headless = glv.headless
        this.operator = glv.operator
        this.callback_url = glv.callback_url
        this.monitor_account = glv.monitor_account
        this.nickname = glv.account_name
        this.task = glv.task
        this.tenant = glv.tenant
        this.profile = glv.profile
        this.uid = glv.uid
        this.userId = glv.userId
        this.robotNum = glv.robotNum
        this.loginType = glv.loginType
        this.record_id = glv.record_id
        this.taskId = glv.taskId
        this.start_time = new Date().getTime()
        this.check_times = 0
        this.tiktokUrl = glv.tiktokUrl

        log.params = {
            'monitor_account': this.monitor_account,
            'nickname': this.nickname,
            'task': 'LETTER',
            'levelName': 'INFO',
            'APIVersion': '0.6.0',
            'env': this.profile,
            'msg': '',
            'uid': this.uid,
            'traceId': '',
            'userId': this.userId,
        };
        log.info(JSON.stringify(glv))

        if (glv.profile == 'prod') {
            this.HOST = 'http://live.byering.com'
        } else {
            this.HOST = 'http://47.98.232.251:8080'
        }
        if (glv.test != undefined && glv.test) {
            this.HOST = 'http://127.0.0.1:5000'
        }
        this.HEADERS = {
            'client_type': '1',
            'traceId': ''
        }
        this.PARAMS = {
            'type': 1
        }
        this.DATA = {
            "assistantType": 1,
            "deviceId": '',
            "inService": 0,
            "monitorAccount": glv['monitor_account'],
            "monitorStatus": 2,
            "roomId": '',
            'taskId': this.taskId,
        }
        this.HQ_DATA = {
            "account": glv['monitor_account'],
            "ackId": "",
            "deviceId": "",
            "list": []
        }
        this.HQ_DATA_LIST = {
            "city": "",
            "digCount": "",
            "fanGroup": 0,
            "fansCount": "",
            "followCount": "",
            "monitorAccount": glv['monitor_account'],
            "nickname": "",
            "qrUrl": "",
            "remark": "",
            "secUid": "",
            "userAccount": ""
        }
    }
}



let glv = {
    "callback_url": 'https://open-pre.byering.com/robot/rpaRobotStatusCallback',
    "uid": '30315829961936996',
    "record_id": '7',
    "account_name": '柳州百道9号更新',
    "profile": 'pre',
    "monitor_account": 'byering888',
    "tenant": '1',
    "userId": '13479',
    "robotNum": '机器人35',
    "headless": false,
    "test": false,
    "task": 'LETTER',
    'loginType': '',
    'operator': "robot",
    'tiktokUrl': 'leads.cluerich.com',
    'taskId': 'fea0569277b945b09668d6120f93adac'
}


let settings = new Settings(glv)
let HOST = settings.HOST
let HEADERS = settings.HEADERS
let DATA = settings.DATA
let HEART_BEAT_URL = HOST + '/rpa/robot/letter/heartbeat'
api.HEART_BEAT_URL = HEART_BEAT_URL
api.DATA = DATA
exports.api = api
