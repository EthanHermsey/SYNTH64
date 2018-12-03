

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

