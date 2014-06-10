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
		var sound = this;
		this.frequency = freq;
		if (this.interval != null) {
			clearInterval(this.interval);
		}
		if (freq > 0 && freq <= 100) {
			this.interval = setInterval(function(){sound.play()}, (100/freq-1)*1000);
		}
	};
	Sound.prototype.setVolume = function(vol) {
		console.log(this.name + " Volume set to " + vol);
		this.volume = vol;
		this.sound.volume(vol/100);
	}
	Sound.prototype.genDom = function(name){
			var volslider = $('<input>').attr('type', 'range').attr('min','0').attr('max','100').attr('value',70);
			var volsliderlabel = $('<span>').addClass('glyphicon glyphicon-volume-up');
			var vollabeldiv = $('<div>').addClass('col-xs-2').append(volsliderlabel);
			var volsliderdiv = $('<div>').addClass('col-xs-9').append(volslider);
			var voldiv = $('<div>').addClass('row').append(vollabeldiv).append(volsliderdiv);

			var freqslider = $('<input>').attr('type', 'range').attr('min','0').attr('max','100').attr('value',0);
			var freqsliderlabel = $('<span>').addClass('glyphicon glyphicon-flash');
			var freqlabeldiv = $('<div>').addClass('col-xs-2').append(freqsliderlabel);
			var freqsliderdiv = $('<div>').addClass('col-xs-9').append(freqslider);
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
			freqslider.change(function(){obj.setFrequency(this.value)});
			volslider.change(function(){obj.setVolume(this.value)});
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
		a.click(function () {
			if(app.currentloop == loop) {
				app.currentloop.dom.removeClass('active');
				app.currentloop.dom.find('.glyphicon').removeClass('glyphicon-stop');
				app.currentloop.dom.find('.glyphicon').addClass('glyphicon-play');
				app.currentloop.loop.fadeOut(0,500);
				app.currentloop = null;
			} else {
				if(app.currentloop != null) {
					app.currentloop.dom.removeClass('active');
					app.currentloop.dom.find('.glyphicon').removeClass('glyphicon-stop');
					app.currentloop.dom.find('.glyphicon').addClass('glyphicon-play');
				}
				loop.dom.addClass('active');
				loop.dom.find('.glyphicon').addClass('glyphicon-stop');
				loop.dom.find('.glyphicon').removeClass('glyphicon-play');
				loop.start();
			}
		});
		return a;
	};
	Loop.prototype.start = function() {
		console.log(this.name + " started");
		if(app.currentloop != null) {
			app.currentloop.loop.fadeOut(0, 3000);
		} 
		app.currentloop = this;
		app.currentloop.loop.fadeIn(app.volume, 3000);
	}
	// End Classes
	//
	var handleZip = function(e) {
		var zip = new JSZip(e.target.result);
		var loops = zip.file(/^loops\/[^\/]*$/); // get all files in loop folder
		loops.forEach(function (loop) {
			var name = loop.name.replace(/loops\//, '');
			console.log('Added loop '+name);
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
			});
			app.sounds["All"].dom.onSelect();
		});
	};

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
		var bgvol = $('#bg-vol');
		bgvol.change(function() {
			console.log("BG Volume:" + this.value); 
			app.volume = this.value / 100;
			if(app.currentloop != null) {
				app.currentloop.loop.volume(app.volume);
			}
		});
		// Handling the files
		var fileuploader = $('#files');
		fileuploader.change(function(evt) {
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.onload = handleZip;
			reader.readAsArrayBuffer(file);
		});
	};
	return{initialize: initialize, Sound: Sound, Soundset: Soundset, sounds: sounds, Loop: Loop};
})();
app.initialize();
