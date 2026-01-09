// Transition effects between images
const Transitions = {
    none: {
        name: "None",
        description: "Direct cut between images",
        duration: 0,
    },
    fade: {
        name: "Fade",
        description: "Fade to black between images",
        duration: 1,
        ffmpegFilter: "fade",
    },
    crossfade: {
        name: "Crossfade",
        description: "Smooth blend between images",
        duration: 1.5,
        ffmpegFilter: "xfade",
    },
}

module.exports = { TRANSITIONS: Transitions }
