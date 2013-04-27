var PLAYER_MOVE_RATE = 0.5
var PLAYER_HEIGHT = 100
var PLAYER_WIDTH = 60

var Player = (function() {

    var _x
    var _y
    var _image
    
    function Player(x, y) {
        this._x = x
        this._y = y
        this._image = new Image()
        this._image.src = "car.png"
    }
    
    Player.prototype.update = function(state, d) {
        old_x = this._x
        old_y = this._y
        if(state.is_down(39)){
            this._x += PLAYER_MOVE_RATE * d
            if(this._x + PLAYER_WIDTH >= state.width){
                this._x = state.width - PLAYER_WIDTH
            }
        }
        if(state.is_down(37)){
            this._x -= PLAYER_MOVE_RATE * d
            if(this._x <= 0){
                this._x = old_x
            }
        }
        if(state.is_down(38)){
            this._y -= PLAYER_MOVE_RATE * d
            if(this._y <= 0){
                this._y = old_y
            }
        }
        if(state.is_down(40)){
            this._y += PLAYER_MOVE_RATE * d
            if(this._y + PLAYER_HEIGHT >= state.height){
                this._y = state.height - PLAYER_HEIGHT
            }
        }
    }
    
    Player.prototype.draw = function(state, context, d) {
        context.drawImage(this._image, this._x, this._y)
    }
    
    return Player
    
})()

var GameState = (function() {
    
    var width
    var height

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
        this._state.width = canvas.width
        this._state.height = canvas.height
        
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
        
        if(self._state.is_clicked(113)){
            self._paused = !self._paused
        }
        
        if(!self._paused){
            for(var i = 0; i < self._gameObjects.length; i++) {
                self._gameObjects[i].update(self._state, delta)
            }
        }
        
        for(var i = 0; i < self._gameObjects.length; i++) {
            self._gameObjects[i].draw(self._state, self._context, delta)
        }
        
        if(self._paused){
            self._context.fillStyle = "red"
            self._context.font = "30px Arial"
            var paused_text = 'Game Paused'
            self._context.fillText(paused_text,
                                   (self._state.width/2)-paused_text.length*8,
                                   (self._state.height/2)-10)
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