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
    "smugcat": "emojis/smugcat.png"
  },
  "backgrounds": {
    "rainbow": "emojo-bg-rainbow",
    "red": "emojo-bg-red"
  },
  "captionTypes": {
    "default": ["emojo-caption-default"],
    "above": ["emojo-caption-default", "emojo-caption-above"],
    "comicsans": ["emojo-caption-sans"],
    "comicsans-above": ["emojo-caption-sans", "emojo-caption-above"]
  },
  "animations": {
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
  "sound": {
    "smwcredits": {
      "path": "sounds/smwcredits.mp3",
      "beat": 0.388,
      "bar": 1.552
    }
  },
  "default": {
    "emoji": ["cate"],
    "animations": ["bounce", "flip"],
    "sound": "smwcredits",
    "speed": 1,
    "caption": null,
    "captionType": "default",
    "background": null
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
  // set up sound
  const audioConfig = constants.sound[config.sound]
  const audio = root.appendChild(document.createElement("audio"))
  root.appendChild(audio)
  audio.loop = true
  audio.controls = false
  audio.src = constants.sound[config.sound].path
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
  // set up emoji interval
  let i = 0
  setInterval(() => {
    i++
    emoji.src = constants.emojis[config.emoji[i % config.emoji.length]]
  }, audioConfig.bar * 1000)
    emoji.src = constants.emojis[config.emoji[0]]
  audio.play()
}

function parseArguments() {
  let config = {}
  const urlParams = new URLSearchParams(window.location.search)
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
  // sound
  config.sound = urlParams.get("sound") || constants.default.sound;
  // background
  config.background = urlParams.get("bg") || constants.default.background;
  // caption
  config.caption = urlParams.get("caption") || constants.default.caption;
  // caption type
  config.captionType = urlParams.get("captiontype") || constants.default.captionType;
  return config
}

const root = document.getElementById("app")
document.getElementById("button").addEventListener("click", () => {
  document.getElementById("button").style.display = "none";
  const config = parseArguments()
  console.log(config)
  renderEmojopage(root, config)
})
