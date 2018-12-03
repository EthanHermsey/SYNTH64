


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
	this.patternbox.style('font-family', 'Montserrat');

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
	this.addbutton.style('font-family', 'Montserrat');

	this.patternName = createInput().hide();
	this.patternName.style('font-family', 'Montserrat');
	
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


//  .oooooo..o     .                        oooooooooo.                  .       .                         
// d8P'    `Y8   .o8                        `888'   `Y8b               .o8     .o8                         
// Y88bo.      .o888oo  .ooooo.  oo.ooooo.   888     888 oooo  oooo  .o888oo .o888oo  .ooooo.  ooo. .oo.   
//  `"Y8888o.    888   d88' `88b  888' `88b  888oooo888' `888  `888    888     888   d88' `88b `888P"Y88b  
//      `"Y88b   888   888ooo888  888   888  888    `88b  888   888    888     888   888   888  888   888  
// oo     .d8P   888 . 888    .o  888   888  888    .88P  888   888    888 .   888 . 888   888  888   888  
// 8""88888P'    "888" `Y8bod8P'  888bod8P' o888bood8P'   `V88V"V8P'   "888"   "888" `Y8bod8P' o888o o888o 
//                                888                                                                      
//                               o888o                                                                    
// beat indicator in patternform :s


function StepButtonObject(x,y,s, i, a){
	this.pos = createVector(x,y);
	this.width = s;
	this.height = 0;
}
