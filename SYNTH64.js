//program objects
var cnv;
var recorder;
var pulseWorker;
var websocketWorker;

var menuBar;
var patternForm;
var sequencerForm;
var soundForm;
var pianoForm;
var waveForm;
var euclidianForm

var sounds = [];
var patterns = [];
var patternNames = [];
var patternImages = [];
var stepImage;


//note frquency mapping
var keyCodes = [90, 83, 88, 68,67, 86, 71, 66, 72, 78, 74, 77, 81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80]
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#","A", "A#", "B"];
var keyboardPolyNotes = [];

//output visualizer
var fft = new p5.FFT(0.8, 512);
var volumeLevel = new p5.Amplitude();
fft.setInput( p5.soundOut );


//interface / layout variables
var knobSize;
var insideTop;
var insideHeight;
var formBackGroundColor = 160;
var titleBarColor = 80;
var backGroundColor = 40;
var cornerRadius = 4;
var iframe = [1];
var quickGuideFrame;

//program variables
var projectName;
var authorName;
var loading = false;
var maxSounds = 16;
var maxBeats = 64;
var beatCounter = 0;
var currentPattern = 0;
var selectedSound = 0;
var playing = false;

var arpMenu = new ArpMenu();
var soundMenu = new SoundMenu();
var pattImageMenu = new PattImageMenu();

var Visualizer3D;

let warning;






//  .oooooo..o               .                          
// d8P'    `Y8             .o8                          
// Y88bo.       .ooooo.  .o888oo oooo  oooo  oo.ooooo.  
//  `"Y8888o.  d88' `88b   888   `888  `888   888' `88b 
//      `"Y88b 888ooo888   888    888   888   888   888 
// oo     .d8P 888    .o   888 .  888   888   888   888 
// 8""88888P'  `Y8bod8P'   "888"  `V88V"V8P'  888bod8P' 
//                                            888       
//                                           o888o      



function setup() {
	
	//p5 settings
	cnv = createCanvas( windowWidth, windowHeight );
	cnv.drop( DropFile );
	cnv.mouseWheel( mouseScroll );

	pixelDensity(1);
	textAlign(CENTER);
	textFont('Montserrat');
	masterVolume(0.5);


	//sound objects
	for (var i = 0; i < maxSounds; i++){
		sounds.push( new SoundObject(i, "Sound " + (i + 1)) );
	}
	sounds[0].start();
	sounds[0].waveChange();

	
	//create pattern images
	preload_patternImage();
	addPattern();

	//create UIforms
	menuBar = new MenuBar();
	patternForm = new PatternForm();
	sequencerForm = new SequencerForm();
	pianoForm = new PianoForm();
	soundForm = new SoundForm();
	waveForm = new WaveformForm();
	euclidianForm = new EuclidianForm();
	menuBar.init();
	
	initLayout();

	//setup bmp/freq && quickguide info frames
	iframe[0] = createElement('iframe').hide();
	iframe[0].attribute('src', './res/bpm_table.html');
	iframe[0].style('position', 'absolute');
	iframe[0].style('background-color', "rgb(180,180,180)");
	iframe[0].position(0,insideTop);
	iframe[0].size(width/2, windowHeight - insideTop);
	
	iframe[1] = createElement('iframe').hide();
	iframe[1].attribute('src', './res/notefreqs.html');
	iframe[1].style('position', 'absolute');
	iframe[1].style('background-color', "rgb(180,180,180)");
	iframe[1].position(width/2, insideTop);
	iframe[1].size(width/2, windowHeight - insideTop);

	quickGuideFrame = createElement('iframe').hide();
	quickGuideFrame.attribute('src', './res/quickGuide/quickGuide.html');
	quickGuideFrame.style('position', 'absolute');
	quickGuideFrame.position(width/2, insideTop);
	quickGuideFrame.size(width/2, windowHeight - insideTop);



	//setup midi input
	WebMidi.enable(function (err) {
	  	if (err){
	    	console.log("WebMidi could not be enabled.", err);
	    	
	  	} else {
		    console.log("WebMidi enabled!");
		    let pref;
		    let prevSelected = localStorage.getItem("midi");

			WebMidi.inputs.forEach((input, i)=>{
				menuBar.midiselect.option(input.name, i);
				if (input.name == prevSelected) pref = i;
			});

			if (pref != undefined){
				menuBar.midiselect.selected(pref);
				menuBar.midiselect._events.input();
			}
 		}
 	});
	
	//setup pulse worker (webworker helps getting a steady pulse, timeout or interval is not consistent)
	pulseWorker = new Worker("./lib/pulsegeneratorWorker.js");
	pulseWorker.addEventListener('message', function(event){
		Step();
	});
	pulseWorker.postMessage({'msg' : 120});

	//setup 3d visualizer
	Visualizer3D = new AudioVisualizer3D(0, insideTop, windowWidth, windowHeight);


	//init view
	background(backGroundColor);
	sequencerForm.display();
	patternForm.display();

	//'warning' for non-chrome browsers
	warning = document.querySelector(".warningDiv");

	console.log("Basis64 - SYNTH64 - v5.9");
}














// oooooooooo.                                                     
// `888'   `Y8b                                                    
//  888      888 oooo d8b  .oooo.   oooo oooo    ooo        88     
//  888      888 `888""8P `P  )88b   `88. `88.  .8'         88     
//  888      888  888      .oP"888    `88..]88..8'      8888888888 
//  888     d88'  888     d8(  888     `888'`888'           88     
// o888bood8P'   d888b    `Y888""8o     `8'  `8'            88     
                                                                
                                                                
                                                                
//  .oooooo..o     .                        
// d8P'    `Y8   .o8                        
// Y88bo.      .o888oo  .ooooo.  oo.ooooo.  
//  `"Y8888o.    888   d88' `88b  888' `88b 
//      `"Y88b   888   888ooo888  888   888 
// oo     .d8P   888 . 888    .o  888   888 
// 8""88888P'    "888" `Y8bod8P'  888bod8P' 
//                                888       
//                               o888o      



function draw() {
	
	
	//performance mode/ 3dvis mode
	if (menuBar.performanceModeButton.active == true){
		background(backGroundColor);
		menuBar.display();
		return;
	} else if (menuBar.visualizerButton.active == true){
		Visualizer3D.display();
		menuBar.display();
	 	return;
	}

	//display Forms
	menuBar.display();

	if ( patternForm.inFront ){
		if (pianoForm.inFront ){
			pianoForm.display();
			patternForm.patternbox.hide();
			patternForm.addbutton.hide();

		}else {
			if (patternForm.render){
				patternForm.display();
			} else if (soundForm.inFront == false) {
				patternForm.displayBeatCounter();
			}
		}

	}else{
	
		sequencerForm.display();
	}

	if (soundForm.inFront == true){
		if (soundForm.render){
			soundForm.display();
		}else if (sounds[selectedSound].arp.length > 0 && playing){
			soundForm.displayArpCounter()
		}
	}
	if (waveForm.inFront) waveForm.display();
	if (euclidianForm.inFront) euclidianForm.display();
	
	if (arpMenu.pos != undefined) arpMenu.show();
	if (pattImageMenu.pos != undefined) pattImageMenu.show();
	if (soundMenu.pos != undefined) soundMenu.show();
}




function Step(){
	if (playing == true){
		
		for (var i = 0; i < maxSounds; i++){
			sounds[i].play();
		}
				
		beatCounter++
		if (beatCounter == maxBeats){
			beatCounter = 0;

			if (menuBar.playMode.value == 1){ //playing in songmode, next sequence

				sequencerForm.currentSeq++;
				if (sequencerForm.currentSeq > sequencerForm.maxSeq){
					sequencerForm.currentSeq = sequencerForm.startSeq;				
					if (!menuBar.repeatButton.active) playstop();
				}

			} else if (!menuBar.repeatButton.active){
				playstop();
			}
		}
	}	
}





















// ooooo     ooo                             
// `888'     `8'                             
//  888       8   .oooo.o  .ooooo.  oooo d8b 
//  888       8  d88(  "8 d88' `88b `888""8P 
//  888       8  `"Y88b.  888ooo888  888     
//  `88.    .8'  o.  )88b 888    .o  888     
//    `YbodP'    8""888P' `Y8bod8P' d888b    
                                          
                                          
                                          
// ooooo                 .                                              .    o8o                        
// `888'               .o8                                            .o8    `"'                        
//  888  ooo. .oo.   .o888oo  .ooooo.  oooo d8b  .oooo.    .ooooo.  .o888oo oooo   .ooooo.  ooo. .oo.   
//  888  `888P"Y88b    888   d88' `88b `888""8P `P  )88b  d88' `"Y8   888   `888  d88' `88b `888P"Y88b  
//  888   888   888    888   888ooo888  888      .oP"888  888         888    888  888   888  888   888  
//  888   888   888    888 . 888    .o  888     d8(  888  888   .o8   888 .  888  888   888  888   888  
// o888o o888o o888o   "888" `Y8bod8P' d888b    `Y888""8o `Y8bod8P'   "888" o888o `Y8bod8P' o888o o888o 


function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	
	initLayout();

	iframe[0].position(0,insideTop);
	iframe[0].size(width/2, windowHeight - insideTop);
	iframe[1].position(width/2, insideTop);
	iframe[1].size(width/2, windowHeight - insideTop);
	quickGuideFrame.position(width/2, insideTop);
	quickGuideFrame.size(width/2, windowHeight - insideTop);

	Visualizer3D.resize(0,insideTop, windowWidth, windowHeight);

	patternForm.render = true;
	soundForm.render = true;
}


function mousePressed(){
	if (warning) return;

	if (waveForm.inFront){
		waveForm.mouseDraw();
		return;
	}

	if (menuBar.visualizerButton.active || menuBar.performanceModeButton.active){
		menuBar.catch();
		return;
	}

	getAudioContext().resume();
	window.onbeforeunload = function(){return "Do you want to save changes?"};
	
	if(pianoForm.inFront){
		pianoForm.catch();
		menuBar.catch();
		return;
	}

	if (euclidianForm.inFront){
		euclidianForm.catch();
		return
	}

	if (arpMenu.pos != undefined){ 
		arpMenu.catch();
	}else if (soundForm.inFront == false){
		if (soundMenu.pos != undefined){
			soundMenu.catch();
		}else if (pattImageMenu.pos != undefined){
			pattImageMenu.catch();
		}else{
			patternForm.catch();
			sequencerForm.catch();
			menuBar.catch();
		}
	}else{
		soundForm.catch();
		menuBar.catch();
	}

}

function mouseReleased(){
	if (warning) return;

	if (pianoForm.inFront) pianoForm.release();
	if (waveForm.inFront) waveForm.release();
	if (euclidianForm.inFront) euclidianForm.release();

	if (soundForm.inFront == false){
		patternForm.release();
		sequencerForm.release();	
		menuBar.release();
	} else {
		soundForm.release();
		menuBar.release();
	}

}

function mouseDragged(){	
	if (warning) return;

	if (waveForm.inFront){
		waveForm.mouseDraw();
		return;
	}

	if (menuBar.visualizerButton.active){
		Visualizer3D.drag(pmouseX - mouseX, pmouseY - mouseY);
		return;
	}

		
	let amount = Math.sign(pmouseY - mouseY);
	
	if (euclidianForm.inFront){
		euclidianForm.drag(amount);
		return;
	}

	if (soundForm.inFront == false){
		patternForm.drag(amount);
		
	}
	
	menuBar.drag(amount);

	if (sequencerForm.inFront == true) sequencerForm.drag(amount);

	if(soundForm.inFront == true){
		soundForm.drag(amount);
	}
	if (pianoForm.inFront == true) pianoForm.drag();

	return false;
}



function mouseScroll(e){
	amount = (e.deltaY > 0) ? 1: -1;

	if (patternForm.inFront == true) patternForm.scroll( amount );
	if (sequencerForm.inFront == true) sequencerForm.scroll( amount );
	if (pianoForm.inFront == true) pianoForm.scroll( amount );
	return false;
}



function keyPressed(){
	if (warning) return;

	getAudioContext().resume();

	//inputboxes
	if (document.activeElement == patternForm.patternName.elt || document.activeElement == soundForm.nameText.elt){
		if (keyCode == 13){
			if (document.activeElement == patternForm.patternName.elt) patternForm.changeName();
			document.activeElement.blur();
		}
		return;
	}

	
	if (keyCode == 32){  //space

		playstop();

	} else if (keyCode == 46){ //delete
		
		sequencerForm.deleteSnippet();
		pianoForm.deleteSnippet();

	}else{

		//check for playable keyboard key
		var i;
		keyCodes.forEach((code, index)=>{
			if (code == keyCode){
				i = index;
			}
		});
		
		
		if (i != undefined){

			//convert to MIDI note
			var note = 12 + i + menuBar.keyboardOctave.value * 12;

			//put in ARP sequence
			if (sounds[selectedSound].arpButton.active && soundForm.inFront == true){
				
				if (sounds[selectedSound].arp.length == 0 || sounds[selectedSound].arpKnob.value == sounds[selectedSound].arp.length -1){
					sounds[selectedSound].arp.push(note);
					let max = sounds[selectedSound].arp.length - 1;
					sounds[selectedSound].arpKnob.set(0, max, max, 1);
				}else{
					sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] = note;
				}

				soundForm.render = true;
			}
			
			//put in polyphone array, to be played, or added to pattern if pianoform is in front.
			if (keyboardPolyNotes.length < 3){

				keyboardPolyNotes.push(note);
				keyboardPolyNotes.sort((a,b)=>a>b);
				sounds[selectedSound].playPolyNotes(keyboardPolyNotes);

				if (pianoForm.inFront && playing) {
					patterns[currentPattern][selectedSound][beatCounter] = []; 
					keyboardPolyNotes.forEach((n)=>{
						patterns[currentPattern][selectedSound][beatCounter].push(n);
					});
					editPatternImage(currentPattern, selectedSound);
				}
			}			
		}
	}
}

function keyReleased(){
	if (warning) return;

	var i;
	keyCodes.forEach((code, index)=>{
		if (code == keyCode){
			i = index;
		}
	});
	
	if (i != undefined){

	 	var note = 12 + i + menuBar.keyboardOctave.value * 12;

	 	//remove from polyphone array
	 	keyboardPolyNotes.forEach((pnote, index)=>{
			if (pnote == note){
				keyboardPolyNotes.splice(index, 1);
			}
		});
	}
}
