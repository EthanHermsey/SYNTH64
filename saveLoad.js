
                                         
                                         
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

		json.osc1DetuneCoarse = sounds[i].osc1DetuneCoarse.value;
		json.osc1DetuneFine = sounds[i].osc1DetuneFine.value;
		json.osc1Wave = sounds[i].osc1Wave.value;

		json.osc2DetuneCoarse = sounds[i].osc2DetuneCoarse.value;
		json.osc2DetuneFine = sounds[i].osc2DetuneFine.value;
		json.osc2Wave = sounds[i].osc2Wave.value;

		json.osc3Amount = sounds[i].osc3Amount.value;
		json.osc3DetuneCoarse = sounds[i].osc3DetuneCoarse.value;
		json.osc3DetuneFine = sounds[i].osc3DetuneFine.value;
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

		json.osc1DetuneCoarse = sounds[i].osc1DetuneCoarse.value;
		json.osc1DetuneFine = sounds[i].osc1DetuneFine.value;
		json.osc1Wave = sounds[i].osc1Wave.value;

		json.osc2DetuneCoarse = sounds[i].osc2DetuneCoarse.value;
		json.osc2DetuneFine = sounds[i].osc2DetuneFine.value;
		json.osc2Wave = sounds[i].osc2Wave.value;

		json.osc3Amount = sounds[i].osc3Amount.value;
		json.osc3DetuneCoarse = sounds[i].osc3DetuneCoarse.value;
		json.osc3DetuneFine = sounds[i].osc3DetuneFine.value;
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

		if (jsonfile[i].osc1Detune != undefined){
			sounds[i].osc1DetuneFine.value = jsonfile[i].osc1Detune;
			sounds[i].osc1DetuneCoarse.value = sounds[i].osc1DetuneCoarse.startValue;
		} else {
			sounds[i].osc1DetuneCoarse.value = jsonfile[i].osc1DetuneCoarse;
			sounds[i].osc1DetuneFine.value = jsonfile[i].osc1DetuneFine;
		}
		if (jsonfile[i].osc2Detune != undefined){
			sounds[i].osc2DetuneCoarse.value = jsonfile[i].osc2Octave * 12;
			sounds[i].osc2DetuneFine.value = jsonfile[i].osc2Detune;
		} else {
			sounds[i].osc2DetuneCoarse.value = jsonfile[i].osc2DetuneCoarse;
			sounds[i].osc2DetuneFine.value = jsonfile[i].osc2DetuneFine;
		}	
		
		if (jsonfile[i].osc3Amount != undefined) sounds[i].osc3Amount.value = jsonfile[i].osc3Amount;
		if (jsonfile[i].osc3Octave != undefined){
			sounds[i].osc3DetuneCoarse.value = jsonfile[i].osc3Octave * 12;
			sounds[i].osc3DetuneFine.value = 0;
		} else {
			sounds[i].osc3DetuneCoarse.value = jsonfile[i].osc3DetuneCoarse;
			sounds[i].osc3DetuneFine.value = jsonfile[i].osc3DetuneFine;
		}

		
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


	if (jsonfile.osc1Detune != undefined){
		sounds[selectedSound].osc1DetuneFine.value = jsonfile.osc1Detune;
		sounds[selectedSound].osc1DetuneCoarse.value = sounds[selectedSound].osc1DetuneCoarse.startValue;
	} else {
		sounds[selectedSound].osc1DetuneCoarse.value = jsonfile.osc1DetuneCoarse;
		sounds[selectedSound].osc1DetuneFine.value = jsonfile.osc1DetuneFine;
	}
	if (jsonfile.osc2Detune != undefined){
		sounds[selectedSound].osc2DetuneFine.value = jsonfile.osc2Detune;
		sounds[selectedSound].osc2DetuneCoarse.value = (jsonfile.osc2Octave * 12) || 0;
	} else {
		sounds[selectedSound].osc2DetuneCoarse.value = jsonfile.osc2DetuneCoarse;
		sounds[selectedSound].osc2DetuneFine.value = jsonfile.osc2DetuneFine;
	}	
	
	if (jsonfile.osc3Amount != undefined) sounds[selectedSound].osc3Amount.value = jsonfile.osc3Amount;
	
	if (jsonfile.osc3Octave != undefined){
		sounds[selectedSound].osc3DetuneFine.value = 0;
		sounds[selectedSound].osc3DetuneCoarse.value = (jsonfile.osc3Octave * 12) || 0;
	} else {
		sounds[selectedSound].osc3DetuneCoarse.value = jsonfile.osc3DetuneCoarse;
		sounds[selectedSound].osc3DetuneFine.value = jsonfile.osc3DetuneFine;
	}

	
	
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



