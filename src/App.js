import '@css/base.css';
import '@css/style.scss';
import * as PIXI from 'pixi.js';
import xz from './assets/images/wxz.png';
import rg from './assets/images/rg.png';

const result = {
  score: 0
}

const getLength = (n) => {
  return window.devicePixelRatio * n
}
const getCenterX = (base) => {
  return getLength(appWidth / 2) - base / 2
}
const getCenterY = (base) => {
  return getLength(appHeight / 2) - base / 2
}
const random = (min, max) => {
  return Math.random() * (max - min + 1) + min
}
/**
 * 碰撞检测
 * @param {Sprite} xz 
 * @param {Sprite} rg 
 */
const hitTestRectangle = (xz, rg) => {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  hit = false;
  xz.centerX = xz.x + xz.width / 2;
  xz.centerY = xz.y + xz.height / 2;
  rg.centerX = rg.x + rg.width / 2;
  rg.centerY = rg.y + rg.height / 2;
  xz.halfWidth = xz.width / 2;
  xz.halfHeight = xz.height / 2;
  rg.halfWidth = rg.width / 2;
  rg.halfHeight = rg.height / 2;
  vx = xz.centerX - rg.centerX;
  vy = xz.centerY - rg.centerY;
  combinedHalfWidths = xz.halfWidth + rg.halfWidth;
  combinedHalfHeights = (xz.halfHeight + rg.halfHeight);
  if (Math.abs(vx * 3) < combinedHalfWidths) {
    if (Math.abs(vy * 2) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

const addScore = () => {
  result.score += 1
  for (let i = 0; i < score.length; i++) {
    score[i].innerText = result.score
  }
}

const unitRem = document.querySelector('.J_unit').offsetWidth
const appWidth = window.innerWidth
const appHeight = window.innerHeight - 1.5 * unitRem

let app = new PIXI.Application({width: getLength(appWidth), height: getLength(appHeight)});
app.renderer.backgroundColor = 0x272C35;
document.querySelector('.J_canvas').appendChild(app.view)


const canvas = document.querySelector('canvas')
const score = document.querySelectorAll('.J_time')
canvas.style.height = appHeight + 'px'

let gameScene = new PIXI.Container(),
    xzSprite,
    healthBar,
    rgSprites = [],
    state = game

const rgMaxSize = 40,
      rgMinSize = 10,
      rgMaxSpeed = getLength(0),
      rgMinSpeed = getLength(0),
      xzSpeed = getLength(20),
      healthWidth = 250,
      healthHeight = 16;

const foodHP = 40;
const hungry = 1.5;

const generaRg = () => {
  const rgSprite = new PIXI.Sprite(PIXI.loader.resources[rg].texture)
  rgSprite.width = getLength(rgSprite.width)
  rgSprite.height = getLength(rgSprite.height)
  rgSprite.position.set(random(getLength(0), getLength(appWidth) - rgSprite.width), getLength(rgSprite.height * 0.5) * -1)
  rgSprite.speed = random(rgMinSpeed, rgMaxSpeed)
  return rgSprite
}

function renderGameScene() {
  xzSprite = new PIXI.Sprite(PIXI.loader.resources[xz].texture)
  xzSprite.width = getLength(xzSprite.width)
  xzSprite.height = getLength(xzSprite.height)
  xzSprite.position.set(getCenterX(xzSprite.width), getLength(appHeight) - xzSprite.height)
  gameScene.addChild(xzSprite)

  healthBar = new PIXI.DisplayObjectContainer();
  healthBar.position.set(getLength(70), getLength(4))
  gameScene.addChild(healthBar);

  //Create the black background rectangle
  let innerBar = new PIXI.Graphics();
  innerBar.beginFill(0x9c9c9c);
  innerBar.drawRect(0, 0, getLength(healthWidth), getLength(healthHeight));
  innerBar.endFill();
  healthBar.addChild(innerBar);

  //Create the front red rectangle
  let outerBar = new PIXI.Graphics();
  outerBar.beginFill(0x00FF00);
  outerBar.drawRect(0, 0, getLength(healthWidth / 1.2), getLength(healthHeight));
  outerBar.endFill();
  healthBar.addChild(outerBar);

  let style = new PIXI.TextStyle({
    fontFamily: "Futura",
    fontSize: getLength(16),
    fill: "white"
  })
  let message = new PIXI.Text(`饥饿值`, style)
  message.position.set(getLength(10), getLength(2))
  gameScene.addChild(message)

  healthBar.outer = outerBar;
}

function renderGameOver1Scene() {
  document.querySelector(".u-game").style.display = 'none'
  document.querySelector(".u-gameover1").classList.add('f-show')
}

function renderGameOver2Scene() {
  document.querySelector(".u-game").style.display = 'none'
  document.querySelector(".u-gameover2").classList.add('f-show')
}

function setup() {
  app.stage.addChild(gameScene)

  renderGameScene()

  gameScene.visible = true

  app.ticker.add(delta => gameLoop(delta));
}

function game(delta) {
  let i = 0
  while (i < rgSprites.length) {
    let rgSprite = rgSprites[i]
    rgSprite.speed += Math.random() * 0.42
    rgSprite.y += rgSprite.speed + delta
    if (rgSprite.y >= getLength(appHeight)) {
      rgSprite.visible = false
      rgSprite = null
      rgSprites.splice(i, 1)
      continue
    }
    if (hitTestRectangle(rgSprite, xzSprite)) {
      rgSprite.visible = false
      rgSprite = null
      rgSprites.splice(i, 1)
      healthBar.outer.width += foodHP;
      addScore()
      continue
    }
    i++
  }
  let needAddRg = Math.random() > 0.75
  if (needAddRg) {
    let rgSprite = generaRg()
    rgSprites.push(rgSprite)
    gameScene.addChild(rgSprite)
  }
  if (healthBar.outer.width <= 0 || healthBar.outer.width > getLength(healthWidth)) {
    state = gameover
  }
  healthBar.outer.width -= hungry;
  if (healthBar.outer.width > getLength(healthWidth * 0.7)) {
    healthBar.outer.tint = 0x6f599c
  } else if (healthBar.outer.width < getLength(healthWidth * 0.3)) {
    healthBar.outer.tint = 0x6f599c
  } else {
    healthBar.outer.tint = 0x00FF00
  }
}

function gameover(delta) {
  if (healthBar.outer.width > getLength(healthWidth)) {
    renderGameOver1Scene()
  }
  if (healthBar.outer.width <= 0) {
    renderGameOver2Scene()
  }
  app.ticker.destroy()
}

function gameLoop(delta) {
  state(delta)
}

document.querySelector('.J_left').addEventListener('touchstart', () => {
  if (xzSprite.x - xzSpeed < 0) {
    return
  }
  xzSprite.x -= xzSpeed
})

document.querySelector('.J_right').addEventListener('touchstart', () => {
  if (xzSprite.x + xzSpeed > (getLength(appWidth) - xzSprite.width)) {
    return
  }
  xzSprite.x += xzSpeed
})

Array.prototype.slice.call(document.querySelectorAll('.J_restart')).forEach(item => {
  item.addEventListener('click', () => {
    window.location.reload()
  })
})

document.querySelector('.J_start').addEventListener('click', () => {
  document.querySelector('.u-load').style.display = 'none'
  document.querySelector('.u-game').style.display = 'block'
  PIXI.loader
      .add([xz, rg])
      .load(setup);
})

document.body.addEventListener('touchmove', (e) => {
  e.preventDefault()
}, {
  passive: false
})