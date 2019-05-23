<template>
  
  <div class="app">
    <v-app>
    
      <dj-design-drawer></dj-design-drawer>

    
        <v-btn  v-if="( !isProductionMode && !designDrawer )"
                fab
                dark
                icon
                fixed
                top
                left
                small
                :color="(!isNeedSave)?'primary':'warning'"
               v-on:click="emit('design-drawer-show')"
        >
                 <v-icon>mdi-exit-to-app</v-icon>
        </v-btn>
    

      <v-tooltip top tag="div">
        <v-btn v-if="user.isOwner || user.isCollaborator"
                slot="activator"
                fab
                dark
                fixed
                bottom
                right
                small
                :color="(isProductionMode) ? 'primary' : 'success'"
                v-on:click.stop="switchMode()"
              >
                 <span class="white--text headline">{{(isProductionMode)?'D':'P'}}</span>
        </v-btn>
        <div>{{(isProductionMode)?'Switch to Design Mode':'Switch to Production Mode'}}</div>
      </v-tooltip>

      <v-content>
        <dj-skin></dj-skin>
      </v-content>

    </v-app>  
  </div>
</template>

<script>
import page from "djvue/components/core/page.vue"


import store from 'djvue/state/index.js'

import { portalPlugin, httpPlugin, djvuePlugin, cookiePlugin, eventhubPlugin, dpsPlugin } from "djvue/plugins/index.js"




import djvueMixin from "djvue/mixins/core/djvue.mixin.js"
import listenerMixin from "djvue/mixins/core/listener.mixin.js"
import availableWidgets from "djvue/components/widgets/index.js"
import ConfigDialogLayout from "djvue/components/core/ext//configDialogLayout.vue"

/**
 * Register plugins for global application configuration.
 * */
Vue.use(cookiePlugin)
Vue.use( portalPlugin, {baseURL:"../../../"})
Vue.use( dpsPlugin, {
  baseURL:dpsURL || "http://127.0.0.1:8098/",
  client: {user: user, app: appName}
});

Vue.use( httpPlugin)
Vue.use( djvuePlugin );
Vue.use( eventhubPlugin );



Vue.prototype.$dialog.layout('default', ConfigDialogLayout)

export default {
    
  mixins:[ djvueMixin, listenerMixin ],

  components: {
    "dj-skin": () => import("djvue/components/core/skin.vue"),
    "dj-design-drawer": () => import("djvue/components/core/design-drawer/design-drawer.vue")
  },

  data () {

    return {

      user,
      author,
      designDrawer: false
    }
  },

  computed:{
  },

  methods:{

    getPageInfo(page){
      if(!page) return {}
      if(!this.app.currentPage) return {}
        
      return {
        title: page.title,
        path:(page.id) ? '/'+page.id : '/',
        current: page.id == this.app.currentPage.id
      }  
    },

    loadAppList() {
      this.$portal
        .get('api/app/get-list')
        .then(response => {
          // console.log(response)
        })
    },

    fullReload(){
      this.$djvue.fullReload()
    },

    login(){
      this.$djvue.login()
    },

    switchMode(){
      // console.log("SWITCH MODE from ", this.app.mode)
      if(this.app.mode == 'production'){
        this.setMode('development')
        this.emit("design-drawer-show", this)
      } else {
        this.setMode('production')
        this.emit("design-drawer-hide", this)
      }

    },

    insertPage() {
      // this.pages.push({path:"/new", name:"NewPage", component:Bar})
      // this.$router.addRoutes(this.pages)
      
    },
    
    setupI18n(){
      let currentLocale = this.$cookie.get("currentLanguage") || "en";
      
      this.$i18n.setLocaleMessage("en", this.app.config.i18n.en);
      this.$i18n.setLocaleMessage("uk", this.app.config.i18n.uk);

      this.setLocale(currentLocale)

    }

  },

    
  created() {
    
    // this.$vuetify.theme.primary = '#009688'
    // this.$vuetify.theme.warning = '#FF5722'
    // this.$vuetify.theme.accent = '#00695C'
    
    if(this.app.config.theme){
      this.$vuetify.theme = this.app.config.theme
    }



    this.$router.addRoutes([
      {path:"/", component:page},
      {path:"/:page", component:page}
    ])
    
    this.on({
          event: "design-drawer-show", 
          callback: () => { this.designDrawer = true },
          rule: () => true  
        });

    this.on({
      event: "design-drawer-hide", 
      callback: () => { this.designDrawer = false },
      rule: () => true  
    });

    this.on({
      event: "page-start", 
      callback: () => { 
        let mode = Vue.cookie.get("mode")
        if(mode && mode == "development") this.switchMode();
        Vue.cookie.delete("mode")
      },
      rule: () => true
    })

    this.$router.beforeEach( (to, from, next) => {
      if(this.isNeedSave){
        this.$djvue.confirm({
          type:"warning",
          text:"App config not saved.",
          rejectText:"Keep page anyway",
          resolveText:"Save app config and keep page"

        })
        .then(()=> {
          this.saveAppConfig()
          next()
        })
        .catch(()=>{
          next()
        })
      } else {
        next()
      }  
        
    })

     window.onbeforeunload = (evt) => {
      
      let message = '111'

      if (this.isNeedSave) {
        if (typeof evt === "undefined") {
          evt = window.event;
        }
        if (evt) {
          evt.returnValue = message;
        }
        return message;
      }
    }
     


  },

  destroyed(){
    this.off()
  },


  mounted(){
    this.setupI18n()
  }

  // ,

  // beforeRouteLeave(to, from, next){

  //     const answer = window.confirm(`Вы хотите уйти? c ${from} to ${to} У вас есть несохранённые изменения!`)
  //     if (answer) {
  //       next()
  //     } else {
  //       next(false)
  //     }
  //  } 


}
</script>

