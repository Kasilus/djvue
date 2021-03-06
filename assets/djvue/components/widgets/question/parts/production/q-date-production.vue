<template>
  <div>
    <div v-if="!options || !answer" class="text-xs-center">
    </div>
    <v-card flat color="transparent" v-else>
      <v-container pa-2>
        
        <q-view v-if="isValid" :title="options.title" :note="options.note" :validation="isValid"></q-view>

        <v-tabs
          v-model="active"
          color="transparent"
        >
          <v-tab key="response" ripple>{{translate('Your_Response')}}</v-tab>
          <v-tab key="statistic" ripple v-if="options.showResponsesStat">{{translate('Report')}}</v-tab>

          <v-tab-item key="response" ripple>
            <v-container fluid grid-list-md pa-0>
              <v-layout row wrap v-if="options">
                <v-flex d-flex xs12 sm12 md8 lg5>
                  <v-date-picker
                        v-model="answer.data[0]"
                        full-width
                        landscape
                        class="mt-3 v-card--flat"
                        style="border: 1px solid #dedede;"
                        :locale="l"
                  ></v-date-picker>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
          <v-tab-item key="statistic" ripple v-if="options.showResponsesStat">
            <echart :options="statOptions" :height="height"></echart>
          </v-tab-item>
      </v-container>
    </v-card>
    </v-tabs>
    <!-- <pre>
        {{JSON.stringify(statOptions,null,"\t")}}
      </pre>
 -->
  </div>
</template>

<script>
import djvueMixin from "djvue/mixins/core/djvue.mixin.js";
import listenerMixin from "djvue/mixins/core/listener.mixin.js";
import statMixin from "../mixins/statistic.mixin.js"
import eventDynamic from "../../event-dynamic.js"
import i18nMixin from "djvue/mixins/core/widget-i18n.mixin.js";

import qView from "../../question-view.vue";


export default {

  mixins: [djvueMixin, listenerMixin, statMixin, i18nMixin],

  components: {
      "q-view": qView
  },

  props: ["config", "options", "answer", "stat"],

  computed: {

    isValid() {
      if (!this.options) return "Not configured"
      if (!this.answer) return "No response data"
      if (this.options.required && this.answer.data.length == 0) return this.translate("Validation_Error")
      return true
    }
  },



  methods: {

    calculateStat() {
      let s = this.stat.responses.filter(a => a)
      let stats = [];

      s.forEach(v => {
        stats = stats.concat(v)
      })

      let result = eventDynamic(stats); 

      if(!result) return {}

      let statOptions = {
        color:[this.$vuetify.theme.primary],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },

        xAxis: {
          type: 'category'
        },

        yAxis: {
          type: 'value'
        },

        series: [{
          name: '',
          type: 'bar',
          itemStyle:{
            opacity:0.5
          },
          data: []
        }]
      }

      statOptions.xAxis.data = result.map(r => r.title)
      statOptions.series[0].data = result.map(r => r.value)
      
      this.height = 250;
      return statOptions
    }

  },

  watch: {

    'answer.data': {
      handler(value, oldValue) {
        if (!oldValue) return
        if (this.answer && this.answer.valid != this.isValid) this.answer.valid = this.isValid;
        this.$emit("update:answer")
      },
      deep: true
    }

  },


  data: () => ({
    active: null,
    newAltTitle: null,
    selection: [],
    height: null,
    l: null,

    i18n: {
          en: {
            "Your_Response": "Your Response",
            "Report": "Report",
            "Validation_Error": "No response for this question but it is required.",
            "Answer_not_configured": "Structure of answer not configured",
            "No_data_available": "No data available",
            "Alt_label": 'Type your response and press "Enter"'
          },

          uk: {
            "Your_Response": "Ваша відповідь",
            "Report": "Звіт",
            "Validation_Error": "Відсутня відповідь на обов'язкове запитання.",
            "Answer_not_configured": "Структура відповіді не визначена",
            "No_data_available": "Дані відсутні",
            "Alt_label": 'Надрукуйте Вашу відповідь та натисніть "Enter"'
          }
        }
  }),

  mounted() { 
    // this.l = (this.$i18n.locale == "uk") ? "ua-uk" : null  
    this.$emit("init") 
  }
}

</script>
</style>
