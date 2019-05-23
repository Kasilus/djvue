<template>
  <v-card v-bind:class="{widget:!isProductionMode}" ma-1 flat style="background:transparent;">
    <v-toolbar dark card height="36px" :color="(!hasError)?'primary darken-1':'error darken-1'" v-if="!isProductionMode">
      <v-tooltip top>
        <v-avatar class="handle" size="32" tile slot="activator">
          <v-icon>{{config.icon}}</v-icon>
        </v-avatar>
        <span>{{config.type}}</span>
      </v-tooltip>
      <v-toolbar-title class="body-2 white--text">{{config.id}} "{{config.name}}"</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn slot="activator" dark icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="collapsed = !collapsed">
            <v-list-tile-title>{{(collapsed) ? "Expand" : "Collapse"}}</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click.stop="configure()">
            <v-list-tile-title>Edit options...</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="cloneWidget()">
            <v-list-tile-title>Clone</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="deleteWidget()">
            <v-list-tile-title>Delete</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    
      <component v-if="config.type" style="width:100%" v-bind:is="config.type" ref="instance" :config="config" @init="onInit"></component>
      <h4 v-else class="error--text"> Widget type not defined </h4>
   
  </v-card>
</template>
<script>
import components from "djvue/components/widgets/index.js"
import djvueMixin from "djvue/mixins/core/djvue.mixin.js"
import widgetMixin from "djvue/mixins/core/widget.mixin.js";

/**
 * Creating a component of widget.
 * */
export default {

  /**
   * Adding mixins to the holders that allow it:
   * 1. Save configuration (djvueMixin).
   * 2. Tune widget (widgetMixin).
   * */
  mixins: [djvueMixin, widgetMixin],

  name: "dj-widget",

  props: ["type", "holder"],

  components,

  data: () => {
    return {
      collapsed: false,
      hasError: false
    }
  },

  computed: {
    globalConfig() {
      // console.log(JSON.stringify(this.app.currentPage.holders[this.holder], null, "\t"))
      return _.find(this.app.currentPage.holders[this.holder].widgets, (item) => item.id == this.config.id)
    }
  },

  methods: {

    /**
     * Change the configuration of the current widget.
     * */
    configure() {
      this.$eventHub.emit("widget-reconfigure", this)
    },

    /**
     * Create a clone of the current widget.
     * */
    cloneWidget() {
      this.$eventHub.emit("widget-clone", this)
    },

    /**
     * Delete current widget.
     * */
    deleteWidget() {
      this.$eventHub.emit("widget-delete", this)
    },

    /**
     * Initialize a new child of the current widget.
     * */
    onInit(){
      this._updateConfig();
      this.onInitChild();
    }

  }

}

</script>
<style>
.widget {
  border: 1px solid #bbb !important;
}

.handle {
  cursor: pointer;
}

</style>
