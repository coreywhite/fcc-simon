const MAX_STEPS = 20;


function ColorButton(game, color, soundURL, $element) {
  var self = this;
  this.game = game;
  this.color = color;
  this.$element = $element;
  this.audio = new Audio(soundURL);
  this.$element.on('click', function() {
    console.log(self.game.state, self.color);
    if (self.game.state === 'waiting') {
      self.game.selectColor(self.color);
      self.activate(500, true);
    }
  });
}
ColorButton.prototype = {
  constructor: ColorButton,
  activate: function(duration, withSound, callback) {
    var dur = duration || 350;
    if(withSound) {
      this.audio.play();
    }
    this.$element.animate({
        opacity: 1
      }, .3 * dur)
      .delay(.4 * dur)
      .animate({
        opacity: .8
      }, .3 * dur, callback);
  }
}

function Game() {
  var self = this;
  this.timeout = null;
  this.state = 'off';
  this.strictMode = false;
  this.count = 0;
  this.curStep = 0;
  this.curSequence = [];
  this.$led = $('#led');
  this.$start = $('#start');
  this.$strict = $('#strict');
  this.colors = [];
  this.colors.push(new ColorButton(self, 'green', 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3', $('#green')));
  this.colors.push(new ColorButton(self, 'red', 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3', $('#red')));
  this.colors.push(new ColorButton(self, 'blue', 'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3', $('#blue')));
  this.colors.push(new ColorButton(self, 'yellow', 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3', $('#yellow')));
  this.$start.on('click', function() {
    if(self.state === 'off') {
      self.start();
    } else {
      self.flash(1, 400, self.start.bind(self));
    }
  });
  this.$strict.on('click', function() {
    self.toggleStrictMode();
  });
}
Game.prototype = {
  constructor: Game,
  start: function() {
    this.generateSequence();
    this.changeState('playback');
  },
  changeState(state) {
    clearTimeout(this.timeout);
    switch (state) {
      case 'waiting':
        //Wait for player input, take no other action
        break;
      case 'playback':
        this.curStep = 0;
        this.timeout = setTimeout(this.playStep.bind(this), 750);
        break;
      case 'error':
        this.flash(3, 200, this.afterWrongGuess.bind(this));
        break;
      case 'won':
        this.flash(2, 800, this.afterWin.bind(this));
        break;
    }
    this.state = state;
  },
  toggleStrictMode: function() {
    this.strictMode = !this.strictMode;
    this.$strict.toggleClass('active', this.strictMode);
  },
  displayCount: function() {
    this.$led.text(("0" + this.count).slice(-2));
  },
  setCount: function(count) {
    this.count = count;
    this.displayCount();
  },
  generateSequence() {
    this.curSequence = [];
    this.curStep = 0;
    this.setCount(1);
    for (var i = 0; i < MAX_STEPS; i++) {
      this.curSequence.push(Math.floor(Math.random() * 4));
    }
  },
  playStep() {
    if (this.state === 'playback') {
      this.colors[this.curSequence[this.curStep]].activate(500, true);
      this.curStep++;
      if (this.curStep < this.count) {
        this.timeout = setTimeout(this.playStep.bind(this), 800);
      } else {
        this.curStep = 0;
        this.changeState('waiting');
      }
    }
  },
  selectColor(color) {
    if (this.state === 'waiting') {
      if (color === this.colors[this.curSequence[this.curStep]].color) {
        this.correctGuess();
      } else {
        this.changeState('error');
      }
    }
  },
  correctGuess() {
    this.curStep++;
    if (this.curStep >= this.count) {
      if (this.count < MAX_STEPS) {
        this.setCount(this.count + 1);
        this.changeState('playback');
      } else {
        this.changeState('won');
      }
    }
  },
  afterWrongGuess() {
    if (this.strictMode) {
      this.generateSequence();
      this.changeState('playback');
    } else {
      this.changeState('playback')
    }
  },
  afterWin() {
    this.generateSequence();
    this.changeState('playback');
  },
  flash(flashCount, flashDuration, callback) {
    var self = this;
    var iter = 0;
    (function loop() {
      setTimeout(function() {
        for (var i = 0; i < self.colors.length; i++) {
          self.colors[i].activate(flashDuration);
        }
        iter++;
        if (iter < flashCount) {
          loop();
        } else {
          setTimeout(callback, flashDuration + 100);
        }
      }, flashDuration + 100);
    })();
  }
}

$(document).ready(function() {
  var game = new Game();
});