<template>

  <v-data-table
    :headers="table.headers"
    :items="table.rows"
    :hide-actions="table.rows.length < 5"
    style="border:1px solid #dedede;"
  >
    
    <template slot="items" slot-scope="props">
      <td :class="{'text-xs-right':(index > 0) }" v-for="(col, index) in table.headers" :style="cellStyle(col.value, props.index, props.item[col.value], props.item)">
          {{props.item[col.value]}}
      </td>
    </template>
  </v-data-table>

  
</template>


<script>

  import djvueMixin from "djvue/mixins/core/djvue.mixin.js";
  import listenerMixin from "djvue/mixins/core/listener.mixin.js";
  import dataTableConfigDialog from "./data-table-config.vue";

  Vue.prototype.$dialog.component('dataTableConfigDialog', dataTableConfigDialog)
  
   
 export default  {
    
    name:"data-table-widget",

    icon: "mdi-grid",

    mixins:[djvueMixin, listenerMixin],


    methods:{
      
      cellStyle( field, row, value, item ){
        if(!this.config.options.useColors) return ""
        if (!this.colors) return ""   
        if (!_.isNumber(value)) return "" 
            
        if (this.config.options.colorMode == "row"){
          let values = _.values(item).filter(d => _.isNumber(d))
          let range = [_.min(values),_.max(values)]
          return "background:" + tinycolor(
            this.colors[Math.trunc(this.colors.length*(value-range[0])/(range[1]-range[0] + 0.00000000001))]
          ).setAlpha(0.5).toRgbString()
        }  

        if (this.config.options.colorMode == "column"){
          let range = this.ranges[field]
          if(!range) return ""
          return "background:" + tinycolor(
            this.colors[Math.trunc(this.colors.length*(value-range[0])/(range[1]-range[0] + 0.00000000001))]
          ).setAlpha(0.5).toRgbString()
        }  

        if (this.config.options.colorMode == "table"){
          let range = this.ranges
          if(!range) return ""
          return "background:" + tinycolor(
            this.colors[Math.trunc(this.colors.length*(value-range[0])/(range[1]-range[0] + 0.00000000001))]
          ).setAlpha(0.5).toRgbString()
        }  
    
      },

      onUpdate ({data, options}) {
        this.data = data.dataset.source;
        let temp = {
          headers: data.dataset.dimensions.map( item => ({
              text: item,
              align: 'center',
              value: item
          })),
          rows: this.data

        }
        this.table = temp
        
        if(!this.config.options.useColors) {
          this.ranges = null
          return
        }

        this.colors = JSON.parse(JSON.stringify(this.config.options.palette.color))
        if(this.config.options.palette.isReverse) this.colors.reverse()
            
        if (this.config.options.colorMode == "row") return
        
        if (this.config.options.colorMode == "column"){
          this.ranges = {}
          this.table.headers.forEach( h => {
              let values = this.table.rows.map( r => r[h.value])
              if((values.length > 0) && _.isNumber(values[0]))
              this.ranges[h.value]  = [_.min(values),_.max(values)]
          })
          return
        }

        if (this.config.options.colorMode == "table"){
          let values = [];
          this.table.headers.forEach( h => {
              let v = this.table.rows.map( r => r[h.value])
              if((v.length > 0) && _.isNumber(v[0]))
              values  =values.concat(v)
          })
          this.ranges  = [_.min(values),_.max(values)]
          return
        }

      },

      onReconfigure (widgetConfig) {
       return this.$dialog.showAndWait(dataTableConfigDialog, {config:widgetConfig})
      },

      // onError (error) {
      //   this.template = `<div style="color:red; font-weight:bold;">${error.toString()}</div>`;
      // },

      onDataSelect (emitter, data) {
        
        let temp = {
          headers: this.table.headers,
          rows: this.data.filter( item => {
            let d = _.find(data.selection, t => t.entity == item[data.mapper])
            if(!d) return false;
            return d.selected
          })

        }
        this.table = temp
      }

    },

    
    props:["config"],

    

    created(){ 
      this.data = this.config.data.embedded.dataset.source;
      let temp = {
        headers: this.config.data.embedded.dataset.dimensions.map( item => ({
            text: item,
            align: 'center',
            value: item
        })),
        rows: this.data

      }
      this.table = temp
    },

    mounted(){ 
      this.$emit("init") 
    },
    
    data: () =>({
      table:{},
      data:[],
      ranges:null,
      colors:null
    })
  }

</script> 

<style scoped>
  
  table.v-table tbody td, table.v-table tbody th {
      height: 2em;
  }
    
</style>

