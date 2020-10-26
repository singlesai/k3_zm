import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import SaleOrder from '@/components/SaleOrder'
import Material from '@/components/Material'
import Bom from '@/components/Bom'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/saleorder',
      name: 'SaleOrder',
      component: SaleOrder
    },
    {
      path: '/material',
      name: 'Material',
      component: Material
    },
    {
      path: '/bom',
      name: 'Bom',
      component: Bom
    }
  ]
})
