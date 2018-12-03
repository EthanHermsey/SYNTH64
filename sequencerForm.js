


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


