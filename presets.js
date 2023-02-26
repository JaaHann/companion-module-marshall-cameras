// presets

const { combineRgb } = require('@companion-module/base')



function getPresets() {
    return [
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
}

module.exports = getPresets