<template>
  <div class="mb-1" :style="(display) ? 'border:1px solid #dedede;  background:white;' : '' ">
    <component 
      v-if="config && !disabled" 
      :is="config.question.type[(production) ? 'production' : 'design']" 
      :config="config" 
      :options="options" 
      :answer="answer" 
      :stat="stat" 
      @init="onInitChild" 
      @update:options="onOptionsUpdate" 
      @update:answer="onAnswerUpdate" 
      @extend:options="onOptionsExtend"
    ></component>
    <div v-else class="pa-3 warning--text font-weight-light subheading">
      Cannot display question. Swith to design mode and fix form.
    </div>  
  
<!-- <pre>
    {{JSON.stringify(options, null,"\t")}}
  </pre>
  <pre>
    {{JSON.stringify(config, null,"\t")}}
  </pre>    

 -->

  <!-- <pre v-if="answer" class="primary">
    {{JSON.stringify(answer, null,"\t")}}
  </pre>     -->

  </div>
  
</template>
<script>
import djvueMixin from "djvue/mixins/core/djvue.mixin.js";
import listenerMixin from "djvue/mixins/core/listener.mixin.js";
import components from "./parts/index.js"



export default {

  name: "question-widget",

  icon: "mdi-help-circle-outline",

  mixins: [djvueMixin, listenerMixin],

  components,
  computed: {
    production() {
      return this.isProductionMode
    }
  },

  methods: {
    onInitChild() {
      this.$emit("init")
    },

    onDelete() {
      this.emit("form-delete-question", this.config.id)
    },

    onOptionsUpdate(newOptions) {
      this.setNeedSave(true)
    },

    onAnswerUpdate() {
      this.emit("form-update-answer", this.answer)
    },

    onOptionsExtend() {
      this.emit("form-extend")
    }

  },


  props: ["config"],

  data: () => ({
    options: null,
    answer: null,
    stat: null,
    display: false,
    disabled: false
  }),

  created() {

    if (this.config.question.options) {
      this.emit("form-insert-question", {
        id: this.config.id,
        options: this.config.question.options
      })
      this.config.question.options = undefined
    }

    this.on({
      event: "question-set-options",
      callback: (questions) => {
        let founded = _.find(questions, q => q.id == this.config.id)
        this.options = (founded) ? founded.options : null
      },
      rule: () => true
    })

    this.on({
      event: "question-set-stat",
      callback: (stat) => {
        // console.log("SET STAT")
        let founded = _.find(stat.questions, q => q.id == this.config.id)
        // if (!this.stat){
          this.stat = (founded) ? JSON.parse(JSON.stringify(founded)) : null  
          // console.log("SET STAT",this.config.id, this.stat)  
        // }
      },
      rule: () => true
    })

    this.on({
      event: "question-set-answers",

      callback: (answers) => {
        // console.log("set answer", this.config.id, answers.map(a=>a.id))
        let founded = _.find(answers, a => a.id == this.config.id)
        // console.log("Founded", JSON.stringify(founded,null,"\t"))
        this.answer = (founded) ?
          founded :
          {
            id: this.config.id,
            type: this.config.question.type.title,
            data: JSON.parse(JSON.stringify(this.config.question.answer.data))
          }
      },
      rule: () => true
    })

    this.on({
      event: "question-access",
      callback: (value) => {
        this.display = value || !this.isProductionMode
      },
      rule: () => true
    })

    this.on({
      event: "question-set-disable",
      callback: (value) => {
        this.disabled = value
      },
      rule: () => true
    })

  },

  beforeDestroy() {
    this.off()
  }
}

</script>
