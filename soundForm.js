
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
	this.nameText.style('font-family', 'Montserrat');
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
	this.presets.style('font-family', 'Montserrat');

	this.envelopeSelect = createSelect().hide();
	this.envelopeSelect.option("Sound");
	this.envelopeSelect.option("Filter");
	this.envelopeSelect.changed(()=>{this.render = true});
	this.envelopeSelect.style('font-family', 'Montserrat');

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
					sounds[selectedSound].osc1DetuneCoarse.pos = createVector(this.pos.x + this.leftwidth * 0.26, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc1DetuneCoarse.size = knobSize;
					sounds[selectedSound].osc1DetuneFine.pos = createVector(this.pos.x + this.leftwidth * 0.34, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc1DetuneFine.size = knobSize;
					sounds[selectedSound].osc1Wave.width = (this.leftwidth - 20) / 2.6;
					sounds[selectedSound].osc1Wave.height = this.threeheight / 12;
					sounds[selectedSound].osc1Wave.pos = createVector(this.pos.x + this.leftwidth * 0.22 - sounds[selectedSound].osc1Wave.width / 2 , this.formtop + this.threeheight * 0.43);

					sounds[selectedSound].osc2DetuneCoarse.pos = createVector(this.pos.x + this.leftwidth * 0.75, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc2DetuneCoarse.size = knobSize;
					sounds[selectedSound].osc2DetuneFine.pos = createVector(this.pos.x + this.leftwidth * 0.83, this.formtop + this.threeheight * 0.2);
					sounds[selectedSound].osc2DetuneFine.size = knobSize;
					sounds[selectedSound].osc2Wave.width = (this.leftwidth - 20) / 2.6;
					sounds[selectedSound].osc2Wave.height = this.threeheight / 12;
					sounds[selectedSound].osc2Wave.pos = createVector(this.pos.x + this.leftwidth * 0.78 - sounds[selectedSound].osc1Wave.width / 2 , this.formtop + this.threeheight * 0.43);

			 		sounds[selectedSound].osc3Amount.pos = createVector( this.pos.x + this.leftwidth * 0.26, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3Amount.size = knobSize;
			 		sounds[selectedSound].osc3DetuneCoarse.pos = createVector( this.pos.x + this.leftwidth * 0.34, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3DetuneCoarse.size = knobSize;
			 		sounds[selectedSound].osc3DetuneFine.pos = createVector( this.pos.x + this.leftwidth * 0.42, this.formtop + this.threeheight * 0.65 );
			 		sounds[selectedSound].osc3DetuneFine.size = knobSize;
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
				
				sounds[selectedSound].osc1DetuneCoarse.display();
				sounds[selectedSound].osc1DetuneFine.display();
	    		sounds[selectedSound].osc1Wave.display();

				sounds[selectedSound].osc2DetuneCoarse.display();
				sounds[selectedSound].osc2DetuneFine.display();
				sounds[selectedSound].osc2Wave.display();

				sounds[selectedSound].osc3Amount.display();
				sounds[selectedSound].osc3DetuneCoarse.display();
				sounds[selectedSound].osc3DetuneFine.display();
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
			background(backGroundColor)
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


