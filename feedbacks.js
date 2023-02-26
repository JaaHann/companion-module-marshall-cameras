// feedbacks

const { combineRgb } = require('@companion-module/base')



function getFeedbacks(inst) {
    return {

        //camera
        camera_audio_delay: {
            type: 'boolean',
            name: 'Camera: Audio Delay',
            description: 'Show feedback for Audio Delay ON/OFF',
            options: [
                {
                    type: 'dropdown',
                    label: 'Delay',
                    id: 'delay',
                    default: 'on',
                    choices: [
                        {id: 'on', label: 'Enabled'},
                        {id: 'off', label: 'Disabled'}
                    ]
                }
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 255)
            },
            callback: (event) => {
                if (inst.data.AudioDelay == event.options.delay) {
                    return true
                }
                return false
            }
        },
        camera_audio_in: {
            type: 'boolean',
            name: 'Camera: Audio In',
            description: 'Show feedback for Audio In ON/OFF',
            options: [
                {
                    type: 'dropdown',
                    label: 'Input',
                    id: 'input',
                    default: 'on',
                    choices: [
                        {id: 'on', label: 'Enabled'},
                        {id: 'off', label: 'Disabled'}
                    ]
                }
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 255)
            },
            callback: (event) => {
                if (inst.data.AudioIn == event.options.input) {
                    return true
                }
                return false
            }
        },
        camera_hdmi_color: {
            type: 'boolean',
            name: 'Camera: HDMI Format',
            description: 'Show feedback for HDMI format',
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
                },
				{
					type: 'checkbox',
					label: 'Stream OFF',
					id: 'invert',
					default: false,
				}
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 255)
            },
            callback: (event) => {
                if (inst.data.HdmiColor == event.options.format) {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        },
        camera_stream: {
            type: 'boolean',
            name: 'Camera: Stream ON/OFF',
            description: 'Show feedback for Stream ON/OFF',
            options: [
                {
                    type: 'dropdown',
                    label: 'Stream',
                    id: 'stream',
                    default: 1,
                    choices: [
                        {'id': 1, 'label': 'Stream 1'},
                        {'id': 2, 'label': 'Stream 2'},
                        {'id': 3, 'label': 'Stream 3'}
                    ]
                },
				{
					type: 'checkbox',
					label: 'Stream OFF',
					id: 'invert',
					default: false,
				}
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(255, 0, 0)
            },
            callback: (event) => {
                if (inst.data['ImageCodec' + event.options.stream] != 'off') {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        },
        camera_output_source: {
            type: 'boolean',
            name: 'Camera: Output Source',
            description: 'Show feedback for output source',
            options: [
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
                },
				{
					type: 'checkbox',
					label: 'Invert',
					id: 'invert',
					default: false,
				}
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 255)
            },
            callback: (event) => {
                if (inst.data.OutputSource == event.options.output) {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        },
        camera_overlay: {
            type: 'boolean',
            name: 'Camera: Overlay ON/OFF',
            description: 'Show feedback for Overlays',
            options: [
                {
                    type: 'dropdown',
                    label: 'Area:',
                    id: 'area',
                    default: 'both',
                    choices: [
                        {'id': 'both', 'label': 'Top Left & Right'},
                        {'id': 'OverlayTopLeftMode', 'label': 'Top Left'},
                        {'id': 'OverlayTopRightMode', 'label': 'Top Right'}
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
					type: 'checkbox',
					label: 'Invert',
					id: 'invert',
					default: true,
				}
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(255, 0, 0)
            },
            callback: (event) => {
                if (event.options.area == 'both' && inst.data.OverlayTopLeftMode == event.options.overlay && inst.data.OverlayTopRightMode == event.options.overlay) {
                    return (event.options.invert) ? false : true
                }
                else if (event.options.area !== 'both' && inst.data[event.options.area] == event.options.overlay) {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        },

        
        presets_select_actions: {
            type: 'boolean',
            name: 'Presets: Selected Action',
            description: 'Show feedback for selected Action for presets',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode:',
                    id: 'mode',
                    default: 'PresetSet',
                    choices: [
                        {'id': 'PresetCall', 'label': 'Call Preset'},
                        {'id': 'PresetSet', 'label': 'Set Preset'},
                        {'id': 'PresetClear', 'label': 'Clear Preset'}
                    ]
                },
				{
					type: 'checkbox',
					label: 'Invert',
					id: 'invert',
					default: false,
				}
            ],
            defaultStyle: {
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 255, 0)
            },
            callback: (event) => {
                if (inst.data.selectedPresetAction == event.options.mode) {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        },
        presets_call_mode: {
            type: 'boolean',
            name: 'Preset Call Mode',
            description: 'Show feedback for Preset Call Mode',
            options: [
                {
                    type: 'dropdown',
                    label: 'Preset Call Mode',
                    id: 'mode',
                    default: 'normal',
                    choices: [
                        {id: 'normal', label: 'Normal'},
                        {id: 'freeze', label: 'Freeze'}
                    ]
                }
            ],
            defaultStyle: {
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 255)
            },
            callback: (event) => {
                return (inst.data.CallMode == event.options.mode) ? true : false
            }
        },

        // restarts
        restarts: {
            type: 'boolean',
            name: 'Restart: Events',
            description: 'Show feedback for internal restarts of specific components',
            options: [
                {
                    type: 'dropdown',
                    label: 'Event',
                    id: 'event',
                    default: 'stream',
                    choices: [
                        {id: 'camera', label: 'Camera'},
                        {id: 'stream', label: 'Stream'}
                    ]
                },
				{
					type: 'checkbox',
					label: 'Invert',
					id: 'invert',
					default: false,
				}
            ],
            defaultStyle: {
                text: '...',
                size: 44,
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 0)
            },
            callback: (event) => {
                if (inst.data.restartEvents[event.options.event]) {
                    return (event.options.invert) ? false : true
                }
                return (event.options.invert) ? true : false
            }
        }
    }
}

module.exports = getFeedbacks