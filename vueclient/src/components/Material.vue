<template>
    <div class="Material">
        <el-container>
            <el-header>
                <el-form :inline="true">
                    <el-form-item label="未同步">
                        <el-switch v-model="unsync"></el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="filter" placeholder="过滤条件（客户，单号）" prefix-icon="el-icon-search"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="query()" type="primary">查询</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="sync()" type="primary">立即同步</el-button>
                    </el-form-item>
                </el-form>
            </el-header>
            <el-main>
                <el-table :data="data" style="width: 100%">
                    <el-table-coumn prop="orderDate" label="日期"></el-table-coumn>
                    <el-table-coumn prop="orderNo" label="订单编号"></el-table-coumn>
                </el-table>
                <table  border="1">
                    <thead>
                        <tr>
                            <td>编号</td>
                            <td>名称</td>
                            <td>规格</td>
                            <td>属性</td>
                            <td>同步状态</td>
                            <td>同步信息</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="v in data">
                            <td>{{ v.materCode }}</td>
                            <td>{{ v.materName }}</td>
                            <td>{{v.spec}}</td>
                            <td>{{v.type}}</td>
                            <td>{{ v.k3_status }}</td>
                            <td>{{ v.k3_info }}</td>
                            <td><el-button v-if="v.k3_status!='S'" @click=reSync(v.materCode) type="primary">重新同步</el-button><el-button v-if="v.k3_status!='S'" @click=lostSync(v.materCode) type="primary">放弃同步</el-button></td>
                        </tr>
                    </tbody>
                </table>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import axios from 'axios'
    export default {
        data() {
            return {
                unsync: true,
                filter: '',
                data: []
            }
        },
        methods: {
            query() {
                console.log('unsync', this.unsync, 'filter', this.filter)
                axios.get('/material?unsync='+this.unsync+'&filter='+this.filter+'').then(rst=>{
                    var arr = []
                    for(var idx in rst.data){
                        arr.push(rst.data[idx])
                    }
                    this.data = rst.data
                    console.log('rst', this.data)
                })
            },
            sync() {
                axios.get('/testmaterial').then(()=>{
                    this.query()
                })
            },
            reSync(number) {
                axios.get('/resyncmaterial?id='+number+'').then(()=>{
                    this.query()
                })
            },
            loseSync(number) {
                axios.get('/losesyncmaterial?id='+number+'').then(()=>{
                    this.query()
                })
            }
        }
    }
</script>