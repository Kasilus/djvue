
export default {
	data:() => ({
		subscriptions:{},
		coreEventHandlers:{}
	}),

	methods:{

	  /**
     * Registration of the event.
     *
     * @param event Event to be registered.
     * */
		_registerEvent (event) {
			if(!this.coreEventHandlers[event]) {
				this.coreEventHandlers[event] = (emitter,...args) => {
					let cb = this._getEventHandler(event, emitter);
					if(cb) cb(emitter, ...args)
				}
				this.$eventHub.on(event,this.coreEventHandlers[event])
			}
		},

    /**
     * Unsubscribe from the event.
     *
     * @param event The event to unsubscribe from.
     * */
		_unregisterEvent(event){
			if(this.coreEventHandlers[event]) {
				this.$eventHub.off(event, this.coreEventHandlers[event])
				this.coreEventHandlers[event] = undefined;
			}	
		},


    /**
     * Allows you to trigger an event.
     * */
		emit(event, ...args){
			return new Promise((resolve,reject) => {
				this.$eventHub.emit(event, ...args)
				resolve()	
			})
			 
		},

    /**
     * Allows you to subscribe to an event.
     * */
		on ({event, rule, callback}) {

			
			
			if(!this.subscriptions[event]) this._registerEvent(event)
			
			this.subscriptions[event] = this.subscriptions[event] || [];
			if( !callback ) return;

			let _rule = _.find(this.subscriptions[event], item => ((item.rule == rule) && (item.callback == callback)));
			if(!_rule) this.subscriptions[event].push( { rule: rule, callback: callback } )
		
		},

    /**
     * Allows you to unsubscribe from the event.
     * */
		off (...args) {

			let event, rule, callback;
			
			if(args.length > 0){
				if(_.isObject(args[0])) {
					event = args[0].event
					rule = args[0].rule
					callback = args[0].callback
				} else {
					event = args[0].event
					rule = args[2].rule
					callback = args[1]
				}
			}

						
			if(!event && !rule && !callback) {
				//off all listeners
				for(let i in this.subscriptions){
					this._unregisterEvent(i);
					this.subscriptions[i] = undefined;
				}
				return
			}

			if(!this.subscriptions[event]) return

			if(this.subscriptions[event] && rule) {
				// off listeners with this event and rule
				_.remove(this.subscriptions[event], item => item.rule == rule)
				if(this.subscriptions[event].length == 0) this._unregisterEvent(event)
				return
			}

			if(this.subscriptions[event] && !rule && callback) {
				// off listeners with this event and callback
				_.remove(this.subscriptions[event], item => item.callback == callback)
				if(this.subscriptions[event].length == 0) this._unregisterEvent(event)
				return
			}	

		},

    /**
     * Get event handler.
     *
     * @param event The event from which the handler will be received.
     * @param emitter ??? Calls events.
     * */
		_getEventHandler (event, emitter) {

			
			if(!this.subscriptions[event]) return
			
			if(this.subscriptions[event].length == 0 ) return

			let rule = _.find(this.subscriptions[event], item => {
				if( !item.rule ) return true;
				if ( _.isString(item.rule) ) return item.rule == emitter.config.id
				if ( _.isFunction(item.rule)) return item.rule( emitter )
				return false	
			})

			return ( rule ) ? rule.callback : undefined
		
		}

	}

}
