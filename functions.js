

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

	background(backGroundColor);
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

