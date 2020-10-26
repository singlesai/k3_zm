"use strict";
Object.defineProperty(exports, "__esModule", {value:true});

var zm = require('./mid/index')
var k3 = require('./k3/index')

var zmApi = new zm()
var k3Api = new k3()

class sync {
    constructor(options){

    }

    async syncOneMaterial(id, val){
        try{
            await k3Api.saveMaterial(id,val)
            await zmApi.MaterialRet(id, 'S', '')
        }catch(ex){
            await zmApi.MaterialRet(id, 'F', ex.message)
        }
    }

    async syncMaterial(){
        var zmMaterials = await zmApi.getMaterial()
        for(var idx in zmMaterials){
            var zmMaterial = zmMaterials[idx]
            await this.syncOneMaterial(zmMaterial.id, zmMaterial)
        }
    }

    async getMaterial(number){
        await this.syncMaterial()
        return await k3Api.getMaterial(number)
    }

    async syncOneBom(id, val){
        try{
            await k3Api.saveBom(id,val)
            await zmApi.BomRet(id, 'S', '')
        }catch(ex){
            await zmApi.BomRet(id, 'F', ex.message)
        }
    }

    async syncBom(){ //执行同步
        var boms = await zmApi.getBom()
        for(var idx in boms){
            var bom = boms[idx]
            await this.syncOneBom(bom.id, bom)
        }
    }

    async getBom(ordNo,number){
        await this.syncBom()
        return await k3Api.getBom(ordNo,number)
    }

    async syncOneSaleOrder(id, val){
        try{
            await k3Api.saveSaleOrder(id, val)
            await zmApi.SaleOrderRet(id, 'S', '')
        }catch(ex){
            await zmApi.SaleOrderRet(id, 'F', ex.message)
        }
    }

    async syncSaleOrder(){
        var ords = await zmApi.getSaleOrder()
        for(var idx in ords){
            var ord = ords[idx]
            await this.syncOneSaleOrder(ord.id, ord)
        }
    }
}

module.exports = sync