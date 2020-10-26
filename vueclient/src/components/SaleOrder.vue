<template>
    <div class="SaleOrder">
        <el-container>
            <el-header>
                <el-form :inline="true">
                    <el-form-item label="未同步">
                        <el-switch v-model="unsync"></el-switch>
                    </el-form-item>
                    <el-form-item label="从">
                        <el-date-picker v-model="begDate" placeholder="开始日期" suffix-icon="el-icon-date"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="到">
                        <el-date-picker v-model="endDate" placeholder="截止日期" suffix-icon="el-icon-date"></el-date-picker>
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
                            <td>id</td>
                            <td>日期</td>
                            <td>订单编号</td>
                            <td>同步状态</td>
                            <td>同步信息</td>
                            <td>同步时间</td>
                            <td>操作</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="v in data">
                            <td>{{ v.orderID }}</td>
                            <td>{{ v.orderDate }}</td>
                            <td>{{ v.orderNo }}</td>
                            <td>{{ v.syncStatus }}</td>
                            <td>{{ v.syncInfo }}</td>
                            <td>{{ v.syncTime }}</td>
                            <td><el-button v-if="v.syncStatus!='S'" @click=reSync(v.orderID) type="primary">重新同步</el-button><el-button v-if="v.syncStatus!='S'" @click=lostSync(v.materCode) type="primary">放弃同步</el-button></td>
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
                begDate: null,
                endDate: null,
                filter: '',
                data: []
            }
        },
        methods: {
            query() {
                console.log('unsync', this.unsync, 'begDate', this.begDate, 'endDate', this.endDate, 'filter', this.filter)
                axios.get('/saleorder?unsync='+this.unsync+'&beg='+this.begDate+'&end='+this.endDate+'&filter='+this.filter+'').then(rst=>{
                    var arr = []
                    for(var idx in rst.data){
                        arr.push(rst.data[idx])
                    }
                    this.data = rst.data
                    console.log('rst', this.data)
                })
            },
            sync() {
                axios.get('/testsaleorder').then(()=>{
                    this.query()
                })
            },
            reSync(id) {
                axios.get('/resyncsaleorder?id='+id+'').then(()=>{
                    this.query()
                })
            },
            loseSync(id) {
                axios.get('/losesyncsaleorder?id='+id+'').then(()=>{
                    this.query()
                })
            }
        }
    }
</script>