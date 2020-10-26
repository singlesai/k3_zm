<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>同步状态查询</h2>
    <ul>
      <li>
        <a
          href="./#/material"
          target="_blank"
        >
          物料
        </a>
      </li>
      <li>
        <a
          href="./#/saleorder"
          target="_blank"
        >
          订单
        </a>
      </li>
      <li>
        <a
          href="./#/bom"
          target="_blank"
        >
          bom
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: '尚高对接',
  data () {
    return {
      msg: '尚高对接'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
