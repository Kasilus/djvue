<template>
	<v-layout column wrap pa-2>

          <v-flex>
            <v-text-field
              :value="config.id"
              label="Widget Id"
              disabled
            ></v-text-field>
          </v-flex>

          <v-flex>
            <v-text-field
              v-model="config.name"
              label="Name"
            ></v-text-field>
          </v-flex>

          <v-switch
            label="Use colors"
            v-model="config.options.useColors"
            color="primary"
          ></v-switch>

          <v-combobox
            v-model="config.options.colorMode"
            :items="['row', 'column', 'table']"
            label="Use colors for"
          ></v-combobox>

          <v-flex xs12 md8>
            <palette-picker :value = "config.options.palette" @change="onChangePalette"></palette-picker>
          </v-flex>


     </v-layout>      
</template>	

<script>
import palettePicker from "djvue/components/core/ext/palette-picker.vue"
	export default {
		name:"name-editor",
		props:["config"],
    methods:{
      onChangePalette(value){
        this.config.options.palette = value
      }
    },
    components:{
      "palette-picker": palettePicker
    }
	}
</script>