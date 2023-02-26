// Marshall-Cameras

const { InstanceBase, Regex, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const getActions = require('./actions')
const getFeedbacks = require('./feedbacks')
const getPresets = require('./presets')
const crypto = require('crypto')
const http = require('http')



class mCamInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.pollTimer = undefined
		this.pollCommands = [
			'camera',
			'freedconfig',
			'imaging',
			'mped2ts',
			'network',
			'presetposition',
			'ptzf',
			'rtmp',
			'srt',
			'system',
			'tally',
			'user'
		]

		this.connTimer = undefined
		this.error = false
		this.requestTimeout = 1000

		this.iFrameMapping = {
			stream1: {
				'59.94': {1: 60, 0.5: 30, 0.25: 15, 0.16: 10},
				'50': {1: 50, 0.5: 25},
				'29.97': {1: 30, 0.5: 15, 0.33: 10},
				'25': {1: 25}
			},
			stream2: {
				'59.94': {1: 60, 0.5: 30, 0.25: 15, 0.16: 10},
				'50': {1: 50, 0.5: 25},
				'29.97': {1: 30, 0.5: 15, 0.33: 10},
				'25': {1: 25, 0.5: 13, 0.33: 12},
				'1080i_59.94': {0.25: 15},
				'1080i_50': {0.5: 15}
			},
			stream3: {
				'29.97': {1: 30, 0.5: 15, 0.33: 10},
				'25': {1: 25, 0.5: 13, 0.33: 12}
			},
		}

		this.data = {
			restartEvents: {
				camera: false,
				stream: false
			},
			selectedPresetAction: 'PresetCall',
			AudioDelay: '',
			AudioDelayTime: '',
			AudioIn: '',
			AudioInVolume: '',
			BitRate1: 0,
			BitRate2: 0,
			BitRate3: 0,
			CBR1: '',
			CBR2: '',
			CBR3: '',
			DZoomLimit: '',
			FocusMode: '',
			FrameRate1: '',
			FrameRate2: '',
			FrameRate3: '',
			HdmiColor: '',
			IFrameRatio1: '',
			IFrameRatio2: '',
			IFrameRatio3: '',
			ImageCodec1: '',
			ImageCodec2: '',
			ImageCodec3: '',
			ImageSize1: '',
			ImageSize2: '',
			ImageSize3: '',
			MicLineSelect: '',
			Mirror: '',
			OverlayTopLeftMode: '',
			OverlayTopRightMode: '',
			OutputSource: '',
			ModelName: '',
			Time: '',
			Uptime: '',
			AbsolutePTZF: '',
			CallMode: '',
			WhiteBalanceCrGain: '',
			WhiteBalanceCbGain: ''
		}

		this.restarts = {
			AudioIn: 'camera',
			BitRate1: 'stream',
			BitRate2: 'stream',
			BitRate3: 'stream',
			CBR1: 'stream',
			CBR2: 'stream',
			CBR3: 'stream',
			ImageSize2: 'stream',
			FrameRate2: 'stream',
			HdmiColor: 'camera',
			IFrameRatio1: 'stream',
			IFrameRatio2: 'stream',
			IFrameRatio3: 'stream',
			ImageCodec1: 'stream',
			ImageCodec2: 'stream',
			ImageCodec3: 'stream',
			OutputSource: 'camera',
		}
	}

	async destroy() {
		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
			delete this.pollTimer
		}
	}

	async init(config) {
		this.updateStatus('connecting')
		this.configUpdated(config)
	}

	async configUpdated(config) {
		// polling is running and polling has been de-selected by config change
		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
			delete this.pollTimer
		}
		this.config = config
		
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		console.log('Try to connect...')
		this.connTimer = setInterval(() => {
			this.init_api()
		}, 1000)
	}

	async init_api() {

		let parameters = []
		this.pollCommands.forEach((command) => {
			parameters.push(['inqjs', command])
		})

		const system = await this.makeRequest('inquiry', parameters)

		if (system.status == 200) {
			console.log('Connection succeeded!')
			if (this.connTimer !== undefined) {
				clearInterval(this.connTimer)
				delete this.connTimer
			}
			this.initCommunication()
		}
	}

	initCommunication() {
		if (this.communicationInitiated !== true) {
			this.initPolling()
			this.updateStatus('ok')

			this.communicationInitiated = true

			console.log('Instance ready to use!')
		}		
	}

	async errorCommunication(err) {
		if (!this.error) {
			console.log('error', err)
			this.error = true
			this.updateStatus(err.data.code)
			this.communicationInitiated = false
			if (this.pollTimer !== undefined) {
				clearInterval(this.pollTimer)
				delete this.pollTimer
			}
			console.log('Try to connect...')
			this.connTimer = setInterval(() => {
				this.init_api()
			}, 1000)
		}
	}

	initPolling() {
		if (this.pollTimer === undefined && this.config.pollInterval > 0) {
			let parameters = []
			this.pollCommands.forEach((command) => {
				parameters.push(['inqjs', command])
			})
			this.pollTimer = setInterval(() => {
				this.sendPollCommands(parameters)
			}, this.config.pollInterval)
		}
	}

	sendPollCommands(parameters) {
		this.makeRequest('inquiry', parameters) // request device info
		.then((res) => {
			if (res.status == 200) {
				if (this.error) {
					this.error = false
				}
				this.updateData(res.data.inquiry, this.data, [ // update from response
					'AudioDelay',
					'AudioDelayTime',
					'AudioIn',
					'AudioInVolume',
					'BitRate1',
					'BitRate2',
					'BitRate3',
					'CBR1',
					'CBR2',
					'CBR3',
					'DZoomLimit',
					'FocusMode',
					'FrameRate1',
					'FrameRate2',
					'FrameRate3',
					'HdmiColor',
					'IFrameRatio1',
					'IFrameRatio2',
					'IFrameRatio3',
					'ImageCodec1',
					'ImageCodec2',
					'ImageCodec3',
					'ImageSize1',
					'ImageSize2',
					'ImageSize3',
					'MicLineSelect',
					'Mirror',
					'OverlayTopLeftMode',
					'OverlayTopRightMode',
					'OutputSource',
					'ModelName',
					'Uptime',
					'AbsolutePTZF',
					'CallMode',
					'WhiteBalanceCrGain',
					'WhiteBalanceCbGain'
				])
			}
			else if (!res.response) {
				this.errorCommunication(res)
			}
		})
	}

	updateData(source, target, variables) {
		variables.forEach((variable) => { // update internal data object
			target[variable] = source[variable]
		})

		this.setVariableValues({ // update variables
			audio_in_delay_time: target.AudioDelayTime,
			audio_in_volume: target.AudioInVolume,
			stream1_bitrate: target.BitRate1,
			stream2_bitrate: target.BitRate2,
			stream3_bitrate: target.BitRate3,
			stream1_mode: (target.CBR1 == 'on') ? 'CBR' : 'VBR',
			stream2_mode: (target.CBR2 == 'on') ? 'CBR' : 'VBR',
			stream3_mode: (target.CBR3 == 'on') ? 'CBR' : 'VBR',
			digital_zoom_limit: target.DZoomLimit,
			focus_mode: target.FocusMode,
			stream1_frame_rate: target.FrameRate1,
			stream2_frame_rate: target.FrameRate2,
			stream3_frame_rate: target.FrameRate3,
			// stream1_keyframe_interval: target.IFrameRatio1,
			// stream2_keyframe_interval: target.IFrameRatio2,
			// stream3_keyframe_interval: target.IFrameRatio3,
			stream1_resolution: target.ImageSize1.replace(',', 'x'),
			stream2_resolution: target.ImageSize2.replace(',', 'x'),
			stream3_resolution: target.ImageSize3.replace(',', 'x'),
			audio_in_level: target.MicLineSelect,
			image_orientation: target.Mirror.replace('off', 'normal'),
			model: target.ModelName,
			uptime: target.Uptime,
			preset_call_mode: target.CallMode,
			red_gain: target.WhiteBalanceCrGain,
			blue_gain: target.WhiteBalanceCbGain
		})

		this.checkFeedbacks() // update feedbacks
	}

	getAuth(auth_str) { // parse auth-header for nonce an other info
		let auth = {request_method: 'GET'}
		Object.assign(auth, {auth_method: auth_str.slice(0, auth_str.indexOf(' '))})
		auth_str.replace(`${auth.auth_method} `, '').split(', ').forEach((parameter) => {
			let [key, value] = parameter.split('=')
			Object.assign(auth, {[key]: value.replaceAll('"', '')})
		})
		return auth
	}

	parseInqjs(data) { // parse response data
		let output = {}
		data.split('\r\n').slice(0,-1).forEach((item) => {
			item = item.slice(4)
			let name = item.slice(0,item.indexOf('='))
			let value = item.slice(item.indexOf('=')+1)
			if (value[0] == '"') {
				value = value.slice(1)
			}
			if (value.slice(-1) == '"') {
				value = value.slice(0,-1)
			}
			Object.assign(output, {[name]: value.trim()})
		})
		return output
	}

	async requestData(url, auth='', getData=false, wait=true) {

		return new Promise ((resolve) => {
			const req = http.get(url, {headers: {Connection: 'keep-alive', Authorization: auth}}) // new request

			if (wait) {
				req.on('socket', (socket) => { // wait for connection
					socket.setTimeout(this.requestTimeout, () => { // set request timeout
						req.destroy({
							status: 0,
							headers: {},
							data: {
								error: {
									type: 'request timeout',
									url: url
								}
							}
						})
					})
				})
			}

			req.on('error', (err) => { // process request errors
				resolve(err)
			})

			req.on('response', (res) => { // receiving response
				if (res.statusCode != 200 && !getData) {
					res.destroy({
						status: res.statusCode,
						headers: res.headers,
						data: {}
					})
				}
				else if (res.statusCode != 200) {
					res.destroy({
						status: res.statusCode,
						headers: {},
						data: {
							error: {
								type: 'authorization required',
								url: url
							}
						}
					})
				}
				else if (res.statusCode == 200 && getData) {
					let data = ''
					res.on('data', chunk => { // 
						data += chunk
					})

					res.on('end', () => {
						resolve({status: res.statusCode, data: {'inquiry': this.parseInqjs(data)}})
					})
				}
				else {
					res.destroy({
						status: res.statusCode,
						headers: {},
						data: {}
					})
				}

				// res.setTimeout(this.requestTimeout, () => { // set response timeout
				// 	res.destroy({
				// 		status: 0,
				// 		headers: {},
				// 		data: {
				// 			error: {
				// 				type: 'response timeout',
				// 				url: url
				// 			}
				// 		}
				// 	})
				// })

				res.on('error', (err) => { // process request errors
					resolve(err)
				})
			})
		})
	}

	createAuth(auth, uri) {
		const HA1 = crypto.createHash('md5').update(`${this.config.username}:${auth.realm}:${this.config.password}`).digest('hex') // create HA1 from 'user:realm:pass'
		const HA2 = crypto.createHash('md5').update(`${auth.request_method}:${uri}`).digest('hex') // create HA2 from 'request_method:uri'
		const cnonce = crypto.createHash('sha1').update(1 + auth.nonce + Date.now()).digest('hex').slice(-16) // create random and unique clinet-nonce
		const RESP = crypto.createHash('md5').update(`${HA1}:${auth.nonce}:00000001:${cnonce}:${auth.qop}:${HA2}`).digest('hex') // create response from 'HA1:nonce_count:cnonce:qop:HA2'
			
		return `${auth.auth_method} username="${this.config.username}", realm="${auth.realm}", nonce="${auth.nonce}", uri="${uri}", algorithm=${auth.algorithm}, response="${RESP}", qop=${auth.qop}, nc=00000001, cnonce="${cnonce}"`
	}

	async makeRequest(endpoint, parameters=[]) { // make a request and handle authentication

		let uri = `/command/${endpoint}.cgi?`

		let restarts = []
		parameters.forEach(([key, value]) => { // adding parameters to uri
			if (Object.keys(this.restarts).includes(key)) { // checking for restart events
				restarts.push(this.restarts[key])
			}
			uri += `${key}=${value}&`
		})
		uri = uri.slice(0,-1) // finalize uri

		if (restarts.length > 0) { // set start of restart event feedback
			for (let event of restarts) {
				if (this.data.restartEvents[event]) { // block actions if internal restarts happen
					return this.returRequest({
						status: 0,
						headers: {},
						data: {
							error: {
								type: `blocked by event "${event}"`,
								url: 'http://' + this.config.host + uri
							}
						}
					}, restarts)
				}
			}
			restarts.forEach((event) => {
				if (!this.data.restartEvents[event]) {
					this.data.restartEvents[event] = true
				}
			})
		}
		if (this.data.restartEvents.camera) { // change instance status when whole device is restarting
			this.updateStatus('camera restarting...')
		}

		const auth_req = await this.requestData('http://' + this.config.host + '/command/user.cgi') // request authentication data
		
		if (!auth_req.headers['www-authenticate']) { // return auth request if not successful
			return this.returRequest(auth_req, restarts)
		}

		const auth_data = this.createAuth(this.getAuth(auth_req.headers['www-authenticate']), uri) // create authentication string
		const data_req = await this.requestData('http://' + this.config.host + uri, auth_data, (endpoint == 'inquiry') ? true : false, (restarts.length == 0) ? true : false) // request data

		return this.returRequest(data_req, restarts)
	}

	returRequest(data, restarts) {
		if (restarts.length > 0) { // set end of restart event feedback
			restarts.forEach((event) => {
				this.data.restartEvents[event] = false
			})
		}
		if (this.data.restartEvents.camera == false && restarts.includes('camera')) { // change instance status when whole device has restarted
			this.updateStatus('ok')
		}
		return data
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to Marshall IP-Cameras',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				default: '',
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Polling Interval (ms), set to 0 to disable polling',
				min: 50,
				max: 1000,
				default: 200,
				width: 3,
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'User Name',
				width: 6,
				default: 'admin',
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				default: '9999',
			},
		]
	}

	initActions() {
		this.setActionDefinitions(getActions(this))
	}

	initFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	initVariables() {
		this.setVariableDefinitions([
			{variableId: 'audio_in_delay_time', name: 'Audio In Delay Time'},
			{variableId: 'audio_in_volume', name: 'Audio In Volume'},
			{variableId: 'stream1_bitrate', name: 'Stream1 Bitrate'},
			{variableId: 'stream2_bitrate', name: 'Stream2 Bitrate'},
			{variableId: 'stream3_bitrate', name: 'Stream3 Bitrate'},
			{variableId: 'stream1_mode', name: 'Stream1 Mode'},
			{variableId: 'stream2_mode', name: 'Stream2 Mode'},
			{variableId: 'stream3_mode', name: 'Stream3 Mode'},
			{variableId: 'digital_zoom_limit', name: 'Digital Zoom Limit'},
			{variableId: 'focus_mode', name: 'Focus Mode'},
			{variableId: 'stream1_frame_rate', name: 'Stream1 Frame Rate'},
			{variableId: 'stream2_frame_rate', name: 'Stream2 Frame Rate'},
			{variableId: 'stream3_frame_rate', name: 'Stream3 Frame Rate'},
			// {variableId: 'stream1_keyframe_interval', name: 'Stream1 Keyframe Interval'},
			// {variableId: 'stream2_keyframe_interval', name: 'Stream2 Keyframe Interval'},
			// {variableId: 'stream3_keyframe_interval', name: 'Stream3 Keyframe Interval'},
			{variableId: 'stream1_resolution', name: 'Stream1 Resolution'},
			{variableId: 'stream2_resolution', name: 'Stream2 Resolution'},
			{variableId: 'stream3_resolution', name: 'Stream3 Resolution'},
			{variableId: 'audio_in_level', name: 'Audio In Level'},
			{variableId: 'image_orientation', name: 'Image Orientation'},
			{variableId: 'model', name: 'Model Name'},
			{variableId: 'uptime', name: 'Uptime'},
			{variableId: 'preset_call_mode', name: 'Preset Call Mode'},
			{variableId: 'red_gain', name: 'Red Gain'},
			{variableId: 'blue_gain', name: 'Blue Gain'}
		])

		this.setVariableValues({
			audio_in_delay_time: 1,
			audio_in_volume: 0,
			stream1_bitrate: 0,
			stream2_bitrate: 0,
			stream3_bitrate: 0,
			stream1_mode: '',
			stream2_mode: '',
			stream3_mode: '',
			digital_zoom_limit: '',
			focus_mode: '',
			stream1_frame_rate: '',
			stream2_frame_rate: '',
			stream3_frame_rate: '',
			// stream1_keyframe_interval: '',
			// stream2_keyframe_interval: '',
			// stream3_keyframe_interval: '',
			stream1_resolution: '',
			stream2_resolution: '',
			stream3_resolution: '',
			audio_in_level: '',
			image_orientation: '',
			model: '',
			uptime: '',
			preset_call_mode: '',
			red_gain: '',
			blue_gain: '',
		})
	}

	initPresets() {
		this.setPresetDefinitions(getPresets())
	}
}

runEntrypoint(mCamInstance, UpgradeScripts)