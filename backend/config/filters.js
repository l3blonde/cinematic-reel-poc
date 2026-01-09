const FILTERS = {
    none: {
        name: "None",
        description: "Original colors, no filter",
        ffmpegFilter: null,
    },
    deepBlue: {
        name: "Deep Blue",
        description: "Enhanced blues, high contrast underwater look",
        ffmpegFilter: "eq=contrast=1.2:brightness=0.05:saturation=1.3,colorbalance=bs=0.3:bm=0.2",
    },
    vintageExplorer: {
        name: "Vintage Explorer",
        description: "70s documentary film grain and color",
        ffmpegFilter:
            "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=contrast=0.9:saturation=0.8,noise=alls=10:allf=t+u",
    },
    biolume: {
        name: "Biolume",
        description: "Glowing bioluminescent effect",
        ffmpegFilter:
            "eq=contrast=1.4:brightness=-0.1:saturation=1.5,colorbalance=bs=0.4:gs=0.2:bm=0.3:gm=0.1,gblur=sigma=0.5",
    },
    ultraVivid: {
        name: "Ultra Vivid",
        description: "BBC-style saturated colors",
        ffmpegFilter: "eq=contrast=1.3:saturation=1.8:gamma=1.1,vibrance=intensity=0.5",
    },
}

module.exports = { FILTERS }
