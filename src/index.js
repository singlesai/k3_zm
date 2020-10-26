const fs = require('fs');
const path = require('path');

var express = require('express');
var app = express();
var schedule = require('node-schedule')
const cfg = require('../config.json')
var zm = require('./mid/index')
var k3 = require('./k3/index')
var sc = require('./sync')

var zmApi = new zm()
var k3Api = new k3()
var sync = new sc()

const syncStatus = {syncing: false, beginTime: null}

app.use(express.static(path.resolve(__dirname, '../vueclient/dist')))
app.get('/vue/*', function(req,res){
    const html = fs.readFileSync(path.resolve(__dirname, '../vueclient/dist/index.html'), 'utf-8')
    res.send(html)
})

app.get('/', function(req, res){
    res.end('test')
})

app.get('/material', function(req,res){
    var filter = req.query['filter']
    var unsync = req.query['unsync']
    zmApi.MaterialDsp(filter, unsync).then(rst=>{
        res.end(JSON.stringify(rst))
    }).catch(err=>{
        res.end(JSON.stringify(err))
    })
})

app.get('/saleorder', function(req, res){
    var filter = req.query['filter']
    var unsync = req.query['unsync']
    var begDate = req.query['beg']
    var endDate = req.query['end']
    zmApi.SaleOrderDsp(begDate, endDate, filter, unsync).then(rst=>{
        res.end(JSON.stringify(rst))
    }).catch(err=>{
        res.end(JSON.stringify(err))
    })
})

app.get('/bom', function(req,res){
    var filter = req.query['filter']
    var unsync = req.query['unsync']
    zmApi.BomDsp(filter, unsync).then(rst=>{
        res.end(JSON.stringify(rst))
    }).catch(err=>{
        res.end(JSON.stringify(err))
    })
})

app.get('/k3so', function(req, res){
    k3Api.getSaleOrder().then(rst=>{
        res.end(JSON.stringify(rst))
    }).catch(err=>{
        res.end(JSON.stringify(err))
    })
})

app.post('/k3so', function(req,res){
    var str = '';
    var i = 0 ;
    req.on('data', (data)=>{
        str+=data;
    });
    req.on('end',()=>{
        var params=str.split('&')
        var query = {}
        for(idx in params){
            var pn = params[idx].split('=')
            query[pn[0]]=pn[1]
        }
        k3Api.saveSaleOrder(query['data']).then(rst=>{
            res.end(JSON.stringify(rst))
        }).catch(err=>{
            res.end(JSON.stringify(err))
        })
    })
})

app.get('/testmaterial', function(req,res){
    sync.syncMaterial().then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex',ex)
        res.end('end')
    })
})

app.get('/resyncmaterial', function(req,res){
    zmApi.MaterialRet(req.query['id'],'R').then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex', ex)
        res.end('end')
    })
})

app.get('/testsaleorder', function(req,res){
    sync.syncSaleOrder().then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex', ex)
        res.end('end')
    })
})

app.get('/resyncsaleorder', function(req,res){
    zmApi.SaleOrderRet(req.query['id'], 'R').then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex', ex)
        res.end('end')
    })
})

app.get('/testbom', function(req,res){
    sync.syncBom().then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex', ex)
        res.end('end')
    })
})

app.get('/resyncbom', function(req,res){
    zmApi.BomRet(req.query['id'], 'R').then(()=>{
        res.end('end')
    }).catch(ex=>{
        console.log('ex', ex)
        res.end('end')
    })
})

var server = app.listen(cfg.port, function(){
    var rule = new schedule.RecurrenceRule()
    var times = [1,6,11,16,21,26,31,36,41,46,51,56]
    rule.minute = times
    schedule.scheduleJob(rule, function() {
        //console.log('begin Sync Material', new Date())
        return sync.syncMaterial().then(()=>{
            //console.log('begin Sync Saleorder', new Date())
            return sync.syncSaleOrder()
        }).then(()=>{
            //console.log('begin Sync Bom', new Date())
            return sync.syncBom()
        }).then(()=>{
            //console.log('end Sync', new Date())
        }).catch(ex=>{
            //console.log('sync error', ex)
        })
    })

    var host = server.address().address
    var port = server.address().port

    console.log('Your fxiaoke Server is running here: http://%s:%s',host,port)
})