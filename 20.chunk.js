webpackJsonp([20],{104:/*!********************************************************************!*\
  !*** ./node_modules/raw-loader!./src/boilerplates/pixi/codebin.js ***!
  \********************************************************************//*! dynamic exports provided *//*! all exports used */function(a){a.exports="const sprite = createSprite()\nconst app = createApp()\n\nfunction createSprite() {\n  const sprite = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png')\n  sprite.anchor.set(0.5)\n  sprite.scale.set(3)\n  return sprite\n}\n\nfunction createApp() {\n  return new PIXI.Tiled.FullscreenApplication(tick, {\n    backgroundColor: 0xffffff\n  })\n}\n\nfunction tick(time) {\n  sprite.position.set(innerWidth / 2, innerHeight / 2)\n  sprite.rotation = time / 100\n}\n\napp.stage.addChild(sprite)\n"}});