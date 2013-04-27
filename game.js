var PLAYER_MOVE_RATE = 0.5

var Player = (function() {

    var _x
    var _y
    
    function Player(x, y) {
        this._x = x
        this._y = y
    }
    
    Player.prototype.update = function(state, d) {
        if(state.is_down(39)){
            this._x += PLAYER_MOVE_RATE * d
        }
        if(state.is_down(37)){
            this._x -= PLAYER_MOVE_RATE * d
        }
        if(state.is_down(38)){
            this._y -= PLAYER_MOVE_RATE * d
        }
        if(state.is_down(40)){
            this._y += PLAYER_MOVE_RATE * d
        }
    }
    
    Player.prototype.draw = function(state, context, d) {
        context.fillStyle = "black"
        context.fillText(d, this._x, this._y)
    }
    
    return Player
    
})()

var GameState = (function() {

    var _keyStates
    var _keyClicks

    function GameState() {
        this._keyStates = new Array()
        this._keyClicks = new Array()
        
        for(var i = 0; i <= 222; i++) {
            this._keyStates[i] = 'up'
            this._keyClicks[i] = 'unclicked'
        }
    }
    
    GameState.prototype._key_down = function(self, event) {
        self._keyStates[event.keyCode] = 'down'
        self._keyClicks[event.keyCode] = 'clicked'
    }
    
    GameState.prototype._key_up = function(self, event) {
        self._keyStates[event.keyCode] = 'up'
    }
    
    GameState.prototype.is_clicked = function(keyCode) {
        if(this._keyClicks[keyCode] == 'clicked'){
            this._keyClicks[keyCode] = 'unclicked'
            return true
        }else{
            return false
        }
    }
    
    GameState.prototype.is_down = function(keyCode) {
        if(this._keyStates[keyCode] == 'down'){
            return true
        }else{
            return false
        }
    }

    return GameState

})()

var Game = (function() {
    var _canvas
    var _context
    var _target_fps
    
    var _running = false
    var _paused = false
    
    var _gameObjects
    var _state
    
    function Game(canvas, target_fps) {
        this._canvas = canvas
        this._context = canvas.getContext("2d")
        this._target_fps = target_fps
        this._gameObjects = new Array()
        this._state = new GameState()
        
        var state = this._state
        
        var key_down = function(event) {
            state._key_down(state, event)
        }
        
        var key_up = function(event) {
            state._key_up(state, event)
        }
        
        document.addEventListener('keydown', key_down)
        document.addEventListener('keyup', key_up)
        
        this._gameObjects.push(new Player(50, 50))
    }
    
    Game.prototype._update_and_draw = function(self, last_run) {
        var start = new Date().getTime()
        var delta =  start - last_run
        
        self._context.fillStyle = "white"
        self._context.fillRect(0, 0, self._canvas.width, self._canvas.height)
        
        for(var i = 0; i < self._gameObjects.length; i++) {
            self._gameObjects[i].update(self._state, delta)
        }
        
        for(var i = 0; i < self._gameObjects.length; i++) {
            self._gameObjects[i].draw(self._state, self._context, delta)
        }
        
        var end = new Date().getTime()
        var run_time = end - start
        
        if(self._running){
            var new_last_run = new Date().getTime()
            var func = function(){
                self._update_and_draw(self, new_last_run)
            }
            window.setTimeout(func, (1000/self._target_fps) - run_time)
        }
    }
    
    Game.prototype.run = function() {
        this._running = true
        this._update_and_draw(this)
    }
    
    return Game
})()