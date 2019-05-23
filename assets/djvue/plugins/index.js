/**
 * Creating plugins for global application configuration.
 * */

// import * as Cookie from "modules/tiny-cookie/dist/tiny-cookie.js"
import dialogFactory from "djvue/components/core/ext/configDialog.js"
import djImg from "djvue/components/core/ext/dj-img.vue"

import warningDialog from "djvue/components/core/dialogs/warning.vue"
Vue.prototype.$dialog.component("warningDialog", warningDialog)

import confirmDialog from "djvue/components/core/dialogs/confirm.vue"
Vue.prototype.$dialog.component("confirmDialog", confirmDialog)


/**
 * Creating a plugin to manage cookies.
 * */
export var cookiePlugin = {
        /**
         * Adding a plugin to control cookies in the global scope
         * and scope of each instance.
         * */
        install: function (Vue) {
          // Добавляем данные в область видимости каждого экземпляра Vue. (но не в глобальную)
          Vue.prototype.$cookie = this;
          // Добавляем данные в глобальную область видимости.
          Vue.cookie = this;
        },
        /**
         * Adding a new cookie.
         *
         * @param name The name of the new cookie.
         * @param value The value of the new cookie.
         * @daysOrOptions Additional options for cookies. If specified by the number type,
         * they are defined as the number of days the cookie is valid.
         * */
        set: function (name, value, daysOrOptions) {
            var opts = daysOrOptions;
            if(Number.isInteger(daysOrOptions)) {
                opts = {expires: daysOrOptions};
            }
            return Cookie.set(name, value, opts);
        },

        /**
         * Adding a new cookie. Synonymous with the @see set method.
         *
         * @param name The name of the new cookie.
         * @param value The value of the new cookie.
         * @daysOrOptions Additional options for cookies. If specified by the number type,
         * they are defined as the number of days the cookie is valid.
         * */
        put: function (name, value, daysOrOptions) {
        		return this.set(name, value, daysOrOptions)
        },

        /**
         * Get cookie by name.
         *
         * @param name The name of the cookie that is being requested.
         * @return A cookie that matches the name.
         * */
        get: function (name) {
            return Cookie.get(name);
        },

        /**
         * Cookie removal.
         *
         * @param name The name of the cookie that is being deleted.
         * @param options Additional options of the cookie to be deleted.
         * */
        delete: function (name, options) {
            var opts = {expires: -1};
            if(options !== undefined) {
                opts = Object.assign(options, opts);
            }
            this.set(name, '', opts);
        }
    }


/**
 * Creating a plugin to manage the portal.
 * */
export var portalPlugin = {
  /**
   * Adding a plugin to manage the portal in the scope of each instance.
   * */
	install(Vue, options = {baseURL:"/"}) {
		Vue.prototype.$portal = axios.create(options)
	}
}

/**
 * Creating a plugin to manage HTTP.
 * */
export var httpPlugin = {
  /**
   * Adding a plugin to control HTTP in the scope of each instance.
   * */
    install(Vue, options) {
        Vue.prototype.$http = axios.create(options)
    }
}

/**
 * Creating a plug-in to manage interaction with DPS.
 * DPS = Data Processing Systems.
 * */
export var dpsPlugin = {
    /**
    * Adding a plug-in to manage the interaction with DPS in the scope of each instance.
    * */
    install(Vue, options) {
        let transport = axios.create(options);
        let url = "api/script"
        let client = options.client;
        let baseURL = options.baseURL;

        // client = {user: user, app: appName} from main page or from options
        // url from main page or from options

        Vue.prototype.$dps = {
            /**
             * Send the script to run on DPS.
             *
             * @param script Script to execute on DPS.
             * @param state ??? Current state.
             * @param file ???
             * */
            run: ({script,state,file}) => {
                if(!file){
                    return transport.post(
                        url,
                        {
                            client,
                            script,
                            state: { storage: state }
                        }
                    ).then( response => {
                        return {
                          type: response.data.type,
                          data: response.data.data
                        }
                      })
                } else {
                    let formData = new FormData();
                    formData.append("client",JSON.stringify(client))
                    formData.append("script",script)
                    formData.append("state",JSON.stringify({ storage: state }))
                    formData.append('file', file);
                    return transport.post(
                        url,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data'}}
                    )
                }    
            },
            call: this.run,
            /**
             * Get the base URL.
             *
             * @return Base URL.
             * */
            getBaseURL: () => baseURL,
            /**
             * Set new base URL value.
             *
             * @param value New base URL value.
             * */
            setBaseURL: (value) => {
                transport.defaults.baseURL = value
            }
        }

        Vue.component("dj-img", djImg)
    }
}



var findChild =  (component, filter, res) => {
                
                res = res || []
                 if (component.$children) {
				    res = res.concat(component.$children.filter(filter))
                    component.$children.forEach(child => {
							res = res.concat(findChild(child, filter))	
						}
					)
				}

				return res
}

var toTree = (object) =>
                
                    _.keys(object).map( key => {
                        return {
                            name: (_.isObject(object[key])) ? key: `${key}: ${object[key]}`,
                            children: (!_.isObject(object[key])) ? undefined : toTree(object[key]) 
                        }
                    })




/**
 * Creating a plugin to control the djvue application.
 * */
export var djvuePlugin = {
	install(Vue, options){
        
        Vue.createConfigDialog = (components) => dialogFactory(components)
        
		Vue.prototype.$djvue = {
			/**
       * Open or reload the page under a specific URL.
       *
       * @param url URL of the page to open or reload.
       * */
			fullReload: (url) => {
                if(url) {
                    window.location = url
                } else {
                    
                    window.location.reload()
                }    
            },

            /**
             * Login to the system.
             * */
            login: () => {
				Vue.cookie.set('redirectToUrl', window.location);
      			window.location = `/auth/google`;
			},

            /**
             * Create a random name.
             * */
            randomName: () => Math.random().toString(36).substring(2),
			
            findChild,
            
            toTree,

            /**
             * Expansion of the current behavior of the object.
             *
             * @param object The object to be expanded.
             * @param extention Extensions that need to expand the object.
             * */
            extend:( object, extention) => {
                
                return _.extend (object,JSON.parse(JSON.stringify(extention)))
                // return {...object,...JSON.parse(JSON.stringify(extention))}
            },

            createConfigDialog(components){
                return dialogFactory(components)
            },

            warning(options){
                options = options || {}
                options.text = options.text || "";
                options.type = options.type || "info";
                options.title = options.title || options.type;

                return Vue.prototype.$dialog.showAndWait(warningDialog, {options:options})
            },

            confirm(options){
                options = options || {}
                options.text = options.text || "";
                options.type = options.type || "info";
                options.title = options.title || options.type;

                return new Promise((resolve, reject) => {
                    Vue.prototype.$dialog.showAndWait(confirmDialog, {options:options})
                    .then(res => {
                        if ( res ) {
                            resolve()
                        } else {
                            reject()
                        }    
                    })    
                }) 
                
            },

            /**
             * Get the widget hierarchy.
             *
             * @param root The element that starts the search for widgets deep into.
             * @param filter Filter for selection of suitable widgets.
             *
             * @return Array The hierarchy of the selected widgets.
             * */
            selectWidgets(root, filter){
                return findChild(root, filter).filter(item => item.widgetWrapper)
            },

            /**
             * Read file.
             *
             * @param file The file from which you want to read.
             * @param encoding Encoding with which to read data from a file.
             * */
            loadLocalFile(file, encoding) {

                return new Promise((resolve, reject) => {
                  let fr = new FileReader();
                  fr.onload = (e) => {
                    resolve(e.target.result)
                  }
                  fr.readAsText(file, encoding);
                  // reader.readAsText(file, 'CP866');
                })

            },

            /**
             * Save object to file.
             *
             * @param fileName The new name for the file that will be saved.
             * @param object The object that will be written to the file before saving the latter.
             * */
            saveLocalFile(fileName,object) {
                
                if(!object) return;

                let a = document.createElement('a');
                a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(JSON.stringify(object, null,'\t')));
                a.setAttribute('download', fileName);
                a.click()

            }


		}


		
	}
}

/**
 * Концентратор всех событий, что будут приходить.
 * */
var eventHub={}

/**
 * Создание плагина для управления концентратором всех событий.
 * */
export var eventhubPlugin = {
	install(Vue, options){
		 eventHub = new Vue();
		 
		 Object.defineProperties(eventHub, {
            on: {
                get: function() {
                    return eventHub.$on
                }
            },
            emit: {
                get: function() {
                	return eventHub.$emit
                }
            },
            off: {
                get: function() {
                    return eventHub.$off
                }
            }
        });

        Object.defineProperty(Vue.prototype, '$eventHub', {
            get: function() {
                return eventHub;
            }
        });

        Object.defineProperty(Vue, 'eventHub', {
            get: function() {
                return eventHub;
            }
        });
	}	
}



