

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

	this.placeMode = undefined;

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

				// patterns[currentPattern][selectedSound][x].forEach((note, index)=>{
				// 	if (note == y + 24) patterns[currentPattern][selectedSound][x].splice(index, 1);
				// });

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
				 		if (note == 24 + y) {
							if (this.placeMode != 'placing'){
								patterns[currentPattern][selectedSound][x].splice(index, 1);
								this.placeMode = 'removing';
							}
							found = true;
						}
				 	});
				 	
				 	if (this.placeMode != 'removing' && !found && patterns[currentPattern][selectedSound][x].length < 3){
				 		patterns[currentPattern][selectedSound][x].push(24 + y);
						patterns[currentPattern][selectedSound][x].sort((a,b)=>a>b);
						this.placeMode = 'placing';
				 	}			 	
				 	if (this.placeMode != 'removing') sounds[selectedSound].playNote( 24 + y );	
				}
			 	
			 	
			}

			editPatternImage(currentPattern, selectedSound);
		}

		if ( (mouseX < this.pos.x || mouseX > this.pos.x + this.pos.w ||
			(mouseY < this.pos.y && mouseY > menuBar.pos.h) || mouseY > this.pos.y + this.pos.h) ){ //outside form

			//save image and data
			this.resetSelection();
			this.inFront = false;
			background(backGroundColor)
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
		this.placeMode = undefined;
		
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


