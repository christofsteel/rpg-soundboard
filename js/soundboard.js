var app = (function () {
	// Classes
	// Single Sounds
	var Sound = function(o) {
		this.name = o.name;
		this.buffer = o.buffer || false;

		if(this.buffer) {
			this.sound = new Howl({
				urls: [this.name],
				customBuffers: [this.buffer]
			})
		} else {
			this.sound = new Howl({
				urls: [this.name]
			});
		}
		this.frequency = 0;
		this.volume = 70;
		this.interval = null;
		this.dom = this.genDom(this.name);
	};
	Sound.prototype.setFrequency = function(freq) {
		console.log('freq: ' + freq);
		var sound = this;
		this.frequency = freq;
		if (this.interval != null) {
			clearInterval(this.interval);
		}
		if (freq > 0 && freq <= 100) {
			this.interval = setInterval(function(){sound.play()}, (1/freq-1)*1000);
		}
	};
	Sound.prototype.setVolume = function(vol) {
		console.log(this.name + " Volume set to " + vol);
		this.volume = vol;
		this.sound.volume(vol);
	}
	Sound.prototype.genDom = function(name){
			this.volslider = $('<input>').addClass('slider col-xs-12').attr('type', 'text').val(0.7);
			var volsliderlabel = $('<span>').addClass('glyphicon glyphicon-volume-up');
			var vollabeldiv = $('<div>').addClass('col-xs-2').append(volsliderlabel);
			var volsliderdiv = $('<div>').addClass('col-xs-9').append(this.volslider);
			var voldiv = $('<div>').addClass('row').append(vollabeldiv).append(volsliderdiv);

			this.freqslider = $('<input>').addClass('slider col-xs-12').attr('type', 'text').val(0.7);
			var freqsliderlabel = $('<span>').addClass('glyphicon glyphicon-flash');
			var freqlabeldiv = $('<div>').addClass('col-xs-2').append(freqsliderlabel);
			var freqsliderdiv = $('<div>').addClass('col-xs-9').append(this.freqslider);
			var freqdiv = $('<div>').addClass('row').append(freqlabeldiv).append(freqsliderdiv);

			var symbol = $('<div>').addClass('glyphicon glyphicon-play');
			var span = $('<div>').addClass('soundLabel').text(name);
			var a = $('<a>').addClass('btn btn-default btn-circle').append(symbol);
			var div = $('<div>').addClass('col-xs-4 col-sm-2 centerize slim hidden')
				.append(a).append(span).append(freqdiv).append(voldiv);
			var obj = this; 
			a.click(function(){
				obj.play();
			});
			return div;
	};
	Sound.prototype.show = function(){
		this.dom.removeClass('hidden');
	};
	Sound.prototype.hide = function(){
		this.dom.addClass('hidden');
	};
	Sound.prototype.play = function(){
		this.sound.play();
	};
	Sound.prototype.stop = function(){
		this.sound.stop();
	}
	// Sound Sets
	var Soundset = function(name) {
		this.name = name;
		this.dom = this.genDom(name);
		this.sounds = [];
	};
	Soundset.prototype.genDom = function(name) {
			var option = $('<option>').text(name);
			var obj = this;
			option.onSelect = function() {
				console.log("Changed to " + name);
				app.sounds.All.sounds.forEach(function(sound){
					sound.hide();
				});
				obj.sounds.forEach(function(sound){
					sound.show();
				});
			};
			return option;
	};
	// Background music
	var Loop = function(o) {
		this.name = o.name;
		this.buffer = o.buffer || false;
		this.dom = this.genDom(this.name);
		if(this.buffer) {
			this.loop = new Howl({
				urls: [this.name],
				customBuffers: [this.buffer],
				volume: 0.7,
				loop: true
			});
		} else {
			this.loop = new Howl({
				urls: [this.name],
				volume: 0.7,
				loop: true
			});
		}
		console.log(this.name + " loaded");
	};
	Loop.prototype.genDom = function(name) {
		var icon = $('<span>').addClass('glyphicon glyphicon-play');
		var a = $('<a>').attr('href','#').addClass('list-group-item').append(icon).append(" "+name); // Weird Hack, but looks good
		var loop = this;
		a.click(function() {
			loop.toggle()
		});
		return a;
	};
	Loop.prototype.start = function() {
		if (app.currentloop == this) {
			return true;
		}
		if(app.currentloop != null) {
			app.currentloop.stop();
		}
		this.dom.addClass('active');
		this.dom.find('.glyphicon').addClass('glyphicon-stop');
		this.dom.find('.glyphicon').removeClass('glyphicon-play');
		app.currentloop = this;
		app.currentloop.loop.fadeIn(app.volume, 3000);
	}
	
	Loop.prototype.stop = function() {
		if(app.currentloop == this) {
			app.currentloop.dom.removeClass('active');
			app.currentloop.dom.find('.glyphicon').removeClass('glyphicon-stop');
			app.currentloop.dom.find('.glyphicon').addClass('glyphicon-play');
			app.currentloop.loop.fadeOut(0, 3000);
			app.currentloop = null;
		}
	}

	Loop.prototype.toggle = function() {
		if(app.currentloop == this) {
			this.stop();
		} else {
			this.start();
		}
	}
	// Preset Class
	var Preset = function (o) {
		var self = this;
		self.name = o.name;
		var loopname = o.loop;
		self.loop = {};
		app.loops.forEach(function (l) {if(l.name == loopname){self.loop = l}});
		self.volume = o.volume;
		self.sounds = [];
		o.sounds.forEach(function (preset_sound) {
			app.sounds[preset_sound.set].sounds.forEach(function (s) {
				if(preset_sound.name == s.name){preset_sound.sound = s};
			})
			self.sounds.push(preset_sound);
		});
		this.dom = this.genDom();
	}
	Preset.prototype.apply = function () {
		app.volume = this.volume;
		app.bgvolslider.slider('setValue',app.volume);
		app.setBGVol(app.volume);
		this.loop.start();
		app.sounds["All"].sounds.forEach(function (s) {
			s.stop();
			s.freqslider.slider('setValue', 0);
			s.freqslider.setFrequency(0);
		});
		this.sounds.forEach(function (s) {
			s.sound.freqslider.slider('setValue', s.freq);
			s.setFrequency(s.freq);
			s.sound.volslider.slider('setValue', s.volume);
			s.setVolume(s.volume);
		});
	};
	Preset.prototype.genDom = function () {
		var self = this;
		var a = $('<a>').addClass('list-group-item').text(this.name);
		a.click(function () {
			self.apply();
		})
		return a;
	}
	// End Classes
	//
	var handleZip = function(e) {
		var zip = new JSZip(e.target.result);
		var loops = zip.file(/^loops\/[^\/]*$/); // get all files in loop folder
		loops.forEach(function (loop) {
			var name = loop.name.replace(/loops\//, '');
			var soundloop = new Loop({name: name, buffer: loop.asArrayBuffer()});
			app.loops.push(soundloop);
			app.loopcontainer.append(soundloop.dom);
		});
		var soundset  = zip.folder(/^sounds\/[^\/]*\/$/); // get all soundsets
		soundset.forEach(function(soundset){
			var soundsetname = soundset.name.replace(/sounds\//, '').replace(/\//, '')
			var sounds = zip.folder(soundset.name).file(/./);
			app.sounds[soundsetname] = new Soundset(soundsetname);
			app.soundsetsContainer.append(app.sounds[soundsetname].dom);
			sounds.forEach(function (sound) {
				var name = sound.name.replace(/^.*\//, '') 
				var audiosound = new Sound({name: name, buffer: sound.asArrayBuffer()});
				app.sounds["All"].sounds.push(audiosound);
				app.sounds[soundsetname].sounds.push(audiosound);
				app.soundsContainer.append(audiosound.dom);
				audiosound.freqslider.slider({min:0,max:1,step:0.01,value:0.0,orientation:"horizontal",selection:"before",tooltip:"hide"});
				audiosound.freqslider.slider().on('slide', function(ev){
					var freq = ev.value
					audiosound.setFrequency(freq)});
				audiosound.volslider.slider({min:0,max:1,step:0.01,value:0.7,orientation:"horizontal",selection:"before",tooltip:"hide"});
				audiosound.volslider.slider().on('slide', function(ev){
					var volume = ev.value
					audiosound.setVolume(volume)});
			});
			app.sounds["All"].dom.onSelect();
		});
		var presets = JSON.parse(zip.file(/^presets.js/)[0].asText());
		presets.settings.forEach(function (presetdata) {
			var p = new Preset(presetdata);
			app.presetContainer.append(p.dom);
			app.preset.push(p);
		});
	}

	var setBGVol = function(vol) {
		app.volume = vol;
		if(app.currentloop != null) {
			app.currentloop.loop.volume(app.volume);
		}
	}

	var initialize = function() {
		// First initialize the soundboard
		app.soundsetsContainer = $('#soundsets');
		app.soundsContainer = $('#sounds');
		app.soundsetsContainer.change(function(){
			var selection = $('#soundsets option:selected').text();
			app.sounds[selection].dom.onSelect();
		});

		app.sounds = {};

		app.sounds["All"] = new Soundset("All");
		app.soundsetsContainer.append(app.sounds["All"].dom);

		// Then initialize the BG-Loop Music
		app.loops = [];
		app.volume = 0.7;
		app.currentloop = null;
		app.loopcontainer = $('#backgrounds');
		app.bgvolslider = $('#bg-vol').slider('getValue')
		app.bgvolslider.slider().on('slide', function(ev) {
			var vol = ev.value
			app.setBGVol(vol)
		});

		// Finaly initialize the presets
		app.presetContainer = $('#presets')
		app.preset = []

		// Handling the files
		var fileuploader = $('#file');
		fileuploader.change(function(evt) {
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.onload = handleZip;
			reader.readAsArrayBuffer(file);
			fileuploader.wrap('<form>').closest('form').get(0).reset();
			fileuploader.unwrap();
		});
	};
	return{initialize: initialize, setBGVol: setBGVol, Preset: Preset, Sound: Sound, Soundset: Soundset, sounds: sounds, Loop: Loop};
})();
app.initialize();
