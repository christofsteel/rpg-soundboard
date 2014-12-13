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
		this.soundset = "All";
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
			var vollabeldiv = $('<div>').addClass('col-sm-2 col-xs-12').append(volsliderlabel);
			var volsliderdiv = $('<div>').addClass('col-sm-10 col-xs-12 fullwidth').append(this.volslider);
			var voldiv = $('<div>').addClass('row').append(vollabeldiv).append(volsliderdiv);

			
			this.freqslider = $('<input>').addClass('slider col-xs-12').attr('type', 'text').val(0.7);
			var freqsliderlabel = $('<span>').addClass('glyphicon glyphicon-flash');
			var freqlabeldiv = $('<div>').addClass('col-sm-2 col-xs-12').append(freqsliderlabel);
			var freqsliderdiv = $('<div>').addClass('col-sm-10 col-xs-12 fullwidth').append(this.freqslider);
			var freqdiv = $('<div>').addClass('row').append(freqlabeldiv).append(freqsliderdiv);

			var symbol = $('<div>').addClass('glyphicon glyphicon-play');
			var span = $('<div>').addClass('soundLabel').text(name);
			var delete_button = $('<a>').addClass('glyphicon glyphicon-remove btn').attr('style','right:5%; text-align: right; color: #d9534f; position:absolute').attr('href', '#')
			var delete_div = $('<div>').addClass('pull-right').append(delete_button)
			var a = $('<a>').addClass('btn btn-success btn-circle').append(symbol);
			var div = $('<div>').addClass('col-xs-6 col-sm-4 col-md-3 centerize slim hidden').attr('style', 'position: relative;')
				.append(delete_div).append(a).append(span).append(freqdiv).append(voldiv);
			var obj = this; 
			a.click(function(){
				obj.play();
			});
			delete_button.click(function() {
				obj.remove();
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
	Sound.prototype.remove = function() {
		this.sound.stop();
		this.setFrequency(0);
		this.dom.remove();
		app.sound
		index = app.sounds["All"].sounds.indexOf(this);
		app.sounds["All"].sounds.splice(index, 1);
		index2 = app.sounds[this.soundset].sounds.indexOf(this);
		app.sounds[this.soundset].sounds.splice(index, 1);
		delete this.buffer;
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
				app.soundset = name;
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
		/*<div class="input-group">
			<div class="input-group-btn">
			<a href="#" role="button" class="btn btn-default"><span class="glyphicon glyphicon-play"></span></a>
			</div>
			<input type="text" class="form-control" value="NAME" />
			<div class="input-group-btn">
			<a href="#" role="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></a>
			</div>
		</div> */
		var input_group = $("<div>").addClass('input-group');
		var play_group = $("<div>").addClass('input-group-btn');
		var play_button = $("<a>").addClass('bg-play-btn btn btn-success').attr("href", "#").attr("role", "button");
		var play_icon = $('<span>').addClass('glyphicon glyphicon-play');
		var input_text = $('<input>').addClass('form-control').attr("disabled","disabled").attr('style','cursor:auto; background-color:white;').attr("type", "text").val(name);
		var remove_group = $("<div>").addClass('input-group-btn');
		var remove_button = $("<a>").addClass('btn btn-danger').attr("href", "#").attr("role", "button");
		var remove_icon = $('<span>').addClass('glyphicon glyphicon-trash');

		input_group.append(play_group).append(input_text).append(remove_group);
		play_group.append(play_button);
		play_button.append(play_icon);
		remove_group.append(remove_button);
		remove_button.append(remove_icon);

		//var a = $('<a>').attr('href','#').addClass('list-group-item').append(icon).append(" "+name); // Weird Hack, but looks good
		var loop = this;
		play_button.click(function() {
			loop.toggle();
		});
		remove_button.click(function() {
			loop.remove();
		});
		return input_group;
	};
	Loop.prototype.start = function() {
		if (app.currentloop == this) {
			return true;
		}
		if(app.currentloop != null) {
			app.currentloop.stop();
		}
		this.dom.find('.bg-play-btn').removeClass('btn-success').addClass('btn-primary');
		this.dom.find('.bg-play-btn span').addClass('glyphicon-stop').removeClass('glyphicon-play');
		app.currentloop = this;
		app.currentloop.loop.fadeIn(app.volume, 3000);
	}
	
	Loop.prototype.stop = function() {
		if(app.currentloop == this) {
			app.currentloop.dom.find('.bg-play-btn').removeClass('btn-primary').addClass('btn-success');
			app.currentloop.dom.find('.bg-play-btn span').removeClass('glyphicon-stop').addClass('glyphicon-play');
			app.currentloop.loop.fadeOut(0, 3000);
			app.currentloop = null;
		}
	}
	Loop.prototype.remove = function() {
		if(app.currentloop == this) {
			this.stop();
		}
		this.dom.remove();
		index = app.loops.indexOf(this);
		app.loops.splice(index, 1);
		delete this.buffer;
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
		if(this.loop) {
			app.bgvolslider.slider('setValue',app.volume);
			app.setBGVol(app.volume);
			this.loop.start();
		}
		app.sounds["All"].sounds.forEach(function (s) {
			s.stop();
			s.freqslider.slider('setValue', 0);
			s.setFrequency(0);
		});
		this.sounds.forEach(function (s) {
			console.log(s)
			s.sound.freqslider.slider('setValue', s.freq);
			s.sound.setFrequency(s.freq);
			s.sound.volslider.slider('setValue', s.volume);
			s.sound.setVolume(s.volume);
		});
	};
	Preset.prototype.remove = function () {
		this.dom.remove();
		index = app.preset.indexOf(this);
		app.preset.splice(index, 1);
	};
	Preset.prototype.genDom = function () {
		/*<div class="input-group">
			<div class="input-group-btn">
			<a href="#" role="button" class="btn btn-success"><span class="glyphicon glyphicon-chevron-left"></span></a>
			</div>
			<input type="text" class="form-control btn btn-default" disabled value="NAME" />
			<div class="input-group-btn">
			<a href="#" role="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></a>
			</div>
		</div>*/
		var input_group = $('<div>').addClass("input-group");
		var apply_group = $("<div>").addClass('input-group-btn');
		var apply_button = $("<a>").addClass('btn btn-success').attr("href", "#").attr("role", "button");
		var apply_icon = $('<span>').addClass('glyphicon glyphicon-chevron-left');
		var input_text = $('<input>').addClass('form-control').attr("disabled","disabled").attr('style','cursor:auto; background-color:white;').attr("type", "text").val(this.name);
		var remove_group = $("<div>").addClass('input-group-btn');
		var remove_button = $("<a>").addClass('btn btn-danger').attr("href", "#").attr("role", "button");
		var remove_icon = $('<span>').addClass('glyphicon glyphicon-trash');

		input_group.append(apply_group).append(input_text).append(remove_group);
		apply_group.append(apply_button);
		apply_button.append(apply_icon);
		remove_group.append(remove_button);
		remove_button.append(remove_icon);
		var self = this;
		apply_button.click(function () {
			self.apply();
		});
		remove_button.click(function () {
			self.remove();
		});
		return input_group;
	}
	// End Classes
	//
	var handleSounds = function(file) {return function(e) {
		var filename = file.name
		var audiosound = new Sound({name: filename, buffer: e.target.result});
		app.sounds["All"].sounds.push(audiosound);
		app.sounds[app.soundset].sounds.push(audiosound);
		app.soundsContainer.append(audiosound.dom);
		audiosound.soundset = app.soundset;
		audiosound.freqslider.slider({min:0,max:1,step:0.01,value:0.0,orientation:"horizontal",selection:"before",tooltip:"hide"});
		audiosound.freqslider.slider().on('slide', function(ev){
			var freq = ev.value
			audiosound.setFrequency(freq)});
		audiosound.volslider.slider({min:0,max:1,step:0.01,value:0.7,orientation:"horizontal",selection:"before",tooltip:"hide"});
		audiosound.volslider.slider().on('slide', function(ev){
			var volume = ev.value
			audiosound.setVolume(volume)});
		console.log("Added " + filename + " to " + app.soundset);
		app.sounds[app.soundset].dom.onSelect();
	};};

	var handleBackground = function(file) {return function(e) {
		var filename = file.name
		var audiosound = new Loop({name: filename, buffer: e.target.result});
		app.loops.push(audiosound);
		app.loopcontainer.append(audiosound.dom);
	};};
	var handleZip = function(file) { return function(e) {
		var zip = new JSZip(e.target.result);
		var loops = zip.file(/^loops\/[^\/]*$/); // get all files in loop folder
		var name = file.name.replace(/\.zip$/,'');

		$("#name").val(name);
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
				audiosound.soundset = soundsetname;
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
	};}

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

		app.soundset = "All"
		app.sounds["All"] = new Soundset("All");
		app.soundsetsContainer.append(app.sounds["All"].dom);

		// Then initialize the BG-Loop Music
		app.loops = [];
		app.volume = 0.7;
		app.currentloop = null;
		app.loopcontainer = $('#backgrounds');
		app.bgvolslider = $('#bg-vol')
		app.bgvolslider.slider().on('slide', function(ev) {
			var vol = ev.value
			app.setBGVol(vol)
		});

		// Global Volume control
		app.volslider = $('#vol');
		app.volslider.slider().on('slide', function(ev) {
			var vol = ev.value;
			$('#mute_button').removeClass('glyphicon-volume-off').addClass('glyphicon-volume-up');
			Howler.volume(vol);
			if (vol == 0) {
				$('#mute_button').removeClass('glyphicon-volume-up').addClass('glyphicon-volume-off');
				Howler.mute()
			}
		});

		app.mutebutton = $('#mute_button');
		app.mutebutton.click(function () {
			if (Howler._muted) {
				console.log('unmute');
				$('#mute_button').removeClass('glyphicon-volume-off').addClass('glyphicon-volume-up');
				Howler.unmute();
			} else {
				console.log('mute');
				$('#mute_button').removeClass('glyphicon-volume-up').addClass('glyphicon-volume-off');
				Howler.mute();
			}
		});


		// Finaly initialize the presets
		app.presetContainer = $('#presets')
		app.preset = []

		// Handling the files
		var zipuploader = $('#add_zip');
		zipuploader.change(function(evt) {
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.onload = handleZip(file);
			reader.readAsArrayBuffer(file);
			zipuploader.wrap('<form>').closest('form').get(0).reset();
			zipuploader.unwrap();
		});
		$('#add_soundset').click(function(evt) {
			var soundset_name = prompt('Soundset Name:', 'New Soundset');
			if(app.sounds[soundset_name]) {
				alert("Soundset already exists");
			} else {
				if(soundset_name == "" || soundset_name == null) {
					alert("Please enter a name")
				} else {
					app.sounds[soundset_name] = new Soundset(soundset_name);
					app.soundsetsContainer.append(app.sounds[soundset_name].dom);
					app.sounds[soundset_name].dom.onSelect();
					app.soundsetsContainer.val(soundset_name);
					console.log("Created Soundset " + soundset_name);
				}
			}
		});
		var soundsuploader = $('#add_sound');
		soundsuploader.change(function(evt) {
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.onload = handleSounds(file);
			reader.readAsArrayBuffer(file);
			zipuploader.wrap('<form>').closest('form').get(0).reset();
			zipuploader.unwrap();
		});
		var backgrounduploader = $('#add_background');
		backgrounduploader.change(function(evt) {
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.onload = handleBackground(file);
			reader.readAsArrayBuffer(file);
			backgrounduploader.wrap('<form>').closest('form').get(0).reset();
			backgrounduploader.unwrap();
		});
		$('#add_preset').click(function(evt){
			var presetname = prompt("Preset name", "New Preset");
			var sounds = [];
			for (set in app.sounds) {
				if (set != "All") {
					for(sound in app.sounds[set].sounds) {
						if(app.sounds[set].sounds[sound].frequency > 0) {
							sounds.push({
								set: set,
								name: app.sounds[set].sounds[sound].name,
								freq: app.sounds[set].sounds[sound].frequency,
								volume: app.sounds[set].sounds[sound].volume
							});
						}
					}
				}
			}
			var loop = ""
			if(app.currentloop){
				loop = app.currentloop.name;
			} 
			var p = new Preset({name: presetname, 
				loop: loop,
				volume: app.volume,
				sounds: sounds,
				});
			app.presetContainer.append(p.dom);
			app.preset.push(p);
		});
		$('#dl_zip').click(function(evt){
			var zip = new JSZip();
			var presetJSON = {'settings': []}
			app.preset.forEach(function(p){
				var pjson = {}
				pjson.name = p.name;
				pjson.loop =  p.loop.name;
				pjson.volume = p.volume;
				pjson.sounds = [];
				p.sounds.forEach(function(s){
					var sjson = {}
					sjson.set = s.set;
					sjson.name = s.name;
					sjson.freq = s.freq;
					sjson.volume = s.volume;
					pjson.sounds.push(sjson)
				});
				presetJSON.settings.push(pjson);
			});
			zip.file("presets.js",JSON.stringify(presetJSON));
			app.loops.forEach(function(l){
				zip.file("loops/" + l.name, l.buffer)
			});
			for(set in app.sounds){
				if(set != "All") {
					app.sounds[set].sounds.forEach(function(s){
						zip.file("sounds/" + set + "/" + s.name,s.buffer);
					});
				}
			}
			var content = zip.generate({type:"blob"});
			var name = $("#name").val();
			if(name == "") {
				name = "soundboard"
			}
			saveAs(content, name + ".zip")
		});
	};
	return{initialize: initialize, setBGVol: setBGVol, Preset: Preset, Sound: Sound, Soundset: Soundset, sounds: sounds, Loop: Loop};
})();
app.initialize();
