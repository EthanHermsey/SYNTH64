



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




