import $C from '@/common/config.js';
export default {
	common:{
		method: 'GET',
		header:{
			"content-type":"application/json"
		},
		data:{}
	},
	request(options = {}){
		
		options.url = $C.webUrl + options.url
		options.method = options.method || this.common.method
		options.header = options.header || this.common.header
		
		return uni.request(options)
	},
	get(url,data = {},options = {}){
		options.url = url
		options.data = data
		options.method = 'GET'
		return this.request(options)
	},
	post(url,data = {},options = {}){
		options.url = url
		options.data = data
		options.method = 'POST'
		return this.request(options)
	}
}