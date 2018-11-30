
var mSecs;
var playing = false;
var counter = 1;
var swing = 0;


self.addEventListener('message', function(e) {

	var data = e.data;
	//console.log(e.data);
	if (data.msg == "start"){
		playing = true;
		Pulse();
	}else if (data.msg == "stop"){
		playing = false;
	}else if (data.msg == "reset"){
		counter = 1;
	}else if (data.msg == "swing"){
		swing = data.swng;
	}else {
		mSecs = BpmToMilliSeconds(data.msg);
	}

}, false);

function BpmToMilliSeconds(bpm){

	return ((60 / bpm) * 1000) / 4;
}

function isEven(n){
	return n % 2 == 0
}

function Pulse(){
	self.postMessage('');
	

	if (isEven(counter)){
		if (playing == true) setTimeout(Pulse, mSecs - (mSecs * swing));
	}else{
		if (playing == true) setTimeout(Pulse, mSecs + (mSecs * swing));
	}

	counter++
	if (counter > 16) counter = 1;
}

console.log("pulsegeneratorWorker initialized..");