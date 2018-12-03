

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


