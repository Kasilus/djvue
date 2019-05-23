<template>
  <div>
    <component :is="layout" :options="options"></component>
  </div>
</template>
<script>
import layouts from "djvue/components/layouts/index.js"
import mixin from "djvue/mixins/core/djvue.mixin.js"

/**
 * Creating a component of page.
 * */
export default {

  mixins: [mixin],
  components: layouts,

  props: {
    type: {
      default: "layout-1-2"
    },
    "options": {}
  },

  data: () => ({
    layout: "empty"
  }),

  watch: {
    /**
     * Sets the transition from one page to another.
     *
     * @param to The page to go to.
     * @param from The page from which the transition will be.
     * */
    '$route'(to, from) {
      this.setCurrentPage(this.getPage(this.$route.params.page))
      this.layout = "empty"
      this.$nextTick(() => {
        this.layout = this.getPage(this.$route.params.page).layout
      })
    }
  },

  /**
   * Actions after page refresh.
   * */
  updated() {
    window.document.title = `${this.appName}${(this.getPage(this.$route.params.page).title?"-":"")}${this.getPage(this.$route.params.page).title || ""}`
  },

  /**
   * Actions after page creation.
   * */
  created() {
    // console.log(this.$route)
    this.setCurrentPage(this.getPage(this.$route.params.page))
    this.layout = this.getPage(this.$route.params.page).layout
    // console.log("currentPage", this.app.currentPage)  
  }

}

</script>
