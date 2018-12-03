

// ooo        ooooo                                      oooooooooo.                     
// `88.       .888'                                      `888'   `Y8b                    
//  888b     d'888   .ooooo.  ooo. .oo.   oooo  oooo      888     888  .oooo.   oooo d8b 
//  8 Y88. .P  888  d88' `88b `888P"Y88b  `888  `888      888oooo888' `P  )88b  `888""8P 
//  8  `888'   888  888ooo888  888   888   888   888      888    `88b  .oP"888   888     
//  8    Y     888  888    .o  888   888   888   888      888    .88P d8(  888   888     
// o8o        o888o `Y8bod8P' o888o o888o  `V88V"V8P'    o888bood8P'  `Y888""8o d888b    
                                                                                      


function MenuBar(){
	this.pos;
	this.keyboardOctave;
	this.outputVisualizer;
	this.mainOutputVolume;
	this.playMode;
	this.swingKnob;
	this.BPMKnob;
	this.menuButton;
	this.performanceModeButton;
	this.visualizerButton;
	this.repeatButton;
	this.cheatbutton;
	this.play;
	this.stop;
	this.saveButton;
	this.loadButton;
	this.onlineButton;
	this.midiselect;
	this.quickGuideButton;



	this.display = function(){
		push();
			//background
			fill(formBackGroundColor);
			stroke( 40 );
			strokeWeight( 2 );
			rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);
					
			//play/stop buttons
			fill(188, 90, 18)
			stroke(208, 110, 38)
			if (playing == true){
				fill(180);
				stroke(200);
			}
			ellipse(this.play.x, this.play.y, this.play.w);

			fill(188, 90, 18)
			stroke(208, 110, 38)
			if (playing == false){
				fill(180);
				stroke(200);
			}
			ellipse(this.stop.x, this.stop.y, this.stop.w);

			fill(0, 180)
			noStroke();
			beginShape();
			vertex(this.play.x - this.play.w / 6, this.play.y - this.play.h / 4 );
			vertex(this.play.x + this.play.w / 4, this.play.y);
			vertex(this.play.x - this.play.w / 6, this.play.y + this.play.h / 4 );
			endShape(CLOSE);
			rect(this.stop.x - this.stop.w / 4, this.stop.y - this.stop.h / 4, this.stop.w / 2, this.stop.h / 2);

			//background for knobs and midi select
			fill(titleBarColor + 10);
			stroke(188, 90, 18);
			strokeWeight(2.1);
			rect(this.mainOutputVolume.pos.x - this.mainOutputVolume.size * 1, 5, this.swingKnob.pos.x + this.swingKnob.size - (this.mainOutputVolume.pos.x - this.mainOutputVolume.size * 1.2), insideTop - 10, 5);
			rect(this.keyboardOctave.pos.x - this.keyboardOctave.size * 1.5, 5, this.midiselect.position().x + this.midiselect.width + 10 - (this.keyboardOctave.pos.x - (this.keyboardOctave.size * 1.5)), insideTop - 10, 5);

			//the text of the pressed keys
			textSize((insideTop - 10) / 3);
			textStyle(BOLD);
			stroke(188, 90, 18);
			strokeWeight(1);
			fill(188, 90, 18);
			let str = "";
			for (var i = 0; i < keyboardPolyNotes.length; i++){
				str += midiToString(keyboardPolyNotes[i]) +  " - ";
			}
			str = str.substr(0, str.length - 3);
			text( str, this.midiselect.x + this.midiselect.width* 0.4, insideTop * 0.45);

			//logo, width shade
			stroke(80);
			fill(90);
			textSize( insideTop - 30);
			textAlign(RIGHT);
			text("SYNTH64", width - 5, insideTop - 20);

			stroke(188, 90, 18);
			fill(188, 90, 18);
			textSize( insideTop - 30);
			textAlign(RIGHT);
			text("SYNTH64", width - 10, insideTop - 25);
			
			//framerate
			noStroke();
			textAlign(LEFT);
			fill(0);
			textSize(12);
			text(round( frameRate() + 1 ), width - 10, 10);
		pop();

		

		this.outputVisualizer.display();
		this.keyboardOctave.display();
		this.performanceModeButton.display();
		this.visualizerButton.display();
		this.repeatButton.display();
		this.cheatbutton.display();
		this.playMode.display();
		this.mainOutputVolume.display();
		this.swingKnob.display();
		this.BPMKnob.display();
		this.quickGuideButton.display()


	}

	this.init = function(){

		//create elements

		this.keyboardOctave = new KnobObject( 0,0,0, "Typing Keyboard\nOctave", function(){});
		this.keyboardOctave.set(1,6,3,1);

		this.outputVisualizer = new OutputVisualizer();

		this.mainOutputVolume = new KnobObject(width - knobSize * 2, height / 2 - knobSize * 3, knobSize, "Volume", function(){
			masterVolume(this.value / 100);
		});
		this.mainOutputVolume.set(0,100,50,1);

		this.playMode = new PlayMode();

		this.BPMKnob = new KnobObject(32, height / 2 - knobSize, knobSize, "BPM", function(){
			pulseWorker.postMessage({'msg' : this.value});
		});
 		this.BPMKnob.set(0,500,120,1);
	
	 	this.swingKnob = new KnobObject(65, height / 2 - knobSize, knobSize, "Swing", function(){
	 		pulseWorker.postMessage({'msg' : 'swing', 'swng' : this.value/2});
	 	});
	 	this.swingKnob.set(0,1,0,0.01);



	 	this.menuButton = new FunctionButtonObject( 5, 5, knobSize, "MENU");

	 	this.performanceModeButton = new FunctionButtonObject( 5, 5, knobSize, "Performance\nMode");
	 	this.visualizerButton = new FunctionButtonObject( 5, 5, knobSize, "3D Visualizer");

	 	this.cheatbutton = new FunctionButtonObject( 5, 5, knobSize, "BPM / Hz\ntables");
	 	this.repeatButton = new FunctionButtonObject( 5, 5, knobSize, "Repeat");
	 	this.repeatButton.active = true;

	 	this.quickGuideButton = new FunctionButtonObject( 5, 5, knobSize, "Quick Guide");
	 	
	 	this.saveButton = createButton("Save") //.hide();
	 	this.saveButton.mousePressed(function(){
	 		let tempProjectName = window.prompt("Save project as:", projectName || "Untitled");
	 		if (tempProjectName != null){
	 			projectName = tempProjectName;
	 			SaveProject();	

	 			window.onbeforeunload = "";
	 		}
			
	 	});

	 	this.fileInput = createFileInput(function(file){
	 		DropFile(file);
	 	}).hide();

	 	this.loadButton = createButton('Load') //.hide();
	 	this.loadButton.mousePressed(()=>{
	 		this.fileInput.elt.click();
	 	})

	 	this.onlineButton = createButton("Demo") //.hide();
	 	this.onlineButton.mousePressed(function(){
	 		if (confirm("Load demo project? Current project will be lost.")) loadJSON('res/demo.txt', LoadProject);
	 	});


	 	this.midiselect = createSelect();
	 	this.midiselect.option("MIDI Devices", -1);
		this.midiselect.input(function(){ 

			WebMidi.inputs.forEach((input)=>{input.removeListener()});
		
			let s = this.selected();
			
			if (s > -1){
				WebMidi.inputs[s].addListener('noteon', "all",function(e){

					if (sounds[selectedSound].arpButton.active && soundForm.inFront == true){	
						if (sounds[selectedSound].arp.length == 0 || sounds[selectedSound].arpKnob.value == sounds[selectedSound].arp.length -1){
							sounds[selectedSound].arp.push(e.note.number);
							let max = sounds[selectedSound].arp.length - 1;
							sounds[selectedSound].arpKnob.set(0, max, max, 1);
						}else{
							sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] = e.note.number;
						}

						soundForm.render = true;
					}

					if (keyboardPolyNotes.length < 3){
						keyboardPolyNotes.push(e.note.number);
						keyboardPolyNotes.sort((a,b)=>a>b);

						if (pianoForm.inFront && playing) {
							patterns[currentPattern][selectedSound][beatCounter] = []; 
							keyboardPolyNotes.forEach((n)=>{
								patterns[currentPattern][selectedSound][beatCounter].push(n);
							});
							editPatternImage(currentPattern, selectedSound);
						}

						sounds[selectedSound].playPolyNotes(keyboardPolyNotes);
					}
				});

				WebMidi.inputs[s].addListener('noteoff', "all",function(e){
					keyboardPolyNotes.forEach((pnote, index)=>{
						if (pnote == e.note.number){
							keyboardPolyNotes.splice(index, 1);
						}
					});
				});

				localStorage.setItem("midi", WebMidi.inputs[s].name);
			}
		});

	}

	this.layOut = function(){

		//set coords for all elements

		this.pos = {x: 0, y: 0, w: width, h: insideTop}
		
		this.menuButton.height = insideTop * 0.6
		this.menuButton.pos.set(5, insideTop / 2 - this.menuButton.height / 2);	

		this.saveButton.size(this.menuButton.pos.x + this.menuButton.width, insideTop * 0.3);
		this.saveButton.position(5, 2);	

		this.loadButton.size(this.menuButton.pos.x + this.menuButton.width, insideTop * 0.3);
		this.loadButton.position(5, 3 + insideTop * 0.3);	

		this.onlineButton.size(this.menuButton.pos.x + this.menuButton.width, insideTop * 0.3);
		this.onlineButton.position(5, 3 + insideTop * 0.6);	

		this.outputVisualizer.pos.set(this.menuButton.pos.x + this.menuButton.width + 10, 1);
		this.outputVisualizer.width = width / 10;
		this.outputVisualizer.height = insideTop - 3;

		this.playMode.height = insideTop - 2;
		this.playMode.pos.set( this.outputVisualizer.pos.x + this.outputVisualizer.width + this.outputVisualizer.width / 8 + 5, insideTop - this.playMode.height - 2);

		this.performanceModeButton.width = width/20 - 5;
		this.performanceModeButton.height = insideTop * 0.45;
		this.performanceModeButton.pos.set(this.playMode.pos.x + this.playMode.width + 15);

		this.visualizerButton.width = width/20 - 5;
		this.visualizerButton.height = insideTop * 0.45;
		this.visualizerButton.pos.set(this.playMode.pos.x + this.playMode.width + 20 + width/20);		

		this.repeatButton.width = width/20 - 5;
		this.repeatButton.height = insideTop * 0.45;
		this.repeatButton.pos.set(this.playMode.pos.x + this.playMode.width + 15, this.performanceModeButton.height + 5);

		this.cheatbutton.width = width/20 - 5;
		this.cheatbutton.height = insideTop * 0.45;
		this.cheatbutton.pos.set(this.playMode.pos.x + this.playMode.width + 20 + width/20, this.performanceModeButton.height + 5);

		this.play = {x: this.performanceModeButton.pos.x + this.performanceModeButton.width * 2 + 25 + knobSize, y : insideTop / 2, w: insideTop * 0.7, h: insideTop * 0.7 }
		this.stop = {x: this.performanceModeButton.pos.x + this.performanceModeButton.width * 2 + 40 + knobSize + insideTop * 0.7 , y : insideTop / 2, w: insideTop * 0.7, h: insideTop * 0.7}
				
		this.mainOutputVolume.pos.set(this.stop.x + this.stop.w * 1.2, insideTop / 3)
		this.mainOutputVolume.size = knobSize;

		this.BPMKnob.pos.set(this.mainOutputVolume.pos.x + knobSize * 2, insideTop / 3);
		this.BPMKnob.size = knobSize;
		this.BPMKnob.index = 0;

		this.swingKnob.pos.set(this.BPMKnob.pos.x + knobSize * 2.1, insideTop / 3);
		this.swingKnob.size = knobSize;
		this.swingKnob.index = 0;

		this.keyboardOctave.pos.set( this.swingKnob.pos.x + knobSize * 3, insideTop / 3 );
		this.keyboardOctave.size = knobSize;
		this.keyboardOctave.index = 0;

		this.midiselect.position( this.keyboardOctave.pos.x + knobSize * 2, insideTop / 1.5 );
		this.midiselect.size( 200 ,insideTop * 0.25)

		this.quickGuideButton.width = width/15;
		this.quickGuideButton.height = insideTop * 0.45;
		this.quickGuideButton.pos.set(this.midiselect.position().x + this.midiselect.width + 20, insideTop * 0.5 - this.quickGuideButton.height * 0.5);

	}

	this.catch = function(){
		this.playMode.catch();
		this.mainOutputVolume.catch()
		this.BPMKnob.catch();
		this.swingKnob.catch();
		this.keyboardOctave.catch();
		this.menuButton.catch();
		this.repeatButton.catch();
		

		if(this.visualizerButton.active && mouseY <= insideTop){ 
			this.visualizerButton.active = false;
			Visualizer3D.renderer.domElement.style.display = "none"
		} else {
			this.visualizerButton.catch();
		}

		if(this.performanceModeButton.active){ 
			this.performanceModeButton.active = false;
			soundForm.inFront = false;
			sequencerForm.display();
			patternForm.display();
			if (patternForm.inFront) {
				patternForm.patternbox.show();
				patternForm.addbutton.show();
			}
			frameRate(60);
		} else {
			this.performanceModeButton.catch();
		}
				
		if(this.quickGuideButton.active){
			quickGuideFrame.hide();
			this.quickGuideButton.active = false;
		} else {
			this.quickGuideButton.catch();
		}

		if(this.cheatbutton.active){
			iframe[0].hide();
			iframe[1].hide();
			this.cheatbutton.active = false;
		} else {
			this.cheatbutton.catch();
		}

		//click on play/pause
		if ( dist(mouseX, mouseY, this.play.x, this.play.y) < this.play.w / 2 && playing == false){
			playstop();

		}else if ( dist(mouseX, mouseY, this.stop.x, this.stop.y) < this.stop.w / 2){
			if (playing == true){
				playstop();
			} else {
				for (var i = 0; i < maxSounds; i++){
					sounds[i].playSilentNote(60);
				}
			}
		}

	}

	this.release = function(){
		this.mainOutputVolume.release()
		this.BPMKnob.release();
		this.swingKnob.release();
		this.keyboardOctave.release();

	}

	this.drag = function(amount){
		this.mainOutputVolume.drag(amount);
		this.BPMKnob.drag(amount);
		this.swingKnob.drag(amount);
		this.keyboardOctave.drag(amount);
	}
}

