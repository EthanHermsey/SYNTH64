
// oooooooooooo ooooooooooooo ooooooooooooo 
// `888'     `8 8'   888   `8 8'   888   `8 
//  888              888           888      
//  888oooo8         888           888      
//  888    "         888           888      
//  888              888           888      
// o888o            o888o         o888o     
                                         
                                         
                                         
//   .oooooo.                   .                              .   
//  d8P'  `Y8b                .o8                            .o8   
// 888      888 oooo  oooo  .o888oo oo.ooooo.  oooo  oooo  .o888oo 
// 888      888 `888  `888    888    888' `88b `888  `888    888   
// 888      888  888   888    888    888   888  888   888    888   
// `88b    d88'  888   888    888 .  888   888  888   888    888 . 
//  `Y8bood8P'   `V88V"V8P'   "888"  888bod8P'  `V88V"V8P'   "888" 
//                                   888                           
//                                  o888o                          


function OutputVisualizer(){
	this.pos = createVector(0,0);
	this.width;
	this.height;
	this.timeout = 5;
	this.waveform;
	this.spectrum;

	this.display = function(){
		push();
			
			this.waveform = fft.waveform();

		  	noFill();
		  	stroke(50);
		  	rect(this.pos.x, this.pos.y, this.width, this.height);
		  	
		  	stroke(188, 90, 18);
		  	strokeWeight(3);

		  	if (menuBar.performanceModeButton.active) {

		  		let halfheight = (height-insideTop)/2;

		  		beginShape();
				  	for (var i = 0; i < this.waveform.length; i += 4){
					    var x = map(i, 0, this.waveform.length - 1, 0, width * 0.8) + width * 0.1;
				    	var y = map( this.waveform[i], -1, 1, -halfheight * 0.9, halfheight * 0.9);
				    	y += insideTop + halfheight;
				    	vertex(x,y);
				  	}
			  	endShape();

		  	} else if (!menuBar.visualizerButton.active){
		  		
		  		beginShape();
				  	for (var i = 0; i < this.waveform.length; i ++){
					    var x = map(i, 0, this.waveform.length - 1, 3, this.width - 1);
				    	var y = map( this.waveform[i], -1, 1, -this.height/2 + 5, this.height/2 -5);
				    	y = constrain(y, -this.height/2 + 5, this.height/2 -5);

				    	vertex(this.pos.x + x, this.pos.y + this.height/2 + y);
				  	}
			  	endShape();
			}

		  	// //extra volume gauge
		  	stroke(0);
		  	strokeWeight( 0.5 );
		  	var level = map( volumeLevel.getLevel(), 0, 1, 0, this.height);
		  	rect(this.pos.x + this.width, this.pos.y , this.width / 8, this.height +1);
		  	fill(188, 90, 18, 180);
		  	rect(this.pos.x + this.width, this.pos.y + (this.height - level) , this.width / 8, level);
		pop();
	}
}








//       .o.                         .o8   o8o            
//      .888.                       "888   `"'            
//     .8"888.     oooo  oooo   .oooo888  oooo   .ooooo.  
//    .8' `888.    `888  `888  d88' `888  `888  d88' `88b 
//   .88ooo8888.    888   888  888   888   888  888   888 
//  .8'     `888.   888   888  888   888   888  888   888 
// o88o     o8888o  `V88V"V8P' `Y8bod88P" o888o `Y8bod8P' 
                                                       
                                                       
                                                       
// oooooo     oooo  o8o                                 oooo   o8o                                
//  `888.     .8'   `"'                                 `888   `"'                                
//   `888.   .8'   oooo   .oooo.o oooo  oooo   .oooo.    888  oooo    oooooooo  .ooooo.  oooo d8b 
//    `888. .8'    `888  d88(  "8 `888  `888  `P  )88b   888  `888   d'""7d8P  d88' `88b `888""8P 
//     `888.8'      888  `"Y88b.   888   888   .oP"888   888   888     .d8P'   888ooo888  888     
//      `888'       888  o.  )88b  888   888  d8(  888   888   888   .d8P'  .P 888    .o  888     
//       `8'       o888o 8""888P'  `V88V"V8P' `Y888""8o o888o o888o d8888888P  `Y8bod8P' d888b    
                                                                                               
                                                                                               
                                                                                               
//   .oooo.   oooooooooo.   
// .dP""Y88b  `888'   `Y8b  
//       ]8P'  888      888 
//     <88b.   888      888 
//      `88b.  888      888 
// o.   .88P   888     d88' 
// `8bd88P'   o888bood8P'   






class AudioVisualizer3D{
	
	constructor(x,y,w,h){
		
		this.cameraDistance = 6000;
		this.cameraHeight = 1800
		this.cameraAngle = 2.3690;
		this.cameraAngleIncrement = 0.0025;

		this.wavesize = 128;
		this.wavesizescalar = 40;
		
		this.waveforms = new Array(this.wavesize);
		for (let i = 0; i < this.waveforms.length; i++){
			this.waveforms[i] = new Array(this.wavesize).fill(0);
		}

		this.wavelines = [];
		
		
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.renderer.setSize(windowWidth, windowHeight - 5);
		this.renderer.setClearColor(new THREE.Color("rgb(40, 40, 40)"));
		document.body.appendChild(this.renderer.domElement);
		
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.left = x;
		this.renderer.domElement.style.top = y;
		this.renderer.domElement.width = w;
		this.renderer.domElement.style.height = windowHeight - insideTop - 20;

		this.renderer.domElement.style.display = "none"

		this.renderer.domElement.onmousewheel = (e)=>{
			this.mousescroll(e.deltaY * 0.5);
		}
		
		
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(45, windowWidth / (windowHeight - 10), 0.1, 20000);
		this.camera.rotation.order = "YXZ"
		
		this.scene.add(new THREE.AmbientLight(0x606059, 1));
		
		
		for (let i = 0; i < this.wavesize; i++){
		
			let wavemat = new THREE.ShaderMaterial({
				uniforms: {
					wavesize: {
						value: this.wavesize * (this.wavesizescalar/4)
					},
					wavearray: {
						type: "fv1",
						value: this.waveforms[i]
					},
					lowcolor: {
						value: new THREE.Color("hsl(13, 100%, 50%)")
					},
						highcolor: {
						value: new THREE.Color("hsl(60, 100%, 50%)")
					}
				},
				vertexShader: document.getElementById('vertexShader').textContent,
				fragmentShader: document.getElementById('fragmentShader').textContent
			});

			let wavegeo = new THREE.BufferGeometry();
			let verts = [];
			let index = [];

			for (var j = 0; j < this.wavesize; j++){
				verts.push(i * this.wavesizescalar);
				verts.push(0);
				verts.push(j * this. wavesizescalar);

				index.push(j)
			}
		
			wavegeo.addAttribute('position', new THREE.Float32BufferAttribute( verts, 3 ));
			wavegeo.addAttribute('pindex', new THREE.Float32BufferAttribute( index, 1 ));

			let waveline = new THREE.Line(wavegeo, wavemat);
			waveline.position.x -= this.wavesize/2 * this.wavesizescalar;
			waveline.position.z -= this.wavesize/2 * this.wavesizescalar;

			this.scene.add(waveline);	
			this.wavelines.push(waveline);
		}
		
		this.moveCamera();
	}
	
	display(){
		
		//if (frameCount%3 != 0) return;

		let wave = fft.waveform();
		this.waveforms.splice(0,0,wave);
		this.waveforms.pop();

		this.wavelines.forEach((line, i)=>{
			line.material.uniforms.wavearray =  {
					type: "fv1",
					value: this.waveforms[i]
				}
		});
		
		this.renderer.render(this.scene, this.camera);
	}
	
	moveCamera(){
		let x = this.cameraDistance * cos(this.cameraAngle)
		let z = this.cameraDistance * sin(this.cameraAngle)

		this.camera.position.set(x, this.cameraHeight, z);
		this.camera.lookAt(new THREE.Vector3(0, this.cameraHeight * 0.1, 0));
	}
	
	drag(amountX, amountY){
		this.cameraHeight = constrain(this.cameraHeight - amountY * 4, 2, 8000);
		this.cameraAngle += amountX * -0.001;
		this.moveCamera();
	}
	
	mousescroll(amount){
		this.cameraDistance = constrain(this.cameraDistance + amount * 4, 0, 10000);
		this.moveCamera();
	}

	resize(x,y,w,h){
		this.renderer.domElement.style.left = x;
		this.renderer.domElement.style.top = y;
		this.renderer.domElement.style.height = windowHeight - insideTop;
		this.renderer.domElement.style.width = w;

		this.camera = new THREE.PerspectiveCamera(45, windowWidth / (windowHeight - 10), 0.1, 20000);
		this.camera.rotation.order = "YXZ"

		this.moveCamera();
	}
}


