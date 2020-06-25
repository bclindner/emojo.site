const constants = {
	"emojis": {
		"blurrycat": "emojis/blurrycat.png",
		"cate": "emojis/cate.png",
		"catto": "emojis/catto.png",
		"freddiecat": "emojis/freddiecat.png",
		"cringingcat": "emojis/cringingcat.png",
		"politecat": "emojis/politecat.png",
		"sadcat": "emojis/sadcat.png",
		"saddercat": "emojis/saddercat.png",
		"smugcat": "emojis/smugcat.png",
		"tiredcat": "emojis/tiredcat.png"
	},
	"backgrounds": {
		"rainbow": "emojo-bg-rainbow",
		"red": "emojo-bg-red",
		"black": "emojo-bg-black"
	},
	"captionTypes": {
		"default": ["emojo-caption-default"],
		"above": ["emojo-caption-default", "emojo-caption-above"],
		"comicsans": ["emojo-caption-sans"],
		"comicsans-above": ["emojo-caption-sans", "emojo-caption-above"]
	},
	"animations": {
		"null": {
			"name": "null",
			"length": 1
		},
		"bounce": {
			"name": "bounce",
			"length": 1,
			"extra": "linear infinite"
		},
		"flip": {
			"name": "flip",
			"length": 1,
			"extra": "linear infinite"
		},
		"fastflip": {
			"name": "flip",
			"length": 0.25,
			"extra": "linear infinite"
		},
		"spin": {
			"name": "spin",
			"length": 2,
			"extra": "linear infinite"
		},
		"zoom": {
			"name": "zoom",
			"length": 50000,
			"extra": "linear"
		},
		"slowzoom": {
			"name": "zoom",
			"length": 100000,
			"extra": "linear"
		},
		"shake": {
			"name": "shake",
			"length": 1,
			"extra": "infinite"
		},
		"fastshake": {
			"name": "shake",
			"length": 0.25,
			"extra": "infinite"
		},
		"sway": {
			"name": "sway",
			"length": 1,
			"extra": "ease-out infinite"
		}
	},
	"music": {
		"smwcredits": {
			"path": "sounds/smwcredits.mp3",
			"beat": 0.395
		},
		"temmie": {
			"path": "sounds/temmie.mp3",
			"beat": 0.715
		},
		"null": {
			"path": null,
			"beat": 1
		}
	},
	"default": {
		"emoji": ["cate"],
		"animations": ["bounce", "flip"],
		"music": "smwcredits",
		"speed": 1,
		"caption": null,
		"captionType": "default",
		"background": null,
		"emojiInterval": 4
	}
}

function renderEmojopage(root, config) {
	// add container div
	const container = root.appendChild(document.createElement("div"))
	container.classList.add("emojo-container");
	// apply background
	if (config.background) {
		container.classList.add(constants.backgrounds[config.background])
	}
	// add caption, if available
	if (config.caption) {
		const caption = container.appendChild(document.createElement("h1"))
		for (className of constants.captionTypes[config.captionType]) {
			caption.classList.add(className);
		}
		caption.innerText = config.caption
	}
	// set up music
	const audioConfig = constants.music[config.music]
	const audio = root.appendChild(document.createElement("audio"))
	root.appendChild(audio)
	audio.loop = true
	audio.controls = false
	const audioLoadPromise = new Promise((resolve, reject) => {
		try {
			audio.addEventListener("loadeddata", resolve)
		} catch (e) {
			reject(e)
		}
	})
	audio.src = audioConfig.path
	audio.playbackRate = config.speed
	// add nested animation divs
	let emojiContainer = container;
	for (animName of config.animations) {
		const animConfig = constants.animations[animName];
		const animDiv = emojiContainer.appendChild(document.createElement("div"))
		animDiv.style.animation = `${animConfig.name} ${(animConfig.length *
			audioConfig.beat) /
			config.speed}s ${animConfig.extra}`;
		emojiContainer = animDiv;
	}
	const emoji = emojiContainer.appendChild(document.createElement('img'))
	// set up emoji interval, if more than one emoji is in the list
	if (config.emoji.length > 1) {
		let i = 0
		setInterval(() => {
			i++
			emoji.src = constants.emojis[config.emoji[i % config.emoji.length]]
		}, audioConfig.beat * config.emojiInterval * 1000)
	}
	const emojiPromise = new Promise((resolve, reject) => {
		try {
			emoji.addEventListener("load", resolve)
		} catch (e) {
			reject(e)
		}
	})
	emoji.src = constants.emojis[config.emoji[0]]
	Promise.all([emojiPromise, audioLoadPromise]).then(() => audio.play())
}

function parseArguments() {
	let config = {}
	const urlParams = new URLSearchParams(window.location.search)
	// if d (the json config) is set, decode that base64 and use that instead
	const jsonData = urlParams.get("d");
	if(jsonData) {
		config = JSON.parse(atob(jsonData))
		return config
	}
	// emoji
	const emojiList = urlParams.get("emoji");
	if (emojiList) {
		config.emoji = emojiList.split(" ")
	} else {
		config.emoji = constants.default.emoji
	}
	// animations
	const animationsList = urlParams.get("anims")
	if (animationsList) {
		config.animations = animationsList.split(" ")
	} else {
		config.animations = constants.default.animations;
	}
	// speed
	try {
		const rawSpeed = urlParams.get("speed")
		if (rawSpeed) {
			const speed = Number(rawSpeed)
			if (!isNaN(speed) && speed >= 0.25 && speed <= 5) {
				config.speed = speed
			} else {
				config.speed = constants.default.speed
			}
		} else {
			config.speed = constants.default.speed
		}
	} catch (e) {
		console.warn("failed to parse speed; continuing with defaults")
		config.speed = constants.default.speed
	}
	// emoji interval
	try {
		const rawEmojiInterval = urlParams.get("eint")
		if (rawEmojiInterval) {
			const emojiInterval = Number(rawEmojiInterval)
			if (emojiInterval) {
				config.emojiInterval = emojiInterval
			} else {
				config.emojiInterval = constants.default.emojiInterval
			}
		} else {
			config.emojiInterval = constants.default.emojiInterval
		}
	} catch (e) {
		console.warn("failed to parse speed; continuing with defaults")
		config.emojiInterval = constants.default.emojiInterval
	}
	// music
	config.music = urlParams.get("music") || constants.default.music;
	// background
	config.background = urlParams.get("bg") || constants.default.background;
	// caption
	config.caption = urlParams.get("caption") || constants.default.caption;
	// caption type
	config.captionType = urlParams.get("captiontype") || constants.default.captionType;
	// console log the base64 encode in case the user wants to hide what they're sending
	console.log(btoa(JSON.stringify(config)))
	return config
}

const root = document.getElementById("app")
document.getElementById("button").addEventListener("click", () => {
	document.getElementById("button").style.display = "none";
	const config = parseArguments()
	console.log(config)
	renderEmojopage(root, config)
})
