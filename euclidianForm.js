

// oooooooooooo                       oooo   o8o        .o8   o8o                        oooooooooooo                                      
// `888'     `8                       `888   `"'       "888   `"'                        `888'     `8                                      
//  888         oooo  oooo   .ooooo.   888  oooo   .oooo888  oooo   .oooo.   ooo. .oo.    888          .ooooo.  oooo d8b ooo. .oo.  .oo.   
//  888oooo8    `888  `888  d88' `"Y8  888  `888  d88' `888  `888  `P  )88b  `888P"Y88b   888oooo8    d88' `88b `888""8P `888P"Y88bP"Y88b  
//  888    "     888   888  888        888   888  888   888   888   .oP"888   888   888   888    "    888   888  888      888   888   888  
//  888       o  888   888  888   .o8  888   888  888   888   888  d8(  888   888   888   888         888   888  888      888   888   888  
// o888ooooood8  `V88V"V8P' `Y8bod8P' o888o o888o `Y8bod88P" o888o `Y888""8o o888o o888o o888o        `Y8bod8P' d888b    o888o o888o o888o 







class EuclidianForm {

	constructor() {
		
		this.inFront = false;
		this.output = [];

		this.patternSet = 0;

	}

	display() {
		push();
			fill(formBackGroundColor);
			stroke(0, 180);
			strokeWeight(3);
			rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);

			//menu bar
			fill(titleBarColor);
			stroke(0);
			strokeWeight(0.5);
			rect(this.pos.x + 1, this.pos.y + 1, this.pos.w - 2, this.pos.h / 20);
			//title
			textSize(this.pos.h / 26);
			textAlign(LEFT);
			textStyle(BOLD);
			strokeWeight( .8 );
			fill(0, 120);
			text("EUCLIDIAN RYTHM GENERATOR", this.pos.x + this.pos.w / 40, this.pos.y + this.pos.h / 25);
			textStyle(NORMAL);
			
		
			//background
			fill(formBackGroundColor + 30);
			stroke(40);
			strokeWeight(2.3)
			rect(this.pos.x + this.pos.w * 0.05, this.pos.y + this.pos.h * 0.1, this.pos.w * 0.9, this.pos.h * 0.7);
			
			//euclidian drawing 
			stroke(0);
			strokeWeight(2.4)
			noFill();
			
			let top = -HALF_PI;
			let pattern = patterns[currentPattern][selectedSound].pattern;

			//startpoint
			let startx = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(top);
			let starty = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(top);
			line(startx, starty - min(this.pos.w, this.pos.h) * 0.045, startx, starty - min(this.pos.w, this.pos.h) * 0.09)

			//actual zero after rotating
			let zerox = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.42 * cos(this.rotateKnob.value * (TWO_PI / pattern.length) + top);
			let zeroy = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.42 * sin(this.rotateKnob.value * (TWO_PI / pattern.length) + top);
			ellipse(zerox, zeroy, min(this.pos.w, this.pos.h) * 0.05);

			beginShape();
				for (var i = 0; i < pattern.length; i++) {
					let x = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(i * (TWO_PI / pattern.length) + top);
					let y = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(i * (TWO_PI / pattern.length) + top);
					vertex(x, y);
				}		
			endShape(CLOSE)
			
			stroke(0);
			beginShape();
				for (var i = 0; i < pattern.length; i++) {
					let x = this.rotateKnob.pos.x + min(this.pos.w, this.pos.h) * 0.35 * cos(i * (TWO_PI / pattern.length) + top);
					let y = this.rotateKnob.pos.y + min(this.pos.w, this.pos.h) * 0.35 * sin(i * (TWO_PI / pattern.length) + top);
					if (pattern[i] != this.patternSet){
						if (i == patterns[currentPattern][selectedSound].counter) {
							fill(188, 90, 18);
						} else {
							fill(formBackGroundColor + 30);
						}
					} else {
						fill(0);
					}
					
					ellipse(x, y, (min(width, height) * 0.015 ) + (pattern[i] != this.patternSet) * (min(width, height) * 0.02));
					if (pattern[i] != this.patternSet) vertex(x, y);
				}
			noFill();
			endShape(CLOSE);
			

			//A/B selector set
			fill(200);
			strokeWeight(1);
			rect( this.pos.x + this.pos.w/2 - this.pos.w * 0.15, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.3, this.pos.h * 0.05);
			fill(100);
			if (this.patternSet == 0){
				rect(this.pos.x + this.pos.w/2 - this.pos.w * 0.15, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.15, this.pos.h * 0.05);
			} else {
				rect(this.pos.x + this.pos.w/2, this.pos.y + this.pos.h * 0.92, this.pos.w * 0.15, this.pos.h * 0.05);
			}
			
			if (mouseIsPressed){
				if (mouseX > this.pos.x + this.pos.w/2 - this.pos.w * 0.15 && mouseX < this.pos.x + this.pos.w/2 &&
						mouseY > this.pos.y + this.pos.h * 0.92 && mouseY < this.pos.y + this.pos.h * 0.97){
					this.patternSet = 0;
					this.setPattern();
					
				} else if (mouseX > this.pos.x + this.pos.w/2 && mouseX < this.pos.x + this.pos.w/2 + this.pos.w * 0.15 &&
									mouseY > this.pos.y + this.pos.h * 0.92 && mouseY < this.pos.y + this.pos.h * 0.97){
					this.patternSet = 1;
					this.setPattern();
				}
			}
			
			textSize(this.pos.h * 0.04);
			textAlign(CENTER);
			noStroke();
			fill(0);
			text("A", this.pos.x + this.pos.w/2 - this.pos.w * 0.075, this.pos.y + this.pos.h * 0.96);
			text("B", this.pos.x + this.pos.w/2 + this.pos.w * 0.075, this.pos.y + this.pos.h * 0.96);
			

		pop();

		this.noteKnob.display(true);
		this.hitKnob.display();
		this.stepKnob.display();
		this.rotateKnob.display();


	}

	set(x, y, w, h){
		this.pos = createVector(x,y);
		this.pos.w = w;
		this.pos.h = h;
		
		this.noteKnob = new KnobObject(this.pos.x + this.pos.w * 0.75, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "NOTE", ()=>{
			this.setPattern();
		});

		this.hitKnob = new KnobObject(this.pos.x + this.pos.w * 0.25, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "HIT", ()=>{
			this.setPattern();
		});
		this.stepKnob = new KnobObject(this.pos.x + this.pos.w / 2, this.pos.y + this.pos.h * 0.85, this.pos.w * 0.06, "STEP", ()=>{
			this.hitKnob.set(1, this.stepKnob.value, min(this.stepKnob.value, this.hitKnob.value), 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value,  min(this.stepKnob.value, this.rotateKnob.value), 1);
			this.setPattern();
		});
		
		
		this.rotateKnob = new KnobObject(this.pos.x + this.pos.w * 0.5, this.pos.y + this.pos.h * 0.45, this.pos.w * 0.06, "", ()=>{
				this.setPattern();
		});

		if (!patterns[currentPattern][selectedSound].isEuclidian){
			this.patternSet = 0;
			this.noteKnob.set(21, 108, 48, 1);
			this.stepKnob.set(1, 128, 8, 1);
			this.hitKnob.set(1, this.stepKnob.value, 4, 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value, 0, 1);

			this.setPattern();
		} else {
			this.patternSet = patterns[currentPattern][selectedSound].patternSet;
			this.noteKnob.set(21, 108, patterns[currentPattern][selectedSound].note, 1);
			this.stepKnob.set(1, 128, patterns[currentPattern][selectedSound].pattern.length, 1);
			this.hitKnob.set(1, this.stepKnob.value, patterns[currentPattern][selectedSound].hits, 1);
			this.rotateKnob.set(-this.stepKnob.value, this.stepKnob.value, patterns[currentPattern][selectedSound].rotation, 1);

		}
	}

	setPattern(){

		patterns[currentPattern][selectedSound] = {
			pattern: this.generateEuclidianPattern(this.hitKnob.value, this.stepKnob.value, this.rotateKnob.value),
			isEuclidian: true,
			lastSeq: -1,
			counter: patterns[currentPattern][selectedSound].counter || 0,
			note: this.noteKnob.value,
			patternSet: this.patternSet,
			hits: this.hitKnob.value,
			rotation: this.rotateKnob.value
		};

		editPatternImage(currentPattern, selectedSound);

    }
    
    generateEuclidianPattern(pulses, steps, rotation) {

		let pattern = [];
		let bucket = [];

		let remainder = new Array(steps - pulses);
		remainder.fill(0);

		let hits = new Array(pulses);
		hits.fill(1);

		if (pulses == 1){
			pattern = hits;
			pattern = pattern.concat(remainder);
			
		} else {
		
			//divide
			let found = false;
			do {
				do {
					bucket.push(hits[0] + "" + remainder[0]);
					hits.splice(0, 1);
					remainder.splice(0, 1);
				} while (hits.length > 0 && remainder.length > 0);

				if (hits.length > 0) remainder = hits;

				if (remainder.length <= 1) {
					found = true;
					bucket = bucket.concat(remainder);
				} else {
					hits = bucket;
					bucket = [];
				}
			} while (found == false);
		
			//build
			bucket.forEach((seq) => {
				if (seq.length > 1){
					seq = seq.split("");
				} else {
					seq = [seq];
				}
				seq.forEach((hit) => {
					pattern.push(Number(hit));
				});
			});
		}
	
	
		//rotate
		if (rotation < 0) rotation += steps;
		for (let i = 0; i < rotation; i++) {
			pattern.splice(0, 0, pattern.pop());
		}

		return pattern;
	}
	
	catch(){
		if (mouseX < this.pos.x || mouseX > this.pos.x + this.pos.w ||
			mouseY < this.pos.y || mouseY > this.pos.y + this.pos.h){
			
			this.inFront = false;
			
			background(backGroundColor)
			sequencerForm.display();
			patternForm.display();
			return;
		}

		this.hitKnob.catch();
		this.stepKnob.catch();
		this.rotateKnob.catch();		
		this.noteKnob.catch();
	}
	
	drag(amount){
		this.hitKnob.drag(amount);
		this.stepKnob.drag(amount);
		this.rotateKnob.drag(amount);
		this.noteKnob.drag(amount);
	}
	
	release(){
		this.hitKnob.release();
		this.stepKnob.release();
		this.rotateKnob.release();		
		this.noteKnob.release();
	}
}



