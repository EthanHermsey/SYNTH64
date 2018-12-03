

// oooo    oooo                        .o8       
// `888   .8P'                        "888       
//  888  d8'    ooo. .oo.    .ooooo.   888oooo.  
//  88888[      `888P"Y88b  d88' `88b  d88' `88b 
//  888`88b.     888   888  888   888  888   888 
//  888  `88b.   888   888  888   888  888   888 
// o888o  o888o o888o o888o `Y8bod8P'  `Y8bod8P' 




function KnobObject(x, y, s, txt, fnx){
	this.pos = createVector(x,y);
	this.size = s || height / 30;
	this.label = txt
	this.index = undefined;
	
	this.fnx = fnx;


	this.stepsize;
	this.value;
	this.min;
	this.max;

	this.active = false;

	this.set = function(min, max, value, stepsize){
		this.min = min;
		this.max = max;
		this.value = value;
		this.startValue = value;
		this.stepsize = stepsize;
	}

	this.catch = function(){
		
		if (dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.size / 2){
			let t = new Date().getTime();
			if (t - this.lastActive < 200){
				this.value = this.startValue;
				this.fnx();
			} else {
				this.active = {pos: mouseY, val: this.value};
			}
			this.lastActive = t;			
		}
	}

	this.release = function(){
		this.active = false;
	}

	this.drag = function(amount, index){
		if (this.active){
			
			if (keyIsDown(16) || keyboardPolyNotes.length > 0){
				this.value = constrain(this.value + this.stepsize * amount, this.min, this.max);
				this.active = {pos: mouseY, val: this.value};

			} else {
				let maxMouseDistance = 150;
				let mouseD = this.active.pos - mouseY;
				let amt;
				if (mouseD > 0){
					amt = this.stepsize * floor(map( mouseD, 0, maxMouseDistance, 0, (this.max - this.active.val) / this.stepsize));
				} else {
					amt = this.stepsize * floor(map( mouseD, 0, -maxMouseDistance, 0, -(this.active.val - this.min) / this.stepsize));
				}			

				this.value = constrain(this.active.val + amt, this.min, this.max);
				
			}
			
			
			let valuestringsplit = this.value.toFixed(3).split(".");
			let strlen;
			for (var i = 2; i >= 0; i--){
				if (valuestringsplit[1].substr(i,1) != "0") {
					strlen = i + 1;
					break;
				}
			}
			if (strlen == undefined) strlen = 3;
			this.value = Number(this.value.toFixed(strlen));
			this.fnx();
		}
	}

	this.display = function(midi){
		push();
			//orange circle
			stroke(188, 90, 18);
			strokeWeight( 3 );
			fill( 200 );
			ellipse( this.pos.x, this.pos.y, this.size );

			//indication point
			var angle = map(this.value, this.min, this.max, 10, 350);
			var x = (this.size / 2 - 5) * cos(radians(angle + 90));
			var y = (this.size / 2 - 5) * sin(radians(angle + 90));
			stroke(0);
			point(this.pos.x + x, this.pos.y + y);

			//black circle
			strokeWeight(1)
			noFill();
			ellipse(this.pos.x, this.pos.y, this.size + 1);

			//black text value
			textSize( this.size * 0.35 );
			fill( 0 );
			strokeWeight( 0 );
			if (midi) {
				text(midiToString(this.value), this.pos.x, this.pos.y + 5);
			} else {
				text(this.value, this.pos.x, this.pos.y + 5);
			}
			
			//label text
			fill(0);
			textSize( constrain(this.size * 0.32, 8, 40) );
			text(this.label, this.pos.x, this.pos.y + this.size / 2 + 14);
		pop();

	}
}



