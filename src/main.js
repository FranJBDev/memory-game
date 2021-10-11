import Phaser from 'phaser'

import Game from './scenes/Game'

import Preloader from './scenes/Preloader'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 0 }
		}
	},
	scene: [Preloader, Game],
	audio: { disableWebAudio: true }
}

export default new Phaser.Game(config)
