import Phaser from 'phaser'

//import the class 
import CountdwonController from './CountdownController'

const level = [
// Guarda cada animal que estara
// dentro de cada caja
    [1, 0, 3],
    [2, 4, 1],
    [3, 4, 2]
]

export default class Game extends Phaser.Scene{
    constructor(){
        super('game')
    }

    // Propiedades
    player
    boxGroup
    cursors
    activeBox
    itemsGroup
    selectedBoxes = []
    matchesCount = 0

    countdown

    create(){
        let addPhysics = this.physics.add

        //let stepSound = this.sound.add('step')
        //stepSound.play()

        const { width, height } = this.scale

        this.player = addPhysics.sprite(
            width * 0.5, height * 0.6, 'sokoban').play('down-idle')
            .setSize(40, 16).setOffset(12.38).play('down-idle')
    
        this.boxGroup = addPhysics.staticGroup()
        this.createBoxes()
        
        // Para que el jugador no atraviese las cajas
        addPhysics.collider(this.player, this.boxGroup,
            this.handlePlayerBoxCollide, undefined, this)

        this.itemsGroup = this.add.group()

        // @ts-ignore
        const timerLabel = this.add.text(width * 0.5, 50, '45', { fontSize: 48})
            .setOrigin(0.5)

        this.countdown = new CountdwonController(this, timerLabel)

        this.countdown.start(this.handleCountdownFinished.bind(this))
    }

    init(){
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    update(){
        this.updatePlayer()

        this.updateActiveBox()

        this.children.each(c => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            // @ts-ignore    
            const child = c

            if (child.getData('sorted')) return

            child.setDepth(child.y)
        })

        this.countdown.update()
    }

    createBoxes(){
        const width = this.scale.width

        let xPer = 0.25; let y = 150

        // Crea 9 cajas  con el sprite 10 / y las posiciona en diferentes coordenadas
        for (let row = 0; row < level.length; ++row){
            for (let col = 0; col < level[row].length; ++col){
            /** @type {Phaser.Physics.Arcade.Sprite} */
                const box = this.boxGroup.get(width * xPer, y, 'sokoban', 10)

                box.setSize(64, 42).setOffset(0, -4)
                .setData('itemType', level[row][col])

                xPer += 0.25
            }
            xPer = 0.25; y += 150
        }
    }

    handlePlayerBoxCollide(player, box){
        // Para no volver a abrir una caja ya abierta
        const opened = box.getData('opened')
        if (opened) return

        if(this.activeBox) return
        this.activeBox = box
        this.activeBox.setFrame(9)
    }

    updateActiveBox(){
        if (!this.activeBox) return

        //obtener distancia entre player y la caja
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.activeBox.x, this.activeBox.y
        )

        if (distance < 64) return // N hacer nada si esta cerca

        // Cambiar a color gris la caja no activa
        this.activeBox.setFrame(10)
        this.activeBox = undefined
    }

    openBox(box){
        if(!box) return

        const itemType = box.getData('itemType')

        let item

        switch (itemType){
            case 0: item = this.itemsGroup.get(
                box.x, box.y)
                item.setTexture('bear');break

            case 1: item = this.itemsGroup.get(
                box.x, box.y)
                item.setTexture('chicken');break

            case 2: item = this.itemsGroup.get(
                box.x, box.y)
                item.setTexture('duck');break

            case 3: item = this.itemsGroup.get(
                box.x, box.y)
                item.setTexture('parrot');break

            case 4: item = this.itemsGroup.get(
                box.x, box.y)
                item.setTexture('penguin');break
        }

        box.setData('opened', true)

        item.setData('sorted', true)
        item.setDepth(2000)

        item.setActive(true)
        item.setVisible(true)

        item.scale = 0
        item.alpha = 0

        this.selectedBoxes.push({ box, item })        

        this.tweens.add({
            targets: item, y: '-=50',
            alpha: 1, scale: 1, duration: 500,
            onComplete: () => {
                if (itemType == 0){
                    this.handleBearSelected()
                    return
                }
                // Checamos si tenemos dos cajas abiertas
                if (this.selectedBoxes.length < 2) return

                this.checkForMatch()
            }
        })

    }

    updatePlayer(){
        const speed = 200
        let player = this.player

        if (!player.active) return

        // Camina animado con las teclas del cursor
        if (this.cursors.left.isDown){
            player.setVelocity(-speed, 0)
            player.play('left-walk', true)
        }
        else if (this.cursors.right.isDown){
            player.setVelocity(speed, 0)
            player.play('right-walk', true)
        }
        else if (this.cursors.up.isDown){
            player.setVelocity(0, -speed)
            player.play('up-walk', true)
        }
        else if (this.cursors.down.isDown){
            player.setVelocity(0, speed)
            player.play('down-walk', true)
        }
        else{ // hacemos que s equede quieto 
            // volteando hacia donde iba
            player.setVelocity(0, 0)
            const key = this.player.anims.currentAnim.key
            const parts = key.split('-')
            const direction = parts[0]
            player.play(`${direction}-idle`)
        }

        const spaceJustPressed = Phaser.Input.Keyboard
            .JustUp(this.cursors.space)
        if (spaceJustPressed && this.activeBox){
            this.openBox(this.activeBox)
            // reset box after opened
            this.activeBox.setFrame(10)
            this.activeBox = undefined
        }

    }

    checkForMatch(){
        // pop from end to get second and first opened boxes
        const second = this.selectedBoxes.pop()
        const first = this.selectedBoxes.pop()

        if (first.item.texture !== second.item.texture){
            // Si no son iguales
            this.tweens.add({
                targets: [first.item, second.item],
                y: '+=50', alpha: 0, scale: 0,
                duration: 300, delay: 1000, onComplete: () => {
                    // Ocultamos los animales
                    this.itemsGroup.killAndHide(first.item)
                    this.itemsGroup.killAndHide(second.item)
                    // y cerramos las cajas
                    first.box.setData('opened', false)
                    second.box.setData('opened', false)
                }
            })
            return
        }

        ++this.matchesCount

        // Tenemos un par!! Esperamos un segundo
        this.time.delayedCall(1000, () => {
            first.box.setFrame(8)
            second.box.setFrame(8)

            // Checamos si tenemos 4 pares
            if (this.matchesCount >=4){
                // Ganaste
                this.countdown.stop()
                this.player.active = false
                this.player.setVelocity(0, 0)

                // Agregamos mensaje de victoria
                const { width, height } = this.scale
                this.add.text(width * 0.5, height * 0.5,
                     'Felicidades, ganaste!!', {
                         // @ts-ignore
                         fontSize: 48
                     })
                     .setOrigin(0.5)

            }
        })
    }

    handleBearSelected(){
        // Obtenemos la informacion de la caja
        const { box, item } = this.selectedBoxes.pop()
        
        // Pintamos al oso de rojo
        item.setTint(0xff0000)

        // Pintamos la caja de rojo
        box.setFrame(7)

        // Congelamos al jugador
        this.player.active = false
        this.player.setVelocity(0, 0)

        // Esperamos un segundo y regresamos a al normalidad
        this.time.delayedCall(1000, () => {
            item.setTint(0xff0000)
            box.setFrame(10)
            box.setData('opened', false)

            this.tweens.add({
                targets: item, y: '+=50', alpha: 0,
                scale: 0, duration: 300, oncomplete: () =>{
                    this.player.active = true // reactivamos al jugador
                }
            })
        })
    }

    handleCountdownFinished(){
        // Desahbilitanmos al jugador como antes
        this.player.active = false
        this.player.setVelocity(0, 0)
    
        // Cramos mensaje perdiste
        const { width, height } = this.scale
        this.add.text(width * 0.5, height * 0.5, 'Perdiste!',
            // @ts-ignore
            { fontSize: 48 }).setOrigin(0.5)
    }
}
