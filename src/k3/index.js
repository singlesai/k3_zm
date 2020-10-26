"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var sql = require('mssql');
const util = require('util')
const cfg = require('../../config.json')

class k3 {
    constructor(options) {

    }

    async getPool() {
        return await new Promise((resolve,reject)=>{
            if(this.pool!==undefined) {
                resolve(this.pool)
            }else{
                new sql.ConnectionPool(cfg.k3db).connect().then(rst=>{
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
/*
    getPool() {
        if(this.pool!==undefined){
            return new Promise((resolve)=>{
                resolve(this.pool)
            })
        }else{
            return new sql.ConnectionPool(cfg.k3db).connect().then(rst=>{
                this.pool = rst
                return rst
            }).catch(ex=>{
                console.log('getPoolErr',ex)
                throw ex
            })
        }
    }
*/
    async getMaterial(number) {
        var strSql = "select fitemid id,fnumber number,fname name,fmodel model from t_icitemcore where fnumber='"+number+"'";
        var rst = await this.query(strSql)
        if(rst.recordset.length===0){
            return undefined
        }else{
            return rst.recordset[0]
        }
    }
/*
    getMaterial(number){
        return this.getPool().then(()=>{
            var strSql = "select fitemid id,fnumber number,fname name,fmodel model from t_icitemcore where fnumber='"+number+"'";
            return this.pool.query(strSql);
        }).then(result=>{
            if(result.recordset.length===0){
                return undefined
            }else{
                return result.recordset[0]
            }
        })
    }
*/
    async saveMaterial(id, val) {
        var strSql=util.format("sl_savematerial '%s','%s','%s','%s','%s'",val.number,val.name,val.model,val.type,val.unit)
        try{
            await this.query(strSql)
            console.log('saveMaterialSuccess', strSql)
            return id
        }catch(ex){
            console.log('saveMaterialErr', strSql)
            throw ex
        }
    }
/*
    saveMaterial(id, val){
        var strSql=util.format("sl_savematerial '%s','%s','%s','%s','%s'",val.number,val.name,val.model,val.type,val.unit)
        return this.getPool().then((rst)=>{
            return this.pool.query(strSql).then(()=>{
                console.log('saveMaterialSuccess', strSql)
                return id
            })
        }).catch(ex=>{
            console.log('saveMaterialErr', strSql)
            throw ex
        })
    }
*/
    async getBom(orderNo,materialNo){
        var strSql=util.format("select bomid id,orderNo,prodCode materialNo,unit,qty,rate from BomHead where orderNo='%s' and prodCode='%s'", orderNo,materialNo)
        var rst = await this.query(strSql)
        if(rst.recordset.length===0){
            return undefined
        }else{
            return result.recordset[0]
        }
    }
/*
    getBom(orderNo,materialNo){
        return this.getPool().then(()=>{
            var strSql=util.format("select bomid id,orderNo,prodCode materialNo,unit,qty,rate from BomHead where orderNo='%s' and prodCode='%s'", orderNo,materialNo)
            return this.pool.query(strSql).then(rst=>{
                if(rst.recordset.length===0){
                    return undefined
                }else{
                    return result.recordset[0]
                }
            })
        })
    }
*/
    // MaterialNo,Unit,Qty
    //      MaterialNo,Unit,Qty
    //          MaterialNo,Unit,Qty
    //      materialNo,Unit,Qty
    async saveBom(id, val){
        var strSql = util.format("SL_SaveBom '%s'", JSON.stringify(val))
        try{
            await this.query(strSql)
            console.log('saveBomSuccess', strSql)
            return id
        }catch(ex){
            console.log('saveBom', strSql)
            throw ex
        }
    }
/*
    saveBom(id, val){
        var strSql = util.format("SL_SaveBom '%s'", JSON.stringify(val))
        return this.getPool().then(()=>{
            return this.pool.query(strSql).then(()=>{
                console.log('saveBomSuccess', strSql)
                return id
            })
        }).then(()=>{
            return id
        }).catch(ex=>{
            console.log('saveBom', strSql)
            throw ex
        })
    }
*/
    async getSaleOrder(){
        var strSql="select top 10 * from seorder"
        var result = await this.pool.query(strSql)
        return result.recordset
    }
/*
    getSaleOrder(){
        return this.getPool().then(()=>{
            var strSql="select top 10 * from seorder"
            return this.pool.query(strSql)
        }).then(result=>{
            return result.recordset
        })
    }
*/
    async saveSaleOrder(id, val) {
        var strSql=util.format("SL_SaveSaleOrder '%s'",JSON.stringify(val))
        try{
            this.query(strSql)
            console.log('saveSaleOrderSuccess', strSql)
            return id
        }catch(ex){
            console.log('saveSaleOrder', strSql)
            throw ex
        }
    }
/*
    saveSaleOrder(id, val) {
        var strSql=util.format("SL_SaveSaleOrder '%s'",JSON.stringify(val))
        return this.getPool().then((rst)=>{
            return this.pool.query(strSql).then(()=>{
                console.log('saveSaleOrderSuccess', strSql)
                return id
            })
        }).then(()=>{
            return id
        }).catch(ex=>{
            console.log('saveSaleOrder', strSql)
            throw ex
        })
    }
*/
}

module.exports = k3