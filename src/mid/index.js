"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var sql = require('mssql');
var util = require('util')
const cfg = require('../../config.json');
const { promises } = require('fs');

class zm {
    constructor(options) {
    }

    async getPool() {
        return await new Promise((resolve, reject)=>{
            if(this.pool!==undefined){
                resolve(this.pool)
            }else{
                new sql.ConnectionPool(cfg.middb).connect().then(rst=>{
                    this.pool = rst
                    resolve(rst)
                }).catch(ex=>{
                    console.log('getPoolErr',ex)
                    reject(ex)
                })
            }
        })
    }

    async query(strSql) {
        await this.getPool()
        return await new Promise((resolve,reject)=>{
            this.pool.query(strSql).then(rst=>{
                resolve(rst)
            }).catch(ex=>{
                reject(ex)
            })
        })
    }

    async getSaleOrder() {
        var rst = {};
        var strSql="select * from saleorder where isnull(k3_status,'R')='R' order by isnull(createTime,updateTime)"
        var result = await this.query(strSql)

        if (result.recordset.length<=0) {
            return []
        }
        var ids = []
        for (var idx in result.recordset) {
            var rec = result.recordset[idx]
            var obj = {id: rec.orderID,date: rec.orderDate, billNo: rec.orderNo,entry:[]}
            result.recordset[idx]['entry'] = []
            rst[obj.id] =obj
            ids.push(obj.id)
        }
        var strSql = "select * from SaleOrderDetail where orderID in ("+ids.join(',')+")"
        result = await this.query(strSql)
        
        for(var idx in result.recordset){
            var rec = result.recordset[idx]
            var obj = {entryid: rec.number, number: rec.prodCode, qty: rec.prodQty, unit: rec.unit, price: rec.price===null?0:rec.price }
            rst[result.recordset[idx].orderID].entry.push(obj)
        }
        var arr = []
        for(var key in rst){
            arr.push(rst[key])
        }
        return arr
    }

    async SaleOrderDsp(begDate, endDate, filter, unsync) {
        var rst = {}
        var bill = {}
    
        var strWhere = "where 1=1"
        if(!begDate){
            strWhere += " and orderDate>='"+begDate+"'"
        }
        if(!endDate){
            strWhere += " and orderDate<='"+endDate+"'"
        }
        if(filter!==undefined){
            strWhere += " and orderNo like '%"+filter+"%'"
        }
        
        if (unsync===undefined){
            unsync = true
        }
        if(unsync==='true') {
            strWhere += " and isnull(k3_status,'') in ('F','','R')"
        }
        var strSql = `select jobID,orderID,orderDate,orderNo,flag,isnull(createTime,updateTime) syncTime,k3_status syncStatus,k3_info syncInfo
        from SaleOrder
        `+strWhere+`
        order by orderDate desc,isnull(createTime,updateTime) desc`
        var rst = await this.query(strSql)
        return rst.recordset
            /*
            var ids = []
            for(var idx in rst.recordset){
                var rec = rst.recordset[idx]
                ids.push(rec.orderID)
                if(bill[rec.jobID]===undefined){
                    bill[rec.jobID] = {id: rec.jobID, date: rec.orderDate, billNo: rec.orderNo, his: {}}
                }
                bill[rec.jobID].his[rec.orderID] = rec
            }
            if(ids.length===0) {
                return []
            }else{
                var strSql = `select orderID,number eIdx,prodCode,prodQty,price,unit
                from SaleOrderDetail where orderID in (`+ids.join(',')+`)
                order by orderID,number`
                return this.pool.query(strSql).then(rst=>{
                    for(var idx in rst.recordset){
                        var rec = rst.recordset[idx]
                        for(var id in bill){
                            if(rec.orderID in bill[id].his){
                                if(bill[id].his[rec.orderID]['entry']===undefined){
                                    bill[id].his[rec.orderID]['entry'] = []
                                }
                                bill[id].his[rec.orderID]['entry'].push(rec)
                            }
                        }
                    }
                    return bill
                })
            }
            */
    }

    async SaleOrderRet(id, status, info) {
        var strSql="update saleorder set k3_status='"+status+"' where orderID=" + id
        if (info!==undefined){
            strSql="update saleorder set k3_status='"+status+"',k3_info='"+info+"' where orderID=" + id
        }
        return await this.query(strSql)
    }

    async getMaterial(number) {
        var strSql="select materCode,materName,spec,type,unit from MaterTable where isnull(k3_status,'R')='R' order by isnull(createTime,updateTime)"
        if(number!==undefined){
            strSql = "select materCode,materName,spec,type,unit from MaterTable where isnull(materCode,'')='"+number+"' order by isnull(createTime,updateTime)"
        }
        var rst = await this.query(strSql)
    
        var rr=[]
        for(var idx in rst.recordset){
            var rec = rst.recordset[idx]
            rr.push({
                id: rec.materCode,
                number: rec.materCode,
                name: rec.materName,
                model: rec.spec,
                type: rec.type,
                unit: rec.unit
            })
        }
        return rr
    }

    async MaterialDsp(filter, unsync){
        if (filter===undefined){
            filter = ''
        }
        if (unsync===undefined){
            unsync = 'true'
        }
        var strSql=util.format("select * from MaterTable where materCode like '%'+'%s'+'%'",filter)
        if(unsync==='true') {
            strSql += " and isnull(k3_status,'') in ('F','','R')"
        }
        var rst = await this.query(strSql)
        return rst.recordset
    }

    async MaterialRet(number, status, info){
        if(number===undefined){
            return undefined
        }
        var strSql="update MaterTable set k3_status='"+status+"' where materCode='"+number+"'"
        if(info!==undefined){
            var strSql="update MaterTable set k3_status='"+status+"',k3_info='"+info+"' where materCode='"+number+"'"
        }
        return await this.query(strSql)
    }

    async BomDsp(filter,unsync){
        if (filter===undefined){
            filter = ''
        }
        if (unsync===undefined){
            unsync = 'true'
        }
        var strSql=util.format("select * from BomHead where (orderNo like '%'+'%s'+'%' or prodCode like '%'+'%s'+'%')", filter,filter)
        if(unsync==='true') {
            strSql += " and isnull(k3_status,'') in ('F','','R')"
        }
        var rst = await this.query(strSql)
        return rst.recordset
    }

    async Bom(orderNo,materialNo) {
        var obj = undefined
        var dic = {}
        var strSql=util.format("select bomid id,orderNo,prodCode materialNo,unit,qty,rate from BomHead where orderNo='%s' and prodCode='%s'", orderNo,materialNo)
        var rst = await this.query(strSql)
        if(rst.recordset.length===0){
            return undefined
        }else{
            obj = result.recordset[0]
            obj.child = []
            strSql=util.format("select bomid id,levels,parentCode,materCode,unit,qty from BomBody where bomid=%s order by levels",obj.id)
            rst = await this.query(strSql)
            for(var idx in rst.recordset){
                var rec = rst.recordset[idx]
                dic[materCode] = rec
                dic[materCode]['child'] = []
                if(rec.parentCode===''){
                    obj.child.push(rec)
                }else{
                    if(dic[rec.parentCode]===undefined){
                        obj.child.push(rec)
                    }else{
                        dic[rec.parentCode].child.push(rec)
                    }
                }
            }
            return obj
        }
    }

    async getBom() {
        var dic = {}
        var arr = []
        var strSql=util.format("select bomID,orderDate,orderNo,prodCode,unit,qty,rate from BomHead where isnull(k3_status,'R')='R' order by isnull(createTime,updateTime)")
        var rst = await this.query(strSql)
        var ids = []
        if(rst.recordset.length<=0) {
            return []
        }
        for(var idx in rst.recordset){
            var rec = rst.recordset[idx]
            var obj = {id: rec.bomID, date: rec.orderDate, orderNo: rec.orderNo, level: 0, number: rec.prodCode, unit: rec.unit, qty: rec.qty, rate: rec.rate.replace('%', ''), child: [], dic: {}}
            dic[obj.id] = obj
            ids.push(obj.id)
        }
        var strSql=util.format("select bomID,levels,parentCode,materCode,unit,qty from BomBody where bomid in (%s) order by levels",ids.join(','))
        rst = await this.query(strSql)
        for(var idx in rst.recordset){
            var rec = rst.recordset[idx]
            var root = dic[rec.bomID]
            var obj = {id: rec.bomID, date: root.date, orderNo: root.orderNo, level: rec.levels, number: rec.materCode, unit:rec.unit, qty: rec.qty, rate: 100, child: []}
            var bomDic = root.dic
            bomDic[obj.number] = obj
            if(rec.parentCode===''){
                dic[obj.id].child.push(obj)
            }else{
                if(bomDic[rec.parentCode]===undefined){
                    dic[rec.bomID].child.push(obj)
                }else{
                    bomDic[rec.parentCode].child.push(obj)
                }
            }
        }
        var arr = []
        for(var id in dic){
            arr.push(dic[id].child[0])
        }
        return arr
    }

    async BomRet(id,status,info){
        var strSql="update BomHead set k3_status='"+status+"' where bomID=" + id
        if (info!==undefined){
            strSql="update BomHead set k3_status='"+status+"',k3_info='"+info+"' where bomID=" + id
        }
        return await this.query(strSql)
    }
}

module.exports = zm