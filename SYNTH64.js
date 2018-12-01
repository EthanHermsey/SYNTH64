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
var formBackGroundColor = 140;
var titleBarColor = 80;
var cornerRadius = 4;
var iframe = [1];
var quickGuideFrame;

//program variables
var projectName;
var authorName;
var loading = false;
var dragCount = 0;
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
	background(40);
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
		background(40);
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

	
	//early way of making knob rotation less sensitive... should change (its a delay)
	dragCount++
	if (dragCount > 3 || keyIsDown(16) || keyboardPolyNotes.length > 0 ){ 
		
		if (euclidianForm.inFront){
			euclidianForm.drag(round(pmouseY - mouseY));
			return;
		}

		if (soundForm.inFront == false){
			patternForm.drag(round(pmouseY - mouseY));
			
		}
		
		menuBar.drag(round(pmouseY - mouseY));

		if (sequencerForm.inFront == true) sequencerForm.drag(round(pmouseY - mouseY));

		if(soundForm.inFront == true){
			soundForm.drag(round(pmouseY - mouseY));
		}
		if (pianoForm.inFront == true) pianoForm.drag();

		dragCount = 0;
	}


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







//  .o88o.                                       .    o8o
//  888 `"                                     .o8    `"'
// o888oo  oooo  oooo  ooo. .oo.    .ooooo.  .o888oo oooo   .ooooo.  ooo. .oo.    .oooo.o
//  888    `888  `888  `888P"Y88b  d88' `"Y8   888   `888  d88' `88b `888P"Y88b  d88(  "8
//  888     888   888   888   888  888         888    888  888   888  888   888  `"Y88b.
//  888     888   888   888   888  888   .o8   888 .  888  888   888  888   888  o.  )88b
// o888o    `V88V"V8P' o888o o888o `Y8bod8P'   "888" o888o `Y8bod8P' o888o o888o 8""888P'




function playstop(){

	if (!playing){
		pulseWorker.postMessage({'msg' : "reset"});
		pulseWorker.postMessage({'msg' : "start"});
		
	}else{
		pulseWorker.postMessage({'msg' : "stop"});
		pulseWorker.postMessage({'msg' : "reset"});
		
	}

	beatCounter = 0;
	playing = !playing;

	if (menuBar.playMode.value == 1){
		sequencerForm.currentSeq = sequencerForm.startSeq;
	} 

	for (var i = 0; i < maxSounds; i++){
		sounds[i].arpCounter = 0;
		sounds[i].arpKnob.value = sounds[i].arpKnob.max;

		for (var p = 0; p < patterns.length; p++){
			if (patterns[p][i].isEuclidian){
				patterns[p][i].counter = 0;
			}
		}

		if (!playing){
			sounds[i].playSilentNote(60);  //to really stop all osc's without having to restart them..
		}
	}
}


function DropFile(file){

	if (file.type == "audio" && soundForm.inFront == true && sounds[selectedSound].soundType.value == 2){ // if dropped a mp3 file and the sample window is open.
		sounds[selectedSound].sample = loadSound(file.data, SampleLoaded);

	}else if (file.name.search("json") >= 0){ //dropped a project file
			loadJSON(file.data, LoadProject);
			projectName = file.name.split(".");	
			projectName = projectName[0];
			loading = true;	
	}

	//clear the cache
	menuBar.fileInput = "";
	menuBar.fileInput = createFileInput(function(file){
 		DropFile(file);
 	}).hide();
}

function initLayout(){
	knobSize = height / 26;
	insideTop = height / 10;
	insideHeight = height - insideTop;

	menuBar.layOut();
	patternForm.layOut();
	sequencerForm.layOut();
	soundForm.layOut();
	pianoForm.layOut();

	background(40);
	sequencerForm.display();
	patternForm.display();
}

function addPattern(i, duplicate){
	if (i){ //passing index of new array to insert
		patterns.splice(i, 0, []);
		patternImages.splice(i, 0, []);
		if (duplicate) {
			patternNames.splice(i, 0, patternNames[currentPattern] + " - copy" );     
		} else {
			patternNames.splice(i, 0, patternNames[currentPattern] + " - insert" );     
		}
	}else{
		patterns.push([]);	 
		patternImages.push([]);
		patternNames.push( "Pattern " + patterns.length );
		i = patterns.length -1;
	}
	
	

	for (var x = 0; x < maxSounds; x++){

		//step arrays, inside pattern, where notes go into
		patterns[i].push( [] );
		for (var j = 0; j < maxBeats; j++){
			patterns[i][x][j] = [];      
		}

		//pattern images, per sound.
		patternImages[i][x] = createGraphics(stepImage.width, stepImage.height);
		patternImages[i][x].image(stepImage, 0,0);

	}
}


function preload_patternImage(){
	
	stepImage = createGraphics(20 * maxBeats, 20);
	stepImage.background(200);
	stepImage.strokeWeight(1)
	stepImage.fill(200);
	
	var scaleX = stepImage.width / maxBeats;

	for (var x = 0; x < maxBeats; x++){
		stepImage.rect(x * scaleX, 0, 19,19);
	}
}

function editPatternImage(patt, snd){
	let stepimage = patternImages[patt][snd];

	if (patterns[patt][snd].isEuclidian){
		stepimage.fill(18, 48, 98);
		stepimage.stroke(48, 116, 232);
		stepimage.rect(0,0,stepimage.width -2, stepimage.height -1);

		stepimage.noStroke();
		stepimage.fill(48, 116, 232);
		stepimage.textSize(stepimage.height * 0.8);
		stepimage.text("EUCLIDIAN    " + patterns[patt][snd].hits + " : " + patterns[patt][snd].pattern.length, stepimage.width * 0.05, stepimage.height * 0.8);
		patternForm.render = true;

	} else {
		stepimage.background(200);
		stepimage.stroke(0);
		let scaleX = stepimage.width / maxBeats;
		for (var x = 0; x < maxBeats; x++){
			stepimage.fill(200);
			if(patterns[patt][snd][x].length != 0) stepimage.fill(217,114,31);
			
			stepimage.rect(x * scaleX, 0, 19, 19);
		}
	}
}

function midiToString(note){
	return notes[note%12] + floor((note - 12) / 12);
}

function generateEuclidianPattern(pulses, steps, rotation) {

		let pattern = [];
		let bucket = [];

		let remainder = new Array(steps - pulses);
		remainder.fill(0);

		let hits = new Array(pulses);
		hits.fill(1);

		if (pulses == 1){
			pattern = hits;
			pattern = pattern.concat(remainder);
			
		} else {
		
			//divide
			let found = false;
			do {
				do {
					bucket.push(hits[0] + "" + remainder[0]);
					hits.splice(0, 1);
					remainder.splice(0, 1);
				} while (hits.length > 0 && remainder.length > 0);

				if (hits.length > 0) remainder = hits;

				if (remainder.length <= 1) {
					found = true;
					bucket = bucket.concat(remainder);
				} else {
					hits = bucket;
					bucket = [];
				}
			} while (found == false);
		
			//build
			bucket.forEach((seq) => {
				if (seq.length > 1){
					seq = seq.split("");
				} else {
					seq = [seq];
				}
				seq.forEach((hit) => {
					pattern.push(Number(hit));
				});
			});
		}
	
	
		//rotate
		if (rotation < 0) rotation += steps;
		for (let i = 0; i < rotation; i++) {
			pattern.splice(0, 0, pattern.pop());
		}

		return pattern;
	}













                                         
                                         
//  .oooo.o  .oooo.   oooo    ooo  .ooooo.  
// d88(  "8 `P  )88b   `88.  .8'  d88' `88b 
// `"Y88b.   .oP"888    `88..8'   888ooo888 
// o.  )88b d8(  888     `888'    888    .o 
// 8""888P' `Y888""8o     `8'     `Y8bod8P' 
                                         
                                         
                                         
//                             .o8  
//                            "888  
//  .oooo.   ooo. .oo.    .oooo888  
// `P  )88b  `888P"Y88b  d88' `888  
//  .oP"888   888   888  888   888  
// d8(  888   888   888  888   888  
// `Y888""8o o888o o888o `Y8bod88P" 
                                 
                                 
                                 
// oooo                            .o8  
// `888                           "888  
//  888   .ooooo.   .oooo.    .oooo888  
//  888  d88' `88b `P  )88b  d88' `888  
//  888  888   888  .oP"888  888   888  
//  888  888   888 d8(  888  888   888  
// o888o `Y8bod8P' `Y888""8o `Y8bod88P" 
                                     
                                            
                                            
// oooooooooooo                                       .    o8o                        
// `888'     `8                                     .o8    `"'                        
//  888         oooo  oooo  ooo. .oo.    .ooooo.  .o888oo oooo   .ooooo.  ooo. .oo.   
//  888oooo8    `888  `888  `888P"Y88b  d88' `"Y8   888   `888  d88' `88b `888P"Y88b  
//  888    "     888   888   888   888  888         888    888  888   888  888   888  
//  888          888   888   888   888  888   .o8   888 .  888  888   888  888   888  
// o888o         `V88V"V8P' o888o o888o `Y8bod8P'   "888" o888o `Y8bod8P' o888o o888o 
                                                                                   




//these functions are horrible, i really should've done this differently.
//Like, add all the parameters to some array and have it save that or something...

function SaveProject(ret){
	var saveSounds = {};
	saveSounds.sounds = [];

	for (var i = 0; i < maxSounds; i ++){
		let json = {};

		json.soundType = sounds[i].soundType.value;
		json.label = sounds[i].label;
		json.volume = patternForm.volumeKnobs[i].value;
		json.pan = patternForm.panKnobs[i].value;

		json.osc1wavearray = sounds[i].osc1wavearray;
		json.osc2wavearray = sounds[i].osc2wavearray;
		json.osc3wavearray = sounds[i].osc3wavearray;
		json.LFO1wavearray = sounds[i].LFO1wavearray;
		json.LFO2wavearray = sounds[i].LFO2wavearray;
		
		json.attackTime = sounds[i].attackTime.value;
		json.decayTime = sounds[i].decayTime.value;
		json.susPercent = sounds[i].susPercent.value;
		json.releaseTime = sounds[i].releaseTime.value;
		json.attackLevel = sounds[i].attackLevel.value;
		json.releaseLevel = sounds[i].releaseLevel.value;
		json.ADSRMultiplier = sounds[i].ADSRMultiplier.value;
		json.ADSRExpo = sounds[i].ADSRExpo.active;
		json.ADSRChance = sounds[i].ADSRChance.value;

		json.filterattackTime = sounds[i].filterattackTime.value;
		json.filterdecayTime = sounds[i].filterdecayTime.value;
		json.filtersusPercent = sounds[i].filtersusPercent.value;
		json.filterreleaseTime = sounds[i].filterreleaseTime.value;
		json.filterattackLevel = sounds[i].filterattackLevel.value;
		json.filterreleaseLevel = sounds[i].filterreleaseLevel.value;
		json.filterADSRMultiplier = sounds[i].filterADSRMultiplier.value;
		json.filterADSRExpo = sounds[i].filterADSRExpo.active;

	    json.osc1Detune = sounds[i].osc1Detune.value;
		json.osc1Wave = sounds[i].osc1Wave.value;
		json.osc2Detune = sounds[i].osc2Detune.value;
		json.osc2Octave = sounds[i].osc2Octave.value;
		json.osc2Wave = sounds[i].osc2Wave.value;
		json.osc3Amount = sounds[i].osc3Amount.value;
		json.osc3Detune = sounds[i].osc3Detune.value;
		json.osc3Octave = sounds[i].osc3Octave.value;
		json.osc3Wave = sounds[i].osc3Wave.value;

		json.ringMod = sounds[i].RingMod.active;
		json.oscMix = sounds[i].oscMix.value;
		json.oscRamp = sounds[i].oscRamp.value;

		json.glideUp = sounds[i].glideSelector.up;
		json.glideDown = sounds[i].glideSelector.down;

		json.rollingChords = sounds[i].rollingChords.value;

		json.noiseType = sounds[i].noiseSelector.value;
		
		json.LFO1Freq = sounds[i].LFO1Freq.value;
		json.LFO1Amount = sounds[i].LFO1Amount.value;
		json.LFO1Wave = sounds[i].LFO1Wave.value;
		json.LFO1Binder = sounds[i].LFO1Binder.value;
		json.LFO1Link = sounds[i].LFO1Link.value;

		json.LFO2Freq = sounds[i].LFO2Freq.value;
		json.LFO2Amount = sounds[i].LFO2Amount.value;
		json.LFO2Wave = sounds[i].LFO2Wave.value;
		json.LFO2Binder = sounds[i].LFO2Binder.value;
		json.LFO2Link = sounds[i].LFO2Link.value;

		json.filterFreq = sounds[i].filterFreq.value;
		json.filterRes = sounds[i].filterRes.value;
		json.filterGain = sounds[i].filterGain.value;
		json.filterType = sounds[i].filterType.value;
		json.filterLink = sounds[i].filterLink.value; 

		json.distortionAmount = sounds[i].distortionAmount.value;
		json.distortionSampling =  sounds[i].distortionSampling.value;

		json.delayTime = sounds[i].delayTime.value
		json.delayFeedback =  sounds[i].delayFeedback.value;
		json.delayFilterFreq =  sounds[i].delayFilterFreq.value;
		
		json.sampleStart =  sounds[i].sampleStart.value;
		json.sampleStop =  sounds[i].sampleStop.value;
		json.sampleTune =  sounds[i].sampleTune.value;		
		
		if (sounds[i].sample.buffer != null && sounds[i].soundType.value == 2){
		 	var buffLeft = sounds[i].sample.buffer.getChannelData(0);
		 	var buffRight = sounds[i].sample.buffer.getChannelData(1);
		 	json.sampleLeft = [];
		 	json.sampleRight = [];
		 	for (var a = 0; a < buffLeft.length; a++){
		 		json.sampleLeft[a] = buffLeft[a];
		 		json.sampleRight[a] = buffRight[a];
		 	}
		}

		if (sounds[i].arp.length > 0){
			json.arp = sounds[i].arp;
			json.arpButton = sounds[i].arpButton.active;
			json.arpMenuDirection = sounds[i].arpSelector.direction;
			json.arpMenuReturn = sounds[i].arpSelector.valueReturn;
			json.arpMenuOpposite = sounds[i].arpSelector.valueOpposite;
			json.arpMenuRandom = sounds[i].arpSelector.valueRandom;
		}
		json.inuse = sounds[i].osc1.started || sounds[i].osc2.started || sounds[i].osc3.started || sounds[i].noise.started || sounds[i].sample.buffer != null

		saveSounds.sounds.push(json);
	}

	saveSounds.swing = menuBar.swingKnob.value;
	saveSounds.BPM = menuBar.BPMKnob.value;
	saveSounds.masterVolume = menuBar.mainOutputVolume.value;
	saveSounds.keyboardOctave = menuBar.keyboardOctave.value;
	saveSounds.playMode = menuBar.playMode.value;

	saveSounds.patterns = patterns;
	saveSounds.patternNames = patternNames;
	saveSounds.maxSeq = sequencerForm.maxSeq;
	
	saveSounds.sequence = [];
	for (var i = 0; i <= 99; i++){
		saveSounds.sequence.push( [] );
		for (var j = 0; j <= 24; j++){
			saveSounds.sequence[i][j] = patterns.indexOf(sequencerForm.sequence[i][j]);
		}
	}

	if (ret){
		return JSON.stringify(saveSounds)
	}else{
		if (projectName){
			if (authorName){
				saveJSON(saveSounds, projectName + " - " + authorName, true);
			}else{
				saveJSON(saveSounds, projectName + ".SYNTH64", true);
			}
		}else{
			saveJSON(saveSounds, "Untitled.SYNTH64", true);
		}
	}
	

}




function savePreset(i){
	json = {};
		json.isPreset = true;
		json.soundType = sounds[i].soundType.value;
		json.label = sounds[i].label;
		
		json.attackTime = sounds[i].attackTime.value;
		json.decayTime = sounds[i].decayTime.value;
		json.susPercent = sounds[i].susPercent.value;
		json.releaseTime = sounds[i].releaseTime.value;
		json.adsrMulti = sounds[i].ADSRMultiplier.value;
		json.adsrChance = sounds[i].ADSRChance.value;
		json.adsrExpo = sounds[i].ADSRExpo.active;

		json.filterattackTime = sounds[i].filterattackTime.value;
		json.filterdecayTime = sounds[i].filterdecayTime.value;
		json.filtersusPercent = sounds[i].filtersusPercent.value;
		json.filterreleaseTime = sounds[i].filterreleaseTime.value;
		json.filterattackLevel = sounds[i].filterattackLevel.value;
		json.filterreleaseLevel = sounds[i].filterreleaseLevel.value;
		json.filterADSRMultiplier = sounds[i].filterADSRMultiplier.value;
		json.filterADSRExpo = sounds[i].filterADSRExpo.active;

		json.attackLevel = sounds[i].attackLevel.value;
		json.releaseLevel = sounds[i].releaseLevel.value;

	    json.osc1Detune = sounds[i].osc1Detune.value;
		json.osc1Wave = sounds[i].osc1Wave.value;
		json.osc2Detune = sounds[i].osc2Detune.value;
		json.osc2Octave = sounds[i].osc2Octave.value;
		json.osc2Wave = sounds[i].osc2Wave.value;
		json.osc3Amount = sounds[i].osc3Amount.value;
		json.osc3Detune = sounds[i].osc3Detune.value;
		json.osc3Octave = sounds[i].osc3Octave.value;
		json.osc3Wave = sounds[i].osc3Wave.value;

		json.osc1wavearray = sounds[i].osc1wavearray;
		json.osc2wavearray = sounds[i].osc2wavearray;
		json.osc3wavearray = sounds[i].osc3wavearray;
		json.LFO1wavearray = sounds[i].LFO1wavearray;
		json.LFO2wavearray = sounds[i].LFO2wavearray;

		json.ringMod = sounds[i].RingMod.active;
		json.oscMix = sounds[i].oscMix.value;
		
		json.oscRamp = sounds[i].oscRamp.value;
		json.glideUp = sounds[i].glideSelector.up;
		json.glideDown = sounds[i].glideSelector.down;

		json.rollingChords = sounds[i].rollingChords.value;

		json.noiseType = sounds[i].noiseSelector.value;
		
		json.LFO1Freq = sounds[i].LFO1Freq.value;
		json.LFO1Amount = sounds[i].LFO1Amount.value;
		json.LFO1Wave = sounds[i].LFO1Wave.value;
		json.LFO1Binder = sounds[i].LFO1Binder.value;
		json.LFO1Link = sounds[i].LFO1Link.value;

		json.LFO2Freq = sounds[i].LFO2Freq.value;
		json.LFO2Amount = sounds[i].LFO2Amount.value;
		json.LFO2Wave = sounds[i].LFO2Wave.value;
		json.LFO2Binder = sounds[i].LFO2Binder.value;
		json.LFO2Link = sounds[i].LFO2Link.value;

		json.filterFreq = sounds[i].filterFreq.value;
		json.filterRes = sounds[i].filterRes.value;
		json.filterGain = sounds[i].filterGain.value;
		json.filterType = sounds[i].filterType.value;
		json.filterLink = sounds[i].filterLink.value; 

		json.distortionAmount = sounds[i].distortionAmount.value;
		json.distortionSampling =  sounds[i].distortionSampling.value;

		json.delayTime = sounds[i].delayTime.value
		json.delayFeedback =  sounds[i].delayFeedback.value;
		json.delayFilterFreq =  sounds[i].delayFilterFreq.value;
		json.filterLink = sounds[i].filterLink.value; 
		
		json.sampleStart =  sounds[i].sampleStart.value;
		json.sampleStop =  sounds[i].sampleStop.value;
		json.sampleTune =  sounds[i].sampleTune.value;		

		if (sounds[i].sample.buffer != null){
		 	var buffLeft = sounds[i].sample.buffer.getChannelData(0);
		 	var buffRight = sounds[i].sample.buffer.getChannelData(1);
		 	json.sampleLeft = [];
		 	json.sampleRight = [];
		 	for (var a = 0; a < buffLeft.length; a++){
		 		json.sampleLeft[a] = buffLeft[a];
		 		json.sampleRight[a] = buffRight[a];
		 	}
		}

		saveJSON(json, sounds[i].label);
}


















function LoadProject(jsonfile){

try{

	if (jsonfile.isPreset) {
		loadPreset(jsonfile);
		return;
	}

	pulseWorker.postMessage({'msg' : "stop"});
	pulseWorker.postMessage({'msg' : "reset"});
	beatCounter = 0;
	playing = false;
	
	for (var i = 0; i < maxSounds; i++){
		sounds[i].osc1.stop();
		sounds[i].osc2.stop();
		sounds[i].osc3.stop();
		sounds[i].noise.stop();
		sounds[i].sample.stop();
		sounds[i].LFO1.stop();
		sounds[i].LFO2.stop();
		sounds[i].hiddenLFO.stop();
	}
	
	menuBar.swingKnob.value = jsonfile.swing;
	menuBar.swingKnob.fnx();
	menuBar.BPMKnob.value = jsonfile.BPM;
	menuBar.BPMKnob.fnx();

	menuBar.mainOutputVolume.value = jsonfile.masterVolume;
	menuBar.mainOutputVolume.fnx();

	menuBar.keyboardOctave.value = jsonfile.keyboardOctave;

	if (jsonfile.playMode) {
		menuBar.playMode.value = jsonfile.playMode;
	}else{
		menuBar.playMode.value = 0;
	}

	patterns = jsonfile.patterns;
	patternNames = jsonfile.patternNames;
	
	sequencerForm.startSeq = 0;
	if (jsonfile.maxSeq) sequencerForm.maxSeq = jsonfile.maxSeq;

	for (var i = 0; i <= 99; i++){
		sequencerForm.sequence[i] = [];
		for (var j = 0; j <= 24; j++){
			sequencerForm.sequence[i][j] = patterns[jsonfile.sequence[i][j]];
		}
	}


	patternImages = [];
	for (var patt = 0; patt < patterns.length; patt++){
		patternImages[patt] = [];
		for (var snd = 0; snd < maxSounds; snd++){
	 	  	patternImages[patt][snd] = createGraphics(stepImage.width, stepImage.height);
	 	  	patternImages[patt][snd].image(stepImage, 0,0);
			editPatternImage(patt, snd);
	 	};
	};

	jsonfile = jsonfile.sounds;
	
	for (var i = 0; i < jsonfile.length; i++){
		
		sounds[i].soundType.value = jsonfile[i].soundType;	
		sounds[i].label = jsonfile[i].label;
		patternForm.soundButtons[i].label = jsonfile[i].label;

		if (jsonfile[i].volume != undefined) patternForm.volumeKnobs[i].value = jsonfile[i].volume;
		if (jsonfile[i].pan != undefined) patternForm.panKnobs[i].value = jsonfile[i].pan;

		
		sounds[i].attackTime.value = jsonfile[i].attackTime;
		sounds[i].decayTime.value = jsonfile[i].decayTime;
		sounds[i].susPercent.value = jsonfile[i].susPercent;
		sounds[i].releaseTime.value = jsonfile[i].releaseTime;
		sounds[i].attackLevel.value = jsonfile[i].attackLevel;
		sounds[i].releaseLevel.value = jsonfile[i].releaseLevel;
		sounds[i].ADSRMultiplier.value = jsonfile[i].ADSRMultiplier;

		if (jsonfile[i].ADSRExpo != undefined){
			sounds[i].ADSRExpo.active = jsonfile[i].ADSRExpo;
			
			sounds[i].envOsc1.setExp(jsonfile[i].ADSRExpo);
			sounds[i].envOsc2.setExp(jsonfile[i].ADSRExpo);
			sounds[i].envOsc3.setExp(jsonfile[i].ADSRExpo);
			sounds[i].envNoise.setExp(jsonfile[i].ADSRExpo);
		}

		if (jsonfile[i].filterattackTime != undefined){
			sounds[i].filterattackTime.value = jsonfile[i].filterattackTime;
			sounds[i].filterdecayTime.value = jsonfile[i].filterdecayTime;
			sounds[i].filtersusPercent.value = jsonfile[i].filtersusPercent;
			sounds[i].filterreleaseTime.value = jsonfile[i].filterreleaseTime;
			sounds[i].filterattackLevel.value = jsonfile[i].filterattackLevel;
			sounds[i].filterreleaseLevel.value = jsonfile[i].filterreleaseLevel;
			sounds[i].filterADSRMultiplier.value = jsonfile[i].filterADSRMultiplier;
		}

		if (jsonfile[i].filterADSRExpo != undefined){
			sounds[i].filterADSRExpo.active = jsonfile[i].filterADSRExpo;
			
			sounds[i].envFilter.setExp(jsonfile[i].filterADSRExpo);
		}




		if (jsonfile[i].ADSRChance != undefined) sounds[i].ADSRChance.value = jsonfile[i].ADSRChance;

		if (jsonfile[i].osc1Detune != undefined) sounds[i].osc1Detune.value = jsonfile[i].osc1Detune;
		
		if (jsonfile[i].osc2Detune != undefined) sounds[i].osc2Detune.value = jsonfile[i].osc2Detune;
		if (jsonfile[i].osc2Octave != undefined) sounds[i].osc2Octave.value = jsonfile[i].osc2Octave;
		
		if (jsonfile[i].osc3Amount != undefined) sounds[i].osc3Amount.value = jsonfile[i].osc3Amount;
		if (jsonfile[i].osc3Octave != undefined) sounds[i].osc3Octave.value = jsonfile[i].osc3Octave;
		if (jsonfile[i].osc3Detune != undefined) sounds[i].osc3Detune.value = jsonfile[i].osc3Detune;
		
		if (jsonfile[i].ringMod != undefined) {
			sounds[i].RingMod.active = jsonfile[i].ringMod;
		} else {
			sounds[i].RingMod.active = false;
		}
		
		sounds[i].oscMix.value = jsonfile[i].oscMix;
		if (jsonfile[i].glideUp!= undefined) {
			sounds[i].glideSelector.up = jsonfile[i].glideUp;
			sounds[i].glideSelector.down = jsonfile[i].glideDown;
		} else {
			sounds[i].glideSelector.up = true;
			sounds[i].glideSelector.down = true;
		}


		if (jsonfile[i].oscRamp != undefined) sounds[i].oscRamp.value = jsonfile[i].oscRamp;
		if (jsonfile[i].rollingChords != undefined) {
			sounds[i].rollingChords.value = jsonfile[i].rollingChords;
		} else {
			sounds[i].rollingChords.value = 0;
		}

		if (jsonfile[i].noiseType != undefined) sounds[i].noiseSelector.value = jsonfile[i].noiseType;

		sounds[i].LFO1Freq.value = jsonfile[i].LFO1Freq;
		sounds[i].LFO1Binder.value = jsonfile[i].LFO1Binder;
		if (jsonfile[i].LFO1Link) sounds[i].LFO1Link.value = jsonfile[i].LFO1Link;
		if (jsonfile[i].LFO1Binder == 2) {
			sounds[i].LFO1Amount.set(-5000, 5000, jsonfile[i].LFO1Amount, 1);
		}else{
			
			sounds[i].LFO1Amount.set(-100, 100, jsonfile[i].LFO1Amount, 0.1);
		}
			
		

		sounds[i].LFO2Freq.value = jsonfile[i].LFO2Freq;
		sounds[i].LFO2Amount.value = jsonfile[i].LFO2Amount;
		
		sounds[i].LFO2Binder.value = jsonfile[i].LFO2Binder;
		if (jsonfile[i].LFO2Link) sounds[i].LFO2Link.value = jsonfile[i].LFO2Link;
		if (jsonfile[i].LFO2Binder == 2) {
			sounds[i].LFO2Amount.set(-900, 900, jsonfile[i].LFO2Amount, 1);
		}else{
			sounds[i].LFO2Amount.set(-100, 100, jsonfile[i].LFO2Amount, 0.1);
		}
		
		sounds[i].filterFreq.value = jsonfile[i].filterFreq;
		sounds[i].filterRes.value = jsonfile[i].filterRes;
		if (jsonfile[i].filterGain != undefined) sounds[i].filterGain.value = jsonfile[i].filterGain;
		sounds[i].filterType.value = jsonfile[i].filterType;
		if (jsonfile[i].filterLink != undefined)sounds[i].filterLink.value = jsonfile[i].filterLink;


		sounds[i].distortionAmount.value = jsonfile[i].distortionAmount;
		sounds[i].distortionSampling.value = jsonfile[i].distortionSampling;

		sounds[i].delayTime.value = jsonfile[i].delayTime;
		sounds[i].delayFeedback.value = jsonfile[i].delayFeedback;
		sounds[i].delayFilterFreq.value = jsonfile[i].delayFilterFreq;

		sounds[i].sampleStart.value = jsonfile[i].sampleStart;
		sounds[i].sampleStop.value = jsonfile[i].sampleStop;
		sounds[i].sampleTune.value = jsonfile[i].sampleTune;
		

		if( jsonfile[i].sampleLeft) {
			var buff = [];
			buff[0] = jsonfile[i].sampleLeft;
			buff[1] = jsonfile[i].sampleRight;
			sounds[i].sample.setBuffer(buff);
			selectedSound = i;
			SampleLoaded();
		 }



		 if (jsonfile[i].arp){
			sounds[i].arpCounter = 0;
			sounds[i].arpBaseOffset = 0;
			sounds[i].arp = jsonfile[i].arp;
			sounds[i].arpButton.active = jsonfile[i].arpButton;
			sounds[i].arpSelector.direction = jsonfile[i].arpMenuDirection;
			sounds[i].arpSelector.valueReturn = jsonfile[i].arpMenuReturn;
			sounds[i].arpSelector.valueOpposite = jsonfile[i].arpMenuOpposite
			sounds[i].arpSelector.valueRandom = jsonfile[i].arpMenuRandom;
			let max = sounds[i].arp.length -1;
			sounds[i].arpKnob.set(0, max, max, 1);
		}else{
			sounds[i].arp = [];
			sounds[i].arpBaseOffset = 0;
			sounds[i].arpButton.active = false;
			sounds[i].arpKnob.set(0,0,0, 1);
		}

		if (sounds[i].osc1.oscillator.type == "custom") sounds[i].osc1.oscillator.type = "sine";
		if (sounds[i].osc2.oscillator.type == "custom") sounds[i].osc2.oscillator.type = "sine";
		if (sounds[i].osc3.oscillator.type == "custom") sounds[i].osc3.oscillator.type = "sine";
		if (sounds[i].LFO1.oscillator.type == "custom") sounds[i].LFO1.oscillator.type = "sine";
		if (sounds[i].LFO2.oscillator.type == "custom") sounds[i].LFO2.oscillator.type = "sine";

		if (jsonfile[i].inuse){
			sounds[i].start();
		}


		sounds[i].osc1Wave.value = jsonfile[i].osc1Wave;
		sounds[i].osc2Wave.value = jsonfile[i].osc2Wave;
		sounds[i].osc3Wave.value = jsonfile[i].osc3Wave;
		sounds[i].LFO1Wave.value = jsonfile[i].LFO1Wave;
		sounds[i].LFO2Wave.value = jsonfile[i].LFO2Wave;

		if (jsonfile[i].osc1wavearray != undefined){
		
			sounds[i].osc1wavearray = jsonfile[i].osc1wavearray;
			sounds[i].osc2wavearray = jsonfile[i].osc2wavearray;
			sounds[i].osc3wavearray = jsonfile[i].osc3wavearray;
			sounds[i].LFO1wavearray = jsonfile[i].LFO1wavearray;
			sounds[i].LFO2wavearray = jsonfile[i].LFO2wavearray;

			if (sounds[i].osc1Wave.value == 4){
			sounds[i].osc1Wave.array = sounds[i].osc1wavearray;
			waveForm.updateWave(sounds[i].osc1Wave.array, sounds[i].osc1.oscillator);		
			}

			if (sounds[i].osc2Wave.value == 4){
				sounds[i].osc2Wave.array = sounds[i].osc2wavearray;
				waveForm.updateWave(sounds[i].osc2Wave.array, sounds[i].osc2.oscillator);
			}
			
			if (sounds[i].osc3Wave.value == 4){
				sounds[i].osc3Wave.array = sounds[i].osc3wavearray;
				waveForm.updateWave(sounds[i].osc3Wave.array, sounds[i].osc3.oscillator);
			}
			
			if (sounds[i].LFO1Wave.value == 4){
				sounds[i].LFO1Wave.array = sounds[i].LFO1wavearray;
				waveForm.updateWave(sounds[i].LFO1Wave.array, sounds[i].LFO1.oscillator);
			}
			
			if (sounds[i].LFO2Wave.value == 4){
				sounds[i].LFO2Wave.array = sounds[i].LFO2wavearray;
				waveForm.updateWave(sounds[i].LFO2Wave.array, sounds[i].LFO2.oscillator);
			}
		}

	}


	
	patternForm.volumeKnobs.forEach((knob)=>{
		knob.fnx();
	})
	patternForm.panKnobs.forEach((knob)=>{
		knob.fnx();
	})

	sounds.forEach((sound)=>{

		sound.waveChange();
		sound.knobs.forEach((knob)=>{
			knob.fnx();
		});
		sound.setADSRValues();
		
		sound.setNoiseType();
		sound.bindLFO({lfo: sound.LFO1, binder: sound.LFO1Binder, wave: sound.LFO1Wave, array: sound.LFO1wavearray, amount: sound.LFO1Amount}, sound.LFO2);
		sound.bindLFO({lfo: sound.LFO2, binder: sound.LFO2Binder, wave: sound.LFO2Wave, array: sound.LFO2wavearray, amount: sound.LFO2Amount}, sound.LFO1);
		sound.connectRingMod();
		sound.setFilterType();		

		sound.playSilentNote(60);
	})

	

	
	soundForm.layOut();

	soundForm.inFront = false;
	selectedSound = 0;
	currentPattern = 0;
	if (menuBar.playMode.value == 1){
		sequencerForm.currentSeq = sequencerForm.startSeq;
	}
	beatCounter = 0;
	pulseWorker.postMessage({'msg' : "reset"});
	loading = false;
	sequencerForm.display();
	patternForm.render = true;
	soundForm.nameText.hide();
	soundForm.presets.hide();
	soundForm.envelopeSelect.hide();
	patternForm.updatePatternBox();

}
catch(err) {
    print(err.message);
}

}












function loadPreset(jsonfile){

	if (!jsonfile){
		name = soundForm.presets.value();
		if (name == "-- Preset --") name = "default";
		loadJSON('res/presets/' + name + ".txt", loadPreset);
		return;
	}

	sounds[selectedSound].soundType.value = jsonfile.soundType;	
	if (jsonfile.label != undefined) sounds[selectedSound].label = jsonfile.label;
	if (jsonfile.label != undefined) patternForm.soundButtons[selectedSound].label = jsonfile.label;

	if (jsonfile.volume != undefined) patternForm.volumeKnobs[selectedSound].value = jsonfile.volume;
	if (jsonfile.pan != undefined) patternForm.panKnobs[selectedSound].value = jsonfile.pan;

	
	sounds[selectedSound].attackTime.value = jsonfile.attackTime;
	sounds[selectedSound].decayTime.value = jsonfile.decayTime;
	sounds[selectedSound].susPercent.value = jsonfile.susPercent;
	sounds[selectedSound].releaseTime.value = jsonfile.releaseTime;
	sounds[selectedSound].attackLevel.value = jsonfile.attackLevel;
	sounds[selectedSound].releaseLevel.value = jsonfile.releaseLevel;
	if (jsonfile.adsrMulti != undefined){
		sounds[selectedSound].ADSRMultiplier.value = jsonfile.adsrMulti;
	} else {
		sounds[selectedSound].ADSRMultiplier.value = 1;
	}
	
	if (jsonfile.adsrExpo != undefined){
		sounds[selectedSound].ADSRExpo.active = jsonfile.adsrExpo;
	} else {
		sounds[selectedSound].ADSRExpo.active = false;
	}
	
	sounds[selectedSound].envOsc1.setExp(sounds[selectedSound].ADSRExpo.active);
	sounds[selectedSound].envOsc2.setExp(sounds[selectedSound].ADSRExpo.active);
	sounds[selectedSound].envOsc3.setExp(sounds[selectedSound].ADSRExpo.active);
	sounds[selectedSound].envNoise.setExp(sounds[selectedSound].ADSRExpo.active);

	if (jsonfile.adsrChance != undefined) sounds[selectedSound].ADSRChance.value = jsonfile.adsrChance;

	if (jsonfile.filterattackTime != undefined){
		sounds[selectedSound].filterattackTime.value = jsonfile.filterattackTime;
		sounds[selectedSound].filterdecayTime.value = jsonfile.filterdecayTime;
		sounds[selectedSound].filtersusPercent.value = jsonfile.filtersusPercent;
		sounds[selectedSound].filterreleaseTime.value = jsonfile.filterreleaseTime;
		sounds[selectedSound].filterattackLevel.value = jsonfile.filterattackLevel;
		sounds[selectedSound].filterreleaseLevel.value = jsonfile.filterreleaseLevel;
		sounds[selectedSound].filterADSRMultiplier.value = jsonfile.filterADSRMultiplier;
	}

	if (jsonfile.filterADSRExpo != undefined){
		sounds[selectedSound].filterADSRExpo.active = jsonfile.filterADSRExpo;
		
		sounds[selectedSound].envFilter.setExp(jsonfile.filterADSRExpo);
	}




	if ( jsonfile.osc1Detune != undefined) sounds[selectedSound].osc1Detune.value = jsonfile.osc1Detune;
	
	if ( jsonfile.osc2Detune != undefined) sounds[selectedSound].osc2Detune.value = jsonfile.osc2Detune;
	if (jsonfile.osc2Octave != undefined) sounds[selectedSound].osc2Octave.value = jsonfile.osc2Octave;
		
	if (jsonfile.osc3Amount != undefined) sounds[selectedSound].osc3Amount.value = jsonfile.osc3Amount;
	if (jsonfile.osc3Octave != undefined) sounds[selectedSound].osc3Octave.value = jsonfile.osc3Octave;
	if (jsonfile.osc3Detune != undefined) sounds[selectedSound].osc3Detune.value = jsonfile.osc3Detune;
	
	sounds[selectedSound].RingMod.active = jsonfile.ringMod;

	sounds[selectedSound].oscMix.value = jsonfile.oscMix;
	if (jsonfile.glideUp!= undefined) {
		sounds[selectedSound].glideSelector.up = jsonfile.glideUp;
		sounds[selectedSound].glideSelector.down = jsonfile.glideDown;
	} else {
		sounds[selectedSound].glideSelector.up = true;
		sounds[selectedSound].glideSelector.down = true;
	}


	if (jsonfile.oscRamp != undefined) sounds[selectedSound].oscRamp.value = jsonfile.oscRamp;
	if (jsonfile.rollingChords != undefined) {
		sounds[selectedSound].rollingChords.value = jsonfile.rollingChords;
	} else {
		sounds[selectedSound].rollingChords.value = 0;
	}

	if (jsonfile.noiseType != undefined) sounds[selectedSound].noiseSelector.value = jsonfile.noiseType;

	sounds[selectedSound].LFO1Freq.value = jsonfile.LFO1Freq;
	sounds[selectedSound].LFO1Binder.value = jsonfile.LFO1Binder;
	if (jsonfile.LFO1Link) sounds[selectedSound].LFO1Link.value = jsonfile.LFO1Link;
	if (jsonfile.LFO1Binder == 2) {
		sounds[selectedSound].LFO1Amount.set(-5000, 5000, jsonfile.LFO1Amount, 1);
	}else{
		
		sounds[selectedSound].LFO1Amount.set(-100, 100, jsonfile.LFO1Amount, 0.1);
	}
		

	sounds[selectedSound].LFO2Freq.value = jsonfile.LFO2Freq;
	sounds[selectedSound].LFO2Amount.value = jsonfile.LFO2Amount;
	
	sounds[selectedSound].LFO2Binder.value = jsonfile.LFO2Binder;
	if (jsonfile.LFO2Link) sounds[selectedSound].LFO2Link.value = jsonfile.LFO2Link;
	if (jsonfile.LFO2Binder == 2) {
		sounds[selectedSound].LFO2Amount.set(-900, 900, jsonfile.LFO2Amount, 1);
	}else{
		sounds[selectedSound].LFO2Amount.set(-100, 100, jsonfile.LFO2Amount, 0.1);
	}
	
	sounds[selectedSound].filterFreq.value = jsonfile.filterFreq;
	sounds[selectedSound].filterRes.value = jsonfile.filterRes;
	if (jsonfile.filterGain != undefined) sounds[selectedSound].filterGain.value = jsonfile.filterGain;
	sounds[selectedSound].filterType.value = jsonfile.filterType;
	if (jsonfile.filterLink != undefined)sounds[selectedSound].filterLink.value = jsonfile.filterLink;


	sounds[selectedSound].distortionAmount.value = jsonfile.distortionAmount;
	sounds[selectedSound].distortionSampling.value = jsonfile.distortionSampling;

	sounds[selectedSound].delayTime.value = jsonfile.delayTime;
	sounds[selectedSound].delayFeedback.value = jsonfile.delayFeedback;
	sounds[selectedSound].delayFilterFreq.value = jsonfile.delayFilterFreq;

	sounds[selectedSound].sampleStart.value = jsonfile.sampleStart;
	sounds[selectedSound].sampleStop.value = jsonfile.sampleStop;
	sounds[selectedSound].sampleTune.value = jsonfile.sampleTune;

	 if( jsonfile.sampleLeft && jsonfile.sampleRight) {
		var buff = [];
		buff[0] = jsonfile.sampleLeft;
		buff[1] = jsonfile.sampleRight;
		sounds[selectedSound].sample.setBuffer(buff);
		SampleLoaded();
	 }

	
	if (sounds[selectedSound].osc1.oscillator.type == "custom") sounds[selectedSound].osc1.oscillator.type = "sine";
	if (sounds[selectedSound].osc2.oscillator.type == "custom") sounds[selectedSound].osc2.oscillator.type = "sine";
	if (sounds[selectedSound].osc3.oscillator.type == "custom") sounds[selectedSound].osc3.oscillator.type = "sine";
	

	sounds[selectedSound].start();

	sounds[selectedSound].osc1Wave.value = jsonfile.osc1Wave;
	sounds[selectedSound].osc2Wave.value = jsonfile.osc2Wave;
	sounds[selectedSound].osc3Wave.value = jsonfile.osc3Wave;
	sounds[selectedSound].LFO1Wave.value = jsonfile.LFO1Wave;
	sounds[selectedSound].LFO2Wave.value = jsonfile.LFO2Wave;


	if (jsonfile.osc1wavearray != undefined){
	
		sounds[selectedSound].osc1wavearray = jsonfile.osc1wavearray;
		sounds[selectedSound].osc2wavearray = jsonfile.osc2wavearray;
		sounds[selectedSound].osc3wavearray = jsonfile.osc3wavearray;
		sounds[selectedSound].LFO1wavearray = jsonfile.LFO1wavearray;
		sounds[selectedSound].LFO2wavearray = jsonfile.LFO2wavearray;

		if (sounds[selectedSound].osc1Wave.value == 4){
			sounds[selectedSound].osc1Wave.array = sounds[selectedSound].osc1wavearray;
			waveForm.updateWave(sounds[selectedSound].osc1Wave.array, sounds[selectedSound].osc1.oscillator);
						
		}

		if (sounds[selectedSound].osc2Wave.value == 4){
			sounds[selectedSound].osc2Wave.array = sounds[selectedSound].osc2wavearray;
			waveForm.updateWave(sounds[selectedSound].osc2Wave.array, sounds[selectedSound].osc2.oscillator);
		}
		
		if (sounds[selectedSound].osc3Wave.value == 4){
			sounds[selectedSound].osc3Wave.array = sounds[selectedSound].osc3wavearray;
			waveForm.updateWave(sounds[selectedSound].osc3Wave.array, sounds[selectedSound].osc3.oscillator);
		}
		
		if (sounds[selectedSound].LFO1Wave.value == 4){
			sounds[selectedSound].LFO1Wave.array = sounds[selectedSound].LFO1wavearray;
			waveForm.updateWave(sounds[selectedSound].LFO1Wave.array, sounds[selectedSound].LFO1.oscillator);
		}
		
		if (sounds[selectedSound].LFO2Wave.value == 4){
			sounds[selectedSound].LFO2Wave.array = sounds[selectedSound].LFO2wavearray;
			waveForm.updateWave(sounds[selectedSound].LFO2Wave.array, sounds[selectedSound].LFO2.oscillator);
		}
	}

	setTimeout(()=>{
		sounds[selectedSound].waveChange();
		sounds[selectedSound].knobs.forEach((knob)=>{
			knob.fnx();
		});

		sounds[selectedSound].setADSRValues();
		sounds[selectedSound].setADSRRange();
		sounds[selectedSound].setFilterType();
		sounds[selectedSound].setNoiseType();
		sounds[selectedSound].bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
		sounds[selectedSound].bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
		sounds[selectedSound].connectRingMod();

		patternForm.volumeKnobs[selectedSound].fnx();
	
		patternForm.panKnobs[selectedSound].fnx();

		sounds[selectedSound].playSilentNote(60)
		
	}, 10);

	soundForm.layOut();
	soundForm.render = true;

	patternForm.render = true;

}




function SampleLoaded(){

	sounds[selectedSound].sample.connect(sounds[selectedSound].filter);
	//draw sample waveform

	var isLoaded
	do{
		isLoaded = sounds[selectedSound].sample.isLoaded;
	} while (isLoaded == false)

	var sampleSize = 200;
	var peaks = sounds[selectedSound].sample.getPeaks(sampleSize);
	sounds[selectedSound].sampleWaveSet = [];

	for (var i = 0; i < sampleSize; i++){
		sounds[selectedSound].sampleWaveSet.push(peaks[i]);
	}

	soundForm.render = true;
}
















//   .oooooo.    .o8           o8o                         .                      
//  d8P'  `Y8b  "888           `"'                       .o8                      
// 888      888  888oooo.     oooo  .ooooo.   .ooooo.  .o888oo  .oooo.o           
// 888      888  d88' `88b    `888 d88' `88b d88' `"Y8   888   d88(  "8           
// 888      888  888   888     888 888ooo888 888         888   `"Y88b.        o8o 
// `88b    d88'  888   888     888 888    .o 888   .o8   888 . o.  )88b       `"' 
//  `Y8bood8P'   `Y8bod8P'     888 `Y8bod8P' `Y8bod8P'   "888" 8""888P'       o8o 
//                             888                                            `"' 
//                         .o. 88P                                                
//                         `Y888P                                                 















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
			fill(120);
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


















// ooooooooo.                 .       .                                  
// `888   `Y88.             .o8     .o8                                  
//  888   .d88'  .oooo.   .o888oo .o888oo  .ooooo.  oooo d8b ooo. .oo.   
//  888ooo88P'  `P  )88b    888     888   d88' `88b `888""8P `888P"Y88b  
//  888          .oP"888    888     888   888ooo888  888      888   888  
//  888         d8(  888    888 .   888 . 888    .o  888      888   888  
// o888o        `Y888""8o   "888"   "888" `Y8bod8P' d888b    o888o o888o 
                                                                      
                                                                      
                                                                      
// oooooooooooo                                      
// `888'     `8                                      
//  888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "    888   888  888      888   888   888  
//  888         888   888  888      888   888   888  
// o888o        `Y8bod8P' d888b    o888o o888o o888o 
//#patternform

function PatternForm(){
	this.pos;
	this.innerheight;
	this.innerTop;
	this.inFront = true;
	this.show = 5;
	this.render = true;

	this.soundButtons = [];
	this.volumeKnobs = [];
	this.panKnobs = [];

	this.stepButtons = [];

	this.vertical = {};
	this.thumb = {};
	this.list = 0;
	this.maxList = maxSounds - this.show;
	this.verticalSelect = false;

	
	this.patternbox = createSelect()
	this.patternbox.option("Pattern 1");
	this.patternbox.changed(()=>{
		currentPattern = Number(this.patternbox.selected());
		patternForm.render = true;
	});

	this.addbutton = createButton('+');
	this.addbutton.style("font-weight", "bold");
	this.addbutton.mousePressed(() => {
		if (patterns.length < 99){
			addPattern();
			currentPattern = patterns.length -1;
			this.updatePatternBox();
			patternForm.render = true;
		}
	});

	this.patternName = createInput().hide();
	
	this.patternmenuButton = new FunctionButtonObject(0,0,0,"Pattern menu");
	
	this.patternMenu = new PattMenu();

	
	for (var i = 0; i < maxSounds; i++){
		this.soundButtons.push( new FunctionButtonObject( 0, 0, 0, sounds[i].label ) );
		this.volumeKnobs.push( new KnobObject(0,0,0, "Vol", function(){
			sounds[this.index].filter.output.gain.value = this.value;
		}));
		this.volumeKnobs[i].index = i;
		this.volumeKnobs[i].set(0, 1, 0.5, 0.01);

		this.panKnobs.push( new KnobObject(0,0,0, "Pan", function(){
			sounds[this.index].osc1.pan(this.value);
			sounds[this.index].osc2.pan(this.value);
			sounds[this.index].osc3.pan(this.value);
			sounds[this.index].noise.pan(this.value);
			sounds[this.index].sample.pan(this.value);
		}));
		this.panKnobs[i].set(-1, 1, 0, 0.1);
		this.panKnobs[i].index = i;

		this.stepButtons[i] = [];
		for (var a = 0; a < maxBeats; a++){
			this.stepButtons[i].push( new StepButtonObject(0, 0, 0, a, i));
		}
	}
	

	this.layOut = function(){
		this.pos = {x:10, y: insideTop + insideHeight / 9, w: width * 0.9, h: height - insideTop - insideHeight / 6 - 5 };
		this.innerheight = (this.pos.x + this.pos.h) - this.pos.h / 20
		this.innerTop = this.pos.y + this.pos.h / 20;


		this.patternbox.size(this.pos.w / 10, this.pos.h / 22 );
		this.patternbox.position(this.pos.x + this.pos.w / 4.5, this.pos.y + 4);
		this.patternbox.selected(patternNames[currentPattern]);			

		this.addbutton.size(this.pos.h / 22, this.pos.h / 22);
		this.addbutton.position(this.patternbox.position().x - this.addbutton.width, this.pos.y + 4);

		this.patternName.size(this.addbutton.width + this.patternbox.width + 2, this.patternbox.height - 1);
		this.patternName.position(this.addbutton.position().x, this.pos.y + 4);

		this.patternmenuButton.pos = createVector(this.patternbox.position().x + this.patternbox.width + 10, this.pos.y + 4);
		this.patternmenuButton.height =this.pos.h/24;
		
		let margin = this.innerheight / 35
		let h = this.innerheight / 10;
		let b = (this.innerheight - (margin * 2) - (this.show * h)) / this.show; 

		var x = this.pos.x + this.pos.w / 80;
		for (var i = 0; i < this.show; i++){
			
			let y = this.innerTop + margin + i * (h + b);
			this.soundButtons[i + this.list].pos.x = x;
			this.soundButtons[i + this.list].pos.y = y;
			this.soundButtons[i + this.list].height = h;
			this.soundButtons[i + this.list].width = this.pos.w / 12;

			this.volumeKnobs[i + this.list].pos.x = x + this.pos.w / 12 + 15 ;
			this.volumeKnobs[i + this.list].pos.y = y + h/2;
			this.volumeKnobs[i + this.list].size = h * 0.3;

			this.panKnobs[i + this.list].pos.x = x + this.pos.w / 12 + 42;
			this.panKnobs[i + this.list].pos.y = y + h/2;
			this.panKnobs[i + this.list].size = h * 0.3;

			
			let stepLeft = x + this.pos.w / 11 + 60;
			let totalWidthPerButton = (this.pos.w - stepLeft - 15) / (maxBeats);
			let w = totalWidthPerButton * 0.9;
			var colorcount = 0;
			for (var a = 0; a < maxBeats; a++){
				this.stepButtons[i + this.list][a].pos.x = stepLeft + a * totalWidthPerButton;
				this.stepButtons[i + this.list][a].pos.y = y;
				this.stepButtons[i + this.list][a].width = w ;
				this.stepButtons[i + this.list][a].height = h ;
				if (colorcount < 4 ){
					this.stepButtons[i + this.list][a].color = 190;
				}else if(colorcount > 3){
					this.stepButtons[i + this.list][a].color = 160;
				}
				colorcount++
				if (colorcount == 8) colorcount = 0;
			}
		}

		this.vertical = {x: this.pos.x + this.pos.w - 15, y: this.soundButtons[0].pos.y, w: 10, h: (this.soundButtons[this. list + this.show -1].pos.y + this.soundButtons[this.list + this.show -1].height) - this.soundButtons[0].pos.y }
		this.thumb = {x: this.vertical.x, y: this.vertical.y + ((this.list) * (this.vertical.h / (this.maxList + 1))), w: 10, h: this.vertical.h / 10};

	}


	this.display = function(){
		push();
			//background
			fill( formBackGroundColor );
			stroke( 0, 180 );
			strokeWeight( 3 );
			rect( this.pos.x, this.pos.y, this.pos.w, this.pos.h);
			
			//menu bar
			fill( titleBarColor );
			stroke( 0 );
			strokeWeight( .5 );
			rect( this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			
			//title
			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text( "PATTERN : ", this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);
			let totalwidthtext = textWidth("PATTERN : ");
			textSize(this.pos.h / 30);
			textAlign(LEFT);
			//var s = textWidth((currentPattern + 1) + " / " + patterns.length);
			fill( formBackGroundColor );
			strokeWeight( 1.5 );
			rect(this.pos.x + this.pos.w / 40 + totalwidthtext, this.pos.y + 5, this.pos.w / 15, this.pos.h / 20 - 6);  //rect(this.pos.x + this.pos.w / 40 - 5, this.pos.y + 5, s + 10, this.pos.h / 20 - 6);

			fill(0);
			noStroke();
			text( (currentPattern + 1) + " / " + patterns.length, this.pos.x + this. pos.w / 40 + totalwidthtext + 5, this.pos.y + this.pos.h / 25);


			//soundselect indicator
			var w = this.stepButtons[0][0].width / 3.5;
			for (var i = 0; i < this.show; i++){
				fill(50);
				noStroke();
				if (i + this.list == selectedSound){
					fill(14, 181, 17);
					strokeWeight(0.8);
					stroke(50);
				}
				
				rect(this.stepButtons[i + this.list][0].pos.x - 8 - w, this.stepButtons[i + this.list][0].pos.y, w, this.stepButtons[i + this.list][0].height,cornerRadius );
			}

			this.displayBeatCounter();

		pop();

		//displaying knobs and buttons
			let margin = this.innerheight / 35
			let h = this.innerheight / 10;
			let b = (this.innerheight - (margin * 2) - (this.show * h)) / this.show; 

		for (var i = 0; i < this.show; i++){
			this.soundButtons[i + this.list].display(i + this.list);
			this.volumeKnobs[i + this.list].display();
			this.panKnobs[i + this.list].display();

			// //drawing the note images...    and catching a mouseclick on them??.. test..
			
			let y = this.innerTop + margin + i * (h + b);

			let stepLeft = (this.pos.x + this.pos.w / 80) + this.pos.w / 11 + 60;
			//let stepLeft = this.pos.x + this.pos.w / 8 + 45;

			image( patternImages[currentPattern][i + this.list], stepLeft, y, this.pos.w - stepLeft - 16, (this.pos.h / this.show) * 0.5);
			
		}

		//scrollbar
		fill(120);
		rect( this.vertical.x, this.vertical.y, this.vertical.w, this.vertical.h );
		fill(188, 90, 18);
		rect( this.thumb.x, this.thumb.y, this.thumb.w, this.thumb.h);

		//pattern menu
		this.patternmenuButton.display();
		if (this.patternMenu.pos) this.patternMenu.show();

		this.render = false;
	}
	

	this.catch = function(){
		if (this.inFront){

			//check if exiting the name inputbox
			let pw = this.addbutton.width + this.patternbox.width + 2;
			let ph = this.patternbox.height - 1;
			if (document.activeElement == this.patternName.elt &&
				!(mouseX > this.patternName.x && mouseX < this.patternName.x + pw &&
				mouseY > this.patternName.y && mouseY < this.patternName.y + ph) ){
				this.changeName();
				return;
			}

			//clicking the slider
			if (mouseX > this.vertical.x && mouseX < this.vertical.x + this.vertical.w &&
				mouseY > this.vertical.y && mouseY < this.vertical.y + this.vertical.h){
				this.thumb.y = constrain(mouseY, this.vertical.y, this.vertical.y + this.vertical.h - this.thumb.h);
				this.list = floor(map(this.thumb.y, this.vertical.y, this.vertical.y + this.vertical.h - this.thumb.h, 0, 10));
				this.layOut();
				this.verticalSelect = true;

			}else{

				if (this.patternMenu.pos){
					this.patternMenu.catch();

				}else{

					let margin = this.innerheight / 35
					let h = this.innerheight / 10;
					let b = (this.innerheight - (margin * 2) - (this.show * h)) / this.show; 

					for (var i = 0; i < this.show; i++){ //find mouseclicks on the images

						let y = this.innerTop + margin + i * (h + b);
						let stepLeft = (this.pos.x + this.pos.w / 80) + this.pos.w / 11 + 60;

						if (mouseX > stepLeft && mouseX < this.pos.w - 16 &&
							mouseY > y && mouseY < y + (this.pos.h / this.show) * 0.5){
							selectedSound = i + this.list;

							if (mouseButton == LEFT){
								if (patterns[currentPattern][selectedSound].isEuclidian){
									euclidianForm.set(
										patternForm.patternbox.position().x + patternForm.patternbox.width + width * 0.01,
										insideTop + height * 0.01,
										soundForm.pos.w * 0.55,
										(height - insideTop) * 0.95,
									);
									euclidianForm.inFront = true;

								} else {
									pianoForm.inFront = true;
									pianoForm.list.y = pianoForm.maxRows / 2;

								}

							}else if (mouseButton == RIGHT){
								pattImageMenu.pos = createVector(mouseX, mouseY);
							}
							
							if (!sounds[selectedSound].started) {
								sounds[selectedSound].start();
								sounds[selectedSound].waveChange();
							}

						}else{
							this.soundButtons[i + this.list].catch(i + this.list);
							this.volumeKnobs[i + this.list].catch();
							this.panKnobs[i + this.list].catch();
						}
					}
					this.patternmenuButton.catch()
					this.render = true;
				}
				
				
				
			}
			
		}else{
			//check if clicked outside form, inside sequencerform, switch
			if ((mouseX > this.pos.x && mouseX < sequencerForm.pos.x &&
				mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h) ||
				(mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
				 mouseY > sequencerForm.pos.y + sequencerForm.pos.h && mouseY < this.pos.y + this.pos.h)){
				this.inFront = true;
				sequencerForm.inFront = false;
				this.patternbox.show();
				this.addbutton.show();
			}
		}
	}

	this.displayBeatCounter = function(){

		//draw only the beatcounter, saves time

		push();
			fill(formBackGroundColor);
			noStroke();
			rect(this.stepButtons[this.list+ this.show-1][0].pos.x, this.stepButtons[this.list+ this.show-1][0].pos.y + this.stepButtons[this.list+ this.show-1][0].height * 1.1, (this.pos.x + this.pos.w) - this.stepButtons[this.list+ this.show-1][0].pos.x - 5, this.pos.h * 0.05)

			stroke(0);
			fill(formBackGroundColor - 40);
			strokeWeight(1.2);

			for (var i = 0; i < maxBeats; i++){
				var s = this.stepButtons[this.list + this.show -1][i];
				if (i == beatCounter-1){
					push();
					fill(188, 90, 18);
					rect( s.pos.x, s.pos.y + s.height * 1.2, s.width, s.height / 3, cornerRadius);
					pop();
				}else {
					rect( s.pos.x, s.pos.y + s.height * 1.2, s.width, s.height / 3, cornerRadius);	
				}
			}
		pop();
	}

	this.release = function(){
		for (var i = 0; i < this.show; i++){
			this.volumeKnobs[i + this.list].release();
			this.panKnobs[i + this.list].release();
		}
		this.verticalSelect = false;
	}

	this.drag = function(amount){
		for (var i = 0; i < this.show; i++){
			this.volumeKnobs[i + this.list].drag( amount );
			this.panKnobs[i + this.list].drag( amount );
		}
		if (this.verticalSelect == true){
			this.thumb.y = constrain(mouseY, this.vertical.y, this.vertical.y + this.vertical.h - this.thumb.h);
			this.list = floor(map(this.thumb.y, this.vertical.y, this.vertical.y + this.vertical.h - this.thumb.h, 0, this.maxList));
			this.layOut();
		}
		this.render = true;
	}

	this.scroll = function(amount){
		//if mouse = on menu bar, change pattern
		if (this.inFront == true && mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
			mouseY > this.pos.y && mouseY < this.innerTop){
			
			if (currentPattern + amount >= 0 && currentPattern + amount < patterns.length) currentPattern += amount;
			this.patternbox.selected(currentPattern);
			this.render = true;

		}else if (this.inFront == true && pianoForm.inFront == false && soundForm.inFront == false && mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
			mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h &&
			this.list + round(amount) <= this.maxList && this.list + round(amount) >= 0) {
			
			this.list += round(amount);
			this.thumb.y = this.list;
			this.layOut();
			this.render = true;
		}
	}

	this.changeName = function(){
		patternForm.patternName.hide();
		if (patternForm.patternName.value() != "") patternNames[currentPattern] = patternForm.patternName.value();
		this.updatePatternBox();
	}

	this.updatePatternBox = function(){
		patternForm.patternbox.elt.innerHTML = "";
		for (var i = 0; i < patternNames.length; i++){
			this.patternbox.option(patternNames[i], i);
		}
		this.patternbox.selected(currentPattern);
	}
}







//  .oooooo..o                                                                                     
// d8P'    `Y8                                                                                     
// Y88bo.       .ooooo.   .ooooo oo oooo  oooo   .ooooo.  ooo. .oo.    .ooooo.   .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b d88' `888  `888  `888  d88' `88b `888P"Y88b  d88' `"Y8 d88' `88b `888""8P 
//      `"Y88b 888ooo888 888   888   888   888  888ooo888  888   888  888       888ooo888  888     
// oo     .d8P 888    .o 888   888   888   888  888    .o  888   888  888   .o8 888    .o  888     
// 8""88888P'  `Y8bod8P' `V8bod888   `V88V"V8P' `Y8bod8P' o888o o888o `Y8bod8P' `Y8bod8P' d888b    
//                             888.                                                                
//                             8P'                                                                 
//                             "                                                                   
// oooooooooooo                                      
// `888'     `8                                      
//  888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "    888   888  888      888   888   888  
//  888         888   888  888      888   888   888  
// o888o        `Y8bod8P' d888b    o888o o888o o888o 


function SequencerForm(){
	this.pos;
	this.inFront = false;

	this.list = {x: 0, y:0};
	this.horizontal = {};
	this.vertical = {};


	this.tx;
	this.ty;
	this.maxx;
	this.maxy;

	this.maxSeq = 0;
	this.startSeq = 0;
	this.currentSeq = 0;

	this.viewCols = 8;
	this.viewRows = 20;

	this.maxCols = 99;
	this.maxRows = 24;

	this.sequence = [];
	for (var i = 0; i <= this.maxCols; i++){
		this.sequence.push( [] );
		for (var j = 0; j <= this.maxRows; j++){
			this.sequence[this.sequence.length -1].push( undefined );
		}
	}

	this.resetSelection = function(){
		this.selection = {
			start: undefined,
			end: undefined
		};
	}
	this.resetSelection();


	this.layOut = function(){
		this.pos = {x: 50, y: insideTop + 15, w: width - 55, h: height * 0.8 - insideTop };
		
		this.tx = this.pos.x + 8;
		this.ty = this.pos.y + 35 + this.pos.h / 20;
		this.maxx = this.pos.w - 26;
		this.maxy = this.pos.h - 5 - (this.ty - this.pos.y);

		this.horizontal.w = this.maxx / this.sequence.length * 6;
		this.vertical.h = this.maxy / this.sequence[0].length * 12;
				
		this.horizontal = {h: 15, w : this.maxx / this.sequence.length * 6, x: map(this.list.x, 0, this.sequence.length - 6, this.tx, this.tx + this.maxx - this.horizontal.w), y: this.ty - 25, active: false};
		this.vertical = {w: 15, h: this.maxy / this.sequence[0].length * 12,  x: this.tx + this.maxx, y: map(this.list.y, 0, 24, this.ty, this.ty + this.maxy - this.vertical.h), active: false};
		
			
			

	}

	this.display = function(){
		push();

			let xscale = (this.maxx / this.viewCols);
			let yscale = (this.maxy / this.viewRows);

			//background
			fill( formBackGroundColor );
			stroke( 0, 180 );
			strokeWeight( 3 );
			rect( this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			//menu bar
			fill( titleBarColor );
			stroke( 0 );
			strokeWeight( .5 );
			rect( this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			//title

			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text( "SEQUENCER : " + patternNames[currentPattern], this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);

			//background
			fill(100);
			stroke(30);
			rect(this.tx, this.ty, this.maxx, this.maxy);

			//scrollbars
			fill(120);
			rect(this.tx, this.ty - 25, this.maxx, 15);
			rect(this.tx + this.maxx, this.ty, 15, this.maxy);
			//bar thumbs
			fill(188, 90, 18);
			rect( this.horizontal.x, this.horizontal.y, this.horizontal.w, this.horizontal.h);
			rect( this.vertical.x, this.vertical.y, this.vertical.w, this.vertical.h);


			//grid lines
			stroke(200);
			strokeWeight(0.4);
			for (var x = 0; x < this.viewCols; x++){
				line(this.tx + x * xscale, this.ty, this.tx + x * xscale, this.ty + this.maxy);
			}
			for (var y = 0; y < this.viewRows; y++){
				line(this.tx + 0.2, this.ty + y * yscale, this.tx + this.maxx, this.ty + y * yscale);
			}

			//find list
			this.list.x = floor(map(this.horizontal.x, this.tx, this.tx + this.maxx - this.horizontal.w, 0, this.sequence.length - this.viewCols));
			this.list.y = floor(map(this.vertical.y, this.ty, this.ty + this.maxy - this.horizontal.h, 0, this.sequence[0].length - this.viewRows));
			
			// start indicator bar
			fill(40);
			noStroke()
			rect(this.tx, this.ty - 10, this.maxx, 10);

			//running bar
			if (menuBar.playMode.value == 1 && this.currentSeq >= this.list.x && this.currentSeq < this.list.x + this.viewCols){
				fill(240,80);
				noStroke();
				let blockx = this.tx + (this.currentSeq - this.list.x) * xscale;
				let blockPlace = blockx + beatCounter * (this.maxx / this.viewCols / maxBeats);
				rect(blockPlace, this.ty, this.maxx / 32 / this.viewCols, this.maxy);
			}


			//draw selection rectangle and notes within
			textSize(yscale * 0.5);

			if (this.selection.start){
				
				//start end vector true positions
				let startx = this.tx + (this.selection.start.x - this.list.x) * xscale;
				let starty = this.ty + (this.selection.start.y - this.list.y) * yscale;
				

				let endx = this.tx + (this.selection.end.x - this.list.x) * xscale;
				let endy = this.ty + (this.selection.end.y - this.list.y) * yscale;
				


				//notes of snippet
				if (this.selection.snippet){
					
					this.selection.snippet.forEach((col, colIndex)=>{
						col.forEach((seq, rowIndex)=>{
							
							if (seq && startx + (colIndex * xscale) >= this.tx && startx + (colIndex * xscale) < this.tx + this.maxx &&
								starty + (rowIndex * yscale) >= this.ty && starty + (rowIndex * yscale) < this.ty + this.maxy){

								fill(220,50);
								rect( startx + (colIndex * xscale), starty + (rowIndex * yscale), xscale, yscale, cornerRadius * 2);
								fill(80);
								rect( startx + (colIndex * xscale), starty + (rowIndex + 0.7) * yscale, xscale, yscale * 0.3);
								fill(20);
								noStroke();

								if (textWidth( patternNames[patterns.indexOf(seq)] ) > xscale * 0.9 ){
									var ind = patternNames[patterns.indexOf(seq)].length -1
									for (var a = patternNames[patterns.indexOf(seq)].length - 1; a >= 0; a--){
										if (textWidth( patternNames[patterns.indexOf(seq)].substr(0, a) ) > xscale * 0.9){
											ind = a;
										}						
									}
									text(patternNames[patterns.indexOf(seq)].substr(0, ind  - 3) + "...", startx + (colIndex + 0.1) * xscale, starty + (rowIndex + 0.6) * yscale);
									
								}else{
									text(patternNames[patterns.indexOf(seq)], startx + (colIndex + 0.1) * xscale, starty + (rowIndex + 0.6) * yscale);

								}
							}
							
						});
					});

				}

				//hide sleection outside view
				startx = constrain(startx, this.tx, this.tx + this.maxx);
				starty = constrain(starty, this.ty, this.ty + this.maxy);
				endx = constrain(endx, this.tx - xscale, this.tx + this.maxx - xscale);
				endy = constrain(endy, this.ty - yscale, this.ty + this.maxy - yscale);

				//rectangle (within the view)
				stroke(217,114,31);	
				fill(200,0,0,50);
				
				rect(startx, starty, endx - startx + xscale, endy - starty + yscale);
			}


			
			noStroke();
			//adding pattern blocks
			for (var y = 0; y < this.viewRows; y++){
				for (var x = 0; x < this.viewCols; x++){
					
					if (this.list.x + x == this.startSeq){ // green start indicator
						fill(20,200,10);
						rect(this.tx + x * xscale, this.ty - 10, 15,10); 
					}

					var seq = this.sequence[this.list.x + x][this.list.y + y];

					if (seq != undefined){
						fill(220,50);
						rect(this.tx + x * xscale, this.ty + y * yscale, xscale, yscale, cornerRadius * 2);
						fill(80);
						rect(this.tx + x * xscale, this.ty + (y + 0.7) * yscale, xscale, yscale * 0.3);
						fill(20);
						noStroke();

						if (textWidth( patternNames[patterns.indexOf(seq)] ) > xscale * 0.9 ){
							var ind = patternNames[patterns.indexOf(seq)].length -1
							for (var a = patternNames[patterns.indexOf(seq)].length - 1; a >= 0; a--){
								if (textWidth( patternNames[patterns.indexOf(seq)].substr(0, a) ) > xscale * 0.9){
									ind = a;
								}						
							}
							text(patternNames[patterns.indexOf(seq)].substr(0, ind  - 3) + "...", this.tx + (x + 0.1) * xscale, this.ty + (y+ 0.6) * yscale )
							
						}else{
							text(patternNames[patterns.indexOf(seq)], this.tx + (x + 0.1) * xscale, this.ty + (y+ 0.6) * yscale );

						}
					}
				}
			}

		pop();
	}

	this.displayBeatCounter = function(){
		if (this.currentSeq >= this.list.x && this.currentSeq < this.list.x + this.viewCols){
			push();
				fill(240,80);
				noStroke();
				let blockx = this.tx + (this.currentSeq - this.list.x) * (this.maxx / this.viewCols);
				let blockPlace = blockx + beatCounter * (this.maxx / this.viewCols / maxBeats);
				rect(blockPlace, this.ty, this.maxx / 32 / this.viewCols, this.maxy);
			pop();
		}
	}


	this.catch = function(){
		if (this.inFront){

			if (mouseX > this.tx && mouseX < this.tx + this.maxx &&  //the small playbar on top, to select start pattern
				mouseY > this.ty - 10 && mouseY < this.ty){
			    let x = this.list.x + floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
				this.startSeq = x;
				if (!playing) this.currentSeq = x;

			}else if (mouseX > this.tx && mouseX < this.tx + this.maxx &&
				mouseY < this.ty - 10 && mouseY > this.ty - 25){   //horizontal scrollbar
				
				this.horizontal.active = true;
				this.horizontal.x = constrain(mouseX, this.tx, this.tx + this.maxx - this.horizontal.w);

			}else if (mouseX > this.tx + this.maxx && mouseX < this.tx + this.maxx + 15 &&
				mouseY > this.ty && mouseY < this.ty + this.maxy){  // vertical scrollbar
				
				this.vertical.active = true;
				this.vertical.y = constrain( mouseY, this.ty, this.ty + this.maxy - this.vertical.h);
			}


			if (mouseX > this.tx && mouseX < this.tx + this.maxx && mouseY > this.ty && mouseY < this.ty + this.maxy){
				//clicked inside main area
				
				var x = this.list.x + floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
				var y = this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows) );

				if (mouseButton == RIGHT){

					if (this.selection.start){
						this.pasteSnippet();
						return;
					}
					//remove block
					this.sequence[x][y] = null;

					if ( x == this.maxSeq){ //find out if the maxseq should be different
						let found = false;
						for (var e = 0; e <= x; e++){
							for (var i = 0; i < this.sequence[x - e].length; i++){
								if (this.sequence[x - e][i] != null){
									found = true;
								}
							}
							if (found == true){
								this.maxSeq = x - e;
								break;
							}
						}
					}

				}else if (mouseButton == LEFT){

					if ( keyIsDown(16) ){  
					//if shift is pressed, note select rectangle
						if (this.selection.snippet) this.pasteSnippet();
						this.resetSelection();
						this.selection.end = createVector(x, y);	
						this.selection.start = createVector(x, y);					

					} else if (this.selection.start) { //if there is a rectangle selected, but shift is not pressed
							

						if ( !this.selection.drag && 
							 (x < this.selection.start.x || x > this.selection.end.x ||
							 y < this.selection.start.y || y > this.selection.end.y) ) {  
							//check if outside selection area
							this.pasteSnippet();
							this.resetSelection();

						} else {
							this.selection.drag = createVector(x, y);
						}

						return;

					} else {
				 	
					 	if ( this.sequence[x][y] != null){
					 		currentPattern = patterns.indexOf(this.sequence[x][y]);
					 		patternForm.patternbox.selected(currentPattern);
					 	}else{
					 		if (x > this.maxSeq) this.maxSeq = x;
					 		this.sequence[x][y] = patterns[currentPattern];
					 	}
					}
				}
			}

		}else{
			if ( (mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
				mouseY > this.pos.y && mouseY < patternForm.pos.y) ||
				(mouseX > patternForm.pos.x + patternForm.pos.w && mouseX < this.pos.x + this.pos.w &&
				 mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h) ){

				this.inFront = true;
				patternForm.inFront = false;
				patternForm.patternbox.hide();
				patternForm.addbutton.hide();
				patternForm.render = true;
			}
		}
	}

	this.scroll = function(amount){


		//if mouse = on menu bar, change pattern
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
			mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h / 20){
			
			if (currentPattern + amount >= 0 && currentPattern + amount < patterns.length){
				currentPattern += amount;
				patternForm.patternbox.selected(currentPattern);
			}
			
		}else if(mouseX > this.tx && mouseX < this.tx + this.maxx && //if inside window, move horizontal scrollbar
			mouseY > this.ty && mouseY < this.ty + this.maxy){

			this.horizontal.x = constrain(this.horizontal.x + amount * 10, this.tx, this.tx + this.maxx - this.horizontal.w);

		}
	}

	this.release = function(){
		this.horizontal.active = false;
		this.vertical.active = false;

		if (!this.selection.snippet && this.selection.start){
			
			this.selection.snippet = this.grabSnippet();
			return;
		}
		if (this.selection.drag) this.selection.drag = undefined;
	}

	this.drag = function(amount){

		if (keyIsDown(16) && this.selection.start){  
			//if shift is pressed, change end
			
			var x = this.list.x + floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
			var y = this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows) );

			x = constrain( x, this.selection.start.x, this.list.x + this.viewCols - 1);
			y = constrain( y, this.selection.start.y, this.list.y + this.viewRows - 1);

			this.selection.end = createVector(x, y);	
			
			return;
		}

		if (this.selection.drag){
			
			var x = this.list.x + floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
			var y = this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows) );

			let nD = createVector(x, y);

			if (nD.dist(this.selection.drag) != 0){

				let diff = nD.copy().sub(this.selection.drag);

				if (this.selection.start.x + diff.x >= 0 && this.selection.end.x + diff.x < this.maxCols &&
					this.selection.start.y + diff.y >= 0 && this.selection.end.y + diff.y < this.maxRows) {

					this.selection.start.x += diff.x;
					this.selection.end.x += diff.x;
					this.selection.start.y += diff.y;
					this.selection.end.y += diff.y;

					this.selection.drag = nD.copy();
				}

				
			}

			return;
		}



		if ( this.horizontal.active ){
			this.horizontal.x = constrain(mouseX, this.tx, this.tx + this.maxx - this.horizontal.w);
			
		}else if( this.vertical.active ){
			this.vertical.y = constrain(mouseY, this.ty, this.ty + this.maxy - this.vertical.h);
		}
	}

	this.grabSnippet = function(){

		let snip = new Array(this.selection.end.x - this.selection.start.x);

		for (var x = this.selection.start.x; x <= this.selection.end.x; x++){
			snip[x - this.selection.start.x] = [];

			for (var y = this.selection.start.y; y <= this.selection.end.y; y++){
				
				snip[x - this.selection.start.x][y - this.selection.start.y] = this.sequence[x][y];
				this.sequence[x][y] = null;
			}			
		}

		if (this.maxSeq >= this.selection.start.x && this.maxSeq <= this.selection.end.x){

			let lastFilledColumn = this.selection.start.x - 1;
			for (var x = this.selection.start.x; x <= this.selection.end.x; x++){
				for (var y = 0; y < this.sequence[x].length; y++){
					if (this.sequence[x][y] != null){
						lastFilledColumn = x;
						break;
					}
				}
			}

			this.maxSeq = lastFilledColumn;	
		}


		return snip;		
	}

	this.pasteSnippet = function(){
		this.selection.snippet.forEach((col, colIndex)=>{
			col.forEach((seq, rowIndex)=>{
				
				if (seq != undefined) this.sequence[this.selection.start.x + colIndex][this.selection.start.y + rowIndex] = seq;
				if (seq != undefined && this.selection.start.x + colIndex > this.maxSeq) this.maxSeq = this.selection.start.x + colIndex;

			});
		});
	}

	this.deleteSnippet = function(){
		this.resetSelection();
	}
}
















// ooooooooo.    o8o                                  oooooooooooo                                      
// `888   `Y88.  `"'                                  `888'     `8                                      
//  888   .d88' oooo   .oooo.   ooo. .oo.    .ooooo.   888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888ooo88P'  `888  `P  )88b  `888P"Y88b  d88' `88b  888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888          888   .oP"888   888   888  888   888  888    "    888   888  888      888   888   888  
//  888          888  d8(  888   888   888  888   888  888         888   888  888      888   888   888  
// o888o        o888o `Y888""8o o888o o888o `Y8bod8P' o888o        `Y8bod8P' d888b    o888o o888o o888o 
                                                                                                     





function PianoForm(){
	this.pos;
	this.inFront = false;

	this.list = {x: 0, y:12};
	this.vertical = {};

	this.tx;
	this.ty;
	this.maxx;
	this.maxy;

	this.maxCols = 64;
	this.maxRows = 83;

	this.viewCols = 64;
	this.viewRows = 32;

	this.keys = [];
	this.keyIndexMap = new Map();

	var index = 0;
	for (var oct = 1; oct <= 7; oct++){
		for (var n = 0; n < notes.length; n++){
			this.keys.push(notes[n] + oct);
			this.keyIndexMap.set(notes[n] + oct, index);
			index++;
		}
	}
	
	this.resetSelection = function(){
		this.selection = {
			start: undefined,
			end: undefined
		};
	}
	this.resetSelection();


	this.layOut = function(){
		this.pos = {x: 50, y: insideTop + 15, w: width - 55, h: height - insideTop - 60 };
		
		this.tx = this.pos.x + 50;
		this.ty = this.pos.y + this.pos.h / 15;
		this.maxx = this.pos.w - 75;
		this.maxy = this.pos.h - 5 - (this.ty - this.pos.y);

		this.vertical.h = this.maxy / this.maxRows * this.viewRows;
				
		this.vertical = {w: 15, h: this.vertical.h,  x: this.tx + this.maxx, y: this.ty + this.maxy * 0.35, active: false};			

	}

	this.display = function(){
		push();


		let first = this.maxRows - (this.list.y + this.viewRows);
		let last = this.maxRows - this.list.y + 1;
		var xscale = this.maxx / this.viewCols;
		var yscale = this.maxy / this.viewRows;


		//background
			fill( formBackGroundColor );
			stroke( 0, 180 );
			strokeWeight( 3 );
			rect( this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			//menu bar
			fill( titleBarColor );
			stroke( 0 );
			strokeWeight( .5 );
			rect( this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			//title
			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text( "PIANOROLL: " + sounds[selectedSound].label + " : " + patternNames[currentPattern], this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);


			//background
			fill(100);
			stroke(30);
			rect(this.tx, this.ty, this.maxx, this.maxy);

			//scrollbar
			fill(120);
			rect(this.tx + this.maxx, this.ty, 15, this.maxy);
			//bar thumb
			fill(188, 90, 18);
			rect( this.vertical.x, this.vertical.y, this.vertical.w, this.vertical.h);


			//find list
			this.list.y = floor(map(this.vertical.y, this.ty, this.ty + this.maxy - this.vertical.h, 0, this.maxRows - this.viewRows + 1));

			//grid lines
			stroke(200);
			for (var x = 0; x < this.viewCols; x++){
				strokeWeight(0.5);
				if ((x)%8==0 && x != 0) strokeWeight(2.6); //drawing thicker lines every 8 beats
				line(this.tx + x * xscale, this.ty, this.tx + x * xscale, this.ty + this.maxy);
			}
			strokeWeight(0.5);
			for (var y = 0; y < this.viewRows; y++){
				line(this.tx + 0.2, this.ty + y * yscale, this.tx + this.maxx, this.ty + y * yscale);
			}

			
			//piano keys
			textSize(yscale * 0.5);

			let allpressednotes = "";
			
			keyboardPolyNotes.forEach(note=>{
				allpressednotes = allpressednotes + midiToString(note) + " ";
			});

			for (var y = 0; y < this.viewRows; y++){
				let i = this.maxRows - (this.list.y + y);
				stroke(0);
				fill(200);
				if (this.keys[i]){
					
					if (allpressednotes.search(this.keys[i]) >= 0){
						fill( 188, 90, 18 );
						
					}else if (this.keys[i].length > 2){
						fill(0);
					}
					
					rect(this.tx - 35, this.ty + y * yscale, 35, yscale);
					noStroke();
					fill(80);
					text(this.keys[i], this.tx - 25, this.ty + y * yscale + textSize());
				}
			}


			//draw selection rectangle and notes within

			if (this.selection.start){
				
				//start end vector true positions
				let startx = this.tx + this.selection.start.x * xscale;
				let starty = this.ty + (this.viewRows - (this.selection.start.y - first)) * yscale;
				

				let endx = this.tx + (this.selection.end.x) * xscale;
				let endy = this.ty + (this.viewRows - ((this.selection.end.y) - first)) * yscale;
				

				//notes of snippet
				if (this.selection.snippet){
					stroke(0)
					fill(217,114,31);
					this.selection.snippet.forEach((col, colIndex)=>{
						col.forEach(note=>{
							if (starty + note * yscale >= this.ty && starty + note * yscale + yscale <= this.ty + this.maxy){
								rect(startx + colIndex * xscale, starty + note * yscale, xscale, yscale, cornerRadius);
							}
						});
					});

				}

				//hide selection out of view
				starty = constrain(starty, this.ty, this.ty + this.maxy);
				endy = constrain(endy, this.ty - yscale, this.ty + this.maxy - yscale);

				//rectangle (within the view)
				stroke(217,114,31);	
				fill(200,0,0,50);
				
				rect(startx, starty, endx - startx + xscale, endy - starty + yscale);
			}

			//draw notes
			stroke(0)
			fill(217,114,31);
			for (var x = 0; x < this.maxCols; x++){
				let note = patterns[currentPattern][selectedSound][x];
				if (note.length > 0){
					for (var i = 0; i < note.length; i++){

						let index = note[i] - 24;

						if (index > first && index < last){
							
							rect(this.tx + x * xscale, this.ty + (this.viewRows - (index-first)) * yscale, xscale, yscale, cornerRadius);
						}
					}
				}
			}


			//een lijn die aangeeft waar je bent in de pattern....\
			if (playing == true){
				fill(200,200,200,100);
				rect( this.tx + beatCounter * xscale, this.ty, xscale, this.maxy);
			}
	

		pop();
	}


	this.catch = function(){
	

		if (mouseX > this.tx + this.maxx && mouseX < this.tx + this.maxx + 15 &&
			mouseY > this.ty && mouseY < this.ty + this.maxy){  // vertical scrollbar

			this.vertical.active = true;
			this.vertical.y = constrain( mouseY, this.ty, this.ty + this.maxy - this.vertical.h);
		}


		if (mouseX > this.tx && mouseX < this.tx + this.maxx && mouseY > this.ty && mouseY < this.ty + this.maxy){
			//clicked inside main area
			
			var x = floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
			var y = this.maxRows - (this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows) ));

			if (y != floor(y)) return;

			if (mouseButton == RIGHT){ //removing note
				
				if (this.selection.start){
					this.pasteSnippet();
					return;
				}

				patterns[currentPattern][selectedSound][x].forEach((note, index)=>{
					if (note == y + 24) patterns[currentPattern][selectedSound][x].splice(index, 1);
				});

			}else if (mouseButton == LEFT){

				if ( keyIsDown(16) ){  
				//if shift is pressed, note select rectangle

					if (this.selection.snippet) this.pasteSnippet();
					this.resetSelection();
					this.selection.end = createVector(x, y);	
					this.selection.start = createVector(x, y);					

				} else if (this.selection.start) { //if there is a rectangle selected, but shift is not pressed
						

					if ( !this.selection.drag && 
						 (x < this.selection.start.x || x > this.selection.end.x ||
						 y > this.selection.start.y || y < this.selection.end.y) ) {  //endpoint y is smaller than starty...
						//check if outside selection area
						this.pasteSnippet();
						this.resetSelection();

					} else {
						this.selection.drag = createVector(x, y);
					}

					return;

				} else {

					//if not inside selection area, add note!

					let found = false;
				 	patterns[currentPattern][selectedSound][x].forEach((note, index)=>{
				 		if (note == 24 + y) found = true;
				 	});
				 	
				 	if (!found && patterns[currentPattern][selectedSound][x].length < 3){
				 		patterns[currentPattern][selectedSound][x].push(24 + y);
				 		patterns[currentPattern][selectedSound][x].sort((a,b)=>a>b);
				 	}			 	
				 	sounds[selectedSound].playNote( 24 + y );	
				}
			 	
			 	
			}

			editPatternImage(currentPattern, selectedSound);
		}

		if ( (mouseX < this.pos.x || mouseX > this.pos.x + this.pos.w ||
			(mouseY < this.pos.y && mouseY > menuBar.pos.h) || mouseY > this.pos.y + this.pos.h) ){ //outside form

			//save image and data
			this.resetSelection();
			this.inFront = false;
			background(40)
			sequencerForm.display();
			patternForm.render = true;
			patternForm.patternbox.show();
			patternForm.addbutton.show();
			
		}
	}

	
	this.scroll = function(amount){

		//if mouse = on menu bar, change pattern
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
			mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h / 20){
			
			if (currentPattern + amount >= 0 && currentPattern + amount < patterns.length){
				currentPattern += amount;
				patternForm.display();
			}
			
		}else{
			this.vertical.y = constrain(this.vertical.y += amount * 10, this.ty, this.ty + this.maxy - this.vertical.h);
		}
	}

	this.release = function(){
		this.vertical.active = false;
		
		if (!this.selection.snippet && this.selection.start){
			
			this.selection.snippet = this.grabSnippet();
			return;
		}
		if (this.selection.drag) this.selection.drag = undefined;
	}

	this.drag = function(amount){

		if (keyIsDown(16) && this.selection.start){  
			//if shift is pressed, change end
			var x = floor(map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols));
			x = constrain( x, this.selection.start.x, this.maxCols - 1);

			var y = this.maxRows - (this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows)));
			var y = constrain( y, this.maxRows - (this.list.y + this.viewRows) + 1, this.selection.start.y);

			this.selection.end = createVector(x, y);	
			
			return;
		}

		if (this.selection.drag){
			
			var x = floor( map(mouseX, this.tx, this.tx + this.maxx, 0, this.viewCols) );
			var y = this.maxRows - (this.list.y + floor( map(mouseY, this.ty, this.ty + this.maxy, 0, this.viewRows) ));

			let nD = createVector(x, y);

			if (nD.dist(this.selection.drag) != 0){

				let diff = nD.copy().sub(this.selection.drag);

				if (this.selection.start.x + diff.x >= 0 && this.selection.end.x + diff.x < this.maxCols &&
					this.selection.start.y + diff.y < this.maxRows && this.selection.end.y + diff.y >= 0) {

					this.selection.start.x += diff.x;
					this.selection.end.x += diff.x;
					this.selection.start.y += diff.y;
					this.selection.end.y += diff.y;

					this.selection.drag = nD.copy();
				}

				
			}

			return;
		}

		if( this.vertical.active ){
			this.vertical.y = constrain(mouseY, this.ty, this.ty + this.maxy - this.vertical.h);
		}else{
			this.catch();
		}
	}

	this.grabSnippet = function(){

		let snip = new Array(this.selection.end.x - this.selection.start.x);

		for (var x = this.selection.start.x; x <= this.selection.end.x; x++){
			snip[x - this.selection.start.x] = [];
			
			let len = patterns[currentPattern][selectedSound][x].length;
			for (var n = len; n >= 0; n--){
				let note = patterns[currentPattern][selectedSound][x][n];
				if (note - 24 <= this.selection.start.y && note - 24 >= this.selection.end.y ){
					snip[x - this.selection.start.x].push( this.selection.start.y - (note - 24));
					patterns[currentPattern][selectedSound][x].splice(n, 1);
				}
			};
		}

		editPatternImage(currentPattern, selectedSound);

		return snip;
	}

	this.pasteSnippet = function(){
		this.selection.snippet.forEach((col, colIndex)=>{
			col.forEach(note=>{
				let actualNote = this.selection.start.y + 24 - note;
				
				let alreadyThere = false
				patterns[currentPattern][selectedSound][ this.selection.start.x + colIndex].forEach(pN=>{
					if (pN == actualNote) alreadyThere = true;
				});
				
				if (!alreadyThere && patterns[currentPattern][selectedSound][ this.selection.start.x + colIndex].length < 3) patterns[currentPattern][selectedSound][ this.selection.start.x + colIndex].push( actualNote );
			});
		});

		editPatternImage(currentPattern, selectedSound);
	}

	this.deleteSnippet = function(){
		this.resetSelection();
	}

}













// oooooo   oooooo     oooo                                  .o88o.                                      
//  `888.    `888.     .8'                                   888 `"                                      
//   `888.   .8888.   .8'    .oooo.   oooo    ooo  .ooooo.  o888oo   .ooooo.  oooo d8b ooo. .oo.  .oo.   
//    `888  .8'`888. .8'    `P  )88b   `88.  .8'  d88' `88b  888    d88' `88b `888""8P `888P"Y88bP"Y88b  
//     `888.8'  `888.8'      .oP"888    `88..8'   888ooo888  888    888   888  888      888   888   888  
//      `888'    `888'      d8(  888     `888'    888    .o  888    888   888  888      888   888   888  
//       `8'      `8'       `Y888""8o     `8'     `Y8bod8P' o888o   `Y8bod8P' d888b    o888o o888o o888o 
                                                                                                      
                                                                                                      
                                                                                                      
// oooooooooooo                                      
// `888'     `8                                      
//  888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "    888   888  888      888   888   888  
//  888         888   888  888      888   888   888  
// o888o        `Y8bod8P' d888b    o888o o888o o888o 
//                                                   




class WaveformForm{
	
	constructor(){
		this.pos;
		this.array = [];
		this.output;
		this.inFront = false;
		this.drawing = false;
		
		this.image;
	}
	
	display(){
		push();
			fill( formBackGroundColor );
			stroke( 0, 180 );
			strokeWeight( 3 );
			rect( this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			//menu bar
			fill( titleBarColor );
			stroke( 0 );
			strokeWeight( 0.5 );
			rect( this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			//title
			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text( "CUSTOM WAVEFORM", this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);
			

			//background
			fill(100);
			stroke(30);
			image(this.image, this.pos.x + 10, this.pos.y + this.pos.h / 13, this.pos.w - 20, this.pos.h - this.pos.h / 10);
		pop();
	}
	
	drawImage(){
		this.image.background(80);
		this.image.stroke(200);
		this.image.line(0, this.image.height/2, this.image.width, this.image.height/2);
		this.image.noFill();
		this.image.stroke(188, 90, 18); // drawing is green
		this.image.strokeWeight(2);
		this.image.beginShape();
			for (let i = 0; i < this.array.length; i++) {
				let y = map(this.array[i], -1, 1, 0, this.image.height);
				let x = map(i, 0, this.array.length - 1, 0, this.image.width);
				this.image.vertex(x, y);
			}
		this.image.endShape();
	}
	
	updateWave(arr, osc){
		let nArr = this.quadrupleArray(arr); //not working yet.. 

		let ac = getAudioContext();
		var ft = new DFT(arr.length, 44100);
		ft.forward(arr);
		let pwave = ac.createPeriodicWave(ft.real, ft.imag);
		osc.setPeriodicWave(pwave);
	}

	quadrupleArray(arr){
		let nArr = [];
		for (let i = 0; i < arr.length; i++){
			nArr.push(arr[i]);
			for (var a = 1; a < 4; a++){
				let l;
				if (i == arr.length -1){
					l = lerp(arr[i], 0, 0.25 * a)
				} else {
					l = lerp(arr[i], arr[i+1], 0.25 * a)
				}
				nArr.push(l);
			}
		}
		return nArr;
	}

	set(x,y,w,h, arr, out){
		this.pos = createVector(x,y);
		this.pos.w = w;
		this.pos.h = h;
		this.array = arr;
		this.output = out;
		this.image = createGraphics(this.pos.w * 0.8, this.pos.h * 0.8);
		this.drawImage();
	}
	
	mouseDraw(){
		if (mouseX > this.pos.x + 10 && mouseX < this.pos.x + this.pos.w - 10 &&
				mouseY > this.pos.y + this.pos.h / 13 && mouseY < this.pos.y + this.pos.h / 13 + this.pos.h - this.pos.h / 10){
			
			var y = map(mouseY, this.pos.y + this.pos.h / 13, this.pos.y + this.pos.h / 13 + this.pos.h - this.pos.h / 10, -1, 1);
			var x = constrain( floor(map(mouseX, this.pos.x + 10, this.pos.x + this.pos.w - 10, 0, this.array.length)), 0, this.array.length -1);
			this.array[x] = y;
		
			this.updateWave(this.array, this.output.oscillator);
			this.drawImage();

			this.drawing = true;
				
		} else if ((mouseX < this.pos.x || mouseX > this.pos.x + this.pos.w ||
				   mouseY < this.pos.y || mouseY > this.pos.y + this.pos.h) && this.drawing == false){
			this.inFront = false;
			soundForm.render = true;
		}
	}	

	release(){
		this.drawing = false;
	}
}











// oooooooooooo                       oooo   o8o        .o8   o8o                        oooooooooooo                                      
// `888'     `8                       `888   `"'       "888   `"'                        `888'     `8                                      
//  888         oooo  oooo   .ooooo.   888  oooo   .oooo888  oooo   .oooo.   ooo. .oo.    888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    `888  `888  d88' `"Y8  888  `888  d88' `888  `888  `P  )88b  `888P"Y88b   888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "     888   888  888        888   888  888   888   888   .oP"888   888   888   888    "    888   888  888      888   888   888  
//  888       o  888   888  888   .o8  888   888  888   888   888  d8(  888   888   888   888         888   888  888      888   888   888  
// o888ooooood8  `V88V"V8P' `Y8bod8P' o888o o888o `Y8bod88P" o888o `Y888""8o o888o o888o o888o        `Y8bod8P' d888b    o888o o888o o888o 







class EuclidianForm {

	constructor() {
		
		this.inFront = false;
		this.output = [];

		this.patternSet = 0;

	}

	display() {
		push();
			fill(formBackGroundColor);
			stroke(0, 180);
			strokeWeight(3);
			rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			//menu bar
			fill(titleBarColor);
			stroke(0);
			strokeWeight(0.5);
			rect(this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			//title
			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text("EUCLIDIAN RYTHM GENERATOR", this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);
			
		
			//background
			fill(formBackGroundColor + 30);
			stroke(40);
			strokeWeight(2.3)
			rect(this.pos.x + this.pos.w * 0.05, this.pos.y + this.pos.h * 0.1, this.pos.w * 0.9, this.pos.h * 0.7);
			
			//euclidian drawing 
			stroke(0);
			strokeWeight(2.4)
			noFill();
			
			let top = -HALF_PI;
			let pattern = patterns[currentPattern][selectedSound].pattern;

			//startpoint
			let startx = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(top);
			let starty = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(top);
			line(startx, starty - min(this.pos.w, this.pos.h) * 0.045, startx, starty - min(this.pos.w, this.pos.h) * 0.09)

			//actual zero after rotating
			let zerox = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.42 * cos(this.rotateKnob.value * (TWO_PI / pattern.length) + top);
			let zeroy = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.42 * sin(this.rotateKnob.value * (TWO_PI / pattern.length) + top);
			ellipse(zerox, zeroy, min(this.pos.w, this.pos.h) * 0.05);

			beginShape();
				for (var i = 0; i < pattern.length; i++) {
					let x = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(i * (TWO_PI / pattern.length) + top);
					let y = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(i * (TWO_PI / pattern.length) + top);
					vertex(x, y);
				}		
			endShape(CLOSE)
			
			stroke(0);
			beginShape();
				for (var i = 0; i < pattern.length; i++) {
					let x = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(i * (TWO_PI / pattern.length) + top);
					let y = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(i * (TWO_PI / pattern.length) + top);
					if (pattern[i] != this.patternSet){
						if (i == patterns[currentPattern][selectedSound].counter) {
							fill(188, 90, 18);
						} else {
							fill(formBackGroundColor + 30);
						}
					} else {
						fill(0);
					}
					
					ellipse(x, y, (min(width, height) * 0.015 ) + (pattern[i] != this.patternSet) * (min(width, height) * 0.02));
					if (pattern[i] != this.patternSet) vertex(x, y);
				}
			noFill();
			endShape(CLOSE);
			

			//A/B selector set
			fill(200);
			strokeWeight(1);
			rect( this.pos.x + this.pos.w/2 - this.pos.w * 0.15, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.3, this.pos.h * 0.05);
			fill(100);
			if (this.patternSet == 0){
				rect(this.pos.x + this.pos.w/2 - this.pos.w * 0.15, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.15, this.pos.h * 0.05);
			} else {
				rect(this.pos.x + this.pos.w/2, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.15, this.pos.h * 0.05);
			}
			
			if (mouseIsPressed){
				if (mouseX > this.pos.x + this.pos.w/2 - this.pos.w * 0.15 && mouseX < this.pos.x + this.pos.w/2 &&
						mouseY > this.pos.y + this.pos.h * 0.92 && mouseY < this.pos.y + this.pos.h * 0.97){
					this.patternSet = 0;
					this.setPattern();
					
				} else if (mouseX > this.pos.x + this.pos.w/2 && mouseX < this.pos.x + this.pos.w/2 + this.pos.w * 0.15 &&
									mouseY > this.pos.y + this.pos.h * 0.92 && mouseY < this.pos.y + this.pos.h * 0.97){
					this.patternSet = 1;
					this.setPattern();
				}
			}
			
			textSize(this.pos.h * 0.04);
			textAlign(CENTER);
			noStroke();
			fill(0);
			text("A", this.pos.x + this.pos.w/2 - this.pos.w * 0.075, this.pos.y + this.pos.h * 0.96);
			text("B", this.pos.x + this.pos.w/2 + this.pos.w * 0.075, this.pos.y + this.pos.h * 0.96);
			

		pop();

		this.noteKnob.display(true);
		this.hitKnob.display();
		this.stepKnob.display();
		this.rotateKnob.display();


	}

	set(x, y, w, h){
		this.pos = createVector(x,y);
		this.pos.w = w;
		this.pos.h = h;
		
		this.noteKnob = new KnobObject(this.pos.x + this.pos.w * 0.75, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "NOTE", ()=>{
			this.setPattern();
		});

		this.hitKnob = new KnobObject(this.pos.x + this.pos.w * 0.25, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "HIT", ()=>{
			this.setPattern();
		});
		this.stepKnob = new KnobObject(this.pos.x + this.pos.w / 2, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "STEP", ()=>{
			this.hitKnob.set(1, this.stepKnob.value, min(this.stepKnob.value, this.hitKnob.value), 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value,  min(this.stepKnob.value, this.rotateKnob.value), 1);
			this.setPattern();
		});
		
		
		this.rotateKnob = new KnobObject(this.pos.x + this.pos.w * 0.5, this.pos.y + this.pos.h * 0.45, this.pos.w * 0.06, "", ()=>{
				this.setPattern();
		});

		if (!patterns[currentPattern][selectedSound].isEuclidian){
			this.patternSet = 0;
			this.noteKnob.set(21, 108, 48, 1);
			this.stepKnob.set(1, 128, 8, 1);
			this.hitKnob.set(1, this.stepKnob.value, 4, 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value, 0, 1);

			this.setPattern();
		} else {
			this.patternSet = patterns[currentPattern][selectedSound].patternSet;
			this.noteKnob.set(21, 108, patterns[currentPattern][selectedSound].note, 1);
			this.stepKnob.set(1, 128, patterns[currentPattern][selectedSound].pattern.length, 1);
			this.hitKnob.set(1, this.stepKnob.value, patterns[currentPattern][selectedSound].hits, 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value, patterns[currentPattern][selectedSound].rotation, 1);

		}
	}

	setPattern(){

		patterns[currentPattern][selectedSound] = {
			pattern: generateEuclidianPattern(this.hitKnob.value, this.stepKnob.value, this.rotateKnob.value),
			isEuclidian: true,
			lastSeq: -1,
			counter: patterns[currentPattern][selectedSound].counter || 0,
			note: this.noteKnob.value,
			patternSet: this.patternSet,
			hits: this.hitKnob.value,
			rotation: this.rotateKnob.value
		};

		editPatternImage(currentPattern, selectedSound);

	}
	
	catch(){
		if (mouseX < this.pos.x || mouseX > this.pos.x + this.pos.w ||
			mouseY < this.pos.y || mouseY > this.pos.y + this.pos.h){
			
			this.inFront = false;
			
			background(40)
			sequencerForm.display();
			patternForm.display();
			return;
		}

		this.hitKnob.catch();
		this.stepKnob.catch();
		this.rotateKnob.catch();		
		this.noteKnob.catch();
	}
	
	drag(amount){
		this.hitKnob.drag(amount);
		this.stepKnob.drag(amount);
		this.rotateKnob.drag(amount);
		this.noteKnob.drag(amount);
	}
	
	release(){
		this.hitKnob.release();
		this.stepKnob.release();
		this.rotateKnob.release();		
		this.noteKnob.release();
	}
}













//  .oooooo..o                                         .o8  
// d8P'    `Y8                                        "888  
// Y88bo.       .ooooo.  oooo  oooo  ooo. .oo.    .oooo888  
//  `"Y8888o.  d88' `88b `888  `888  `888P"Y88b  d88' `888  
//      `"Y88b 888   888  888   888   888   888  888   888  
// oo     .d8P 888   888  888   888   888   888  888   888  
// 8""88888P'  `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P" 
                                                         
                                                         
                                                         
// oooooooooooo                                      
// `888'     `8                                      
//  888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "    888   888  888      888   888   888  
//  888         888   888  888      888   888   888  
// o888o        `Y8bod8P' d888b    o888o o888o o888o 
                                                  






function SoundForm(){
	this.pos;
	this.nameText = createInput();
	this.nameText.hide()
	this.nameText.input(function(){
		sounds[selectedSound].label = soundForm.nameText.value(); 
		patternForm.render = true;
		soundForm.render = true;
	});
	this.dev;
	this.formtop;
	this.threeheight;
	this.leftwidth;
	this.rightwidth;
	this.render = true;


		

	this.presets = createSelect().hide();
	
	//fill preset!
	this.presets.option("-- Preset --");
	this.presets.option("Default");
	this.presets.option("Kick Sample");
	this.presets.option("Kick");
	this.presets.option("Kick2");
	this.presets.option("Kick3");
	this.presets.option("Snare");
	this.presets.option("Snare2");
	this.presets.option("Hi-hat");
	this.presets.option("Hi-hat Open");
	this.presets.option("Clave");
	this.presets.option("Clave2");
	this.presets.option("Bass");
	this.presets.option("Bass2");
	this.presets.option("Bass3");
	this.presets.option("Bass wobble");
	this.presets.option("Bass deep");
	this.presets.option("Lead");
	this.presets.option("Organ");
	this.presets.option("Organ2");
	this.presets.option("Electric Banjo");
	this.presets.option("Electric String");
	this.presets.option("Harsh");
	this.presets.option("High Trickle");
	this.presets.option("Coil");
	this.presets.option("Strings");
	this.presets.option("Celestial");
	this.presets.option("Heavy Reverb");
	this.presets.option("Distorted Delay");
	this.presets.option("Clock");
	this.presets.option("Ponk");
	this.presets.option("Ponk2");
	//function
	this.presets.changed( function(){
		sounds[selectedSound].label = soundForm.presets.value();
		loadPreset();

		soundForm.presets.elt.blur();

	});

	this.envelopeSelect = createSelect().hide();
	this.envelopeSelect.option("Sound");
	this.envelopeSelect.option("Filter");
	this.envelopeSelect.changed(()=>{this.render = true});

	this.init = function(){}


	
	this.layOut = function(){
		this.pos = {x: width / 4, y: insideTop + 10, w: max(width / 1.8, 690), h: height - insideTop - 20 };
		this.pos.x = patternForm.patternbox.x + patternForm.patternbox.width + 10 //width - this.pos.w - 10;
		
		this.formtop = this.pos.y + this.pos.h / 10 
		this.dev = soundForm.pos.x + ((soundForm.pos.w / 3.15) *2);
		this.leftwidth = this.dev - this.pos.x;
		this.rightwidth = this.pos.x + this.pos.w - this.dev;
		this.threeheight = ( (this.pos.y + this.pos.h) - this.formtop - 15) / 3;
		
		this.nameText.position( this.pos.x + 10, this.pos.y + 15 + this.pos.h/30);
		this.nameText.size( this.pos.w / 2 - 30, this.pos.h / 30 );
		
		this.presets.position( this.pos.x + 20 + (this.pos.w / 2 - 30), this.pos.y + 15 + this.pos.h/30);
		this.presets.size( this.pos.w / 2 , this.pos.h / 30 );
		
		this.envelopeSelect.position(this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 2.25);
		this.envelopeSelect.size(this.pos.w / 11, this.pos.h / 30);
		this.envelopeSelect.selected("Sound");


		if (sounds[selectedSound] != undefined){

			this.presets.selected("-- Preset --");

			sounds[selectedSound].soundType.pos = createVector( this.pos.x + 10, this.pos.y + 10);
			sounds[selectedSound].soundType.width = this.pos.w - 20;
			sounds[selectedSound].soundType.height = this.pos.h / 30;

			
			//arpKnob
			sounds[selectedSound].arpKnob.size = knobSize;


			// //filter interface
			sounds[selectedSound].filterFreq.pos = createVector( this.dev + this.rightwidth / 4 , this.formtop + this.threeheight * 0.35);
			sounds[selectedSound].filterFreq.size = knobSize;
			sounds[selectedSound].filterRes.pos = createVector( this.dev + (this.rightwidth / 4 * 2), this.formtop + this.threeheight * 0.35);
			sounds[selectedSound].filterRes.size = knobSize;
			sounds[selectedSound].filterGain.pos = createVector( this.dev + (this.rightwidth / 4 * 3), this.formtop + this.threeheight * 0.35);
			sounds[selectedSound].filterGain.size = knobSize;
			sounds[selectedSound].filterType.pos = createVector(this.dev + (this.rightwidth * 0.5) - sounds[selectedSound].filterType.width / 2 , this.formtop + this.threeheight * 0.8);
			sounds[selectedSound].filterLink.pos = createVector( this.dev + this.rightwidth / 4 - sounds[selectedSound].filterLink.width/2 , this.formtop + this.threeheight * 0.6);

			//LFO1 interface
			sounds[selectedSound].LFO1Freq.pos = createVector( this.dev + this.rightwidth / 4 , this.formtop + 5 + this.threeheight * 1.3);
			sounds[selectedSound].LFO1Freq.size = knobSize;
			sounds[selectedSound].LFO1Amount.pos = createVector(this.dev + (this.rightwidth / 4 * 3), this.formtop + 5 +  this.threeheight * 1.3);
			sounds[selectedSound].LFO1Amount.size = knobSize;
			sounds[selectedSound].LFO1Wave.width = this.rightwidth - 40;
			sounds[selectedSound].LFO1Wave.height = this.threeheight / 12;
			sounds[selectedSound].LFO1Wave.pos = createVector(this.dev + (this.rightwidth * 0.5) - sounds[selectedSound].LFO1Wave.width / 2 , this.formtop + this.threeheight * 1.54);

			sounds[selectedSound].LFO1Binder.width = this.rightwidth * 0.8;
			sounds[selectedSound].LFO1Binder.height = this.threeheight * 0.3;
			sounds[selectedSound].LFO1Binder.pos = createVector(this.dev + (this.rightwidth * 0.5) - sounds[selectedSound].LFO1Binder.width / 2 , this.formtop + this.threeheight * 1.68);
			sounds[selectedSound].LFO1Link.pos = createVector( this.dev + this.rightwidth / 2 - sounds[selectedSound].LFO1Link.width/2 , this.formtop + 5 + this.threeheight * 1.3);

			//LFO2 interface
			sounds[selectedSound].LFO2Freq.pos = createVector( this.dev + this.rightwidth / 4 , this.formtop + 5 + this.threeheight * 2.3);
			sounds[selectedSound].LFO2Freq.size = knobSize;
			sounds[selectedSound].LFO2Amount.pos = createVector(this.dev + (this.rightwidth / 4 * 3), this.formtop + 5 +  this.threeheight * 2.3);
			sounds[selectedSound].LFO2Amount.size = knobSize;
			sounds[selectedSound].LFO2Wave.width = this.rightwidth - 40;
			sounds[selectedSound].LFO2Wave.height = this.threeheight / 12;
			sounds[selectedSound].LFO2Wave.pos = createVector(this.dev + (this.rightwidth * 0.5) - sounds[selectedSound].LFO2Wave.width / 2 , this.formtop + this.threeheight * 2.54);
			
			sounds[selectedSound].LFO2Binder.width = this.rightwidth * 0.8;
			sounds[selectedSound].LFO2Binder.height = this.threeheight * 0.3;
			sounds[selectedSound].LFO2Binder.pos = createVector(this.dev + (this.rightwidth * 0.5) - sounds[selectedSound].LFO2Binder.width / 2 , this.formtop + this.threeheight * 2.7);
			sounds[selectedSound].LFO2Link.pos = createVector( this.dev + this.rightwidth / 2 - sounds[selectedSound].LFO2Link.width/2 , this.formtop + 5 + this.threeheight * 2.3);

			// //sound select / ADSR interface
			sounds[selectedSound].attackTime.pos = createVector(this.pos.x + this.leftwidth * 0.25, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].attackTime.size = knobSize;
			
			sounds[selectedSound].decayTime.pos = createVector(this.pos.x + this.leftwidth * 0.35, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].decayTime.size = knobSize;

			sounds[selectedSound].susPercent.pos = createVector(this.pos.x + this.leftwidth * 0.45, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].susPercent.size = knobSize;

			sounds[selectedSound].releaseTime.pos = createVector(this.pos.x + this.leftwidth  * 0.55, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].releaseTime.size = knobSize;

			sounds[selectedSound].attackLevel.pos = createVector(this.pos.x + this.leftwidth * 0.7, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].attackLevel.size = knobSize;

			sounds[selectedSound].releaseLevel.pos = createVector(this.pos.x + this.leftwidth * 0.8, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].releaseLevel.size = knobSize;
			
			sounds[selectedSound].ADSRMultiplier.pos = createVector(this.pos.x + this.leftwidth - knobSize * 1.5 , this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].ADSRMultiplier.size = knobSize;

			sounds[selectedSound].ADSRExpo.pos = createVector(this.pos.x + this.leftwidth - knobSize * 1.6 - (knobSize/2) , this.formtop + this.threeheight * 2.5);
			sounds[selectedSound].ADSRExpo.width = knobSize * 1.2;
			sounds[selectedSound].ADSRExpo.height = knobSize * 1.2;
			
			sounds[selectedSound].ADSRChance.pos = createVector(this.pos.x + this.leftwidth - knobSize * 1.5 , this.formtop + this.threeheight * 2.85);
			sounds[selectedSound].ADSRChance.size = knobSize;

			//adsr for filter!

			sounds[selectedSound].filterattackTime.pos = createVector(this.pos.x + this.leftwidth * 0.25, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterattackTime.size = knobSize;
			
			sounds[selectedSound].filterdecayTime.pos = createVector(this.pos.x + this.leftwidth * 0.35, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterdecayTime.size = knobSize;

			sounds[selectedSound].filtersusPercent.pos = createVector(this.pos.x + this.leftwidth * 0.45, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filtersusPercent.size = knobSize;

			sounds[selectedSound].filterreleaseTime.pos = createVector(this.pos.x + this.leftwidth  * 0.55, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterreleaseTime.size = knobSize;

			sounds[selectedSound].filterattackLevel.pos = createVector(this.pos.x + this.leftwidth * 0.7, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterattackLevel.size = knobSize;

			sounds[selectedSound].filterreleaseLevel.pos = createVector(this.pos.x + this.leftwidth * 0.8, this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterreleaseLevel.size = knobSize;
			
			sounds[selectedSound].filterADSRMultiplier.pos = createVector(this.pos.x + this.leftwidth - knobSize * 1.5 , this.formtop + this.threeheight * 2.2);
			sounds[selectedSound].filterADSRMultiplier.size = knobSize;

			sounds[selectedSound].filterADSRExpo.pos = createVector(this.pos.x + this.leftwidth - knobSize * 1.6 - (knobSize/2) , this.formtop + this.threeheight * 2.5);
			sounds[selectedSound].filterADSRExpo.width = knobSize * 1.2;
			sounds[selectedSound].filterADSRExpo.height = knobSize * 1.2;




			 switch(sounds[selectedSound].soundType.value){
			 	case 0:
			// 		//OSC Interface
					sounds[selectedSound].osc1Detune.pos = createVector(this.pos.x + this.leftwidth * 0.26, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc1Detune.size = knobSize;
					sounds[selectedSound].osc1Wave.width = (this.leftwidth - 20) / 2.6;
					sounds[selectedSound].osc1Wave.height = this.threeheight / 12;
					sounds[selectedSound].osc1Wave.pos = createVector(this.pos.x + this.leftwidth * 0.22 - sounds[selectedSound].osc1Wave.width / 2 , this.formtop + this.threeheight * 0.43);

					sounds[selectedSound].osc2Detune.pos = createVector(this.pos.x + this.leftwidth * 0.75, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc2Detune.size = knobSize;
					sounds[selectedSound].osc2Octave.pos = createVector(this.pos.x + this.leftwidth * 0.83, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc2Octave.size = knobSize;
					sounds[selectedSound].osc2Wave.width = (this.leftwidth - 20) / 2.6;
					sounds[selectedSound].osc2Wave.height = this.threeheight / 12;
					sounds[selectedSound].osc2Wave.pos = createVector(this.pos.x + this.leftwidth * 0.78 - sounds[selectedSound].osc1Wave.width / 2 , this.formtop + this.threeheight * 0.43);

			 		sounds[selectedSound].osc3Amount.pos = createVector( this.pos.x + this.leftwidth * 0.26, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3Amount.size = knobSize;
			 		sounds[selectedSound].osc3Detune.pos = createVector( this.pos.x + this.leftwidth * 0.34, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3Detune.size = knobSize;
			 		sounds[selectedSound].osc3Octave.pos = createVector( this.pos.x + this.leftwidth * 0.42, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3Octave.size = knobSize;
					sounds[selectedSound].osc3Wave.width = (this.leftwidth - 20) / 2.6;
					sounds[selectedSound].osc3Wave.height = this.threeheight / 12;
			 		sounds[selectedSound].osc3Wave.pos = createVector( this.pos.x + this.leftwidth * 0.22 - sounds[selectedSound].osc1Wave.width / 2 , this.formtop + this.threeheight * 0.86 );

			 		sounds[selectedSound].oscMix.pos = createVector(this.pos.x + this.leftwidth * 0.5, this.formtop + this.threeheight * 0.15);
			 		sounds[selectedSound].oscMix.size = knobSize;

			 		sounds[selectedSound].RingMod.pos = createVector(this.pos.x + this.leftwidth * 0.5 - knobSize, sounds[selectedSound].oscMix.pos.y + knobSize*1.4);
					sounds[selectedSound].RingMod.width = knobSize * 2;
					sounds[selectedSound].RingMod.height = knobSize;

			 		sounds[selectedSound].oscRamp.pos = createVector(this.pos.x + this.leftwidth * 0.72, this.formtop + this.threeheight * 0.71); 
			 		sounds[selectedSound].oscRamp.size = knobSize;

			 		sounds[selectedSound].glideSelector.pos = createVector(this.pos.x + this.leftwidth * 0.72 - sounds[selectedSound].glideSelector.width - knobSize * 0.8, this.formtop + this.threeheight * 0.7 - 15); 

			 		sounds[selectedSound].rollingChords.pos = createVector(this.pos.x + this.leftwidth * 0.83, this.formtop + this.threeheight * 0.71); 
			 		sounds[selectedSound].rollingChords.size = knobSize;


			// 		//	Effect interface
			 		sounds[selectedSound].delayTime.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.2);
			 		sounds[selectedSound].delayTime.size = knobSize;
			 		sounds[selectedSound].delayFeedback.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.55);
			 		sounds[selectedSound].delayFeedback.size = knobSize;
			 		sounds[selectedSound].delayFilterFreq.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.85);
			 		sounds[selectedSound].delayFilterFreq.size = knobSize;

					sounds[selectedSound].distortionAmount.pos = createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.2);
					sounds[selectedSound].distortionAmount.size = knobSize;
					sounds[selectedSound].distortionSampling.pos	= createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.55);
					sounds[selectedSound].distortionSampling.size = knobSize;

					sounds[selectedSound].arpSelector.height = this.threeheight * 0.6;
					sounds[selectedSound].arpSelector.width = this.leftwidth * 0.45;
			 		sounds[selectedSound].arpSelector.pos = createVector(this.pos.x + this.leftwidth - 10 - sounds[selectedSound].arpSelector.width, this.formtop + this.threeheight * 2 - sounds[selectedSound].arpSelector.height);

			 		sounds[selectedSound].arpButton.width = sounds[selectedSound].arpSelector.width;
			 		sounds[selectedSound].arpButton.height = this.threeheight * 0.25
			 		sounds[selectedSound].arpButton.pos = createVector(sounds[selectedSound].arpSelector.pos.x, this.formtop + this.threeheight * 1.1 );
			 		sounds[selectedSound].arpKnob.pos = createVector(sounds[selectedSound].arpSelector.pos.x + knobSize, this.formtop + this.threeheight * 1.2 );

			
		 			break;
				case 1:
					//noise
					sounds[selectedSound].noiseSelector.width = this.leftwidth - 40;
					sounds[selectedSound].noiseSelector.height = this.threeheight * 0.5
			 		sounds[selectedSound].noiseSelector.pos.set( this.pos.x + 20, this.formtop + this.threeheight * 0.3 );

					sounds[selectedSound].delayTime.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.2);
			 		sounds[selectedSound].delayTime.size = knobSize;
			 		sounds[selectedSound].delayFeedback.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.55);
			 		sounds[selectedSound].delayFeedback.size = knobSize;
			 		sounds[selectedSound].delayFilterFreq.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.85);
			 		sounds[selectedSound].delayFilterFreq.size = knobSize;

					sounds[selectedSound].distortionAmount.pos = createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.2);
					sounds[selectedSound].distortionAmount.size = knobSize;
					sounds[selectedSound].distortionSampling.pos	= createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.55);
					sounds[selectedSound].distortionSampling.size = knobSize;

					break;
			 	case 2:
			// 		//sample
					sounds[selectedSound].sampleStart.pos = createVector(this.pos.x + this.leftwidth / 8, this.formtop + this.threeheight * 0.8);
					sounds[selectedSound].sampleStart.size = knobSize;
					sounds[selectedSound].sampleStop.pos  = createVector(this.pos.x + this.leftwidth / 8 * 2, this.formtop + this.threeheight * 0.8);
					sounds[selectedSound].sampleStop.size = knobSize;
					sounds[selectedSound].sampleTune.pos  = createVector(this.pos.x + this.leftwidth / 8 * 3, this.formtop + this.threeheight * 0.8);
					sounds[selectedSound].sampleTune.size = knobSize;

					sounds[selectedSound].sampleLoop.height = this.threeheight * 0.2;
			 		sounds[selectedSound].sampleLoop.pos  = createVector(this.pos.x + this.leftwidth / 8 * 4.8 - sounds[selectedSound].sampleLoop.width / 2 , this.formtop + this.threeheight * 0.8 - sounds[selectedSound].sampleLoop.height / 2); 
					sounds[selectedSound].sampleReverse.height = this.threeheight * 0.2;
					sounds[selectedSound].sampleReverse.width = this.leftwidth * 0.15
			 		sounds[selectedSound].sampleReverse.pos  = createVector(this.pos.x + this.leftwidth / 8 * 6 - sounds[selectedSound].sampleReverse.width / 2 , this.formtop + this.threeheight * 0.8 - sounds[selectedSound].sampleReverse.height / 2); 
			 		sounds[selectedSound].samplePlay.height = this.threeheight * 0.2;
			 		sounds[selectedSound].samplePlay.pos  = createVector(this.pos.x + this.leftwidth / 8 * 7.2 - sounds[selectedSound].samplePlay.width / 2 , this.formtop + this.threeheight * 0.8 - sounds[selectedSound].samplePlay.height / 2); 

					sounds[selectedSound].delayTime.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.2);
			 		sounds[selectedSound].delayTime.size = knobSize;
			 		sounds[selectedSound].delayFeedback.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.55);
			 		sounds[selectedSound].delayFeedback.size = knobSize;
			 		sounds[selectedSound].delayFilterFreq.pos = createVector(this.pos.x + this.leftwidth * 0.2, this.formtop + this.threeheight * 1.85);
			 		sounds[selectedSound].delayFilterFreq.size = knobSize;

					sounds[selectedSound].distortionAmount.pos = createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.2);
					sounds[selectedSound].distortionAmount.size = knobSize;
					sounds[selectedSound].distortionSampling.pos	= createVector(this.pos.x + this.leftwidth * 0.4, this.formtop + this.threeheight * 1.55);
					sounds[selectedSound].distortionSampling.size = knobSize;

					sounds[selectedSound].arpSelector.height = this.threeheight * 0.6;
					sounds[selectedSound].arpSelector.width = this.leftwidth * 0.45;
			 		sounds[selectedSound].arpSelector.pos = createVector(this.pos.x + this.leftwidth - 10 - sounds[selectedSound].arpSelector.width, this.formtop + this.threeheight * 2 - sounds[selectedSound].arpSelector.height);

			 		sounds[selectedSound].arpButton.width = sounds[selectedSound].arpSelector.width;
			 		sounds[selectedSound].arpButton.height = this.threeheight * 0.25
			 		sounds[selectedSound].arpButton.pos = createVector(sounds[selectedSound].arpSelector.pos.x, this.formtop + this.threeheight * 1.1 );
			 		sounds[selectedSound].arpKnob.pos = createVector(sounds[selectedSound].arpSelector.pos.x + knobSize, this.formtop + this.threeheight * 1.2 );

					break;
			}
		}


	}







	this.display = function(){
		push();
			//form
			fill( formBackGroundColor );
			stroke( 0, 180 );
			strokeWeight( 3 );
			rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);
			strokeWeight( 1 );
			stroke(80)

			//deviding rectangles
			fill( formBackGroundColor + 20);
			rect(this.pos.x + 5, this.formtop, this.dev - this.pos.x - 10, this.threeheight);
			rect(this.pos.x + 5, this.formtop + this.threeheight + 5, this.dev - this.pos.x - 10, this.threeheight);
			rect(this.pos.x + 5, this.formtop + (this.threeheight * 2) + 10, this.dev - this.pos.x - 10, this.threeheight);
			
			rect(this.dev, this.formtop, this.pos.x + this.pos.w - this.dev - 5, this.threeheight);
			rect(this.dev, this.formtop + this.threeheight + 5,this.pos.x + this.pos.w - this.dev - 5, this.threeheight);
			rect(this.dev, this.formtop + (this.threeheight * 2) + 10, this.pos.x + this.pos.w - this.dev - 5, this.threeheight);

			stroke(188, 90, 18)
			fill(188, 90, 18, 100);

			textAlign(LEFT);
			textStyle(BOLD);
			textSize(height * 0.028);
			
			if (sounds[selectedSound].soundType.value == 0){
				text("OSC 1",this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 0.2);
				text("OSC 2",this.pos.x + this.pos.w * 0.36, this.formtop + this.threeheight * 0.2);
				text("OSC 3",this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 0.68);
			} else if (sounds[selectedSound].soundType.value == 1){
				text("NOISE",this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 0.2);
			}
			
			

			text("FILTER",this.pos.x + this.pos.w * 0.65, this.formtop + this.threeheight * 0.2);
			text("LFO 1",this.pos.x + this.pos.w * 0.65, this.formtop + this.threeheight * 1.2);
			text("LFO 2",this.pos.x + this.pos.w * 0.65, this.formtop + this.threeheight * 2.2);
			text("FX",this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 1.2);
			text("ADSR",this.pos.x + this.pos.w * 0.04, this.formtop + this.threeheight * 2.2);

			
		pop();

		pop();
		this.nameText.value(sounds[selectedSound].label); 
		this.nameText.show();

		this.presets.show();
		this.envelopeSelect.show()

		sounds[selectedSound].soundType.display();

		sounds[selectedSound].filterFreq.display();
		if (sounds[selectedSound].filterType.value != 4 && sounds[selectedSound].filterType.value != 5) {
			sounds[selectedSound].filterRes.display();
		} else {
			fill(200);
			ellipse(sounds[selectedSound].filterRes.pos.x, sounds[selectedSound].filterRes.pos.y, knobSize);
		}
		if (sounds[selectedSound].filterType.value >= 4 && sounds[selectedSound].filterType.value <= 6) {
			sounds[selectedSound].filterGain.display();
		} else {
			fill(200);
			ellipse(sounds[selectedSound].filterGain.pos.x, sounds[selectedSound].filterGain.pos.y, knobSize);
		}

		sounds[selectedSound].filterType.display();
		if (sounds[selectedSound].soundType.value != 2) sounds[selectedSound].filterLink.display();

		sounds[selectedSound].LFO1Freq.display();
		//if ( sounds[selectedSound].LFO1Binder.value != 1 && sounds[selectedSound].LFO1Binder.value != 2) 
		sounds[selectedSound].LFO1Amount.display();
		sounds[selectedSound].LFO1Wave.display();
		sounds[selectedSound].LFO1Binder.display();
		sounds[selectedSound].LFO1Link.display();

		sounds[selectedSound].LFO2Freq.display();
		//if ( sounds[selectedSound].LFO1Binder.value != 1 && sounds[selectedSound].LFO1Binder.value != 2) 
			sounds[selectedSound].LFO2Amount.display();
		sounds[selectedSound].LFO2Wave.display();
		sounds[selectedSound].LFO2Binder.display();
		sounds[selectedSound].LFO2Link.display();

		if (this.envelopeSelect.selected() == "Sound"){
			sounds[selectedSound].attackTime.display();
			sounds[selectedSound].decayTime.display();
			sounds[selectedSound].susPercent.display();
			sounds[selectedSound].releaseTime.display();
			
			sounds[selectedSound].releaseLevel.display();
			sounds[selectedSound].attackLevel.display();

			sounds[selectedSound].ADSRMultiplier.display();
			sounds[selectedSound].ADSRExpo.display();
			
			sounds[selectedSound].ADSRChance.display();

		} else {
			sounds[selectedSound].filterattackTime.display();
			sounds[selectedSound].filterdecayTime.display();
			sounds[selectedSound].filtersusPercent.display();
			sounds[selectedSound].filterreleaseTime.display();

			sounds[selectedSound].filterreleaseLevel.display();
			sounds[selectedSound].filterattackLevel.display();

			sounds[selectedSound].filterADSRMultiplier.display();
			sounds[selectedSound].filterADSRExpo.display();
		}
		
		//adsr panel!

		var tx = this.pos.x + 15;
		var ty = this.formtop + this.threeheight * 3;
		var maxx = this.leftwidth - 120
		var maxy = this.threeheight * -0.6;
		push();
			fill(100);
			rect( tx, ty, maxx, maxy);

			strokeWeight(2);
			stroke(188, 90, 18);
			fill(188, 90, 18, 100);
			strokeWeight(1);

			if (this.envelopeSelect.selected() == "Sound"){
				var attlev = map(sounds[selectedSound].attackLevel.value, 1, 0, 0, maxy * 0.5);
				var rellev = map(sounds[selectedSound].releaseLevel.value, 1, 0, 0, maxy);

				var att = tx + 2 + map(sounds[selectedSound].attackTime.value, 0, 1, 0, maxx / 3 );
				var dec = map(sounds[selectedSound].decayTime.value, 0, 1, att, att + maxx / 3 );
				var rel = map(sounds[selectedSound].releaseTime.value, 0, 1, dec, dec + maxx / 3 );
				var sus = ty + map(sounds[selectedSound].susPercent.value, 0, 1, 0, maxy - attlev);
			} else {
				var attlev = map(sounds[selectedSound].filterattackLevel.value, 1, 0, 0, maxy * 0.5);
				var rellev = map(sounds[selectedSound].filterreleaseLevel.value, 1, 0, 0, maxy);

				var att = tx + 2 + map(sounds[selectedSound].filterattackTime.value, 0, 1, 0, maxx / 3 );
				var dec = map(sounds[selectedSound].filterdecayTime.value, 0, 1, att, att + maxx / 3 );
				var rel = map(sounds[selectedSound].filterreleaseTime.value, 0, 1, dec, dec + maxx / 3 );
				var sus = ty + map(sounds[selectedSound].filtersusPercent.value, 0, 1, 0, maxy - attlev);
			}
			
			beginShape();
				vertex( tx + 2, ty );
				vertex( att, ty + maxy +3 - attlev );
				vertex( dec, sus);
				vertex( rel, ty + maxy - rellev);
				vertex( rel, ty);
			endShape(CLOSE);

		pop();




		switch(sounds[selectedSound].soundType.value){
			case 0:
				
	    		sounds[selectedSound].osc1Detune.display();
	    		sounds[selectedSound].osc1Wave.display();

				sounds[selectedSound].osc2Detune.display();
				sounds[selectedSound].osc2Octave.display();
				sounds[selectedSound].osc2Wave.display();

				sounds[selectedSound].osc3Amount.display();
				sounds[selectedSound].osc3Detune.display();
				sounds[selectedSound].osc3Octave.display();
				sounds[selectedSound].osc3Wave.display();

				sounds[selectedSound].oscMix.display();
				sounds[selectedSound].RingMod.display();
				sounds[selectedSound].oscRamp.display();
				sounds[selectedSound].glideSelector.display();
				sounds[selectedSound].rollingChords.display();
			
				sounds[selectedSound].delayTime.display();
				sounds[selectedSound].delayFeedback.display();
				sounds[selectedSound].delayFilterFreq.display();

				sounds[selectedSound].distortionAmount.display();
				sounds[selectedSound].distortionSampling.display();

				
				sounds[selectedSound].arpButton.display();
				sounds[selectedSound].arpSelector.display();
				sounds[selectedSound].arpKnob.display();

				push();
					fill(0);
					textSize(25);
					if (playing) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arpCounter -1;
					if (sounds[selectedSound].arpKnob.value == -1) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arp.length -1;
					if (sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] != undefined){
						text( midiToString( sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] ), sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
					}else{
						text( "--", sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
					}
				pop();

				
				break;
			case 1:
				
					sounds[selectedSound].delayTime.display();
					sounds[selectedSound].delayFeedback.display();
					sounds[selectedSound].delayFilterFreq.display();

					sounds[selectedSound].distortionAmount.display();
					sounds[selectedSound].distortionSampling.display();

					sounds[selectedSound].noiseSelector.display();

				break;
			case 2:
				push();
										
					//draw sample waveform
					var tx = this.pos.x + 10;
					var ty = this.formtop + 5;
					var maxx = this.leftwidth - 20;
					var maxy = this.threeheight * 0.6;
					
					noFill();
				  	rect(tx, ty, maxx, maxy);

				  	if (sounds[selectedSound].sample.duration() == 0){
				  		noStroke()
				  		fill(188, 90, 18, 150)
				  		textSize(maxy * 0.28);
				  		text("Drag and drop sample\nor Click here.", tx + maxx / 2, ty + maxy / 3);
				  		
				  	}else{
					  	beginShape();
					  	stroke(188, 90, 18);
					 	for (var i = 0; i < sounds[selectedSound].sampleWaveSet.length; i++){
					 		var x = map(i, 0, sounds[selectedSound].sampleWaveSet.length, tx, tx + maxx);
					 		
					 		var y = map( sounds[selectedSound].sampleWaveSet[i] , -1, 1, ty + maxy, ty );
					 		var y2 = map( sounds[selectedSound].sampleWaveSet[i] , -1, 1, ty, ty + maxy);
					    	vertex(x,y);
					    	vertex(x,y2);
					  	}
					  	endShape();
					}

				  	
				  	strokeWeight(2);
				  	
				  	//start
				  	stroke(40,220,40);
			  		time = map(sounds[selectedSound].sampleStart.value, 0, 1, tx, tx + maxx)
			  	  	line(time, ty, time, ty + maxy);

			  	  	//end
			   		stroke(40,40,220);
			  		time = map(sounds[selectedSound].sampleStop.value, 0, 1, tx, tx + maxx)
			  	  	line(time, ty, time, ty + maxy);
				  	
			  	  	
				pop();

				sounds[selectedSound].sampleStart.display();
				sounds[selectedSound].sampleStop.display();
				sounds[selectedSound].sampleTune.display();

				sounds[selectedSound].sampleLoop.display();
				sounds[selectedSound].sampleReverse.display();
				sounds[selectedSound].samplePlay.display();

				sounds[selectedSound].delayTime.display();
				sounds[selectedSound].delayFeedback.display();
				sounds[selectedSound].delayFilterFreq.display();

				sounds[selectedSound].distortionAmount.display();
				sounds[selectedSound].distortionSampling.display();

				sounds[selectedSound].arpButton.display();
				sounds[selectedSound].arpSelector.display();
				sounds[selectedSound].arpKnob.display();

				push();
					fill(0);
					textSize(25);
					if (playing) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arpCounter -1;
					if (sounds[selectedSound].arpKnob.value == -1) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arp.length -1;
					if (sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] != undefined){
						text( midiToString( sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] ), sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
					}else{
						text( "--", sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
					}
				pop();

				break;
		}

		this.render = false;

	}

	this.displayArpCounter = function(){
		sounds[selectedSound].arpButton.display();
		sounds[selectedSound].arpSelector.display();
		sounds[selectedSound].arpKnob.display();

		push();
			fill(0);
			textSize(25);
			if (playing) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arpCounter -1;
			if (sounds[selectedSound].arpKnob.value == -1) sounds[selectedSound].arpKnob.value = sounds[selectedSound].arp.length -1;
			if (sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] != undefined){
				text( midiToString( sounds[selectedSound].arp[sounds[selectedSound].arpKnob.value] ), sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
			}else{
				text( "--", sounds[selectedSound].arpButton.pos.x + sounds[selectedSound].arpButton.width * 0.7, sounds[selectedSound].arpButton.pos.y + sounds[selectedSound].arpButton.height * 0.7 );
			}
		pop();
	}

	this.catch = function(){
		
		if ( (mouseX > this.pos.x && mouseX < this.pos.x + this.pos.w &&
			mouseY > this.pos.y && mouseY < this.pos.y + this.pos.h) ){

			var tx = this.pos.x + 10;
			var ty = this.formtop + 5;
			var maxx = this.leftwidth - 20;
			var maxy = this.threeheight * 0.6;
			if (sounds[selectedSound].soundType.value == 2 && 
				mouseX > tx && mouseX < tx + maxx &&
	  			mouseY > ty && mouseY < ty + maxy){
	  			
	  			menuBar.fileInput.elt.click();
	  			return;
	  		}

			sounds[selectedSound].knobs.forEach((knob)=>{
				if ((this.envelopeSelect.selected() == "Sound" && !knob.forFilter) || (this.envelopeSelect.selected() == "Filter" && !knob.forSound)){
					knob.catch();
				}
			});

			sounds[selectedSound].soundType.catch();

			sounds[selectedSound].RingMod.catch();

			sounds[selectedSound].glideSelector.catch();

			if (this.envelopeSelect.selected() == "Sound") sounds[selectedSound].ADSRExpo.catch();
			if (this.envelopeSelect.selected() == "Filter") sounds[selectedSound].filterADSRExpo.catch();
			
			if (sounds[selectedSound].soundType.value == 0) sounds[selectedSound].osc1Wave.catch();
			if (sounds[selectedSound].soundType.value == 0) sounds[selectedSound].osc2Wave.catch();
			if (sounds[selectedSound].soundType.value == 0) sounds[selectedSound].osc3Wave.catch();

			
			sounds[selectedSound].noiseSelector.catch();
			
			sounds[selectedSound].LFO1Wave.catch();
			sounds[selectedSound].LFO1Binder.catch();
			sounds[selectedSound].LFO1Link.catch();

			sounds[selectedSound].LFO2Wave.catch();
			sounds[selectedSound].LFO2Binder.catch();
			sounds[selectedSound].LFO2Link.catch();

			sounds[selectedSound].filterType.catch();
			sounds[selectedSound].filterLink.catch();

			sounds[selectedSound].arpButton.catch();
			sounds[selectedSound].arpSelector.catch();

			sounds[selectedSound].sampleLoop.catch();
			sounds[selectedSound].sampleReverse.catch();
			sounds[selectedSound].samplePlay.catch();

			this.render = true;
			
		}else if (mouseY > insideTop){
			//hide form
			background(40)
			this.nameText.hide();
			this.presets.hide();
			this.envelopeSelect.hide();

			sequencerForm.display();
			patternForm.display();

			soundForm.inFront = false;
			for (var i = 0; i < patternForm.soundButtons.length -1; i++){
				patternForm.soundButtons[i].active = false;
			}

			mousePressed();


		}
	}

	this.release = function(){

		sounds[selectedSound].knobs.forEach((knob)=>{
			knob.release();
		});	
	}
		
		
	


	this.drag = function(amount){
		
		sounds[selectedSound].knobs.forEach((knob)=>{
			if ((this.envelopeSelect.selected() == "Sound" && !knob.forFilter) || (this.envelopeSelect.selected() == "Filter" && !knob.forSound)){
				knob.drag(amount, selectedSound);
			}
		});

		this.render = true;
	}
	

}






















//  .oooooo..o                                         .o8  
// d8P'    `Y8                                        "888  
// Y88bo.       .ooooo.  oooo  oooo  ooo. .oo.    .oooo888  
//  `"Y8888o.  d88' `88b `888  `888  `888P"Y88b  d88' `888  
//      `"Y88b 888   888  888   888   888   888  888   888  
// oo     .d8P 888   888  888   888   888   888  888   888  
// 8""88888P'  `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P"                                                                                     `Y888P                              



class SoundObject{

	constructor(index, l){
		this.index = index;
		this.label = l;
		this.started = false;
		this.polyNotes = [];

		this.knobs = [];
		this.buttons = [];

	    this.arp = [];
		this.arpCounter = 0;
		this.arp = [];
		this.arpBaseOffset;
		this.arpPrevBaseNote;
		this.arpSelector = new ArpSelector();
		this.arpButton = new FunctionButtonObject(0,0,knobSize * 1.6, "   ");

		this.loadKnobs();
		this.loadButtons();
				
		this.envOsc1 = new p5.Env();
		this.envOsc1.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc1.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc1.output.gain.value = 0.5;

		this.envOsc2 = new p5.Env();
		this.envOsc2.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc2.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc1.output.gain.value = 0.5;

		this.envOsc3 = new p5.Env();
		this.envOsc3.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc3.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc3.mult(this.osc3Amount.value);

		this.envNoise = new p5.Env();
		this.envNoise.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envNoise.setRange(this.attackLevel.value, this.releaseLevel.value);

		this.envSample = new p5.Env();
		this.envSample.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envSample.setRange(this.attackLevel.value, this.releaseLevel.value);
				
		this.envFilter = new p5.Env();
		this.envFilter.setADSR(this.filterattackTime.value * this.filterADSRMultiplier.value, this.filterdecayTime.value * this.filterADSRMultiplier.value, this.filtersusPercent.value * this.filterADSRMultiplier.value, this.filterreleaseTime.value * this.filterADSRMultiplier.value);
		this.envFilter.setRange(this.filterattackLevel.value, this.filterreleaseLevel.value);


		this.osc1 = new p5.Oscillator('sine');
		this.osc1.disconnect();
		this.osc1.amp(0);
		
		this.osc2 = new p5.Oscillator('sine');
		this.osc2.disconnect();
		this.osc2.amp(0);
		
		this.osc3 = new p5.Oscillator('sine');
		this.osc3.disconnect();
		this.osc3.amp(0);

		this.ringGain = getAudioContext().createGain();

		this.LFO1 = new p5.Oscillator('sine');
		this.LFO1.freq(0.01);
		this.LFO1.disconnect();
		
		this.LFO2 = new p5.Oscillator('sine');
		this.LFO2.freq(0.01);
		this.LFO2.disconnect();

		this.hiddenLFO = new p5.Oscillator('sine');
		this.hiddenLFO.freq(0.01);
		this.hiddenLFO.disconnect();		

		this.noise = new p5.Noise();
		this.noise.disconnect();
		this.noise.stop();
		this.noise.amp(this.envNoise);

		this.sample = new p5.SoundFile();
		this.sampleFFT = new p5.FFT();
		this.sampleFFT.setInput(this.sample);
		this.sampleWaveSet = [];
		
		this.delay = new p5.Delay();
		this.distortion = new p5.Distortion(0.0,'none');
		this.distortion.drywet(0);

		this.scriptProc1 = getAudioContext().createScriptProcessor(4096, 1, 1);
		
		let procFunc = function(audioProcessingEvent){
			var inputBuffer = audioProcessingEvent.inputBuffer;
			var outputBuffer = audioProcessingEvent.outputBuffer;
		
			for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
				var inputData = inputBuffer.getChannelData(channel);
				var outputData = outputBuffer.getChannelData(channel);

				for (var sample = 0; sample < inputBuffer.length; sample++) {
					outputData[sample] = (inputData[sample] + 1) / 2;
				}
			}
		}

		this.scriptProc1.onaudioprocess = procFunc;
		

		this.procGain1 = new p5.Gain();
		this.procGain1.amp(0);
		this.procGain2 = new p5.Gain();
		this.procGain2.amp(0);

		this.filter = new p5.Filter();  
		this.filter.freq(this.filterFreq.value); 
		this.filter.res(this.filterRes.value);
		this.filter.output.gain.value = 0.3;
		this.filter.drywet(0);

		this.filter.chain(this.distortion, this.delay);

		this.filter._drywet.fade.setInput(this.envFilter.control);
		
		this.osc1.connect(this.filter);
		this.osc2.connect(this.filter);
		this.osc3.connect(this.filter);
		this.noise.connect(this.filter);
		this.sample.connect(this.filter);
		

		this.osc1wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.osc2wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.osc3wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.LFO1wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.LFO2wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		
		this.osc1Wave = new WaveSelector(this.osc1wavearray, this.osc1);
		this.osc2Wave = new WaveSelector(this.osc2wavearray, this.osc2);
		this.osc3Wave = new WaveSelector(this.osc3wavearray, this.osc3);
		this.LFO1Wave = new WaveSelector(this.LFO1wavearray, this.LFO1);
		this.LFO2Wave = new WaveSelector(this.LFO2wavearray, this.LFO2);

		this.LFO1Binder.connect(this.LFO1, this.LFO1Wave, this.LFO1wavearray, this.LFO1Amount, "LFO2", this.LFO2, this.LFO2Binder);
		this.LFO2Binder.connect(this.LFO2, this.LFO2Wave, this.LFO2wavearray, this.LFO2Amount, "LFO1", this.LFO1, this.LFO1Binder);
	}











	start(){

		if (this.soundType.value == 0 && !this.osc1.started){
			this.noise.stop();		
			this.osc1.start();
			this.osc2.start();
			this.osc3.start();
			
				
		}else if (this.soundType.value == 1 && !this.noise.started){
			this.osc1.stop();
			this.osc2.stop();
			this.osc3.stop();
			this.noise.start();
	
		}else if (this.soundType.value == 2 && (this.osc1.started || this.noise.started) ){
			
			this.osc1.stop();
			this.osc2.stop();
			this.osc3.stop();
			this.noise.stop();
		}

		this.started = true;
	}

	











	play(){

		let rnd;
		if (this.ADSRChance.value != 1){
			rnd = Math.random();
		}

		let minilist = [ patterns[currentPattern] ];
		
		if (menuBar.playMode.value == 1){
			minilist = sequencerForm.sequence[sequencerForm.currentSeq];
		}
		

		//looping through all patterns in a column in the sequencer
		for (var seqpat = 0; seqpat < minilist.length; seqpat++){ 
			let m = minilist[seqpat];
			if (m != undefined){
				//euclidian patterns
				if (m[this.index].isEuclidian){
					
					//check if this pattern was played last sequence-step, to reset the counter
					if (m[this.index].lastSeq != sequencerForm.currentSeq && 
						m[this.index].lastSeq != sequencerForm.currentSeq -1){
					
							m[this.index].counter = 0;
					}
					
					m[this.index].lastSeq = sequencerForm.currentSeq; 
					

					//play current hit? 
					if (m[this.index].pattern[m[this.index].counter] != m[this.index].patternSet){
						
						if (this.arpButton.active && this.arp.length != 0){

							if (rnd == undefined || rnd < this.ADSRChance.value) this.playArpNote(m[this.index].note);
		
						}else if (!this.arpButton.active){

							if (rnd == undefined || rnd < this.ADSRChance.value) this.playNote(m[this.index].note);
										
						}
					}
						
					m[this.index].counter++
					if (m[this.index].counter > m[this.index].pattern.length - 1) m[this.index].counter = 0;

				//normal patterns
				} else if (m[this.index][beatCounter].length > 0 && 
					(rnd == undefined || rnd < this.ADSRChance.value)){
					
					
					if (this.arpButton.active && this.arp.length != 0){

						this.playArpNote(m[this.index][beatCounter][0])
		
					}else if (!this.arpButton.active){

						if (m[this.index][beatCounter].length > 1){
							this.playPolyNotes(m[this.index][beatCounter], {rollChords: true});

						} else {
							this.playNote( Number(m[this.index][beatCounter]) );
						}
										
					}								
				}
			}
		}
	}







	//only used in the pianoForm
	playNote(note){


	
		if (this.soundType.value == 0){

			let osc2Note = note; //noteMap.get(note);
			if (this.osc2Octave.value < 0){
				osc2Note -= (abs(this.osc2Octave.value) * 12);
			} else if (this.osc2Octave.value > 0){
				osc2Note += (this.osc2Octave.value * 12);
			}

			let osc3Note = note; //noteMap.get(note);
			if (this.osc3Octave.value < 0){
				osc3Note -= (abs(this.osc3Octave.value) * 12);
			} else if (this.osc3Octave.value > 0){
				osc3Note += (this.osc3Octave.value * 12);
			}


			if ( this.oscRamp.value != 0 && 
				((midiToFreq(note) > this.osc1.f && this.glideSelector.up) || 
				(midiToFreq(note) < this.osc1.f && this.glideSelector.down)) ){

				this.osc1.freq(midiToFreq(note), this.oscRamp.value);
				this.osc2.freq(midiToFreq(osc2Note), this.oscRamp.value);
				this.osc3.freq(midiToFreq(osc3Note), this.oscRamp.value);
			} else {

				this.osc1.freq(midiToFreq(note));
				this.osc2.freq(midiToFreq(osc2Note));
				this.osc3.freq(midiToFreq(osc3Note));
			}


			if (this.filterLink.value == true){
				this.filter.freq(midiToFreq(note) + this.filterFreq.value);
			}

			this.envOsc1.play(this.osc1);
			this.envOsc2.play(this.osc2);
			this.envOsc3.play(this.osc3);
			this.envFilter.play();


		}else if (this.soundType.value == 1){
			if (this.filterLink.value == true) this.filter.freq(midiToFreq(note) + this.filterFreq.value);
			this.envNoise.play(this.noise);
			this.envFilter.play();

		}else if (this.soundType.value == 2){
			var start = map(this.sampleStart.value, 0, 1, 0, this.sample.duration());
			var stop = map(this.sampleStop.value, 0, 1, 0, this.sample.duration());
			var pitch = midiToFreq(note) / midiToFreq(60);

			if (this.sampleLoop.active){
				this.sample.stop();
				this.sample.loop(0, pitch + this.sampleTune.value, patternForm.volumeKnobs[selectedSound].value, start, stop - start);
			}else{
				this.sample.stop();
				this.sample.setLoop(false);
				this.sample.play(0, pitch + this.sampleTune.value, patternForm.volumeKnobs[selectedSound].value, start, stop - start);
			}
			this.sample.setVolume(this.envSample);

			if (this.filterLink.value == true) this.filter.freq(midiToFreq(note) + this.filterFreq.value);

			this.envSample.play();
			this.envFilter.play();
		}




		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}		
		
	}








	playArpNote(note){

		if (this.arpPrevBaseNote != note){

			this.arpPrevBaseNote = note;
			this.arpCounter = 0; //reset arp
			
			this.arpBaseOffset = this.arp[0] - this.arpPrevBaseNote;

		}


		if (this.soundType.value == 0){

			if (this.arpSelector.valueRandom == true){
				
				if (!this.randomArpLength) this.randomArpLength = floor( random(this.arp.length) );
				


				var n = this.arp[this.arpCounter] - this.arpBaseOffset ; 
				
				this.playNote(n);

				this.arpCounter += this.arpSelector.direction;
				if (this.arpSelector.direction > 0 && this.arpCounter >= this.randomArpLength){
					this.randomArpLength = floor( random(this.arp.length) );
					this.arpCounter = 0;
				} else if (this.arpSelector.direction < 0 && this.arpCounter <= this.arp.length - this.randomArpLength){
					this.randomArpLength = floor( random(this.arp.length) );
					this.arpCounter = this.arp.length -1;
				}
				
			}else{

				if (this.arpSelector.valueReturn == true && beatCounter == 0) this.arpCounter = 0;
				
				var n = this.arp[this.arpCounter] - this.arpBaseOffset ; 
				
				this.playNote(n);

				this.arpCounter += this.arpSelector.direction;

				if (this.arpCounter >= this.arp.length){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = 0;
					}
				}else if (this.arpCounter < 0){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = this.arp.length -1;
					}
				}
			}


			if (this.filterLink.value == true) this.filter.freq( (this.osc1.f + this.filterFreq.value) );


		} else if (this.soundType.value == 1){

			this.playNote( note );

		} else if (this.soundType.value == 2 && this.sample.duration() != 0){


				
			if (this.arpSelector.valueRandom == true){
				
				if (!this.randomArpLength) this.randomArpLength = floor( random(this.arp.length) );
				

				this.playNote(this.arp[this.arpCounter] - this.arpBaseOffset);

				
				this.arpCounter += this.arpSelector.direction;
				if (this.arpSelector.direction > 0 && this.arpCounter >= this.randomArpLength){
					this.randomArpLength = floor( random(this.arp.length) );
					this.arpCounter = 0;
				} else if (this.arpSelector.direction < 0 && this.arpCounter <= this.arp.length - this.randomArpLength){
					this.randomArpLength = floor( random(this.arp.length) );
					this.arpCounter = this.arp.length -1;
				}
				
				
			}else{

				if (this.arpSelector.valueReturn == true && beatCounter == 0) this.arpCounter = 0;
				
				this.playNote(this.arp[this.arpCounter] - this.arpBaseOffset);

				this.arpCounter += this.arpSelector.direction;

				if (this.arpCounter >= this.arp.length){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = 0;
					}
				}else if (this.arpCounter < 0){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = this.arp.length -1;
					}
				}
			}

			
		}

		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}	
	}








	playPolyNotes(notes, rollChords){

	
		if (this.soundType.value == 0){

			let osc2Note = notes[1] || notes[0]; //noteMap.get(note);
			if (this.osc2Octave.value < 0){
				osc2Note -= (abs(this.osc2Octave.value) * 12);
			} else if (this.osc2Octave.value > 0){
				osc2Note += (this.osc2Octave.value * 12);
			}

			let osc3Note = notes[2] || notes[0];
			if (this.osc3Octave.value < 0){
				osc3Note -= (abs(this.osc3Octave.value) * 12);
			} else if (this.osc3Octave.value > 0){
				osc3Note += (this.osc3Octave.value * 12);
			}

			if (this.filterLink.value == true){
				this.filter.freq(midiToFreq(notes[0]) + this.filterFreq.value);
			}

			if ((midiToFreq(notes[0]) > this.osc1.f && this.glideSelector.up) || 
				(midiToFreq(notes[0]) < this.osc1.f && this.glideSelector.down)){

				this.osc1.freq(midiToFreq(notes[0]), this.oscRamp.value);
				this.osc2.freq(midiToFreq(osc2Note), this.oscRamp.value);
				this.osc3.freq(midiToFreq(osc3Note),this.oscRamp.value);
			} else {

				this.osc1.freq(midiToFreq(notes[0]));
				this.osc2.freq(midiToFreq(osc2Note));
				this.osc3.freq(midiToFreq(osc3Note));
			}

			if (notes.length > 1 && rollChords && this.rollingChords.value != 0){
				this.envOsc1.play(this.osc1);
				this.envOsc2.play(this.osc2, this.rollingChords.value/4);
				this.envOsc3.play(this.osc3, this.rollingChords.value/2);
			} else {
				this.envOsc1.play(this.osc1);
				this.envOsc2.play(this.osc2);
				this.envOsc3.play(this.osc3);	
			}
			this.envFilter.play();
			

			if (this.filterLink.value == true) this.filter.freq( (this.osc1.f + this.filterFreq.value) );

		}else if (this.soundType.value == 1){
			
			if (this.filterLink.value == true) this.filter.freq( midiToFreq( notes[0] ) + this.filterFreq.value);
			this.envNoise.play(this.noise);
			this.envFilter.play();

		}else if (this.soundType.value == 2){

			this.playNote(notes[0]);
		}


		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}	
	}



	playSilentNote(note){
		this.envOsc1.setRange(0, 0);
		this.envOsc2.setRange(0, 0);
		this.envOsc3.setRange(0, 0);
		this.envNoise.setRange(0, 0);
		this.envSample.setRange(0, 0);

		this.envOsc1.setADSR(0, 0, 0, 0);
		this.envOsc2.setADSR(0, 0, 0, 0);
		this.envOsc3.setADSR(0, 0, 0, 0);
		this.envNoise.setADSR(0, 0, 0, 0);
		this.envSample.setADSR(0, 0, 0, 0);

		this.playNote(note);

		this.setADSRRange();
		this.setADSRValues();		
	}










	loadKnobs(){
		this.arpKnob = new KnobObject(1,1, knobSize, "ARP", function(){});
		this.arpKnob.set(0, 1, 0, 1);
		this.knobs.push(this.arpKnob)
		// ADSR Knobs

		this.attackLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.attackLevel.set(0.08, 1, 0.5, 0.01);
		this.attackLevel.index = this.index;
		this.knobs.push(this.attackLevel);
		this.knobs[this.knobs.length -1].forSound = true;

		this.releaseLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Release\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.releaseLevel.set(0, 1, 0, 0.01);
		this.releaseLevel.index = this.index;
		this.knobs.push(this.releaseLevel);
		this.knobs[this.knobs.length -1].forSound = true;


		this.attackTime = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack", function(){
			sounds[this.index].setADSRValues();
		});
		this.attackTime.set(0.001, 1, 0.01, 0.001);
		this.attackTime.index = this.index;
		this.knobs.push(this.attackTime);
		this.knobs[this.knobs.length -1].forSound = true;


		this.decayTime = new KnobObject(width - 110, (height / 2) - 85, knobSize, "Decay", function(){
			sounds[this.index].setADSRValues();
		});
		this.decayTime.set (0, 1, 0.2, 0.001);
		this.decayTime.index = this.index;
		this.knobs.push(this.decayTime);
		this.knobs[this.knobs.length -1].forSound = true;

		this.susPercent = new KnobObject(width - 70, (height / 2) - 85, knobSize, "Sustain", function(){
			sounds[this.index].setADSRValues();
		});
		this.susPercent.set(0, 1, 0.2, 0.001);
		this.susPercent.index = this.index;
		this.knobs.push(this.susPercent);
		this.knobs[this.knobs.length -1].forSound = true;

	    this.releaseTime = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Release", function(){
			sounds[this.index].setADSRValues();
		});
	    this.releaseTime.set(0, 1, 0.5, 0.001);
	    this.releaseTime.index = this.index;
	    this.knobs.push(this.releaseTime);
	    this.knobs[this.knobs.length -1].forSound = true;

		this.ADSRMultiplier = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Multiply", function(){
			sounds[this.index].setADSRValues();
		});
	    this.ADSRMultiplier.set(1, 10, 1, 0.1);
	    this.ADSRMultiplier.index = this.index;
	    this.knobs.push(this.ADSRMultiplier);
	    this.knobs[this.knobs.length -1].forSound = true;

	    this.ADSRChance = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Chance", function(){});
	    this.ADSRChance.set(0, 1, 1, 0.01); 
	    this.knobs.push(this.ADSRChance);
	    this.knobs[this.knobs.length -1].forSound = true;


	    //for the filter adsr

	    this.filterattackLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.filterattackLevel.set(0.08, 1, 0.5, 0.01);
		this.filterattackLevel.index = this.index;
		this.knobs.push(this.filterattackLevel);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filterreleaseLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Release\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.filterreleaseLevel.set(0, 1, 0, 0.01);
		this.filterreleaseLevel.index = this.index;
		this.knobs.push(this.filterreleaseLevel);
		this.knobs[this.knobs.length -1].forFilter = true;


		this.filterattackTime = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack", function(){
			sounds[this.index].setADSRValues();
		});
		this.filterattackTime.set(0.001, 1, 0.001, 0.001);
		this.filterattackTime.index = this.index;
		this.knobs.push(this.filterattackTime);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filterdecayTime = new KnobObject(width - 110, (height / 2) - 85, knobSize, "Decay", function(){
			sounds[this.index].setADSRValues();
		});
		this.filterdecayTime.set (0, 1, 0, 0.001);
		this.filterdecayTime.index = this.index;
		this.knobs.push(this.filterdecayTime);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filtersusPercent = new KnobObject(width - 70, (height / 2) - 85, knobSize, "Sustain", function(){
			sounds[this.index].setADSRValues();
		});
		this.filtersusPercent.set(0, 1, 0, 0.001);
		this.filtersusPercent.index = this.index;
		this.knobs.push(this.filtersusPercent);
		this.knobs[this.knobs.length -1].forFilter = true;

	    this.filterreleaseTime = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Release", function(){
			sounds[this.index].setADSRValues();
		});
	    this.filterreleaseTime.set(0, 1, 0, 0.001);
	    this.filterreleaseTime.index = this.index;
	    this.knobs.push(this.filterreleaseTime);
	    this.knobs[this.knobs.length -1].forFilter = true;

		this.filterADSRMultiplier = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Multiply", function(){
			sounds[this.index].setADSRValues();
		});
	    this.filterADSRMultiplier.set(1, 10, 1, 0.1);
	    this.filterADSRMultiplier.index = this.index;
	    this.knobs.push(this.filterADSRMultiplier);
	    this.knobs[this.knobs.length -1].forFilter = true;


	    //OSC & LFO & FILTER FREQ Knobs
		this.osc1Detune = new KnobObject(50, 50, knobSize, "Detune\n(cents)", function(){
			sounds[this.index].osc1.oscillator.detune.value = this.value;
		});
		this.osc1Detune.set(-2000, 2000, 0, 0.05);
		this.osc1Detune.index = this.index;
		this.knobs.push(this.osc1Detune);

		this.osc2Detune = new KnobObject(150, 50, knobSize, "Detune\n(cents)", function(){
			sounds[this.index].osc2.oscillator.detune.value = this.value;
		});
		this.osc2Detune.set(-2000, 2000, 0, 0.05);
		this.osc2Detune.index = this.index;
		this.knobs.push(this.osc2Detune);

		this.osc2Octave = new KnobObject(150, 50, knobSize, "Octave", function(){});
		this.osc2Octave.set(-2, 2, 0, 1);
		this.knobs.push(this.osc2Octave);


		this.osc3Amount = new KnobObject(150, 50, knobSize, "Amount",function(){
			sounds[this.index].envOsc3.output.gain.value = this.value;
		});
		this.osc3Amount.set(0, 1, 0.5, 0.001);
		this.osc3Amount.index = this.index;
		this.knobs.push(this.osc3Amount);

		this.osc3Detune = new KnobObject(150, 50, knobSize, "Detune\n(cents)", function(){
			sounds[this.index].osc3.oscillator.detune.value = this.value;
		});
		this.osc3Detune.set(-2000, 2000, 0, 0.05);
		this.osc3Detune.index = this.index;
		this.knobs.push(this.osc3Detune);

		this.osc3Octave = new KnobObject(150, 50, knobSize, "Octave", function(){});
		this.osc3Octave.set(-2, 2, 0, 1);
		this.knobs.push(this.osc3Octave);
		

		this.oscMix = new KnobObject(50,50,knobSize, "<--  Mix  -->", function(){
			sounds[this.index].envOsc1.output.gain.value = 1 - this.value;
			sounds[this.index].envOsc2.output.gain.value = this.value;
		});
		this.oscMix.set(0,1,0.5,0.01);
		this.oscMix.index = this.index;
		this.knobs.push(this.oscMix);

		this.oscRamp = new KnobObject(50,50,knobSize, "Glide", function(){});
		this.oscRamp.set(0,1,0,0.01);
		this.knobs.push(this.oscRamp)

		this.rollingChords = new KnobObject(50,50,knobSize, "Strum\nChords", function(){});
		this.rollingChords.set(0,1,0,0.001);
		this.knobs.push(this.rollingChords);

		this.LFO1Freq = new KnobObject(25, 80, knobSize, "Frequency", function(){
			sounds[this.index].LFO1.freq(this.value);
			if (sounds[this.index].LFO1Binder.value == 1) sounds[this.index].hiddenLFO.freq(this.value * -1);
		});
		this.LFO1Freq.set(0.001, 150, 0.01, 0.005);
		this.LFO1Freq.index = this.index;
		this.knobs.push(this.LFO1Freq)

		this.LFO1Amount = new KnobObject(75, 80, knobSize, "Amount", function(){
			sounds[this.index].LFO1.amp(this.value);
			if (sounds[this.index].LFO1Binder.value == 1) sounds[this.index].hiddenLFO.amp(this.value * -1);
		});
		this.LFO1Amount.set(-100, 100, 0, 0.01);	
		this.LFO1Amount.index = this.index;
		this.knobs.push(this.LFO1Amount)


		this.LFO2Freq = new KnobObject(25, 80, knobSize, "Frequency", function(){
			sounds[this.index].LFO2.freq(this.value);
		});
		this.LFO2Freq.set(0.001, 150, 0.01, 0.005);
		this.LFO2Freq.index = this.index;
		this.knobs.push(this.LFO2Freq)

		this.LFO2Amount = new KnobObject(75, 80, knobSize, "Amount", function(){
			sounds[this.index].LFO2.amp(this.value);
			if (sounds[this.index].LFO2Binder.value == 1) sounds[this.index].hiddenLFO.amp(this.value * -1);
		});
		this.LFO2Amount.set(-100, 100, 0, 0.01);
		this.LFO2Amount.index = this.index;
		this.knobs.push(this.LFO2Amount)


		this.filterFreq = new KnobObject(40, 25, knobSize, "Frequency", function(){
			sounds[this.index].filter.freq(this.value);
		});
		this.filterFreq.set(0, 8000, 0, 0.1);
		this.filterFreq.index = this.index;
		this.knobs.push(this.filterFreq);

		this.filterRes = new KnobObject(95, 25, knobSize, "Resonance", function(){
			sounds[this.index].filter.res(this.value);
		});
		this.filterRes.set(0, 100, 0, 0.1);
		this.filterRes.index = this.index;
		this.knobs.push(this.filterRes);

		this.filterGain = new KnobObject(95, 25, knobSize, "Gain", function(){
			sounds[this.index].filter.gain(this.value);
		});
		this.filterGain.set(0, 100, 0, 1);
		this.filterGain.index = this.index;
		this.knobs.push(this.filterGain);

		
		this.distortionAmount = new KnobObject(95, 25, knobSize, "Distortion\nAmount", function(){
			sounds[this.index].setDistortion();
		});
		this.distortionAmount.set(0, 0.4, 0, 0.001);
		this.distortionAmount.index = this.index;
		this.knobs.push(this.distortionAmount);

		this.distortionSampling = new KnobObject(95, 25, knobSize, "Over\nSampling", function(){
			sounds[this.index].setDistortion();
		});
		this.distortionSampling.set(0, 2, 0, 1);
		this.distortionSampling.index = this.index;
		this.knobs.push(this.distortionSampling)

		this.delayTime = new KnobObject(95, 25, knobSize, "Delay Time", function(){
			sounds[this.index].delay.delayTime(this.value);
			if (this.value == 0){
				sounds[this.index].delay.drywet(0);
			} else {
				sounds[this.index].delay.drywet(1);
			}
		});
		this.delayTime.set(0, 0.9, 0, 0.001);
		this.delayTime.index = this.index;
		this.knobs.push(this.delayTime);

		this.delayFeedback = new KnobObject(95, 25, knobSize, "Delay Feedback", function(){
			sounds[this.index].delay.feedback(this.value);
			if (this.value == 0){
				sounds[this.index].delay.drywet(0);
			} else {
				sounds[this.index].delay.drywet(1);
			}
		});
		this.delayFeedback.set(0, 0.9, 0, 0.001);
		this.delayFeedback.index = this.index;
		this.knobs.push(this.delayFeedback)

		this.delayFilterFreq = new KnobObject(95, 25, knobSize, "Delay FilterFreq", function(){
			sounds[this.index].delay.filter(this.value);
		});
		this.delayFilterFreq.set(0, 20000, 0, 10);
		this.delayFilterFreq.index = this.index;
		this.knobs.push(this.delayFilterFreq)

		//sample knobs
		this.sampleStart = new KnobObject(0,0,knobSize, "Start", function(){
			if (sounds[this.index].sampleStop.value < sounds[this.index].sampleStart.value){
				sounds[this.index].sampleStop.value = sounds[this.index].sampleStart.value + 0.01;
			}
		});
		this.sampleStart.set(0,1,0,0.001);
		this.sampleStart.index = this.index;
		this.knobs.push(this.sampleStart);

		this.sampleStop = new KnobObject(0,0,knobSize, "End", function(){
			if (sounds[this.index].sampleStop.value < sounds[this.index].sampleStart.value){
				sounds[this.index].sampleStop.value = sounds[this.index].sampleStart.value + 0.01;
			}
		});
		this.sampleStop.set(0,1,1,0.001);
		this.sampleStop.index = this.index;
		this.knobs.push(this.sampleStop)

		this.sampleTune = new KnobObject(0,0,knobSize, "Tune", function(){});
		this.sampleTune.set(-1,1,0,0.001);
		this.knobs.push(this.sampleTune);

	}

	loadButtons(){
		// Sound Type Selector
		this.soundType = new SoundSelector();

		this.RingMod = new FunctionButtonObject(0,0, knobSize * 1.4, " <<< RING <<< \n <<< MOD  <<< ");

		this.glideSelector = new GlideSelector();

		this.ADSRExpo = new FunctionButtonObject(0,0, knobSize * 1.6, "Expo");

		this.filterADSRExpo = new FunctionButtonObject(0,0, knobSize * 1.6, "Expo");

		this.noiseSelector = new NoiseSelector();

		this.LFO1Binder = new LFOBinder();
		this.LFO1Link = new LinkSelector();
		
		this.LFO2Binder = new LFOBinder();
		this.LFO2Link = new LinkSelector();

		this.filterType = new FilterSelector();
		this.filterLink = new LinkSelector();
		
		this.sampleReverse = new FunctionButtonObject(0,0,knobSize, "Reverse");
		this.samplePlay = new FunctionButtonObject(0,0,knobSize, "Play");
		this.sampleLoop = new FunctionButtonObject(0,0,knobSize, "Loop");
	}




	setADSRValues(){
		this.envOsc1.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envOsc2.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envOsc3.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envNoise.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envSample.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);

		this.envFilter.setADSR(this.filterattackTime.value * this.filterADSRMultiplier.value, this.filterdecayTime.value * this.filterADSRMultiplier.value, this.filtersusPercent.value * this.filterADSRMultiplier.value, this.filterreleaseTime.value * this.filterADSRMultiplier.value);
	}

	setADSRRange(){
	
		this.envOsc1.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envOsc2.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envOsc3.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envNoise.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envSample.setRange(this.attackLevel.value / 2, this.releaseLevel.value);

		this.envFilter.setRange(this.filterattackLevel.value / 2, this.filterreleaseLevel.value);
		
	}

	setDistortion(){
		if (this.distortionAmount.value != 0){
			switch(this.distortionSampling.value){

				case 0:
					this.distortion.set(this.distortionAmount.value, "none");
					break;
				case 1:
					this.distortion.set(this.distortionAmount.value, "2x");
					break;
				case 2:
					this.distortion.set(this.distortionAmount.value, "4x");
					break;
			}
			this.distortion.drywet(1)
		}else{
			this.distortion.drywet(0)
		}
	}

	setFilterType(){
		if (this.filterType.value == 0){
				this.filter.drywet(0);

			}else{
				if (this.filterType.value == 1){
					this.filter.setType('lowpass');
				}else if (this.filterType.value == 2){
					this.filter.setType('highpass');
				}else if (this.filterType.value == 3){
					this.filter.setType('bandpass');
				}else if (this.filterType.value == 4){
					this.filter.setType('lowshelf');
				}else if (this.filterType.value == 5){
					this.filter.setType('highshelf');
				}else if (this.filterType.value == 6){
					this.filter.setType('peaking');
				}else if (this.filterType.value == 7){
					this.filter.setType('notch');
				}else if (this.filterType.value == 8){
					this.filter.setType('allpass');
				} 
				this.filter.drywet(1);
				this.filter.freq(this.filterFreq.value);
				this.filter.res(this.filterRes.value);
				this.filter.gain(this.filterGain.value);
			}
	}

	setNoiseType(){
		this.noise.setType(this.noiseSelector.value);
	}


	bindLFO(pack, otherlfo){

		pack.lfo.disconnect();
		this.hiddenLFO.disconnect();
		this.hiddenLFO.stop();
		otherlfo._freqMods = [];
		this.procGain1.disconnect();
		this.procGain2.disconnect();

		this.osc1.disconnect();
		this.osc2.disconnect();
		this.osc1.connect(this.filter);
		this.osc2.connect(this.filter);
		
		if (pack.binder.value == 0){
			pack.lfo.stop();
			return;
		} 

		if (pack.lfo.oscillator.type == "custom") pack.lfo.oscillator.type = "sine";
		pack.lfo.start();

		if (pack.wave.value == 4){
			waveForm.updateWave(pack.array, pack.lfo.oscillator);
		}
		
		
		switch(pack.binder.value){
			case 1:
				
				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);

				
				if (this.hiddenLFO.oscillator.type == "custom") this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();

				this.hiddenLFO.freq(pack.lfo.f);
				this.hiddenLFO.amp(pack.amount.value * -1);

				if (pack.wave.value == 4){
					waveForm.updateWave(pack.array, pack.hiddenLFO.oscillator);

				} else {
					this.hiddenLFO.setType(pack.lfo.getType());
				}

				this.osc1.disconnect();
				this.osc2.disconnect();

				this.osc1.output.connect(this.procGain1);
				this.osc2.output.connect(this.procGain2);

				this.procGain1.connect(this.filter);
				this.procGain2.connect(this.filter);

				pack.lfo.output.connect(this.procGain1.output.gain);
				this.hiddenLFO.output.connect(this.procGain2.output.gain);
				
				break;

			case 2:

				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);
								
				pack.lfo.output.connect(this.filter.output.gain);
								
				break;

			case 3:

				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);
				
				if (this.soundType.value == 0){

					pack.lfo.output.connect(this.osc1.panner.stereoPanner.pan);
					pack.lfo.output.connect(this.osc2.panner.stereoPanner.pan);
					pack.lfo.output.connect(this.osc3.panner.stereoPanner.pan);
				

				} else if (this.soundType.value == 1){

					pack.lfo.output.connect(this.noise.panner.stereoPanner.pan);					

				} else if (this.soundType.value == 2){

					pack.lfo.output.connect(this.sample.panner.stereoPanner.pan);

				}
				break;

			case 5:
				pack.amount.set(-8000, 8000, pack.amount.value, 1);	
				this.filter.freq(pack.lfo);
				break;

			case 6:
				var a = constrain(pack.amount.value, 0, 100);
				pack.amount.set(0, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.filter.res(pack.lfo);
				break;

			case 7:
				var a = constrain(pack.amount.value, 0, 100);
				pack.amount.set(0, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.filter.gain(pack.lfo);
				break;

			case 9:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc1.freq(pack.lfo);
				break;

			case 10:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc2.freq(pack.lfo);
				break;

			case 11:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc3.freq(pack.lfo);
				break;

			case 13:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				otherlfo.freq(pack.lfo);

				if (pack.lfo === this.LFO1){ //to fix a bug
					this.bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
				} else {
					this.bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
				}
				break;

			case 14:
				var a = constrain(pack.amount.value, -1000, 1000);
				pack.amount.set(-1000, 1000, a, 0.01);	
				pack.lfo.amp(a);

				otherlfo.amp(pack.lfo);

				if (pack.lfo === this.LFO1){ //to fix a bug
					this.bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
				} else {
					this.bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
				}
				break;
		}
	}

	connectRingMod(){
		if (this.RingMod.active){
			this.osc1.disconnect();
			this.osc2.disconnect();
			this.osc1.connect(this.ringGain);
			this.osc2.oscillator.connect(this.ringGain.gain);
			this.ringGain.connect(this.filter);

		} else {
			this.osc1.disconnect();
			this.osc2.disconnect();
			this.ringGain.disconnect();
			this.osc1.connect(this.filter);
			this.osc2.connect(this.filter);
		}
	}
	

	waveChange(){

		var wavetypes = ['sine', 'triangle', 'sawtooth', 'square']
		if (this.osc1Wave.value != 4) this.osc1.setType(wavetypes[this.osc1Wave.value]);
		if (this.osc2Wave.value != 4) this.osc2.setType(wavetypes[this.osc2Wave.value]);
		if (this.osc3Wave.value != 4) this.osc3.setType(wavetypes[this.osc3Wave.value]);
		if (this.LFO1Wave.value != 4) this.LFO1.setType(wavetypes[this.LFO1Wave.value]);
		if (this.LFO2Wave.value != 4) this.LFO2.setType(wavetypes[this.LFO2Wave.value]);
	}
}














//  .oooooo..o     .                        oooooooooo.                  .       .                         
// d8P'    `Y8   .o8                        `888'   `Y8b               .o8     .o8                         
// Y88bo.      .o888oo  .ooooo.  oo.ooooo.   888     888 oooo  oooo  .o888oo .o888oo  .ooooo.  ooo. .oo.   
//  `"Y8888o.    888   d88' `88b  888' `88b  888oooo888' `888  `888    888     888   d88' `88b `888P"Y88b  
//      `"Y88b   888   888ooo888  888   888  888    `88b  888   888    888     888   888   888  888   888  
// oo     .d8P   888 . 888    .o  888   888  888    .88P  888   888    888 .   888 . 888   888  888   888  
// 8""88888P'    "888" `Y8bod8P'  888bod8P' o888bood8P'   `V88V"V8P'   "888"   "888" `Y8bod8P' o888o o888o 
//                                888                                                                      
//                               o888o                                                                    
// used in spacing the beat indicator in patternform :s


function StepButtonObject(x,y,s, i, a){
	this.pos = createVector(x,y);
	this.width = s;
	this.height = 0;
}













// oooooooooooo                                       .    o8o                        oooooooooo.                  .       .                                  
// `888'     `8                                     .o8    `"'                        `888'   `Y8b               .o8     .o8                                  
//  888         oooo  oooo  ooo. .oo.    .ooooo.  .o888oo oooo   .ooooo.  ooo. .oo.    888     888 oooo  oooo  .o888oo .o888oo  .ooooo.  ooo. .oo.    .oooo.o 
//  888oooo8    `888  `888  `888P"Y88b  d88' `"Y8   888   `888  d88' `88b `888P"Y88b   888oooo888' `888  `888    888     888   d88' `88b `888P"Y88b  d88(  "8 
//  888    "     888   888   888   888  888         888    888  888   888  888   888   888    `88b  888   888    888     888   888   888  888   888  `"Y88b.  
//  888          888   888   888   888  888   .o8   888 .  888  888   888  888   888   888    .88P  888   888    888 .   888 . 888   888  888   888  o.  )88b 
// o888o         `V88V"V8P' o888o o888o `Y8bod8P'   "888" o888o `Y8bod8P' o888o o888o o888bood8P'   `V88V"V8P'   "888"   "888" `Y8bod8P' o888o o888o 8""888P' 
 






function FunctionButtonObject(x,y,h, lbl){
	this.pos = createVector(x,y);
	this.height = h;
	this.color = 220;
	this.active = false;
	this.label = lbl;
	this.width = textWidth(this.label) + 30;

	this.display = function(i){
		push();
			if (this.active){
				fill(160);
				strokeWeight(2);
				rect(this.pos.x, this.pos.y, this.width, this.height, cornerRadius);
			}else{
				fill(this.color);
				rect(this.pos.x, this.pos.y, this.width, this.height, cornerRadius);
			}
			textSize(this.height * 0.3);
			strokeWeight(1);
			fill(0);
			if (i != undefined){
				if (textWidth( sounds[i].label ) > this.width){
					var ind = sounds[i].label.length -1
					for (var a = sounds[i].label.length - 1; a >= 0; a--){
						if (textWidth( sounds[i].label.substr(0, a) ) > this.width){
							ind = a;
						}						
					}
					text(sounds[i].label.substr(0, ind  - 3) + "...", this.pos.x + (this.width) / 2, this.pos.y + this.height / 2 + 5);	
					
				}else{
					text(sounds[i].label, this.pos.x + (this.width) / 2, this.pos.y + this.height / 2 + 5);
				}
			}else{
				if(this.label.search("\n") > 0){
					text(this.label, this.pos.x + (this.width) / 2, this.pos.y + this.height / 2);
				} else {
					text(this.label, this.pos.x + (this.width) / 2, this.pos.y + this.height / 2 + 5);
				}	
			}
		pop();
	}

	this.catch = function(index){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			
			if ( mouseButton == RIGHT){

				if (index != undefined){ //sound button
					selectedSound = index;
					soundMenu.pos = createVector(mouseX, min(mouseY, height - soundMenu.height));

				}else if (this.label == "Pattern menu"){
					patternForm.patternMenu.pos = createVector(mouseX, mouseY);
		
				}else if (this.label == "   "){
					arpMenu.pos = createVector(sounds[selectedSound].arpButton.pos.x - 10, mouseY);
				}


			}else{

				if (index != undefined){ // this is one of the soundbuttons on the patternform
					soundForm.inFront = true;
					selectedSound = index;
					soundForm.layOut();
					soundForm.render = true;
					this.active = true;
					sounds[index].waveChange();
					sounds[index].start();

				}else if (this.active){

					if (this.label == "   " && dist(mouseX, mouseY, sounds[selectedSound].arpKnob.pos.x, sounds[selectedSound].arpKnob.pos.y) > sounds[selectedSound].arpKnob.size){
						this.active = false;
					}else if( this.label != "   "){
		 				this.active = false;
		 				if (this.label == "Play"){
			 				sounds[selectedSound].sample.stop();

			 			} else if (this.label == "Expo") {
			 				if (soundForm.envelopeSelect.selected() == "Sound"){
								sounds[selectedSound].envOsc1.setExp(false);
								sounds[selectedSound].envOsc2.setExp(false);
								sounds[selectedSound].envOsc3.setExp(false);
								sounds[selectedSound].envNoise.setExp(false);
							} else {
								sounds[selectedSound].envFilter.setExp(false);
							}

						} else if (this.label == " <<< RING <<< \n <<< MOD  <<< ") {

							sounds[selectedSound].connectRingMod();
			 			}
			 		}

		 		}else{

		 			if (this.label == "Pattern menu"){
						patternForm.patternMenu.pos = createVector(mouseX, mouseY);
					}

					if (this.label == "   " && dist(mouseX, mouseY, sounds[selectedSound].arpKnob.pos.x, sounds[selectedSound].arpKnob.pos.y) > sounds[selectedSound].arpKnob.size){
						this.active = !this.active;

					}else if(this.label == "Reverse" && sounds[selectedSound].sample.duration() != 0){
						sounds[selectedSound].sample.reverseBuffer();
						SampleLoaded();

					}else if(this.label == "Repeat"){
						this.active = true;

					}else if(this.label == "Performance\nMode"){
						this.active = true;
						patternForm.patternbox.hide();
						patternForm.addbutton.hide();
						soundForm.nameText.hide();
						soundForm.presets.hide();
						soundForm.envelopeSelect.hide();
						frameRate(10);
						
					}else if(this.label == "3D Visualizer"){
						this.active = true;
						Visualizer3D.renderer.domElement.style.display = ""


					}else if(this.label == "BPM / Hz\ntables"){
						iframe[0].show();
						iframe[1].show();
						this.active = true;

					}else if(this.label == "Quick Guide"){
						quickGuideFrame.show();
						this.active = true;

					}else if(this.label == "Expo"){
						if (soundForm.envelopeSelect.selected() == "Sound"){
								sounds[selectedSound].envOsc1.setExp(true);
								sounds[selectedSound].envOsc2.setExp(true);
								sounds[selectedSound].envOsc3.setExp(true);
								sounds[selectedSound].envNoise.setExp(true);
							} else {
								sounds[selectedSound].envFilter.setExp(true);
							}
						this.active = true;

					}else if(this.label == "Play" && sounds[selectedSound].sample.duration() != 0){
						sounds[selectedSound].playNote(60);
						if (sounds[selectedSound].sampleLoop.active) {
							this.active = !playing;
						} else {
							this.active = false;
						}
						
					}else if(this.label == "Loop"){
						this.active = true;

					}else if(this.label == " <<< RING <<< \n <<< MOD  <<< "){
						
						this.active = true;
						sounds[selectedSound].connectRingMod();						
		 			}
		 		}
		 	}
		}
	}

	

}















// oooo    oooo                        .o8       
// `888   .8P'                        "888       
//  888  d8'    ooo. .oo.    .ooooo.   888oooo.  
//  88888[      `888P"Y88b  d88' `88b  d88' `88b 
//  888`88b.     888   888  888   888  888   888 
//  888  `88b.   888   888  888   888  888   888 
// o888o  o888o o888o o888o `Y8bod8P'  `Y8bod8P' 




function KnobObject(x, y, s, txt, fnx){
	this.pos = createVector(x,y);
	this.size = s || height / 30;
	this.label = txt
	this.index = undefined;
	
	this.fnx = fnx;


	this.stepsize;
	this.value;
	this.min;
	this.max;

	this.active = false;

	this.set = function(min, max, value, stepsize){
		this.min = min;
		this.max = max;
		this.value = value;
		this.stepsize = stepsize;
	}

	this.catch = function(){
		
		if (dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.size / 2){
			
				this.active = true;
			
		}
	}

	this.release = function(){
		this.active = false;
	}

	this.drag = function(amount, index){
		if (this.active){
			if (keyIsDown(16) || keyboardPolyNotes.length > 0) amount *= 25;

			this.value = constrain(this.value + (amount * this.stepsize), this.min, this.max);
			
			let valuestringsplit = this.value.toFixed(3).split(".");
			let strlen;
			for (var i = 2; i >= 0; i--){
				if (valuestringsplit[1].substr(i,1) != "0") {
					strlen = i + 1;
					break;
				}
			}
			if (strlen == undefined) strlen = 3;
			this.value = Number(this.value.toFixed(strlen));
			this.fnx();
		}
	}

	this.display = function(midi){
		push();
			//orange circle
			stroke(188, 90, 18);
			strokeWeight( 3 );
			fill( 200 );
			ellipse( this.pos.x, this.pos.y, this.size );

			//indication point
			var angle = map(this.value, this.min, this.max, 10, 350);
			var x = (this.size / 2 - 5) * cos(radians(angle + 90));
			var y = (this.size / 2 - 5) * sin(radians(angle + 90));
			stroke(0);
			point(this.pos.x + x, this.pos.y + y);

			//black circle
			strokeWeight(1)
			noFill();
			ellipse(this.pos.x, this.pos.y, this.size + 1);

			//black text value
			textSize( this.size * 0.35 );
			fill( 0 );
			strokeWeight( 0 );
			if (midi) {
				text(midiToString(this.value), this.pos.x, this.pos.y + 5);
			} else {
				text(this.value, this.pos.x, this.pos.y + 5);
			}
			
			//label text
			fill(0);
			textSize( constrain(this.size * 0.32, 8, 40) );
			text(this.label, this.pos.x, this.pos.y + this.size / 2 + 14);
		pop();

	}
}





















// oooooo   oooooo     oooo                                 
//  `888.    `888.     .8'                                  
//   `888.   .8888.   .8'    .oooo.   oooo    ooo  .ooooo.  
//    `888  .8'`888. .8'    `P  )88b   `88.  .8'  d88' `88b 
//     `888.8'  `888.8'      .oP"888    `88..8'   888ooo888 
//      `888'    `888'      d8(  888     `888'    888    .o 
//       `8'      `8'       `Y888""8o     `8'     `Y8bod8P' 
                                                         
                                                         
                                                         
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    





function WaveSelector(arr, out){
	this.pos = createVector(0,0);
	this.value = 0; // 0 = sine, 1 = triangle, 2 = sawtooth, 3 = square, 4 = custom!
	this.width = 89;
	this.height = 0;
	this.array = arr;
	this.output = out;
	

	this.display = function(){
		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width,this.height);

			fill(100);
			if (this.value == 0){
				rect(this.pos.x, this.pos.y, this.width * 0.20,this.height);
			}else if (this.value == 1){
				rect(this.pos.x + this.width * 0.2, this.pos.y, this.width * 0.15, this.height);
			}else if (this.value == 2){
				rect(this.pos.x + this.width * 0.35, this.pos.y, this.width * 0.2, this.height);
			}else if (this.value == 3){
				rect(this.pos.x + this.width * 0.55, this.pos.y, this.width * 0.18, this.height);
			}else if (this.value == 4){
				rect(this.pos.x + this.width * 0.73, this.pos.y, this.width * 0.27, this.height);
			}
			
			fill(0);
			textSize(this.height * 0.7)
			text("Sine", this.pos.x + this.width * 0.1 , this.pos.y + this.height * 0.8);
			text("Tri", this.pos.x + this.width * 0.28, this.pos.y + this.height * 0.8);
			text("Saw", this.pos.x + this.width * 0.46, this.pos.y + this.height * 0.8);
			text("Sqr", this.pos.x + this.width * 0.64, this.pos.y + this.height * 0.8);
			text("Custom", this.pos.x + this.width * 0.85, this.pos.y + this.height * 0.8);

		pop();
	}

	this.catch = function(){

		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width * 0.2 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 0;
			//
			sounds[selectedSound].waveChange();
		
		}else if (mouseX > this.pos.x + this.width * 0.2 && mouseX < this.pos.x + this.width * 0.35 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 1;
			//
			sounds[selectedSound].waveChange();	
		
		}else if (mouseX > this.pos.x + this.width * 0.35 && mouseX < this.pos.x + this.width * 0.55 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 2;
			//
			sounds[selectedSound].waveChange();

		}else if (mouseX > this.pos.x + this.width * 0.55 && mouseX < this.pos.x + this.width * 0.73 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 3;
			//
			sounds[selectedSound].waveChange();
		} else if (mouseX > this.pos.x + this.width * 0.73 && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 4;
			waveForm.set(soundForm.pos.x + soundForm.pos.w * 0.15, soundForm.pos.y + soundForm.pos.h * 0.125, soundForm.pos.w * 0.8, soundForm.pos.h * 0.75, this.array, this.output);
			waveForm.updateWave(this.array, this.output.oscillator);
			waveForm.inFront = true;
		}

	}
}












// oooooooooooo  o8o  oooo      .                      
// `888'     `8  `"'  `888    .o8                      
//  888         oooo   888  .o888oo  .ooooo.  oooo d8b 
//  888oooo8    `888   888    888   d88' `88b `888""8P 
//  888    "     888   888    888   888ooo888  888     
//  888          888   888    888 . 888    .o  888     
// o888o        o888o o888o   "888" `Y8bod8P' d888b    
                                                    
                                                    
                                                    
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    






function FilterSelector(){
	this.pos = createVector(0,0);
	this.value = 0;  //0 = off, 1 = lowpass, 2 = highpass, 3 = bandpass
	this.width = 220;
	

	this.display = function(){

		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width,20);

			fill(100);
			if (this.value == 0){
				rect(this.pos.x, this.pos.y, 24,20);
			}else if (this.value == 1){
				rect(this.pos.x + 24, this.pos.y, 16,20);
			}else if (this.value == 2){
				rect(this.pos.x + 40, this.pos.y, 17,20);
			}else if (this.value == 3){
				rect(this.pos.x + 57, this.pos.y, 20,20);
			


			}else if (this.value == 4){
				rect(this.pos.x + 75, this.pos.y, 18,20);
			}else if (this.value == 5){
				rect(this.pos.x + 93, this.pos.y, 19,20);
			}else if (this.value == 6){
				rect(this.pos.x + 112, this.pos.y, 35,20);
			}else if (this.value == 7){
				rect(this.pos.x + 147, this.pos.y, 46,20);
			}else if (this.value == 8){
				rect(this.pos.x + 193, this.pos.y, this.width - 192,20);
			}


			fill(0);

			text("OFF",this.pos.x + 12, this.pos.y + 15);
			text("LP", this.pos.x + 32, this.pos.y + 15);
			text("HP", this.pos.x + 49, this.pos.y + 15);
			text("BP", this.pos.x + 67, this.pos.y + 15);

			text("LS", this.pos.x + 85, this.pos.y + 15);
			text("HS", this.pos.x + 103, this.pos.y + 15);
			text("PEAK", this.pos.x + 130, this.pos.y + 15);
			text("NOTCH", this.pos.x + 170, this.pos.y + 15);
			text("ALL", this.pos.x + 205, this.pos.y + 15);
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + 24 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 0;	
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 24 && mouseX < this.pos.x + 40 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 1;
			
			sounds[selectedSound].setFilterType();
		
		}else if (mouseX > this.pos.x + 40 && mouseX < this.pos.x + 57 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 2;
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 57 && mouseX < this.pos.x + 75 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 3;
			
			sounds[selectedSound].setFilterType();



		}else if (mouseX > this.pos.x + 75 && mouseX < this.pos.x + 93 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 4;
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 93 && mouseX < this.pos.x + 112 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 5;
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 112 && mouseX < this.pos.x + 147 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 6;
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 147 && mouseX < this.pos.x + 193 && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 7;
			
			sounds[selectedSound].setFilterType();

		}else if (mouseX > this.pos.x + 193 && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + 20){
			this.value = 8;
			
			sounds[selectedSound].setFilterType();

		}
	}

}











// ooooo         o8o              oooo        
// `888'         `"'              `888        
//  888         oooo  ooo. .oo.    888  oooo  
//  888         `888  `888P"Y88b   888 .8P'   
//  888          888   888   888   888888.    
//  888       o  888   888   888   888 `88b.  
// o888ooooood8 o888o o888o o888o o888o o888o                                                                                  
                                                                                               
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    
                                                                           







function LinkSelector(){
	this.pos = createVector(0,0);
	this.value = false;  //false - not linked, true - linked the filter freq to the osc freq
	this.width = 30;
	

	this.display = function(){
		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width,20);
			if (this.value == 0){
				fill(200);
			}else if (this.value == 1){
				fill(100);				
			}
			rect(this.pos.x, this.pos.y, this.width,20);
			fill(0);
			textSize(11);
			text("LINK",this.pos.x + this.width/2, this.pos.y + 15);
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y && mouseY < this.pos.y + 20){
			
			this.value = !this.value;	
			

		}
	}

}










//   .oooooo.    oooo   o8o        .o8            
//  d8P'  `Y8b   `888   `"'       "888            
// 888            888  oooo   .oooo888   .ooooo.  
// 888            888  `888  d88' `888  d88' `88b 
// 888     ooooo  888   888  888   888  888ooo888 
// `88.    .88'   888   888  888   888  888    .o 
//  `Y8bood8P'   o888o o888o `Y8bod88P" `Y8bod8P' 
                                               
                                               
                                               
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    




function GlideSelector(){
	this.pos = createVector(0,0);
	this.up = true;
	this.down = true;
	this.width = 50;
	this.height = 30;
	

	this.display = function(){
		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width,this.height);
			line(this.pos.x, this.pos.y + this.height/2, this.pos.x + this.width, this.pos.y + this.height/2);

			fill(100);
			if (this.up) rect(this.pos.x, this.pos.y, this.width,this.height/2);	

			if (this.down) rect(this.pos.x, this.pos.y + this.height/2, this.width,this.height/2);	
			
			fill(0);
			textSize(11);
			text("UP",this.pos.x + this.width/2, this.pos.y + this.height * 0.45);
			text("DOWN",this.pos.x + this.width/2, this.pos.y + this.height * 0.95);
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y && mouseY < this.pos.y + this.height/2){
			
			this.up = !this.up;

		} else if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y + this.height/2 && mouseY < this.pos.y + this.height){

			this.down = !this.down;

		}
	}

}

















//  .oooooo..o                                         .o8  
// d8P'    `Y8                                        "888  
// Y88bo.       .ooooo.  oooo  oooo  ooo. .oo.    .oooo888  
//  `"Y8888o.  d88' `88b `888  `888  `888P"Y88b  d88' `888  
//      `"Y88b 888   888  888   888   888   888  888   888  
// oo     .d8P 888   888  888   888   888   888  888   888  
// 8""88888P'  `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P" 
                                                         
                                                         
                                                         
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    






function SoundSelector(){
	this.pos = createVector(0,0);
	this.value = 0;  //0 = OSC, 1 = NOISE, 2 = SAMPLE
	this.width = 55;
	this.height = 33;
	

	this.display = function(){
		push();
			textAlign(CENTER);
			textStyle(BOLD);
			textSize(this.height * 0.97);
			fill(formBackGroundColor + 20);
			rect(this.pos.x, this.pos.y, this.width, this.height);

			fill(100);
			if (this.value == 0){
				rect( this.pos.x, this.pos.y, this.width / 2.5, this.height);
			}else if (this.value == 1){
				rect( this.pos.x + this.width / 2.5, this.pos.y, this.width / 5, this.height);
			}else if (this.value == 2){
				rect( this.pos.x + this.width / 2.5 + this.width / 5, this.pos.y , this.width - ( this.width / 2.5 + this.width / 5) , this.height);
			}

			stroke(0);
			fill(0, 150);
			// stroke(188, 90, 18)
			// fill(188, 90, 18, 200);

			text("OSCILLATOR",this.pos.x + this.width / 4, this.pos.y + this.height * 0.9);
			text("NOISE", this.pos.x + this.width / 2, this.pos.y + this.height * 0.9);
			text("SAMPLE", this.pos.x + (this.width / 4 * 3), this.pos.y + this.height * 0.9);
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width / 2.5 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 0;	
			sounds[selectedSound].start()
			soundForm.layOut();
					
		}else if (mouseX > this.pos.x + this.width / 2.5 && mouseX < this.pos.x + this.width / 2.5 + this.width / 5 && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 1;
			sounds[selectedSound].start()
			soundForm.layOut();
		
		}else if (mouseX > this.pos.x + this.width / 2.5 + this.width / 5 && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			this.value = 2;
			sounds[selectedSound].start()
			soundForm.layOut();
		}
	}
}












// ooooooooo.   oooo                        ooo        ooooo                 .o8            
// `888   `Y88. `888                        `88.       .888'                "888            
//  888   .d88'  888   .oooo.   oooo    ooo  888b     d'888   .ooooo.   .oooo888   .ooooo.  
//  888ooo88P'   888  `P  )88b   `88.  .8'   8 Y88. .P  888  d88' `88b d88' `888  d88' `88b 
//  888          888   .oP"888    `88..8'    8  `888'   888  888   888 888   888  888ooo888 
//  888          888  d8(  888     `888'     8    Y     888  888   888 888   888  888    .o 
// o888o        o888o `Y888""8o     .8'     o8o        o888o `Y8bod8P' `Y8bod88P" `Y8bod8P' 
//                              .o..P'                                                      
//                              `Y8P'                                                       
                                                                                         
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    
                                                                           




function PlayMode(){
	this.pos = createVector(0,0);
	this.value = 0;  //0 = pattern, 1 = song
	this.width = 75;
	this.height = insideTop * 0.8;
	

	this.display = function(){
		push();
			textAlign(LEFT);

			
			fill(200);
			rect(this.pos.x, this.pos.y, this.width, this.height, cornerRadius * 2);

			fill(100);
			if (this.value == 0){
				rect(this.pos.x, this.pos.y, this.width, this.height / 2, cornerRadius * 2);
			}else if (this.value == 1){
				rect(this.pos.x, this.pos.y + this.height / 2, this.width, this.height / 2, cornerRadius * 2);
			}
			
			fill(0);
			textSize(this.width / 8)
			text("Pattern Mode",this.pos.x + 5, this.pos.y + this.height * 0.3);
			text("Song Mode", this.pos.x + 5, this.pos.y + this.height * 0.8);
			
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + this.height / 2){
			this.value = 0;	
			pulseWorker.postMessage({'msg' : "reset"});
			beatCounter = 0;

					
		}else if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && mouseY > this.pos.y + this.height / 2 && mouseY < this.pos.y + this.height){
			this.value = 1;
			pulseWorker.postMessage({'msg' : "reset"});
			beatCounter = 0;
			sequencerForm.currentSeq = sequencerForm.startSeq;
		}
	}
}















// ooooo      ooo            o8o                     
// `888b.     `8'            `"'                     
//  8 `88b.    8   .ooooo.  oooo   .oooo.o  .ooooo.  
//  8   `88b.  8  d88' `88b `888  d88(  "8 d88' `88b 
//  8     `88b.8  888   888  888  `"Y88b.  888ooo888 
//  8       `888  888   888  888  o.  )88b 888    .o 
// o8o        `8  `Y8bod8P' o888o 8""888P' `Y8bod8P' 
                                                  
                                                  
                                                  
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    
                                                                           




function NoiseSelector(){
	this.pos = createVector(0,0);
	this.value = 'white'; 
	this.width = 100
	this.height = 40;
	

	this.display = function(){
		if (this.pos.x != 0 && this.pos.y != 0){
		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width, this.height);

			fill(100);
			if (this.value == 'white'){
				rect(this.pos.x, this.pos.y,this.width * 0.35 ,this.height);
			}else if (this.value == 'brown'){
				rect(this.pos.x + this.width * 0.35, this.pos.y, this.width * 0.3,this.height);
			}else if (this.value == 'pink'){
				rect(this.pos.x + this.width * 0.65, this.pos.y, this.width * 0.35,this.height);
			}
			fill(0);
			textSize(20);
			text("White", this.pos.x + this.width * 0.2, this.pos.y + this.height * 0.6);
			text("Brown", this.pos.x + this.width * 0.5, this.pos.y + this.height * 0.6);
			text("Pink", this.pos.x + this.width * 0.8, this.pos.y + this.height * 0.6);
			

		pop();
		}	
	}

	this.catch = function(){

		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width * 0.35 && mouseY > this.pos.y &&
			 mouseY < this.pos.y + this.height){
			
			this.value = 'white';
			
			sounds[selectedSound].setNoiseType();
		
		}else if (mouseX > this.pos.x + this.width * 0.35 && mouseX < this.pos.x + this.width * 0.65 &&
		 	 mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			
			this.value = 'brown';
			
			sounds[selectedSound].setNoiseType();
		
		}else if (mouseX > this.pos.x + this.width * 0.65 && mouseX < this.pos.x + this.width &&
			 mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			
			this.value = 'pink';
			
			sounds[selectedSound].setNoiseType();

		}

	}
}










//       .o.                           
//      .888.                          
//     .8"888.     oooo d8b oo.ooooo.  
//    .8' `888.    `888""8P  888' `88b 
//   .88ooo8888.    888      888   888 
//  .8'     `888.   888      888   888 
// o88o     o8888o d888b     888bod8P' 
//                           888       
//                          o888o      
                                    
//  .oooooo..o           oooo                          .                      
// d8P'    `Y8           `888                        .o8                      
// Y88bo.       .ooooo.   888   .ooooo.   .ooooo.  .o888oo  .ooooo.  oooo d8b 
//  `"Y8888o.  d88' `88b  888  d88' `88b d88' `"Y8   888   d88' `88b `888""8P 
//      `"Y88b 888ooo888  888  888ooo888 888         888   888   888  888     
// oo     .d8P 888    .o  888  888    .o 888   .o8   888 . 888   888  888     
// 8""88888P'  `Y8bod8P' o888o `Y8bod8P' `Y8bod8P'   "888" `Y8bod8P' d888b    







function ArpSelector(){
	this.pos = createVector(0,0);
	this.width = 90;
	this.height = 80;
	this.valueReturn = false;
	this.valueOpposite = false;
	this.valueRandom = false;
	this.direction = 1;

	this.display = function(){
		push();
			fill(200);
			stroke(0);
			textSize(this.height * 0.15);
			rect(this.pos.x, this.pos.y, this.width, this.height);
			if (sounds[selectedSound].arpButton.active){
				fill(100);
				rect(this.pos.x, this.pos.y, this.width, this.height * 0.32);
			}else{
				fill(200);
				rect(this.pos.x, this.pos.y, this.width, this.height * 0.32);
			}
			fill(100);

			
			if (this.valueReturn == true){
				rect(this.pos.x, this.pos.y + this.height * 0.32, this.width, this.height * 0.22);
			}
			if (this.valueOpposite == true){
				rect(this.pos.x, this.pos.y + this.height * 0.55, this.width, this.height * 0.23);
			}
			if (this.valueRandom == true){
				rect(this.pos.x, this.pos.y + this.height * 0.79, this.width, this.height * 0.20);
			}

			line(this.pos.x, this.pos.y + this.height * 0.55, this.pos.x + this.width, this.pos.y + this.height * 0.55);
			line(this.pos.x, this.pos.y + this.height * 0.79, this.pos.x + this.width, this.pos.y + this.height * 0.79);
			
			fill(0);
			strokeWeight(0);
			if (this.direction > 0){
				text("Ascending", this.pos.x + this.width/2, this.pos.y + this.height / 4 -2);
			}else{
				text("Descending", this.pos.x + this.width/2, this.pos.y + this.height / 4 -2);
			}
			text("+ return", this.pos.x + this.width/2, this.pos.y + this.height / 4 * 2 -2);
			text("+ opposite", this.pos.x + this.width/2, this.pos.y + this.height / 4 * 3 -2);
			text("+ random", this.pos.x + this.width/2, this.pos.y + this.height / 4 * 4 -2);
		pop();
	}

	this.catch = function(){

		if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y && mouseY < this.pos.y + this.height * 0.32){
			this.direction *= -1;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + this.height * 0.32 && mouseY < this.pos.y + this.height * 0.55){
			
			this.valueReturn = !this.valueReturn;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + this.height * 0.55 && mouseY < this.pos.y + this.height * 0.79){

			this.valueOpposite = !this.valueOpposite;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
					mouseY > this.pos.y + this.height * 0.79 && mouseY < this.pos.y + this.height ){	

			this.valueRandom = !this.valueRandom;
		}
	}
}






















// ooooo        oooooooooooo   .oooooo.   
// `888'        `888'     `8  d8P'  `Y8b  
//  888          888         888      888 
//  888          888oooo8    888      888 
//  888          888    "    888      888 
//  888       o  888         `88b    d88' 
// o888ooooood8 o888o         `Y8bood8P'  
                                       
                                       
                                       
// oooooooooo.   o8o                    .o8  
// `888'   `Y8b  `"'                   "888  
//  888     888 oooo  ooo. .oo.    .oooo888  
//  888oooo888' `888  `888P"Y88b  d88' `888  
//  888    `88b  888   888   888  888   888  
//  888    .88P  888   888   888  888   888  
// o888bood8P'  o888o o888o o888o `Y8bod88P




function LFOBinder(){
	this.pos = createVector(0,0);
	this.value = 0;  //0 = OFF, 1 = osc1Detune, 2 = FilterFreq
	this.width = 250;
	this.height = 60;
	this.grid = createVector(4,4);
	this.options = ["OFF", "MIX", "AMP", "PAN", "FILTER:", "FREQ", "RES", "GAIN", "OSC:", "1", "2", "3", "LFOxx", "FREQ", "AMOUNT", ""];
	//this.options = ["OFF", "", "AMP", "PAN", "FILTER:", "FREQ", "RES", "GAIN", "OSC:", "1", "2", "3", "LFOxx", "FREQ", "AMOUNT", ""];

	this.display = function(){
		push();
			fill(200)
			rect(this.pos.x, this.pos.y, this.width, this.height);
			
			let xspace = this.width / this.grid.x;	
			let yspace = this.height / this.grid.y;
			
			for(let x = 0; x < this.grid.x; x++){
					for(let y = 0; y < this.grid.y; y++){
						let offset = y*this.grid.x + x;
						
						if (x == 0 && (y == 1 || y == 2 || y == 3)) {
							fill(180);
							rect(this.pos.x + xspace * x, this.pos.y + yspace * y, xspace, yspace);
							
						} else {
							
							if (this.otherBinder.value == offset && offset != 0){ //hide option if selected in otherBinder
								fill(188, 90, 18);
								rect(this.pos.x + xspace * x, this.pos.y + yspace * y, xspace, yspace);
								
							} else if (offset == this.value){
								fill(100);
								rect(this.pos.x + xspace * x, this.pos.y + yspace * y, xspace, yspace);
							}
							
						}
						
						fill(0);
						textAlign(LEFT);
						textSize(this.height / 6);
						if (!(this.otherBinder.value == offset && offset != 0)) text(this.options[offset], this.pos.x + xspace * x + 10, this.pos.y + yspace * (y+1) - 3);
					}
			}
		pop();
	}

	this.catch = function(){
		if (mouseX > this.pos.x && mouseX < this.pos.x + this.width && mouseY > this.pos.y && mouseY < this.pos.y + this.height){
			let x = floor(map(mouseX, this.pos.x, this.pos.x + this.width, 0, 4));
			let y = floor(map(mouseY, this.pos.y, this.pos.y + this.height, 0, 4));
			let offset = y*this.grid.x + x;
			
			if ( !(x == 0 && (y == 1 || y == 2 || y == 3)) && this.options[offset] != "" && (offset != this.otherBinder.value || offset == 0)){
				
				this.value = offset;
				sounds[selectedSound].bindLFO({lfo: this.LFO, binder: this, wave: this.wave, array: this.array, amount: this.amount}, this.otherLFO);
			}
		}
	}
	
	this.connect = function(lfo, wave, array, amount, name, otherlfo, otherbinder){
			this.LFO = lfo;
			this.wave = wave;
			this.array = array;
			this.amount = amount;
			this.options[12] = name + ":";
			this.otherLFO = otherlfo;
			this.otherBinder = otherbinder;
	}
}














// ooo        ooooo                                            
// `88.       .888'                                            
//  888b     d'888   .ooooo.  ooo. .oo.   oooo  oooo   .oooo.o 
//  8 Y88. .P  888  d88' `88b `888P"Y88b  `888  `888  d88(  "8 
//  8  `888'   888  888ooo888  888   888   888   888  `"Y88b.  
//  8    Y     888  888    .o  888   888   888   888  o.  )88b 
// o8o        o888o `Y8bod8P' o888o o888o  `V88V"V8P' 8""888P' 








function PattMenu(){
	this.pos;
	this.width = 280;
	this.height = 134;
	this.copypattern;


	this.show = function(){
		push();
			fill(220);
			stroke(0);
			rect(this.pos.x, this.pos.y, this.width, this.height);
			strokeWeight(2);
			line(this.pos.x, this.pos.y + this.height * 0.18, this.pos.x + this.width, this.pos.y + this.height * 0.18);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + this.height * 0.32, this.pos.x + this.width, this.pos.y + this.height * 0.32);
			line(this.pos.x, this.pos.y + this.height * 0.48, this.pos.x + this.width, this.pos.y + this.height * 0.48);
			strokeWeight(2);
			line(this.pos.x, this.pos.y + this.height * 0.62, this.pos.x + this.width, this.pos.y + this.height * 0.62);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + this.height * 0.76, this.pos.x + this.width, this.pos.y + this.height * 0.76);
			line(this.pos.x, this.pos.y + this.height * 0.88, this.pos.x + this.width, this.pos.y + this.height * 0.88);

			fill(0);
			strokeWeight(0);
			text("Rename", this.pos.x + this.width/2, this.pos.y + 18 );
			text("Copy", this.pos.x + this.width/2, this.pos.y + 38 );
			text("Paste", this.pos.x + this.width/2, this.pos.y + 58);
			text("Clear", this.pos.x + this.width/2, this.pos.y + 78);
			text("Duplicate", this.pos.x + this.width/2, this.pos.y + 98);
			text("Insert", this.pos.x + this.width/2, this.pos.y + 114);
			text("Remove", this.pos.x + this.width/2, this.pos.y + 130);
		pop();
	}

	this.catch = function(){

		if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y && mouseY < this.pos.y + this.height * 0.18){ 
			//rename
			patternForm.patternName.value(patternNames[currentPattern]);
			patternForm.patternName.show();
			setTimeout(()=>{
				patternForm.patternName.elt.focus();
				patternForm.patternName.elt.selectionStart = 0 //patternNames[currentPattern].length;
				patternForm.patternName.elt.selectionEnd = patternNames[currentPattern].length;
			}, 0);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + this.height * 0.18 && mouseY < this.pos.y + this.height * 0.32){

			//copy
			this.copypattern = currentPattern;
			

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + this.height * 0.32 && mouseY < this.pos.y + this.height * 0.48){

			//paste
			patterns[this.copypattern].forEach((pattern, index)=>{
				arrayCopy(pattern, 0, patterns[currentPattern][index], 0, pattern.length);	
			});
			

			for (var i = 0; i < maxSounds; i++){
				editPatternImage(currentPattern, i);
			}

			

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + this.height * 0.48 && mouseY < this.pos.y + this.height * 0.62){

			//clear
			for (var i = 0; i < maxSounds; i++){
				patterns[currentPattern][i] = [];
				for (var x = 0; x < maxBeats; x++){
					patterns[currentPattern][i][x] = [];
				}
				editPatternImage(currentPattern, i);
			}

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
			mouseY > this.pos.y + this.height * 0.62 && mouseY < this.pos.y + this.height * 0.76){

			//duplicate
			addPattern(currentPattern + 1, {duplicate: true});

			for (var i = 0; i < maxSounds; i++){

				if (patterns[currentPattern][i].isEuclidian){

					let src = patterns[currentPattern][i];
					let patt = []
					arrayCopy(src.pattern, 0, patt, 0, src.pattern.length);

					patterns[currentPattern + 1][i] = {
						pattern: patt,
						isEuclidian: true,
						lastSeq: -1,
						counter: 0,
						note: src.note,
						patternSet: src.patternSet,
						hits: src.hits,
						rotation: src.rotation
					};



				} else {
					for (var j = 0; j < maxBeats; j++){
						let src = patterns[currentPattern][i][j];
						let dst = patterns[currentPattern + 1][i][j];
					 	arrayCopy(src, 0, dst, 0, src.length);
				 	}
				}

			 	editPatternImage(currentPattern + 1, i);
			 	patternForm.updatePatternBox();

			}
	
			currentPattern++
			patternForm.updatePatternBox();

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
			mouseY > this.pos.y + this.height * 0.76 && mouseY < this.pos.y + this.height * 0.88){

			//insert
			addPattern(currentPattern + 1);
			currentPattern++
			patternForm.updatePatternBox();

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
			mouseY > this.pos.y + this.height * 0.88 && mouseY < this.pos.y + this.height){

			//remove
			if (patterns.length > 1){
				for (var i = 0; i < sequencerForm.sequence.length; i++){
					for (var j = 0; j < sequencerForm.sequence[i].length; j++){
							if (sequencerForm.sequence[i][j] === patterns[currentPattern]){
								sequencerForm.sequence[i][j] = undefined;
							}
					}
				}

				patterns.splice(currentPattern, 1);
				patternNames.splice(currentPattern, 1);
				patternImages.splice(currentPattern, 1);
				patternForm.updatePatternBox();
				currentPattern--
				if (currentPattern < 0) currentPattern = 0;
			}

		}
		
		patternForm.updatePatternBox();
		patternForm.render = true;
		this.pos = null;
	}
}







function PattImageMenu(){
	this.pos;
	this.width = 100;
	this.height = 48;
	this.savesound;

	this.show = function(){
		push();
			fill(220);
			stroke(0);
			rect(this.pos.x, this.pos.y, this.width, this.height);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + this.height * 0.37, this.pos.x + this.width, this.pos.y + this.height * 0.37);
			line(this.pos.x, this.pos.y + this.height * 0.7, this.pos.x + this.width, this.pos.y + this.height * 0.7);
			fill(0);
			strokeWeight(0);
			text("Copy", this.pos.x + this.width/2, this.pos.y + 13 );
			text("Paste", this.pos.x + this.width/2, this.pos.y + 30 );
			text("Clear", this.pos.x + this.width/2, this.pos.y + 45 );
		pop();
	}

	this.catch = function(){
		

		if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y && mouseY < this.pos.y + this.height * 0.37){

			//copy
			this.savesound = patterns[currentPattern][selectedSound];

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + this.height * 0.37 && mouseY < this.pos.y + this.height * 0.7){

			//paste
			if (this.savesound != undefined){

				if (this.savesound.isEuclidian){

					let src = this.savesound;
					let patt = []
					arrayCopy(src.pattern, 0, patt, 0, src.pattern.length);

					patterns[currentPattern][selectedSound] = {
						pattern: patt,
						isEuclidian: true,
						lastSeq: -1,
						counter: 0,
						note: src.note,
						patternSet: src.patternSet,
						hits: src.hits,
						rotation: src.rotation
					};



				} else {

					patterns[currentPattern][selectedSound] = [];			
					
					for (var j = 0; j < maxBeats; j++){
						patterns[currentPattern][selectedSound].push([]);
						let src = this.savesound[j];
						let dst = patterns[currentPattern][selectedSound][j];
					 	arrayCopy(src, 0, dst, 0, src.length);
				 	}
				}

			 	editPatternImage(currentPattern, selectedSound);
			}

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + this.height * 0.7 && mouseY < this.pos.y + this.height){

			
			patterns[currentPattern][selectedSound] = [];
			for (var i = 0; i < maxBeats; i++){
				patterns[currentPattern][selectedSound].push([]);
			}
			

			patternImages[currentPattern][selectedSound].image(stepImage, 0,0);

		}
		
		patternForm.render = true;
		this.pos = null;
	}
}





function ArpMenu(){
	this.pos;
	this.width = 90;
	this.height = 60;

	this.show = function(){
		push();
			fill(220)
			rect(this.pos.x, this.pos.y, this.width, this.height);
			line(this.pos.x, this.pos.y + this.height * 0.33, this.pos.x + this.width, this.pos.y + this.height * 0.33);
			line(this.pos.x, this.pos.y + this.height * 0.66 , this.pos.x + this.width, this.pos.y + this.height * 0.66);
			fill(0);
			textAlign(CENTER, CENTER);
			text("Clear all", this.pos.x + this.width/2, this.pos.y + this.height * 0.2);
			text("Remove current", this.pos.x + this.width/2, this.pos.y + this.height * 0.5);
			text("Remove last", this.pos.x + this.width/2, this.pos.y + this.height * 0.8);
		pop();
	}

	this.catch = function(){

		if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y && mouseY < this.pos.y + this.height * 0.33){
			
			sounds[selectedSound].arp = [];
			sounds[selectedSound].arpCounter = 0;
			sounds[selectedSound].arpKnob.set(0,0,0,1);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y + this.height * 0.33 && mouseY < this.pos.y + this.height * 0.66){

			sounds[selectedSound].arp.splice(sounds[selectedSound].arpKnob.value, 1);
			this.changeArpKnob();

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
			mouseY > this.pos.y + this.height * 0.66 && mouseY < this.pos.y + this.height){
			
			sounds[selectedSound].arp.pop();
			this.changeArpKnob();
		}

		patternForm.render = true;
		soundForm.render = true;
		this.pos = null;
	}

	this.changeArpKnob = function(){
		if (sounds[selectedSound].arp.length == 0 && sounds[selectedSound].arp.length == 0){
				sounds[selectedSound].arpCounter = 0;
			}

			let max = sounds[selectedSound].arp.length -1;
			if (sounds[selectedSound].arpKnob.value > max) sounds[selectedSound].arpKnob.value = max;
			if (sounds[selectedSound].arpKnob.value < 0) sounds[selectedSound].arpKnob.value = 0;

			sounds[selectedSound].arpKnob.set(0, max, sounds[selectedSound].arpKnob.value, 1);
	}
}






function SoundMenu(){
	this.pos;
	this.width = 180;
	this.height = 225;
	this.savesound;

	this.show = function(){
		push();
			fill(220);
			stroke(0);
			rect(this.pos.x, this.pos.y, this.width, this.height);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + 25, this.pos.x + this.width, this.pos.y + 25);
			strokeWeight(2);
			line(this.pos.x, this.pos.y + 50, this.pos.x + this.width, this.pos.y + 50);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + 75, this.pos.x + this.width, this.pos.y + 75);
			line(this.pos.x, this.pos.y + 95, this.pos.x + this.width, this.pos.y + 95);
			line(this.pos.x, this.pos.y + 115, this.pos.x + this.width, this.pos.y + 115);
			strokeWeight(2);
			line(this.pos.x, this.pos.y + 140, this.pos.x + this.width, this.pos.y + 140);
			strokeWeight(1);
			line(this.pos.x, this.pos.y + 165, this.pos.x + this.width, this.pos.y + 165);
			line(this.pos.x, this.pos.y + 185, this.pos.x + this.width, this.pos.y + 185);
			line(this.pos.x, this.pos.y + 205, this.pos.x + this.width, this.pos.y + 205);

			fill(0);
			strokeWeight(0);
			text("Piano roll", this.pos.x + this.width/2, this.pos.y + 20 );
			text("Euclidian generator", this.pos.x + this.width/2, this.pos.y + 40 );

			text("Copy Sound", this.pos.x + this.width/2, this.pos.y + 70 );
			text("Paste Sound", this.pos.x + this.width/2, this.pos.y + 90 );
			text("Export Sound", this.pos.x + this.width/2, this.pos.y + 110 );
			text("Import Sound", this.pos.x + this.width/2, this.pos.y + 130 );

			text("Fill all", this.pos.x + this.width/2, this.pos.y + 160);
			text("Fill every 2", this.pos.x + this.width/2, this.pos.y + 180);
			text("Fill every 4", this.pos.x + this.width/2, this.pos.y + 200);
			text("Fill every 8", this.pos.x + this.width/2, this.pos.y + 220);
		pop();
	}


	this.catch = function(){
		let fillPattern = 0;

		if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y && mouseY < this.pos.y + 25){

			//pianoForm
			if (patterns[currentPattern][selectedSound].isEuclidian){
				
				patterns[currentPattern][selectedSound] = [];
				for (var i = 0; i < maxBeats; i++){
					patterns[currentPattern][selectedSound].push([]);
				}
				editPatternImage(currentPattern, selectedSound);
			}

			pianoForm.inFront = true;
			pianoForm.list.y = pianoForm.maxRows / 2;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + 25 && mouseY < this.pos.y + 50){

			//euclidianForm
			euclidianForm.set(
				patternForm.patternbox.position().x + patternForm.patternbox.width + width * 0.01,
				insideTop + height * 0.01,
				soundForm.pos.w * 0.55,
				(height - insideTop) * 0.95,
			);
			euclidianForm.inFront = true;
			sounds[selectedSound].start();

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + 50&& mouseY < this.pos.y + 75){

			//copy
			this.savesound = selectedSound;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + 75 && mouseY < this.pos.y + 95){

			//paste
			if (this.savesound != undefined){
			 this.pastesound();
			}
		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + 95 && mouseY < this.pos.y + 115){

			//export soundfile
			savePreset(selectedSound);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + 115 && mouseY < this.pos.y + 140){

			//import soundfile
			menuBar.fileInput.elt.click();
			patternForm.render = true;

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + 140 && mouseY < this.pos.y + 165){
			this.fillPattern(1);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
				mouseY > this.pos.y + 165 && mouseY < this.pos.y + 185){
			this.fillPattern(2);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 
				mouseY > this.pos.y + 185 && mouseY < this.pos.y + 205){
			this.fillPattern(4);

		}else if(mouseX > this.pos.x && mouseX < this.pos.x + this.width && 			
			mouseY > this.pos.y + 205 && mouseY < this.pos.y + this.height){
			this.fillPattern(8);
		}
		
		background(40);
		sequencerForm.display();
		patternForm.display();
		this.pos = null;
	}

	this.fillPattern = function(fillPattern){
	
		for (var i = 0; i < maxBeats; i++){
			patterns[currentPattern][selectedSound][i] = [];
			if (i%fillPattern == 0){
				if (keyboardPolyNotes.length > 0){
					let src = keyboardPolyNotes;
					let dst = patterns[currentPattern][selectedSound][i];
			 		arrayCopy(src, 0, dst, 0, src.length);
				} else {
					patterns[currentPattern][selectedSound][i].push( 12 + (12 * menuBar.keyboardOctave.value) );
				}
			}
		}

		editPatternImage(currentPattern, selectedSound);
	}

	this.pastesound = function(){
		sounds[selectedSound].soundType.value = sounds[this.savesound].soundType.value;


		sounds[selectedSound].attackTime.value = sounds[this.savesound].attackTime.value;
		sounds[selectedSound].decayTime.value = sounds[this.savesound].decayTime.value;
		sounds[selectedSound].susPercent.value = sounds[this.savesound].susPercent.value;
		sounds[selectedSound].releaseTime.value = sounds[this.savesound].releaseTime.value;
		sounds[selectedSound].attackLevel.value = sounds[this.savesound].attackLevel.value;
		sounds[selectedSound].releaseLevel.value = sounds[this.savesound].releaseLevel.value;
		sounds[selectedSound].ADSRMultiplier.value = sounds[this.savesound].ADSRMultiplier.value;
		sounds[selectedSound].ADSRChance.value = sounds[this.savesound].ADSRChance.value;

		sounds[selectedSound].filterattackTime.value = sounds[this.savesound].filterattackTime.value;
		sounds[selectedSound].filterdecayTime.value = sounds[this.savesound].filterdecayTime.value;
		sounds[selectedSound].filtersusPercent.value = sounds[this.savesound].filtersusPercent.value;
		sounds[selectedSound].filterreleaseTime.value = sounds[this.savesound].filterreleaseTime.value;
		sounds[selectedSound].filterattackLevel.value = sounds[this.savesound].filterattackLevel.value;
		sounds[selectedSound].filterreleaseLevel.value = sounds[this.savesound].filterreleaseLevel.value;
		sounds[selectedSound].filterADSRMultiplier.value = sounds[this.savesound].filterADSRMultiplier.value;
		
		sounds[selectedSound].ADSRExpo.active = sounds[this.savesound].ADSRExpo.active;
		sounds[selectedSound].filterADSRExpo.active = sounds[this.savesound].filterADSRExpo.active;

		sounds[selectedSound].envOsc1.setExp(sounds[this.savesound].ADSRExpo.active);
		sounds[selectedSound].envOsc2.setExp(sounds[this.savesound].ADSRExpo.active);
		sounds[selectedSound].envOsc3.setExp(sounds[this.savesound].ADSRExpo.active);
		sounds[selectedSound].envNoise.setExp(sounds[this.savesound].ADSRExpo.active);
		sounds[selectedSound].envFilter.setExp(sounds[this.savesound].filterADSRExpo.active);
	

		sounds[selectedSound].osc1Detune.value = sounds[this.savesound].osc1Detune.value;
		sounds[selectedSound].osc1Wave.value = sounds[this.savesound].osc1Wave.value;
		sounds[selectedSound].osc2Detune.value = sounds[this.savesound].osc2Detune.value;
		sounds[selectedSound].osc2Octave.value = sounds[this.savesound].osc2Octave.value;
		sounds[selectedSound].osc2Wave.value = sounds[this.savesound].osc2Wave.value;
		sounds[selectedSound].osc3Amount.value = sounds[this.savesound].osc3Amount.value;
		sounds[selectedSound].osc3Detune.value = sounds[this.savesound].osc3Detune.value;
		sounds[selectedSound].osc3Octave.value = sounds[this.savesound].osc3Octave.value;
		sounds[selectedSound].osc3Wave.value = sounds[this.savesound].osc3Wave.value;

		sounds[selectedSound].RingMod.active = sounds[this.savesound].RingMod.active
		sounds[selectedSound].oscMix.value = sounds[this.savesound].oscMix.value
		sounds[selectedSound].rollingChords.value = sounds[this.savesound].rollingChords.value

		sounds[selectedSound].glideSelector.up = sounds[this.savesound].glideSelector.up;
		sounds[selectedSound].glideSelector.down = sounds[this.savesound].glideSelector.down;

		sounds[selectedSound].oscRamp.value = sounds[this.savesound].oscRamp.value

		sounds[selectedSound].LFO1Freq.value = sounds[this.savesound].LFO1Freq.value;
		sounds[selectedSound].LFO1Wave.value = sounds[this.savesound].LFO1Wave.value;
		sounds[selectedSound].LFO1Binder.value = sounds[this.savesound].LFO1Binder.value;
		sounds[selectedSound].LFO1Link.value = sounds[this.savesound].LFO1Link.value;

		if (sounds[selectedSound].LFO1Binder.value == 2) {
			sounds[selectedSound].LFO1Amount.set(-900, 900, sounds[this.savesound].LFO1Amount.value, 1);
		}else{
			
			sounds[selectedSound].LFO1Amount.set(-100, 100, sounds[this.savesound].LFO1Amount.value, 0.1);
		}
			
		
		sounds[selectedSound].LFO2Freq.value = sounds[this.savesound].LFO2Freq.value;
		sounds[selectedSound].LFO2Amount.value = sounds[this.savesound].LFO2Amount.value;
		sounds[selectedSound].LFO2Wave.value = sounds[this.savesound].LFO2Wave.value;
		sounds[selectedSound].LFO2Link.value = sounds[this.savesound].LFO2Link.value;

		sounds[selectedSound].LFO2Binder.value = sounds[this.savesound].LFO2Binder.value;
		if (sounds[selectedSound].LFO2Binder.value == 2) {
			sounds[selectedSound].LFO2Amount.set(-900, 900, sounds[this.savesound].LFO2Amount.value, 1);
		}else{
			
			sounds[selectedSound].LFO2Amount.set(-100, 100, sounds[this.savesound].LFO2Amount.value, 0.1);
		}
		

		sounds[selectedSound].filterFreq.value = sounds[this.savesound].filterFreq.value;
		sounds[selectedSound].filterRes.value = sounds[this.savesound].filterRes.value;
		sounds[selectedSound].filterGain.value = sounds[this.savesound].filterGain.value;
		sounds[selectedSound].filterType.value = sounds[this.savesound].filterType.value;
		sounds[selectedSound].filterLink.value = sounds[this.savesound].filterLink.value;

		sounds[selectedSound].distortionAmount.value = sounds[this.savesound].distortionAmount.value;
		sounds[selectedSound].distortionSampling.value = sounds[this.savesound].distortionSampling.value;

		sounds[selectedSound].delayTime.value = sounds[this.savesound].delayTime.value;
		sounds[selectedSound].delayFeedback.value = sounds[this.savesound].delayFeedback.value;
		sounds[selectedSound].delayFilterFreq.value = sounds[this.savesound].delayFilterFreq.value;

		sounds[selectedSound].sampleStart.value = sounds[this.savesound].sampleStart.value;
		sounds[selectedSound].sampleStop.value = sounds[this.savesound].sampleStop.value;
		sounds[selectedSound].sampleTune.value = sounds[this.savesound].sampleTune.value;
		
		
		sounds[selectedSound].arp = [];
		for (var i = 0; i < sounds[this.savesound].arp.length; i++){
			sounds[selectedSound].arp.push(sounds[this.savesound].arp[i])
		}

		
		sounds[selectedSound].arpButton.active = sounds[this.savesound].arpButton.active;
		sounds[selectedSound].arpSelector.direction = sounds[this.savesound].arpSelector.direction;
		sounds[selectedSound].arpSelector.valueReturn = sounds[this.savesound].arpSelector.valueReturn;
		sounds[selectedSound].arpSelector.valueOpposite = sounds[this.savesound].arpSelector.valueOpposite;
		sounds[selectedSound].arpSelector.valueRandom = sounds[this.savesound].arpSelector.valueRandom;


		if(sounds[this.savesound].sample.duration() > 0){
			var buff = [];
				buff[0] = sounds[this.savesound].sample.buffer.getChannelData(0);
		 		buff[1] = sounds[this.savesound].sample.buffer.getChannelData(1);
			sounds[selectedSound].sample.setBuffer(buff);
			SampleLoaded();
		}

		sounds[selectedSound].osc1wavearray = sounds[this.savesound].osc1wavearray;
		sounds[selectedSound].osc2wavearray = sounds[this.savesound].osc2wavearray;
		sounds[selectedSound].osc3wavearray = sounds[this.savesound].osc3wavearray;
		sounds[selectedSound].LFO1wavearray = sounds[this.savesound].LFO1wavearray;
		sounds[selectedSound].LFO2wavearray = sounds[this.savesound].LFO2wavearray;

		sounds[selectedSound].start();

		if (sounds[selectedSound].osc1Wave.value == 4){
			sounds[selectedSound].osc1Wave.array = sounds[selectedSound].osc1wavearray;
			waveForm.updateWave(sounds[selectedSound].osc1Wave.array, sounds[selectedSound].osc1.oscillator);
						
		}

		if (sounds[selectedSound].osc2Wave.value == 4){
			sounds[selectedSound].osc2Wave.array = sounds[selectedSound].osc2wavearray;
			waveForm.updateWave(sounds[selectedSound].osc2Wave.array, sounds[selectedSound].osc2.oscillator);
		}
		
		if (sounds[selectedSound].osc3Wave.value == 4){
			sounds[selectedSound].osc3Wave.array = sounds[selectedSound].osc3wavearray;
			waveForm.updateWave(sounds[selectedSound].osc3Wave.array, sounds[selectedSound].osc3.oscillator);
		}
		
		if (sounds[selectedSound].LFO1Wave.value == 4){
			sounds[selectedSound].LFO1Wave.array = sounds[selectedSound].LFO1wavearray;
			waveForm.updateWave(sounds[selectedSound].LFO1Wave.array, sounds[selectedSound].LFO1.oscillator);
		}
		
		if (sounds[selectedSound].LFO2Wave.value == 4){
			sounds[selectedSound].LFO2Wave.array = sounds[selectedSound].LFO2wavearray;
			waveForm.updateWave(sounds[selectedSound].LFO2Wave.array, sounds[selectedSound].LFO2.oscillator);
		}

		
		sounds[selectedSound].label = sounds[this.savesound].label + " - Copy"


		sounds[selectedSound].waveChange();
		sounds[selectedSound].knobs.forEach((knob)=>{
			knob.fnx();
		});
		sounds[selectedSound].setADSRValues();
		sounds[selectedSound].setADSRRange();
		sounds[selectedSound].setFilterType();
		sounds[selectedSound].setNoiseType();
		sounds[selectedSound].bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
		sounds[selectedSound].bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
		sounds[selectedSound].connectRingMod();
		

	}
}








// oooooooooooo ooooooooooooo ooooooooooooo 
// `888'     `8 8'   888   `8 8'   888   `8 
//  888              888           888      
//  888oooo8         888           888      
//  888    "         888           888      
//  888              888           888      
// o888o            o888o         o888o     
                                         
                                         
                                         
//   .oooooo.                   .                              .   
//  d8P'  `Y8b                .o8                            .o8   
// 888      888 oooo  oooo  .o888oo oo.ooooo.  oooo  oooo  .o888oo 
// 888      888 `888  `888    888    888' `88b `888  `888    888   
// 888      888  888   888    888    888   888  888   888    888   
// `88b    d88'  888   888    888 .  888   888  888   888    888 . 
//  `Y8bood8P'   `V88V"V8P'   "888"  888bod8P'  `V88V"V8P'   "888" 
//                                   888                           
//                                  o888o                          


function OutputVisualizer(){
	this.pos = createVector(0,0);
	this.width;
	this.height;
	this.timeout = 5;
	this.waveform;
	this.spectrum;

	this.display = function(){
		push();
			
			this.waveform = fft.waveform();

		  	noFill();
		  	stroke(50);
		  	rect(this.pos.x, this.pos.y, this.width, this.height);
		  	
		  	stroke(188, 90, 18);
		  	strokeWeight(3);

		  	if (menuBar.performanceModeButton.active) {

		  		let halfheight = (height-insideTop)/2;

		  		beginShape();
				  	for (var i = 0; i < this.waveform.length; i += 4){
					    var x = map(i, 0, this.waveform.length - 1, 0, width * 0.8) + width * 0.1;
				    	var y = map( this.waveform[i], -1, 1, -halfheight * 0.9, halfheight * 0.9);
				    	y += insideTop + halfheight;
				    	vertex(x,y);
				  	}
			  	endShape();

		  	} else if (!menuBar.visualizerButton.active){
		  		
		  		beginShape();
				  	for (var i = 0; i < this.waveform.length; i ++){
					    var x = map(i, 0, this.waveform.length - 1, 3, this.width - 1);
				    	var y = map( this.waveform[i], -1, 1, -this.height/2 + 5, this.height/2 -5);
				    	y = constrain(y, -this.height/2 + 5, this.height/2 -5);

				    	vertex(this.pos.x + x, this.pos.y + this.height/2 + y);
				  	}
			  	endShape();
			}

		  	// //extra volume gauge
		  	stroke(0);
		  	strokeWeight( 0.5 );
		  	var level = map( volumeLevel.getLevel(), 0, 1, 0, this.height);
		  	rect(this.pos.x + this.width, this.pos.y , this.width / 8, this.height +1);
		  	fill(188, 90, 18, 180);
		  	rect(this.pos.x + this.width, this.pos.y + (this.height - level) , this.width / 8, level);
		pop();
	}
}








//       .o.                         .o8   o8o            
//      .888.                       "888   `"'            
//     .8"888.     oooo  oooo   .oooo888  oooo   .ooooo.  
//    .8' `888.    `888  `888  d88' `888  `888  d88' `88b 
//   .88ooo8888.    888   888  888   888   888  888   888 
//  .8'     `888.   888   888  888   888   888  888   888 
// o88o     o8888o  `V88V"V8P' `Y8bod88P" o888o `Y8bod8P' 
                                                       
                                                       
                                                       
// oooooo     oooo  o8o                                 oooo   o8o                                
//  `888.     .8'   `"'                                 `888   `"'                                
//   `888.   .8'   oooo   .oooo.o oooo  oooo   .oooo.    888  oooo    oooooooo  .ooooo.  oooo d8b 
//    `888. .8'    `888  d88(  "8 `888  `888  `P  )88b   888  `888   d'""7d8P  d88' `88b `888""8P 
//     `888.8'      888  `"Y88b.   888   888   .oP"888   888   888     .d8P'   888ooo888  888     
//      `888'       888  o.  )88b  888   888  d8(  888   888   888   .d8P'  .P 888    .o  888     
//       `8'       o888o 8""888P'  `V88V"V8P' `Y888""8o o888o o888o d8888888P  `Y8bod8P' d888b    
                                                                                               
                                                                                               
                                                                                               
//   .oooo.   oooooooooo.   
// .dP""Y88b  `888'   `Y8b  
//       ]8P'  888      888 
//     <88b.   888      888 
//      `88b.  888      888 
// o.   .88P   888     d88' 
// `8bd88P'   o888bood8P'   






class AudioVisualizer3D{
	
	constructor(x,y,w,h){
		
		this.cameraDistance = 6000;
		this.cameraHeight = 1800
		this.cameraAngle = 2.3690;
		this.cameraAngleIncrement = 0.0025;

		this.wavesize = 128;
		this.wavesizescalar = 40;
		
		this.waveforms = new Array(this.wavesize);
		for (let i = 0; i < this.waveforms.length; i++){
			this.waveforms[i] = new Array(this.wavesize).fill(0);
		}

		this.wavelines = [];
		
		
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.renderer.setSize(windowWidth, windowHeight - 5);
		this.renderer.setClearColor(new THREE.Color("rgb(40, 40, 40)"));
		document.body.appendChild(this.renderer.domElement);
		
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.left = x;
		this.renderer.domElement.style.top = y;
		this.renderer.domElement.width = w;
		this.renderer.domElement.style.height = windowHeight - insideTop - 20;

		this.renderer.domElement.style.display = "none"

		this.renderer.domElement.onmousewheel = (e)=>{
			this.mousescroll(e.deltaY * 0.5);
		}
		
		
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(45, windowWidth / (windowHeight - 10), 0.1, 20000);
		this.camera.rotation.order = "YXZ"
		
		this.scene.add(new THREE.AmbientLight(0x606059, 1));
		
		
		for (let i = 0; i < this.wavesize; i++){
		
			let wavemat = new THREE.ShaderMaterial({
				uniforms: {
					wavesize: {
						value: this.wavesize * (this.wavesizescalar/4)
					},
					wavearray: {
						type: "fv1",
						value: this.waveforms[i]
					},
					lowcolor: {
						value: new THREE.Color("hsl(13, 100%, 50%)")
					},
						highcolor: {
						value: new THREE.Color("hsl(60, 100%, 50%)")
					}
				},
				vertexShader: document.getElementById('vertexShader').textContent,
				fragmentShader: document.getElementById('fragmentShader').textContent
			});

			let wavegeo = new THREE.BufferGeometry();
			let verts = [];
			let index = [];

			for (var j = 0; j < this.wavesize; j++){
				verts.push(i * this.wavesizescalar);
				verts.push(0);
				verts.push(j * this. wavesizescalar);

				index.push(j)
			}
		
			wavegeo.addAttribute('position', new THREE.Float32BufferAttribute( verts, 3 ));
			wavegeo.addAttribute('pindex', new THREE.Float32BufferAttribute( index, 1 ));

			let waveline = new THREE.Line(wavegeo, wavemat);
			waveline.position.x -= this.wavesize/2 * this.wavesizescalar;
			waveline.position.z -= this.wavesize/2 * this.wavesizescalar;

			this.scene.add(waveline);	
			this.wavelines.push(waveline);
		}
		
		this.moveCamera();
	}
	
	display(){
		
		//if (frameCount%3 != 0) return;

		let wave = fft.waveform();
		this.waveforms.splice(0,0,wave);
		this.waveforms.pop();

		this.wavelines.forEach((line, i)=>{
			line.material.uniforms.wavearray =  {
					type: "fv1",
					value: this.waveforms[i]
				}
		});
		
		this.renderer.render(this.scene, this.camera);
	}
	
	moveCamera(){
		let x = this.cameraDistance * cos(this.cameraAngle)
		let z = this.cameraDistance * sin(this.cameraAngle)

		this.camera.position.set(x, this.cameraHeight, z);
		this.camera.lookAt(new THREE.Vector3(0, this.cameraHeight * 0.1, 0));
	}
	
	drag(amountX, amountY){
		this.cameraHeight = constrain(this.cameraHeight - amountY * 4, 2, 8000);
		this.cameraAngle += amountX * -0.001;
		this.moveCamera();
	}
	
	mousescroll(amount){
		this.cameraDistance = constrain(this.cameraDistance + amount * 4, 0, 10000);
		this.moveCamera();
	}

	resize(x,y,w,h){
		this.renderer.domElement.style.left = x;
		this.renderer.domElement.style.top = y;
		this.renderer.domElement.style.height = windowHeight - insideTop;
		this.renderer.domElement.style.width = w;

		this.camera = new THREE.PerspectiveCamera(45, windowWidth / (windowHeight - 10), 0.1, 20000);
		this.camera.rotation.order = "YXZ"

		this.moveCamera();
	}
}











