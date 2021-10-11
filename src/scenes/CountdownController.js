export default class CountdwonController{
    // ESta clase toma una referencia a una escena
    // y una referencia de texto
    timerEvent
    scene
    label

    constructor(scene, label){
        this.scene = scene
        this.label = label
    }
     start(callback, duration = 45000){
        this.stop() // En caso de que halla un timer lo
        // detenemos

        this.duration = duration

        this.timerEvent = this.scene.time.addEvent({
            delay: duration, callback: () => {
                this.label.text = '0'
                this.stop()

                if (callback){
                    callback()
                }
            }
        })
     }

     stop(){
        if (this.timerEvent){
            this.timerEvent.destroy()
            this.timerEvent = undefined
        }
     }

     update(){
        if (!this.timerEvent || this.duration <= 0){
            return
        }

        // get the elapsed time
        const elapsed = this.timerEvent.getElapsed()

        // substract from total duration
        const remaining = this.duration - elapsed

        // convert from miliseconds to seconds
        const seconds = remaining / 1000

        // change label to show new value
        this.label.text = seconds.toFixed(2)
     }

}