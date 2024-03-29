import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene{
    constructor(){
        super('preloader')
    }
  
    preload(){
        let load = this.load
        load.spritesheet(
            'sokoban', 'textures/sokoban_tilesheet.png', {
            frameWidth: 64
        })

        load.image('bear', 'textures/bear.png')
        load.image('chicken', 'textures/chicken.png')
        load.image('duck', 'textures/duck.png')
        load.image('parrot', 'textures/parrot.png')
        load.image('penguin', 'textures/penguin.png')
    
        //sounds
        this.load.audio('step', 'sounds/blip.mp3')
    }
    create(){
        let anims = this.anims
        anims.create({key: 'down-idle',
            frames: [{key: 'sokoban', frame: 52}]})

        anims.create({ key: 'up-idle',
            frames: [{ key: 'sokoban', frame: 55 }]})

        anims.create({ key: 'left-idle',
            frames: [{ key: 'sokoban', frame: 81}]})

        anims.create({ key: 'right-idle',
            frames: [{ key: 'sokoban', frame: 78 }]})

        anims.create({ key:'down-walk',
            frames: anims.generateFrameNumbers('sokoban',
            { start: 52, end: 54 }), frameRate: 10,
            repeat: -1})

        anims.create({ key:'up-walk',
            frames: anims.generateFrameNumbers('sokoban',
            { start: 55, end: 57 }), frameRate: 10,
            repeat: -1})

        anims.create({ key:'left-walk',
            frames: anims.generateFrameNumbers('sokoban',
            { start: 81, end: 83 }), frameRate: 10,
            repeat: -1})
        
        anims.create({ key:'right-walk',
            frames: anims.generateFrameNumbers('sokoban',
            { start: 78, end: 80 }), frameRate: 10,
            repeat: -1})

        // Start game scene
        this.scene.start('game')
    }
}