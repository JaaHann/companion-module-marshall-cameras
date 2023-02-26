// actions

function changeInfo(element, time='some') {
    return {
        type: 'static-text',
        id: 'info',
        label: `IMPORTANT: A change will restart internal ${element} components. This may take ${time} seconds and will disable ${element} related actions temporarily!`,
    }
}

function ndiInfo() {
    return {
        type: 'static-text',
        id: 'info',
        label: 'IMPORTANT: This action only works with NDI disabled and "Stream" selected as output!',
    }
}

function streamInfo() {
    return {
        type: 'static-text',
        id: 'info',
        label: 'IMPORTANT: This action only works when selected stream is enabled!',
    }
}

function cameraInfo() {
    return {
        type: 'static-text',
        id: 'info',
        label: `IMPORTANT: A change will restart the camera. This may take some seconds and will disable this instance temporarily!`,
    }
}

function toggle(source, target, options) {
    if (source == 'toggle') {
        source = (target == options[0]) ? options[1] : options[0]
    }
    return source
}

function cycle(source, target, options) {
    if (source == 'cycle') {
        let n = options.indexOf(target)+1
        if (n >= options.length) {
            n = 0
        }
        source = options[n]
    }
    return source
}



function getActions(inst) {
    return {

        // camera related actions
        camera_af_frame: {
            name: 'Camera: AF Frame',
            options: [
                {
                    type: 'dropdown',
                    label: 'Frame',
                    id: 'frame',
                    default: 'full',
                    choices: [
                        {'id': 'full', 'label': 'Full'},
                        {'id': 'center', 'label': 'Center'},
                        {'id': 'auto', 'label': 'Auto'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['AFFrame', event.options.frame]])
            }
        },
        camera_af_sensitivity: {
            name: 'Camera: AF Sensitivity',
            options: [
                {
                    type: 'dropdown',
                    label: 'Sensitivity',
                    id: 'sensitivity',
                    default: 'low',
                    choices: [
                        {'id': 'low', 'label': 'Low'},
                        {'id': 'middle', 'label': 'Middle'},
                        {'id': 'high', 'label': 'High'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['AFSensitivity', event.options.sensitivity]])
            }
        },
        camera_audio_in_codec: {
            name: 'Camera: Audio In Codec',
            options: [
                {
                    type: 'dropdown',
                    label: 'Codec',
                    id: 'codec',
                    default: 'aac_48k',
                    choices: [
                        {'id': 'aac_48k', 'label': 'AAC (48 kHz)'},
                        {'id': 'aac_44.1k', 'label': 'AAC (44.1 kHz)'},
                        {'id': 'aac_16k', 'label': 'AAC (16 kHz)'},
                        {'id': 'g711_16k', 'label': 'G711 (16 kHz)'},
                        {'id': 'g711_8k', 'label': 'G711 (8 kHz)'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['AudInCodec', event.options.codec]])
            }
        },
        camera_audio_in_delay: {
            name: 'Camera: Audio In Delay ON/OFF',
            options: [
                {
                    type: 'dropdown',
                    label: 'Delay',
                    id: 'delay',
                    default: 'on',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'on', 'label': 'Enable'},
                        {'id': 'off', 'label': 'Disable'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['AudioDelay', toggle(event.options.delay, inst.data.AudioDelay, ['on', 'off'])]])
            }
        },
        camera_audio_in_delay_time: {
            name: 'Camera: Audio In Delay Time',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    default: 'set',
                    choices: [
                        {'id': 'set', 'label': 'Set'},
                        {'id': 'inc', 'label': 'Increase'},
                        {'id': 'dec', 'label': 'Decrease'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Time (1 - 500)',
                    id: 'time',
                    default: 1,
                    min: 1,
                    max: 500
                }
            ],
            callback: async (event) => {
                if (event.options.mode != 'set') {
                    event.options.time = (event.options.mode == 'inc') ? parseInt(inst.data.AudioDelayTime)+event.options.time : parseInt(inst.data.AudioDelayTime)-event.options.time
                }

                inst.makeRequest('camera', [['AudioDelayTime', event.options.time]])
            }
        },
        camera_audio_in: {
            name: 'Camera: Audio In ON/OFF',
            options: [
                cameraInfo(),
                {
                    type: 'dropdown',
                    label: 'Input',
                    id: 'input',
                    default: 'on',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'on', 'label': 'Enable'},
                        {'id': 'off', 'label': 'Disable'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['AudioIn', toggle(event.options.input, inst.data.AudioIn, ['on', 'off'])]])
            }
        },
        camera_audio_in_volume: {
            name: 'Camera: Audio In Volume',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    default: 'set',
                    choices: [
                        {'id': 'set', 'label': 'Set'},
                        {'id': 'inc', 'label': 'Increase'},
                        {'id': 'dec', 'label': 'Decrease'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Volume (0 - 10)',
                    id: 'volume',
                    default: 1,
                    min: 0,
                    max: 10
                }
            ],
            callback: async (event) => {
                if (event.options.mode != 'set') {
                    event.options.volume = (event.options.mode == 'inc') ? parseInt(inst.data.AudioInVolume)+event.options.volume : parseInt(inst.data.AudioInVolume)-event.options.volume
                }

                inst.makeRequest('camera', [['AudioInVolume', event.options.volume]])
            }
        },
        camera_digital_zoom_limit: {
            name: 'Camera: Digital Zoom Limit',
            options: [
                {
                    type: 'dropdown',
                    label: 'Limit (2160p_5994/2160p_50 does NOT support this setting in hdmi+stream mode)',
                    id: 'limit',
                    default: 'x1',
                    choices: [
                        {'id': 'x1', 'label': 'x1'},
                        {'id': 'x2', 'label': 'x2'},
                        {'id': 'x3', 'label': 'x3'},
                        {'id': 'x4', 'label': 'x4'},
                        {'id': 'x5', 'label': 'x5'},
                        {'id': 'x6', 'label': 'x6'},
                        {'id': 'x7', 'label': 'x7'},
                        {'id': 'x8', 'label': 'x8'},
                        {'id': 'x9', 'label': 'x9'},
                        {'id': 'x10', 'label': 'x10'},
                        {'id': 'x11', 'label': 'x11'},
                        {'id': 'x12', 'label': 'x12'},
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['DZoomLimit', event.options.limit]])
            }
        },
        camera_focus_mode: {
            name: 'Camera: Focus Mode',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    default: 'manual',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'manual', 'label': 'Manual Focus'},
                        {'id': 'auto', 'label': 'Auto Focus'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['FocusMode', toggle(event.options.mode, inst.data.FocusMode, ['manual', 'auto'])]])
            }
        },
        camera_stream: {
            name: 'Camera: Streams ON/OFF',
            options: [
                changeInfo('stream', 'about 6'),
                {
                    type: 'dropdown',
                    label: 'Stream',
                    id: 'stream',
                    default: 1,
                    choices: [
                        {'id': 0, 'label': 'All'},
                        {'id': 1, 'label': 'Stream 1'},
                        {'id': 2, 'label': 'Stream 2'},
                        {'id': 3, 'label': 'Stream 3'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    default: 'on',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'on', 'label': 'Enable'},
                        {'id': 'off', 'label': 'Disable'}
                    ]
                }
            ],
            callback: async (event) => {
                let parameters = []
                let start = (event.options.stream > 0) ? event.options.stream : 1
                let end = (event.options.stream > 0) ? event.options.stream : 3
                for (event.options.stream = start; event.options.stream <= end; event.options.stream++) {
                    if (event.options.mode == 'on') {
                        parameters.push(['ImageCodec' + event.options.stream, (event.options.stream == 1) ? 'h265' : 'h264'])
                    }
                    else if (event.options.mode == 'toggle' && inst.data['ImageCodec' + event.options.stream] == 'off') {
                        parameters.push(['ImageCodec' + event.options.stream, (event.options.stream == 1) ? 'h265' : 'h264'])
                    }
                    else {
                        parameters.push(['ImageCodec' + event.options.stream, 'off'])
                    }
                }
                
                inst.makeRequest('camera', parameters)
            }
        },
        camera_stream_config: {
            name: 'Camera: Set Stream Config',
            options: [
                ndiInfo(),
                changeInfo('stream', 'about 20'),
                streamInfo(),
                {
                    type: 'dropdown',
                    label: 'Stream:',
                    id: 'stream',
                    default: 1,
                    choices: [
                        {'id': 1, 'label': 'Stream 1'},
                        {'id': 2, 'label': 'Stream 2'},
                        {'id': 3, 'label': 'Stream 3'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'ON/OFF: (disabling will ignore all following settings!)',
                    id: 'active',
                    default: 'on',
                    choices: [
                        {'id': null, 'label': 'Ingnore'},
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'on', 'label': 'Enable'},
                        {'id': 'off', 'label': 'Disable'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'Resolution: (stream2 only!)',
                    id: 'resolution',
                    default: '1920,1080',
                    choices: [
                        {'id': undefined, 'label': 'Ingnore'},
                        {'id': '1920,1080', 'label': 'FHD (1920x1080)'},
                        {'id': '1280,720', 'label': 'HD (1280x720)'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'Frame Rate: (stream2 only!)',
                    id: 'framerate',
                    default: 50,
                    choices: [
                        {'id': null, 'label': 'Ingnore'},
                        {'id': 59.94, 'label': '59.94'},
                        {'id': 50, 'label': '50'},
                        {'id': 29.97, 'label': '29.97'},
                        {'id': 25, 'label': '25'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Bit Rate: (Stream 1/2: 2000 - 20000 kBit/s | Stream 3: 512 - 5000 kBit/s, 0 = Ingnore)',
                    id: 'bitrate',
                    default: 5000,
                    min: 0,
                    max: 20000
                },
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    default: 'on',
                    choices: [
                        {'id': null, 'label': 'Ingnore'},
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'on', 'label': 'CBR'},
                        {'id': 'off', 'label': 'VBR'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'Keyframe Interval: (not all streams support every interval on every frame rate!)',
                    id: 'interval',
                    default: 1,
                    choices: [
                        {'id': null, 'label': 'Ingnore'},
                        {'id': 1, 'label': '1.0 Seconds'},
                        {'id': 0.5, 'label': '0.5 Seconds'},
                        {'id': 0.33, 'label': '0.33 Seconds'},
                        {'id': 0.25, 'label': '0.25 Seconds'},
                        {'id': 0.16, 'label': '0.16 Seconds'}
                    ]
                }
            ],
            callback: async (event) => {
                let parameters = []
                if (event.options.resolution !== null && event.options.stream == 2) { // add resolution to parameters if not ignored (stream2 only)
                    parameters.push(['ImageSize2', event.options.resolution])
                }
                if (event.options.framerate !== null && event.options.stream == 2) { // add frame rate to parameters if not ignored (stream2 only)
                    parameters.push(['FrameRate2', event.options.framerate]) 
                }
                if (event.options.bitrate >= 2000 && event.options.bitrate <= 20000) { // add bit rate to parameters if not ignored
                    parameters.push(['BitRate' + event.options.stream, event.options.bitrate])
                }
                if (event.options.mode !== null) { // add mode to parameters if not ignored
                    if (event.options.mode == 'toggle') {
                        parameters.push(['CBR' + event.options.stream, (inst.data.CBR2 == 'on') ? 'off' : 'on'])
                    }
                    else {
                        parameters.push(['CBR' + event.options.stream, event.options.mode])
                    }
                }
                if (event.options.interval !== null) { // try to add interval to parameters if not ignored
                    if (event.options.framerate !== null && event.options.stream == 2) { // set interval based on new frame rate
                        event.options.interval = inst.iFrameMapping.stream2[event.options.framerate][event.options.interval]
                    }
                    else { // set interval based on current frame rate
                        event.options.interval = inst.iFrameMapping.stream2[inst.data['FrameRate' + event.options.stream]][event.options.interval]
                    }
                    if (event.options.interval !== undefined) { // add interval to parameters if not undifined
                        parameters.push(['IFrameRatio2', event.options.interval])
                    }
                }
                if (event.options.active == 'on') {
                    parameters.push(['ImageCodec' + event.options.stream, (event.options.stream == 1) ? 'h265' : 'h264'])
                }
                else if (event.options.active == 'toggle' && inst.data['ImageCodec' + event.options.stream] == 'off') {
                    parameters.push(['ImageCodec' + event.options.stream, (event.options.stream == 1) ? 'h265' : 'h264'])
                }
                else if (event.options.active !== null) {
                    parameters = [['ImageCodec' + event.options.stream, 'off']]
                }
                if (parameters.length > 0) {
                    inst.makeRequest('camera', parameters)
                }
            }
        },
        camera_hdmi_color: {
            name: 'Camera: HDMI Format',
            options: [
                {
                    type: 'dropdown',
                    label: 'Format',
                    id: 'format',
                    default: 'yuv422',
                    choices: [
                        {'id': 'yuv420', 'label': 'YUV 420'},
                        {'id': 'yuv422', 'label': 'YUV 422'},
                        {'id': 'rgb', 'label': 'RGB'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['HdmiColor', event.options.format]])
            }
        },
        camera_init_position: {
            name: 'Camera: Set Startup Position',
            options: [
                {
                    type: 'dropdown',
                    label: 'Position',
                    id: 'position',
                    default: 'lastmem',
                    choices: [
                        {'id': 'lastmem', 'label': 'Last Position'},
                        {'id': '1stpreset', 'label': '1st Preset'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['InitPosition', event.options.position]])
            }
        },
        camera_audio_in_level: {
            name: 'Camera: Audio In Level',
            options: [
                {
                    type: 'dropdown',
                    label: 'Level',
                    id: 'level',
                    default: 'mic',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'mic', 'label': 'Mic'},
                        {'id': 'line', 'label': 'Line'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['MicLineSelect', toggle(event.options.level, inst.data.MicLineSelect, ['mic', 'line'])]])
            }
        },
        camera_mirror: {
            name: 'Camera: Image Orientation',
            options: [
                {
                    type: 'dropdown',
                    label: 'Orinetation:',
                    id: 'orientation',
                    default: 'off',
                    choices: [
                        {'id': 'cycle', 'label': 'Cycle'},
                        {'id': 'off', 'label': 'Normal'},
                        {'id': 'mirror', 'label': 'Mirror'},
                        {'id': 'flip', 'label': 'Flip'},
                        {'id': 'mirror+flip', 'label': 'Mirror & Flip'}
                    ]
                },
				{
					type: 'checkbox',
					label: 'Pan Correction:',
					id: 'pan',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'Tilt Correction:',
					id: 'tilt',
					default: true,
				}
            ],
            callback: async (event) => {
                event.options.orientation = cycle(event.options.orientation, inst.data.Mirror, ['off', 'mirror', 'flip', 'mirror+flip'])
                inst.makeRequest('camera', [
                    ['Mirror', event.options.orientation],
                    ['PanFlip', (!event.options.pan && event.options.orientation.includes('mirror')) ? 'on' : 'off'],
                    ['TiltFlip', (!event.options.tilt && event.options.orientation.includes('flip')) ? 'on' : 'off']
                ])
            }
        },
        camera_output_source: {
            name: 'Camera: Output Source',
            options: [
                cameraInfo(),
                {
                    type: 'dropdown',
                    label: 'Output',
                    id: 'output',
                    default: 'hdmi',
                    choices: [
                        {'id': 'hdmi', 'label': 'HDMI only'},
                        {'id': 'stream', 'label': 'Stream only'},
                        {'id': 'ndi', 'label': 'NDI only'},
                        {'id': 'hdmi+stream', 'label': 'HDMI + Stream'},
                        {'id': 'hdmi+ndi', 'label': 'HDMI + NDI'},
                        {'id': 'hdmi+uvc', 'label': 'HDMI + UVC (USB)'},
                    ]
                }
            ],
            callback: async (event) => {
                inst.makeRequest('camera', [['OutputSource', event.options.output]])
            }
        },
        camera_overlay: {
            name: 'Camera: Overlay',
            options: [
                {
                    type: 'dropdown',
                    label: 'Area:',
                    id: 'area',
                    default: 'both',
                    choices: [
                        {'id': 'both', 'label': 'Top Left & Right'},
                        {'id': 'OverlayTopLeft', 'label': 'Top Left'},
                        {'id': 'OverlayTopRight', 'label': 'Top Right'}
                    ]
                },
                {
                    type: 'dropdown',
                    label: 'Overlay:',
                    id: 'overlay',
                    default: 'off',
                    choices: [
                        {'id': 'off', 'label': 'Disable'},
                        {'id': 'daytime', 'label': 'Daytime'},
                        {'id': 'text', 'label': 'Text'}
                    ]
                },
                {
                    type: 'textinput',
                    label: 'Text:',
                    id: 'text',
                    default: ''
                }
                
            ],
            callback: async (event) => {
                let parameters = []
                if (event.options.area == 'both') {
                    parameters.push(['OverlayTopLeftMode', event.options.overlay])
                    parameters.push(['OverlayTopRightMode', event.options.overlay])
                }
                else {
                    parameters.push([event.options.area + 'Mode', event.options.overlay])
                }
                if (event.options.overlay == 'text') {
                    if (event.options.area == 'both') {
                        parameters.push(['OverlayTopLeftText', event.options.text])
                        parameters.push(['OverlayTopRightText', event.options.text])
                    }
                    else {
                        parameters.push([event.options.area + 'Text', event.options.text])
                    }
                }
                inst.makeRequest('camera', parameters)
            }
        },


        presets_select_actions: {
            name: 'Presets: Select Action',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    default: 'PresetCall',
                    choices: [
                        {'id': 'PresetCall', 'label': 'Call Preset'},
                        {'id': 'PresetSet', 'label': 'Set Preset'},
                        {'id': 'PresetClear', 'label': 'Clear Preset'}
                    ]
                }
            ],
            callback: async (event) => {
                inst.data.selectedPresetAction = event.options.mode
            },
        },
        presets_actions: {
            name: 'Presets: Call Action',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    default: 'PresetCall',
                    choices: [
                        {'id': 'PresetCall', 'label': 'Call Preset'},
                        {'id': 'PresetSet', 'label': 'Set Preset'},
                        {'id': 'PresetClear', 'label': 'Clear Preset'},
                        {'id': 'selected', 'label': 'Selected Action'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Number: (0 - 255)',
                    id: 'value',
                    default: 0,
                    min: 0,
                    max: 255
                }
            ],
            callback: async (event) => {
                inst.makeRequest('presetposition', [[(event.options.mode == 'selected') ? inst.data.selectedPresetAction : event.options.mode, event.options.value]])
            },
        },
        preset_call_mode: {
            name: 'Preset Call Mode',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    default: 'normal',
                    choices: [
                        {'id': 'toggle', 'label': 'Toggle'},
                        {'id': 'normal', 'label': 'Normal'},
                        {'id': 'freeze', 'label': 'Freeze'}
                    ]
                }
            ],
            callback: async (event) => {
                if (event.options.mode == 'toggle') {
                    event.options.mode = (inst.data.CallMode == 'normal') ? 'freeze' : 'normal'
                }
                inst.makeRequest('presetposition', [['CallMode', event.options.mode]])
            },
        },
        home_pos: {
            name: 'Call Home Position',
            options: [],
            callback: async (event) => {
                inst.makeRequest('presetposition', [['HomePos', 'recall']])
            },
        },
        move: {
            name: 'Move',
            options: [
                {
                    type: 'dropdown',
                    label: 'Direction',
                    id: 'direction',
                    default: 'up',
                    choices: [
                        {'id': 'stop', 'label': 'Stop'},
                        {'id': 'up', 'label': 'Up'},
                        {'id': 'up-right', 'label': 'Up-Right'},
                        {'id': 'right', 'label': 'Right'},
                        {'id': 'down-right', 'label': 'Down-Right'},
                        {'id': 'down', 'label': 'Down'},
                        {'id': 'down-left', 'label': 'Down-Left'},
                        {'id': 'left', 'label': 'Left'},
                        {'id': 'up-left', 'label': 'Up-Left'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Speed (1 - 24)',
                    id: 'speed',
                    default: 1,
                    min: 1,
                    max: 24
                }
            ],
            callback: async (event) => {
                if (event.options.direction == 'stop') {
                    event.options.speed = 'motor'
                }
                else {
                    event.options.speed -= 1
                }
    
                inst.makeRequest('ptzf', [['Move', `${event.options.direction},${event.options.speed}`]])
            }
        },
        change_focus: {
            name: 'Change Focus',
            options: [
                {
                    type: 'dropdown',
                    label: 'Direction',
                    id: 'direction',
                    default: 'far',
                    choices: [
                        {'id': 'stop', 'label': 'Stop'},
                        {'id': 'far', 'label': 'Far'},
                        {'id': 'near', 'label': 'Near'}
                    ]
                },
                {
                    type: 'number',
                    label: 'Speed (1 - 8)',
                    id: 'speed',
                    default: 1,
                    min: 1,
                    max: 8
                }
            ],
            callback: async (event) => {
                if (event.options.direction == 'stop') {
                    event.options.speed = 'focus'
                }
                else {
                    event.options.speed -= 1
                }
    
                inst.makeRequest('ptzf', [['Move', `${event.options.direction},${event.options.speed}`]])
            },
        }
    }
}

module.exports = getActions