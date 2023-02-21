// Marshall-Cameras

const { InstanceBase, Regex, combineRgb, runEntrypoint, CompanionHTTPRequest, CompanionHTTPResponse } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const crypto = require('crypto')
const http = require('http')


class mCamInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.pollTimer = undefined
		this.pollCommands = ['camera', 'freedconfig', 'imaging', 'mped2ts', 'network', 'presetposition', 'ptzf', 'rtmp', 'srt', 'system', 'tally', 'user']

		this.requestCount = 0
		this.auth = {
			request_method: 'GET',
			auth_method: 'Digest',
			algorithm: 'MD5',
			qop: 'auth',
			realm: 'Secure',
			nonce: undefined
		}

		this.data = {
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

		this.init_api()
	}

	async init_api() {
		// this.updateStatus('connection_failure', 'Unable to connect')
		// clearInterval(this.pollTimer)
		
		await this.makeRequest('inquiry')
		let inq = await this.makeRequest('inquiry', [['inqjs', 'system']])
		if (inq.status == 200) {
			console.log('try: initCommunication()')
			this.initCommunication()
		}
	}

	initCommunication() {
		console.log("com1")
		// if (this.communicationInitiated !== true) {
		// 	this.initPolling()
		// 	this.updateStatus('ok')

		// 	this.communicationInitiated = true
		// 	console.log("com2")
		// }		
	}

	// initPolling() {
	// 	if (this.pollTimer === undefined && this.config.pollInterval > 0) {
	// 		let parameters = []
	// 		this.pollCommands.forEach((command) => {
	// 			parameters.push(['inqjs', command])
	// 		})
	// 		this.pollTimer = setInterval(() => {
	// 			this.sendPollCommands(parameters)
	// 		}, this.config.pollInterval)
	// 	}
	// }

	// sendPollCommands(parameters) {
	// 	this.makeRequest('inquiry', parameters)
	// 	.then((res) => {
	// 		console.log(res.status)
	// 	})
	// }

	getAuth(auth_str) {
		this.auth.auth_method = auth_str.slice(0, auth_str.indexOf(' '))
		auth_str.replace(`${this.auth.auth_method} `, '').split(', ').forEach((parameter) => {
			let [key, value] = parameter.split('=')
			this.auth[key] = value.replaceAll('"', '')
		})
		return this.auth
	}

	parseInqjs(data) {
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
			Object.assign(output, {[name]: value})
		})
		return output
	}

	makeRequest(endpoint, parameters=[]) {
		this.requestCount += 1
		let nc = this.requestCount
		let uri = `/command/${endpoint}.cgi?`
		let headers = {
			Connection: 'keep-alive',
			Authorization: ''
		}

		parameters.forEach(([key, value]) => {
			uri += `${key}=${value}&`
		})
		uri = uri.slice(0,-1)

		if (this.auth.nonce != undefined) {
			const HA1 = crypto.createHash('md5').update(`${this.config.username}:${this.auth.realm}:${this.config.password}`).digest('hex')
			const HA2 = crypto.createHash('md5').update(`${this.auth.request_method}:${uri}`).digest('hex')
			const cnonce = crypto.createHash('sha1').update(nc + this.auth.nonce + Date.now()).digest('hex').slice(-16)
			const RESP = crypto.createHash('md5').update(`${HA1}:${this.auth.nonce}:${('0000000' + nc).slice(-8)}:${cnonce}:${this.auth.qop}:${HA2}`).digest('hex')
			
			Object.assign(headers, {
				Authorization: `${this.auth.auth_method} username="${this.config.username}", realm="${this.auth.realm}", nonce="${this.auth.nonce}", uri="${uri}", algorithm=${this.auth.algorithm}, response="${RESP}", qop=${this.auth.qop}, nc=${('0000000' + nc).slice(-8)}, cnonce="${cnonce}"`
			})
		}

		return new Promise ((resolve, reject) => {
			http.get('http://' + this.config.host + uri, {headers: headers}, res => {
				res.on('error', err => {
					console.log("ERROR")
					resolve({response: false, status: res.statusCode, data: {error: err}})
				})

				if (this.auth.nonce == undefined && res.statusCode == 401 && 'www-authenticate' in res.headers) {
					this.requestCount -= 1
					resolve({response: true, status: res.statusCode, data: {auth: this.getAuth(res.headers['www-authenticate'])}})
				}
				else if (endpoint == 'inquiry') {
					let data = []

					res.on('data', chunk => {
						data.push(chunk)
					})
					res.on('end', () => {
						resolve({response: true, status: res.statusCode, data: {[endpoint]: this.parseInqjs(Buffer.concat(data).toString())}})
					})
				}
				else {
					res.on('end', () => {
						resolve({response: true, status: res.statusCode, data: {}})
					})
				}
			})
		})
	}


	initCommunication() {
		if (this.communicationInitiated !== true) {
			this.initPolling()
			this.updateStatus('ok')

			this.communicationInitiated = true;
		}		
	}

	sendCommand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.isConnected) {
				this.cmdPipe.push(cmd)

				if(this.cmdPipe.length === 1) {
					this.socket.send(this.CONTROL_STX + cmd + ';')
				}
			} else {
				this.log('error', 'Network error: Connection to Device not opened.')
				clearInterval(this.pollTimer);
			}
		}
	}

	initPolling() {
		if (this.pollTimer === undefined && this.config.pollInterval > 0) {
			this.pollTimer = setInterval(() => {
				this.sendPollCommands(this.pollCommands)
			}, this.config.pollInterval)
		}
	}

	sendPollCommands(pollCmds=[]) {
		if (this.socket !== undefined && this.socket.isConnected) {
			let cmdStr;
			pollCmds.forEach((cmd) => {
				if (cmd == 'QAX' && this.data.audio_next) { //catch QAX command to add parameter
					cmd = cmd + ':' + (this.data.audio_index + 1)
					this.data.audio_next = false
				}
				else if (cmd == 'QSX' && this.data.still_next) { //catch QSX command to add parameter
					cmd = cmd + ':' + (this.data.still_index + 1)
					this.data.still_next = false
				}
				else if (cmd == 'QNC' && this.data.selected_playlist >= 0 && this.data.selected_playlist <= 8) { //catch QNC command to add parameter
					cmd = cmd + ':' + this.data.selected_playlist
				}
				else if (['QAX', 'QSX', 'QNC'].includes(cmd)) {
					return
				}
				if (cmdStr == undefined) {
					cmdStr = this.CONTROL_STX + cmd + ';';
				}
				else {
					cmdStr = cmdStr + this.CONTROL_STX + cmd + ';'; //chain all poll commands together to only make a single request for all
				}
			});
			if (pollCmds.length > 0) {
				this.socket.send(cmdStr);
			}
			else {
				console.log('No commands for polling!')
			}
		}
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
				default: 250,
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
		let actions = {
			recording: {
				name: 'Start/Stop Recording',
				options: [
					{
						type: 'dropdown',
						label: 'Mode',
						id: 'mode',
						default: 'TOG',
						choices: [
							{'id': 'TOG', 'label': 'Toggle'},
							{'id': 'REC', 'label': 'Start'},
							{'id': 'RES', 'label': 'Stop'}
						]
					},
				],
				callback: async (event) => {
					if (event.options.mode == 'TOG') {
						if (this.data.recording) {
							this.sendCommand('RES')
						}
						else {
							this.sendCommand('REC')
						}
					}
					else {
						this.sendCommand(event.options.mode)
					}
				},
			}
		}
		this.setActionDefinitions(actions)
	}

	initFeedbacks() {
		let feedbacks = {
			project_open: {
				type: 'boolean',
				name: 'Unit has an Open Project',
				description: 'Show feedback for Open Project state',
				options: [
				],
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 255)
				},
				callback: (event) => {
					if (this.data.project_open == true) {
						return true
					}
					return false
				},
			}
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	initVariables() {
		let variables = []

		variables.push({variableId: 'product', name: 'Product Name'})

		this.setVariableDefinitions(variables)

		this.setVariableValues({
			product: '',
		})
	}

	initPresets() {
		let presets = [
			{
				category: 'Control',
				name: 'Play/Pause',
				type: 'button',
				style: {
					text: 'Play',
					size: '24',
					color: combineRgb(255,255,255),
					bgcolor: combineRgb(51,0,0)
				},
				steps: [
					{
						down: [
							{
								actionId: 'playback',
								options: {mode: 'TOG'}
							}
						]
					}
				],
				feedbacks: [
					{
						feedbackId: 'playing',
						style: {
							text: "Pause",
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0)
						}
					}
				]
			}
		]

		this.setPresetDefinitions(presets)
	}
}

runEntrypoint(mCamInstance, UpgradeScripts)