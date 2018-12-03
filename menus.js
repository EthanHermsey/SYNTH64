

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
		
		background(backGroundColor);
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
	
		sounds[selectedSound].osc1DetuneCoarse.value = sounds[this.savesound].osc1DetuneCoarse.value;
		sounds[selectedSound].osc1DetuneFine.value = sounds[this.savesound].osc1DetuneFine.value;
		sounds[selectedSound].osc1Wave.value = sounds[this.savesound].osc1Wave.value;

		sounds[selectedSound].osc2DetuneCoarse.value = sounds[this.savesound].osc2DetuneCoarse.value;
		sounds[selectedSound].osc2DetuneFine.value = sounds[this.savesound].osc2DetuneFine.value;
		sounds[selectedSound].osc2Wave.value = sounds[this.savesound].osc2Wave.value;
		
		sounds[selectedSound].osc3Amount.value = sounds[this.savesound].osc3Amount.value;
		sounds[selectedSound].osc3DetuneCoarse.value = sounds[this.savesound].osc3DetuneCoarse.value;
		sounds[selectedSound].osc3DetuneFine.value = sounds[this.savesound].osc3DetuneFine.value;
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


