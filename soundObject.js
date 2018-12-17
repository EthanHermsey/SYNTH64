


//  .oooooo..o                                         .o8  
// d8P'    `Y8                                        "888  
// Y88bo.       .ooooo.  oooo  oooo  ooo. .oo.    .oooo888  
//  `"Y8888o.  d88' `88b `888  `888  `888P"Y88b  d88' `888  
//      `"Y88b 888   888  888   888   888   888  888   888  
// oo     .d8P 888   888  888   888   888   888  888   888  
// 8""88888P'  `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P"                                                                                     `Y888P                              



class SoundObject{

	constructor(index, l){
		this.index = index;
		this.label = l;
		this.started = false;
		this.polyNotes = [];

		this.knobs = [];
		this.buttons = [];

	    this.arp = [];
		this.arpCounter = 0;
		this.arp = [];
		this.arpBaseOffset;
		this.arpPrevBaseNote;
		this.arpSelector = new ArpSelector();
		this.arpButton = new FunctionButtonObject(0,0,knobSize * 1.6, "   ");

		this.loadKnobs();
		this.loadButtons();
				
		this.envOsc1 = new p5.Env();
		this.envOsc1.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc1.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc1.output.gain.value = 0.5;

		this.envOsc2 = new p5.Env();
		this.envOsc2.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc2.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc1.output.gain.value = 0.5;

		this.envOsc3 = new p5.Env();
		this.envOsc3.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envOsc3.setRange(this.attackLevel.value, this.releaseLevel.value);
		this.envOsc3.mult(this.osc3Amount.value);

		this.envNoise = new p5.Env();
		this.envNoise.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envNoise.setRange(this.attackLevel.value, this.releaseLevel.value);

		this.envSample = new p5.Env();
		this.envSample.setADSR(this.attackTime.value, this.decayTime.value, this.susPercent.value, this.releaseTime.value);	
		this.envSample.setRange(this.attackLevel.value, this.releaseLevel.value);
				
		this.envFilter = new p5.Env();
		this.envFilter.setADSR(this.filterattackTime.value * this.filterADSRMultiplier.value, this.filterdecayTime.value * this.filterADSRMultiplier.value, this.filtersusPercent.value * this.filterADSRMultiplier.value, this.filterreleaseTime.value * this.filterADSRMultiplier.value);
		this.envFilter.setRange(this.filterattackLevel.value, this.filterreleaseLevel.value);


		this.osc1 = new p5.Oscillator('sine');
		this.osc1.disconnect();
		this.osc1.amp(0);
		
		this.osc2 = new p5.Oscillator('sine');
		this.osc2.disconnect();
		this.osc2.amp(0);
		
		this.osc3 = new p5.Oscillator('sine');
		this.osc3.disconnect();
		this.osc3.amp(0);

		this.ringGain = getAudioContext().createGain();

		this.LFO1 = new p5.Oscillator('sine');
		this.LFO1.freq(0.01);
		this.LFO1.disconnect();
		
		this.LFO2 = new p5.Oscillator('sine');
		this.LFO2.freq(0.01);
		this.LFO2.disconnect();

		this.hiddenLFO = new p5.Oscillator('sine');
		this.hiddenLFO.freq(0.01);
		this.hiddenLFO.disconnect();		

		this.noise = new p5.Noise();
		this.noise.disconnect();
		this.noise.stop();
		this.noise.amp(this.envNoise);

		this.sample = new p5.SoundFile();
		this.sampleFFT = new p5.FFT();
		this.sampleFFT.setInput(this.sample);
		this.sampleWaveSet = [];
		
		this.delay = new p5.Delay();
		this.distortion = new p5.Distortion(0.0,'none');
		this.distortion.drywet(0);

		this.scriptProc1 = getAudioContext().createScriptProcessor(4096, 1, 1);
		
		let procFunc = function(audioProcessingEvent){
			var inputBuffer = audioProcessingEvent.inputBuffer;
			var outputBuffer = audioProcessingEvent.outputBuffer;
		
			for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
				var inputData = inputBuffer.getChannelData(channel);
				var outputData = outputBuffer.getChannelData(channel);

				for (var sample = 0; sample < inputBuffer.length; sample++) {
					outputData[sample] = (inputData[sample] + 1) / 2;
				}
			}
		}

		this.scriptProc1.onaudioprocess = procFunc;
		

		this.procGain1 = new p5.Gain();
		this.procGain1.amp(0);
		this.procGain2 = new p5.Gain();
		this.procGain2.amp(0);

		this.filter = new p5.Filter();  
		this.filter.freq(this.filterFreq.value); 
		this.filter.res(this.filterRes.value);
		this.filter.output.gain.value = 0.3;
		this.filter.drywet(0);

		this.filter.chain(this.distortion, this.delay);

		this.filter._drywet.fade.setInput(this.envFilter.control);
		
		this.osc1.connect(this.filter);
		this.osc2.connect(this.filter);
		this.osc3.connect(this.filter);
		this.noise.connect(this.filter);
		this.sample.connect(this.filter);
		

		this.osc1wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.osc2wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.osc3wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.LFO1wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		this.LFO2wavearray = [0, 0.049067674327418015, 0.0980171403295606, 0.14673047445536175, 0.19509032201612825, 0.24298017990326387, 0.29028467725446233, 0.33688985339222005, 0.3826834323650898, 0.4275550934302821, 0.47139673682599764, 0.5141027441932217, 0.5555702330196022, 0.5956993044924334, 0.6343932841636455, 0.6715589548470183, 0.7071067811865475, 0.7409511253549591, 0.7730104533627369, 0.8032075314806448, 0.8314696123025452, 0.8577286100002721, 0.8819212643483549, 0.9039892931234433, 0.9238795325112867, 0.9415440651830208, 0.9569403357322089, 0.970031253194544, 0.9807852804032304, 0.989176509964781, 0.9951847266721968, 0.9987954562051724, 1, 0.9987954562051724, 0.9951847266721969, 0.989176509964781, 0.9807852804032304, 0.970031253194544, 0.9569403357322089, 0.9415440651830208, 0.9238795325112867, 0.9039892931234434, 0.881921264348355, 0.8577286100002721, 0.8314696123025453, 0.8032075314806449, 0.7730104533627371, 0.740951125354959, 0.7071067811865476, 0.6715589548470186, 0.6343932841636455, 0.5956993044924335, 0.5555702330196022, 0.5141027441932218, 0.47139673682599786, 0.42755509343028203, 0.3826834323650899, 0.33688985339222033, 0.2902846772544624, 0.24298017990326407, 0.1950903220161286, 0.1467304744553618, 0.09801714032956083, 0.049067674327417966, 1.2246467991473532e-16, -0.049067674327417724, -0.09801714032956059, -0.14673047445536158, -0.19509032201612836, -0.24298017990326382, -0.2902846772544621, -0.33688985339222005, -0.38268343236508967, -0.4275550934302818, -0.47139673682599764, -0.5141027441932216, -0.555570233019602, -0.5956993044924332, -0.6343932841636453, -0.6715589548470184, -0.7071067811865475, -0.7409511253549589, -0.7730104533627367, -0.803207531480645, -0.8314696123025452, -0.857728610000272, -0.8819212643483549, -0.9039892931234431, -0.9238795325112865, -0.9415440651830208, -0.9569403357322088, -0.970031253194544, -0.9807852804032303, -0.9891765099647809, -0.9951847266721969, -0.9987954562051724, -1, -0.9987954562051724, -0.9951847266721969, -0.9891765099647809, -0.9807852804032304, -0.970031253194544, -0.9569403357322089, -0.9415440651830209, -0.9238795325112866, -0.9039892931234433, -0.881921264348355, -0.8577286100002722, -0.8314696123025455, -0.8032075314806453, -0.7730104533627369, -0.7409511253549591, -0.7071067811865477, -0.6715589548470187, -0.6343932841636459, -0.5956993044924332, -0.5555702330196022, -0.5141027441932219, -0.4713967368259979, -0.42755509343028253, -0.3826834323650904, -0.33688985339222, -0.2902846772544625, -0.24298017990326418, -0.19509032201612872, -0.1467304744553624, -0.0980171403295605, -0.04906767432741809];
		
		this.osc1Wave = new WaveSelector(this.osc1wavearray, this.osc1);
		this.osc2Wave = new WaveSelector(this.osc2wavearray, this.osc2);
		this.osc3Wave = new WaveSelector(this.osc3wavearray, this.osc3);
		this.LFO1Wave = new WaveSelector(this.LFO1wavearray, this.LFO1);
		this.LFO2Wave = new WaveSelector(this.LFO2wavearray, this.LFO2);

		this.LFO1Binder.connect(this.LFO1, this.LFO1Wave, this.LFO1wavearray, this.LFO1Amount, "LFO2", this.LFO2, this.LFO2Binder);
		this.LFO2Binder.connect(this.LFO2, this.LFO2Wave, this.LFO2wavearray, this.LFO2Amount, "LFO1", this.LFO1, this.LFO1Binder);
	}











	start(){

		if (this.soundType.value == 0 && !this.osc1.started){
			this.noise.stop();		
			this.osc1.start();
			this.osc2.start();
			this.osc3.start();
			
				
		}else if (this.soundType.value == 1 && !this.noise.started){
			this.osc1.stop();
			this.osc2.stop();
			this.osc3.stop();
			this.noise.start();
	
		}else if (this.soundType.value == 2 && (this.osc1.started || this.noise.started) ){
			
			this.osc1.stop();
			this.osc2.stop();
			this.osc3.stop();
			this.noise.stop();
		}

		this.started = true;
	}

	











	play(){

		let rnd;
		if (this.ADSRChance.value != 1){
			rnd = Math.random();
		}

		let minilist = [ patterns[currentPattern] ];
		
		if (menuBar.playMode.value == 1){
			minilist = sequencerForm.sequence[sequencerForm.currentSeq];
		}
		

		//looping through all patterns in a column in the sequencer
		for (var seqpat = 0; seqpat < minilist.length; seqpat++){ 
			let m = minilist[seqpat];
			if (m != undefined){
				//euclidian patterns
				if (m[this.index].isEuclidian){
					
					//check if this pattern was played last sequence-step, to reset the counter
					if (m[this.index].lastSeq != sequencerForm.currentSeq && 
						m[this.index].lastSeq != sequencerForm.currentSeq -1){
					
							m[this.index].counter = 0;
					}
					
					m[this.index].lastSeq = sequencerForm.currentSeq; 
					

					//play current hit? 
					if (m[this.index].pattern[m[this.index].counter] != m[this.index].patternSet){
						
						if (this.arpButton.active && this.arp.length != 0){

							if (rnd == undefined || rnd < this.ADSRChance.value) this.playArpNote(m[this.index].note);
		
						}else if (!this.arpButton.active){

							if (rnd == undefined || rnd < this.ADSRChance.value) this.playNote(m[this.index].note);
										
						}
					}
						
					m[this.index].counter++
					if (m[this.index].counter > m[this.index].pattern.length - 1) m[this.index].counter = 0;

				//normal patterns
				} else if (m[this.index][beatCounter].length > 0 && 
					(rnd == undefined || rnd < this.ADSRChance.value)){
					
					
					if (this.arpButton.active && this.arp.length != 0){

						this.playArpNote(m[this.index][beatCounter][0])
		
					}else if (!this.arpButton.active){

						if (m[this.index][beatCounter].length > 1){
							this.playPolyNotes(m[this.index][beatCounter], {rollChords: true});

						} else {
							this.playNote( Number(m[this.index][beatCounter]) );
						}
										
					}								
				}
			}
		}
	}







	playNote(note){


	
		if (this.soundType.value == 0){

			let osc1Note = midiToFreq(note + this.osc1DetuneCoarse.value);

			let osc2Note = midiToFreq(note + this.osc2DetuneCoarse.value);

			let osc3Note = midiToFreq(note + this.osc3DetuneCoarse.value);


			if ( this.oscRamp.value != 0 && 
				((osc1Note > this.osc1.f && this.glideSelector.up) || 
				 (osc1Note < this.osc1.f && this.glideSelector.down)) ){

				this.osc1.freq( osc1Note, this.oscRamp.value);
				this.osc2.freq( osc2Note, this.oscRamp.value);
				this.osc3.freq( osc3Note, this.oscRamp.value);
			} else {

				this.osc1.freq(osc1Note);
				this.osc2.freq(osc2Note);
				this.osc3.freq(osc3Note);
			}


			if (this.filterLink.value == true){
				this.filter.freq(osc1Note + this.filterFreq.value);
			}

			this.envOsc1.play(this.osc1);
			this.envOsc2.play(this.osc2);
			this.envOsc3.play(this.osc3);
			this.envFilter.play();


		}else if (this.soundType.value == 1){
			if (this.filterLink.value == true) this.filter.freq(midiToFreq(note) + this.filterFreq.value);
			this.envNoise.play(this.noise);
			this.envFilter.play();

		}else if (this.soundType.value == 2){
			var start = map(this.sampleStart.value, 0, 1, 0, this.sample.duration());
			var stop = map(this.sampleStop.value, 0, 1, 0, this.sample.duration());
			var pitch = midiToFreq(note) / midiToFreq(60);

			if (this.sampleLoop.active){
				this.sample.stop();
				this.sample.loop(0, pitch + this.sampleTune.value, patternForm.volumeKnobs[selectedSound].value, start, stop - start);
			}else{
				this.sample.stop();
				this.sample.setLoop(false);
				this.sample.play(0, pitch + this.sampleTune.value, patternForm.volumeKnobs[selectedSound].value, start, stop - start);
			}
			this.sample.setVolume(this.envSample);

			if (this.filterLink.value == true) this.filter.freq(midiToFreq(note) + this.filterFreq.value);

			this.envSample.play();
			this.envFilter.play();
		}




		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}		
		
	}








	playArpNote(note){

		if (this.arpPrevBaseNote != note){

			this.arpPrevBaseNote = note;
			this.arpCounter = 0; //reset arp
			
			this.arpBaseOffset = this.arp[0] - this.arpPrevBaseNote;

		}


		if (this.soundType.value == 0){

			if (this.arpSelector.valueRandom == true){
				
				
				this.arpCounter = floor( random(this.arp.length));
				var n = this.arp[this.arpCounter] - this.arpBaseOffset ; 
				
				this.playNote(n);
				
			}else{

				if (this.arpSelector.valueReturn == true && beatCounter == 0) this.arpCounter = 0;
				
				var n = this.arp[this.arpCounter] - this.arpBaseOffset ; 
				
				this.playNote(n);

				this.arpCounter += this.arpSelector.direction;

				if (this.arpCounter >= this.arp.length){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = 0;
					}
				}else if (this.arpCounter < 0){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = this.arp.length -1;
					}
				}
			}


			if (this.filterLink.value == true) this.filter.freq( (this.osc1.f + this.filterFreq.value) );


		} else if (this.soundType.value == 1){

			this.playNote( note );

		} else if (this.soundType.value == 2 && this.sample.duration() != 0){


				
			if (this.arpSelector.valueRandom == true){
				
				this.arpCounter = floor( random(this.arp.length));
				var n = this.arp[this.arpCounter] - this.arpBaseOffset ; 
				
				this.playNote(n);				
				
			}else{

				if (this.arpSelector.valueReturn == true && beatCounter == 0) this.arpCounter = 0;
				
				this.playNote(this.arp[this.arpCounter] - this.arpBaseOffset);

				this.arpCounter += this.arpSelector.direction;

				if (this.arpCounter >= this.arp.length){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = 0;
					}
				}else if (this.arpCounter < 0){
					if (this.arpSelector.valueOpposite == true){
						this.arpSelector.direction *= -1;
						this.arpCounter += this.arpSelector.direction * 2;
					}else{
						this.arpCounter = this.arp.length -1;
					}
				}
			}

			
		}

		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}	
	}








	playPolyNotes(notes, rollChords){

	
		if (this.soundType.value == 0){

			let osc1Note = midiToFreq( notes[0] + this.osc1DetuneCoarse.value );

			let osc2Note = midiToFreq( (notes[1] || notes[0]) + this.osc2DetuneCoarse.value );
			
			let osc3Note = midiToFreq( (notes[2] || notes[0]) + this.osc3DetuneCoarse.value );
			

			if (this.filterLink.value == true){
				this.filter.freq(osc1Note + this.filterFreq.value);
			}

			if ( ( osc1Note > this.osc1.f && this.glideSelector.up) || 
				 ( osc1Note < this.osc1.f && this.glideSelector.down)){

				this.osc1.freq(osc1Note, this.oscRamp.value);
				this.osc2.freq(osc2Note, this.oscRamp.value);
				this.osc3.freq(osc3Note,this.oscRamp.value);
			} else {

				this.osc1.freq(osc1Note);
				this.osc2.freq(osc2Note);
				this.osc3.freq(osc3Note);
			}

			if (notes.length > 1 && rollChords && this.rollingChords.value != 0){
				this.envOsc1.play(this.osc1);
				this.envOsc2.play(this.osc2, this.rollingChords.value/4);
				this.envOsc3.play(this.osc3, this.rollingChords.value/2);
			} else {
				this.envOsc1.play(this.osc1);
				this.envOsc2.play(this.osc2);
				this.envOsc3.play(this.osc3);	
			}
			this.envFilter.play();
			

			if (this.filterLink.value == true) this.filter.freq( (this.osc1.f + this.filterFreq.value) );

		}else if (this.soundType.value == 1){
			
			if (this.filterLink.value == true) this.filter.freq( midiToFreq( notes[0] ) + this.filterFreq.value);
			this.envNoise.play(this.noise);
			this.envFilter.play();

		}else if (this.soundType.value == 2){

			this.playNote(notes[0]);
		}


		if (this.LFO1Link.value && this.LFO1Binder.value != 0) { //sync?
			if (this.LFO1Wave.value == 4) this.LFO1.oscillator.type = "sine";
			this.LFO1.start();
			if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.LFO1.oscillator);

			if (this.LFO1Binder.value == 1){
			 	if (this.LFO1Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO1Wave.value == 4) waveForm.updateWave(this.LFO1wavearray, this.hiddenLFO.oscillator);
			}		
		}
		if (this.LFO2Link.value && this.LFO2Binder.value != 0) { //sync?
			if (this.LFO2Wave.value == 4) this.LFO2.oscillator.type = "sine";
			this.LFO2.start();
			if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.LFO2.oscillator);

			if (this.LFO2Binder.value == 1){
			 	if (this.LFO2Wave.value == 4) this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();
				if (this.LFO2Wave.value == 4) waveForm.updateWave(this.LFO2wavearray, this.hiddenLFO.oscillator);
			}
		}	
	}



	playSilentNote(note){
		this.envOsc1.setRange(0, 0);
		this.envOsc2.setRange(0, 0);
		this.envOsc3.setRange(0, 0);
		this.envNoise.setRange(0, 0);
		this.envSample.setRange(0, 0);

		this.envOsc1.setADSR(0, 0, 0, 0);
		this.envOsc2.setADSR(0, 0, 0, 0);
		this.envOsc3.setADSR(0, 0, 0, 0);
		this.envNoise.setADSR(0, 0, 0, 0);
		this.envSample.setADSR(0, 0, 0, 0);

		this.playNote(note);

		this.setADSRRange();
		this.setADSRValues();		
	}










	loadKnobs(){
		this.arpKnob = new KnobObject(1,1, knobSize, "ARP", function(){});
		this.arpKnob.set(0, 1, 0, 1);
		this.knobs.push(this.arpKnob)
		// ADSR Knobs

		this.attackLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.attackLevel.set(0.08, 1, 0.5, 0.01);
		this.attackLevel.index = this.index;
		this.knobs.push(this.attackLevel);
		this.knobs[this.knobs.length -1].forSound = true;

		this.releaseLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Release\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.releaseLevel.set(0, 1, 0, 0.01);
		this.releaseLevel.index = this.index;
		this.knobs.push(this.releaseLevel);
		this.knobs[this.knobs.length -1].forSound = true;


		this.attackTime = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack", function(){
			sounds[this.index].setADSRValues();
		});
		this.attackTime.set(0.001, 1, 0.01, 0.001);
		this.attackTime.index = this.index;
		this.knobs.push(this.attackTime);
		this.knobs[this.knobs.length -1].forSound = true;


		this.decayTime = new KnobObject(width - 110, (height / 2) - 85, knobSize, "Decay", function(){
			sounds[this.index].setADSRValues();
		});
		this.decayTime.set (0, 1, 0.2, 0.001);
		this.decayTime.index = this.index;
		this.knobs.push(this.decayTime);
		this.knobs[this.knobs.length -1].forSound = true;

		this.susPercent = new KnobObject(width - 70, (height / 2) - 85, knobSize, "Sustain", function(){
			sounds[this.index].setADSRValues();
		});
		this.susPercent.set(0, 1, 0.2, 0.001);
		this.susPercent.index = this.index;
		this.knobs.push(this.susPercent);
		this.knobs[this.knobs.length -1].forSound = true;

	    this.releaseTime = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Release", function(){
			sounds[this.index].setADSRValues();
		});
	    this.releaseTime.set(0, 1, 0.5, 0.001);
	    this.releaseTime.index = this.index;
	    this.knobs.push(this.releaseTime);
	    this.knobs[this.knobs.length -1].forSound = true;

		this.ADSRMultiplier = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Multiply", function(){
			sounds[this.index].setADSRValues();
		});
	    this.ADSRMultiplier.set(1, 10, 1, 0.1);
	    this.ADSRMultiplier.index = this.index;
	    this.knobs.push(this.ADSRMultiplier);
	    this.knobs[this.knobs.length -1].forSound = true;

	    this.ADSRChance = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Chance", function(){});
	    this.ADSRChance.set(0, 1, 1, 0.01); 
	    this.knobs.push(this.ADSRChance);
	    this.knobs[this.knobs.length -1].forSound = true;


	    //for the filter adsr

	    this.filterattackLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.filterattackLevel.set(0.08, 1, 0.5, 0.01);
		this.filterattackLevel.index = this.index;
		this.knobs.push(this.filterattackLevel);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filterreleaseLevel = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Release\nLevel", function(){
			sounds[this.index].setADSRRange();
		});
		this.filterreleaseLevel.set(0, 1, 0, 0.01);
		this.filterreleaseLevel.index = this.index;
		this.knobs.push(this.filterreleaseLevel);
		this.knobs[this.knobs.length -1].forFilter = true;


		this.filterattackTime = new KnobObject(width - 150, (height / 2) - 85, knobSize, "Attack", function(){
			sounds[this.index].setADSRValues();
		});
		this.filterattackTime.set(0.001, 1, 0.001, 0.001);
		this.filterattackTime.index = this.index;
		this.knobs.push(this.filterattackTime);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filterdecayTime = new KnobObject(width - 110, (height / 2) - 85, knobSize, "Decay", function(){
			sounds[this.index].setADSRValues();
		});
		this.filterdecayTime.set (0, 1, 0, 0.001);
		this.filterdecayTime.index = this.index;
		this.knobs.push(this.filterdecayTime);
		this.knobs[this.knobs.length -1].forFilter = true;

		this.filtersusPercent = new KnobObject(width - 70, (height / 2) - 85, knobSize, "Sustain", function(){
			sounds[this.index].setADSRValues();
		});
		this.filtersusPercent.set(0, 1, 0, 0.001);
		this.filtersusPercent.index = this.index;
		this.knobs.push(this.filtersusPercent);
		this.knobs[this.knobs.length -1].forFilter = true;

	    this.filterreleaseTime = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Release", function(){
			sounds[this.index].setADSRValues();
		});
	    this.filterreleaseTime.set(0, 1, 0, 0.001);
	    this.filterreleaseTime.index = this.index;
	    this.knobs.push(this.filterreleaseTime);
	    this.knobs[this.knobs.length -1].forFilter = true;

		this.filterADSRMultiplier = new KnobObject(width - 20, (height / 2) - 85, knobSize, "Multiply", function(){
			sounds[this.index].setADSRValues();
		});
	    this.filterADSRMultiplier.set(1, 10, 1, 0.1);
	    this.filterADSRMultiplier.index = this.index;
	    this.knobs.push(this.filterADSRMultiplier);
	    this.knobs[this.knobs.length -1].forFilter = true;


		//OSC & LFO & FILTER FREQ Knobs
		
		this.osc1DetuneCoarse = new KnobObject(50, 50, knobSize, "Detune\nSemi-tone", function(){});
		this.osc1DetuneCoarse.set(-24, 24, 0, 1);
		this.osc1DetuneCoarse.index = this.index;
		this.knobs.push(this.osc1DetuneCoarse);

		this.osc1DetuneFine = new KnobObject(50, 50, knobSize, "Detune\ncents", function(){
			sounds[this.index].osc1.oscillator.detune.value = this.value;
		});
		this.osc1DetuneFine.set(-1000, 1000, 0, 0.05);
		this.osc1DetuneFine.index = this.index;
		this.knobs.push(this.osc1DetuneFine);

		this.osc2DetuneCoarse = new KnobObject(50, 50, knobSize, "Detune\nSemi-tone", function(){});
		this.osc2DetuneCoarse.set(-24, 24, 0, 1);
		this.osc2DetuneCoarse.index = this.index;
		this.knobs.push(this.osc2DetuneCoarse);

		this.osc2DetuneFine = new KnobObject(50, 50, knobSize, "Detune\ncents", function(){
			sounds[this.index].osc2.oscillator.detune.value = this.value;
		});
		this.osc2DetuneFine.set(-1000, 1000, 0, 0.05);
		this.osc2DetuneFine.index = this.index;
		this.knobs.push(this.osc2DetuneFine);


		this.osc3Amount = new KnobObject(150, 50, knobSize, "Amount",function(){
			sounds[this.index].envOsc3.output.gain.value = this.value;
		});
		this.osc3Amount.set(0, 1, 0.5, 0.001);
		this.osc3Amount.index = this.index;
		this.knobs.push(this.osc3Amount);

		this.osc3DetuneCoarse = new KnobObject(50, 50, knobSize, "Detune\nSemi-tone", function(){});
		this.osc3DetuneCoarse.set(-24, 24, 0, 1);
		this.osc3DetuneCoarse.index = this.index;
		this.knobs.push(this.osc3DetuneCoarse);

		this.osc3DetuneFine = new KnobObject(50, 50, knobSize, "Detune\ncents", function(){
			sounds[this.index].osc3.oscillator.detune.value = this.value;
		});
		this.osc3DetuneFine.set(-1000, 1000, 0, 0.05);
		this.osc3DetuneFine.index = this.index;
		this.knobs.push(this.osc3DetuneFine);
		

		this.oscMix = new KnobObject(50,50,knobSize, "<--  Mix  -->", function(){
			sounds[this.index].envOsc1.output.gain.value = 1 - this.value;
			sounds[this.index].envOsc2.output.gain.value = this.value;
		});
		this.oscMix.set(0,1,0.5,0.01);
		this.oscMix.index = this.index;
		this.knobs.push(this.oscMix);

		this.oscRamp = new KnobObject(50,50,knobSize, "Glide", function(){});
		this.oscRamp.set(0,1,0,0.01);
		this.knobs.push(this.oscRamp)

		this.rollingChords = new KnobObject(50,50,knobSize, "Strum\nChords", function(){});
		this.rollingChords.set(0,1,0,0.001);
		this.knobs.push(this.rollingChords);

		this.LFO1Freq = new KnobObject(25, 80, knobSize, "Frequency", function(){
			sounds[this.index].LFO1.freq(this.value);
			if (sounds[this.index].LFO1Binder.value == 1) sounds[this.index].hiddenLFO.freq(this.value * -1);
		});
		this.LFO1Freq.set(0.001, 150, 0.01, 0.005);
		this.LFO1Freq.index = this.index;
		this.knobs.push(this.LFO1Freq)

		this.LFO1Amount = new KnobObject(75, 80, knobSize, "Amount", function(){
			sounds[this.index].LFO1.amp(this.value);
			if (sounds[this.index].LFO1Binder.value == 1) sounds[this.index].hiddenLFO.amp(this.value * -1);
		});
		this.LFO1Amount.set(-100, 100, 0, 0.01);	
		this.LFO1Amount.index = this.index;
		this.knobs.push(this.LFO1Amount)


		this.LFO2Freq = new KnobObject(25, 80, knobSize, "Frequency", function(){
			sounds[this.index].LFO2.freq(this.value);
		});
		this.LFO2Freq.set(0.001, 150, 0.01, 0.005);
		this.LFO2Freq.index = this.index;
		this.knobs.push(this.LFO2Freq)

		this.LFO2Amount = new KnobObject(75, 80, knobSize, "Amount", function(){
			sounds[this.index].LFO2.amp(this.value);
			if (sounds[this.index].LFO2Binder.value == 1) sounds[this.index].hiddenLFO.amp(this.value * -1);
		});
		this.LFO2Amount.set(-100, 100, 0, 0.01);
		this.LFO2Amount.index = this.index;
		this.knobs.push(this.LFO2Amount)


		this.filterFreq = new KnobObject(40, 25, knobSize, "Frequency", function(){
			sounds[this.index].filter.freq(this.value);
		});
		this.filterFreq.set(0, 8000, 0, 0.1);
		this.filterFreq.index = this.index;
		this.knobs.push(this.filterFreq);

		this.filterRes = new KnobObject(95, 25, knobSize, "Resonance", function(){
			sounds[this.index].filter.res(this.value);
		});
		this.filterRes.set(0, 100, 0, 0.1);
		this.filterRes.index = this.index;
		this.knobs.push(this.filterRes);

		this.filterGain = new KnobObject(95, 25, knobSize, "Gain", function(){
			sounds[this.index].filter.gain(this.value);
		});
		this.filterGain.set(0, 100, 0, 1);
		this.filterGain.index = this.index;
		this.knobs.push(this.filterGain);

		
		this.distortionAmount = new KnobObject(95, 25, knobSize, "Distortion\nAmount", function(){
			sounds[this.index].setDistortion();
		});
		this.distortionAmount.set(0, 0.4, 0, 0.001);
		this.distortionAmount.index = this.index;
		this.knobs.push(this.distortionAmount);

		this.distortionSampling = new KnobObject(95, 25, knobSize, "Over\nSampling", function(){
			sounds[this.index].setDistortion();
		});
		this.distortionSampling.set(0, 2, 0, 1);
		this.distortionSampling.index = this.index;
		this.knobs.push(this.distortionSampling)

		this.delayTime = new KnobObject(95, 25, knobSize, "Delay Time", function(){
			sounds[this.index].delay.delayTime(this.value);
			if (this.value == 0){
				sounds[this.index].delay.drywet(0);
			} else {
				sounds[this.index].delay.drywet(1);
			}
		});
		this.delayTime.set(0, 0.9, 0, 0.001);
		this.delayTime.index = this.index;
		this.knobs.push(this.delayTime);

		this.delayFeedback = new KnobObject(95, 25, knobSize, "Delay Feedback", function(){
			sounds[this.index].delay.feedback(this.value);
			if (this.value == 0){
				sounds[this.index].delay.drywet(0);
			} else {
				sounds[this.index].delay.drywet(1);
			}
		});
		this.delayFeedback.set(0, 0.9, 0, 0.001);
		this.delayFeedback.index = this.index;
		this.knobs.push(this.delayFeedback)

		this.delayFilterFreq = new KnobObject(95, 25, knobSize, "Delay FilterFreq", function(){
			sounds[this.index].delay.filter(this.value);
		});
		this.delayFilterFreq.set(0, 20000, 0, 10);
		this.delayFilterFreq.index = this.index;
		this.knobs.push(this.delayFilterFreq)

		//sample knobs
		this.sampleStart = new KnobObject(0,0,knobSize, "Start", function(){
			if (sounds[this.index].sampleStop.value < sounds[this.index].sampleStart.value){
				sounds[this.index].sampleStop.value = sounds[this.index].sampleStart.value + 0.01;
			}
		});
		this.sampleStart.set(0,1,0,0.001);
		this.sampleStart.index = this.index;
		this.knobs.push(this.sampleStart);

		this.sampleStop = new KnobObject(0,0,knobSize, "End", function(){
			if (sounds[this.index].sampleStop.value < sounds[this.index].sampleStart.value){
				sounds[this.index].sampleStop.value = sounds[this.index].sampleStart.value + 0.01;
			}
		});
		this.sampleStop.set(0,1,1,0.001);
		this.sampleStop.index = this.index;
		this.knobs.push(this.sampleStop)

		this.sampleTune = new KnobObject(0,0,knobSize, "Tune", function(){});
		this.sampleTune.set(-1,1,0,0.001);
		this.knobs.push(this.sampleTune);

	}

	loadButtons(){
		// Sound Type Selector
		this.soundType = new SoundSelector();

		this.RingMod = new FunctionButtonObject(0,0, knobSize * 1.4, " <<< RING <<< \n <<< MOD  <<< ");

		this.glideSelector = new GlideSelector();

		this.ADSRExpo = new FunctionButtonObject(0,0, knobSize * 1.6, "Expo");

		this.filterADSRExpo = new FunctionButtonObject(0,0, knobSize * 1.6, "Expo");

		this.noiseSelector = new NoiseSelector();

		this.LFO1Binder = new LFOBinder();
		this.LFO1Link = new LinkSelector();
		
		this.LFO2Binder = new LFOBinder();
		this.LFO2Link = new LinkSelector();

		this.filterType = new FilterSelector();
		this.filterLink = new LinkSelector();
		
		this.sampleReverse = new FunctionButtonObject(0,0,knobSize, "Reverse");
		this.samplePlay = new FunctionButtonObject(0,0,knobSize, "Play");
		this.sampleLoop = new FunctionButtonObject(0,0,knobSize, "Loop");
	}




	setADSRValues(){
		this.envOsc1.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envOsc2.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envOsc3.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envNoise.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);
		this.envSample.setADSR(this.attackTime.value * this.ADSRMultiplier.value, this.decayTime.value * this.ADSRMultiplier.value, this.susPercent.value * this.ADSRMultiplier.value, this.releaseTime.value * this.ADSRMultiplier.value);

		this.envFilter.setADSR(this.filterattackTime.value * this.filterADSRMultiplier.value, this.filterdecayTime.value * this.filterADSRMultiplier.value, this.filtersusPercent.value * this.filterADSRMultiplier.value, this.filterreleaseTime.value * this.filterADSRMultiplier.value);
	}

	setADSRRange(){
	
		this.envOsc1.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envOsc2.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envOsc3.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envNoise.setRange(this.attackLevel.value / 2, this.releaseLevel.value);
		this.envSample.setRange(this.attackLevel.value / 2, this.releaseLevel.value);

		this.envFilter.setRange(this.filterattackLevel.value / 2, this.filterreleaseLevel.value);
		
	}

	setDistortion(){
		if (this.distortionAmount.value != 0){
			switch(this.distortionSampling.value){

				case 0:
					this.distortion.set(this.distortionAmount.value, "none");
					break;
				case 1:
					this.distortion.set(this.distortionAmount.value, "2x");
					break;
				case 2:
					this.distortion.set(this.distortionAmount.value, "4x");
					break;
			}
			this.distortion.drywet(1)
		}else{
			this.distortion.drywet(0)
		}
	}

	setFilterType(){
		if (this.filterType.value == 0){
				this.filter.drywet(0);

			}else{
				if (this.filterType.value == 1){
					this.filter.setType('lowpass');
				}else if (this.filterType.value == 2){
					this.filter.setType('highpass');
				}else if (this.filterType.value == 3){
					this.filter.setType('bandpass');
				}else if (this.filterType.value == 4){
					this.filter.setType('lowshelf');
				}else if (this.filterType.value == 5){
					this.filter.setType('highshelf');
				}else if (this.filterType.value == 6){
					this.filter.setType('peaking');
				}else if (this.filterType.value == 7){
					this.filter.setType('notch');
				}else if (this.filterType.value == 8){
					this.filter.setType('allpass');
				} 
				this.filter.drywet(1);
				this.filter.freq(this.filterFreq.value);
				this.filter.res(this.filterRes.value);
				this.filter.gain(this.filterGain.value);
			}
	}

	setNoiseType(){
		this.noise.setType(this.noiseSelector.value);
	}


	bindLFO(pack, otherlfo){

		pack.lfo.disconnect();
		this.hiddenLFO.disconnect();
		this.hiddenLFO.stop();
		otherlfo._freqMods = [];
		this.procGain1.disconnect();
		this.procGain2.disconnect();

		this.osc1.disconnect();
		this.osc2.disconnect();
		this.osc1.connect(this.filter);
		this.osc2.connect(this.filter);
		
		if (pack.binder.value == 0){
			pack.lfo.stop();
			return;
		} 

		if (pack.lfo.oscillator.type == "custom") pack.lfo.oscillator.type = "sine";
		pack.lfo.start();

		if (pack.wave.value == 4){
			waveForm.updateWave(pack.array, pack.lfo.oscillator);
		}
		
		
		switch(pack.binder.value){
			case 1:
				
				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);

				
				if (this.hiddenLFO.oscillator.type == "custom") this.hiddenLFO.oscillator.type = "sine";
				this.hiddenLFO.start();

				this.hiddenLFO.freq(pack.lfo.f);
				this.hiddenLFO.amp(pack.amount.value * -1);

				if (pack.wave.value == 4){
					waveForm.updateWave(pack.array, pack.hiddenLFO.oscillator);

				} else {
					this.hiddenLFO.setType(pack.lfo.getType());
				}

				this.osc1.disconnect();
				this.osc2.disconnect();

				this.osc1.output.connect(this.procGain1);
				this.osc2.output.connect(this.procGain2);

				this.procGain1.connect(this.filter);
				this.procGain2.connect(this.filter);

				pack.lfo.output.connect(this.procGain1.output.gain);
				this.hiddenLFO.output.connect(this.procGain2.output.gain);
				
				break;

			case 2:

				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);
								
				pack.lfo.output.connect(this.filter.output.gain);
								
				break;

			case 3:

				var a = constrain(pack.amount.value, -1, 1)
				pack.amount.set(-1, 1, a, 0.01);
				
				if (this.soundType.value == 0){

					pack.lfo.output.connect(this.osc1.panner.stereoPanner.pan);
					pack.lfo.output.connect(this.osc2.panner.stereoPanner.pan);
					pack.lfo.output.connect(this.osc3.panner.stereoPanner.pan);
				

				} else if (this.soundType.value == 1){

					pack.lfo.output.connect(this.noise.panner.stereoPanner.pan);					

				} else if (this.soundType.value == 2){

					pack.lfo.output.connect(this.sample.panner.stereoPanner.pan);

				}
				break;

			case 5:
				pack.amount.set(-8000, 8000, pack.amount.value, 1);	
				this.filter.freq(pack.lfo);
				break;

			case 6:
				var a = constrain(pack.amount.value, 0, 100);
				pack.amount.set(0, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.filter.res(pack.lfo);
				break;

			case 7:
				var a = constrain(pack.amount.value, 0, 100);
				pack.amount.set(0, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.filter.gain(pack.lfo);
				break;

			case 9:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc1.freq(pack.lfo);
				break;

			case 10:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc2.freq(pack.lfo);
				break;

			case 11:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				this.osc3.freq(pack.lfo);
				break;

			case 13:
				var a = constrain(pack.amount.value, -100, 100);
				pack.amount.set(-100, 100, a, 0.01);	
				pack.lfo.amp(a);

				otherlfo.freq(pack.lfo);

				if (pack.lfo === this.LFO1){ //to fix a bug
					this.bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
				} else {
					this.bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
				}
				break;

			case 14:
				var a = constrain(pack.amount.value, -1000, 1000);
				pack.amount.set(-1000, 1000, a, 0.01);	
				pack.lfo.amp(a);

				otherlfo.amp(pack.lfo);

				if (pack.lfo === this.LFO1){ //to fix a bug
					this.bindLFO({lfo: sounds[selectedSound].LFO2, binder: sounds[selectedSound].LFO2Binder, wave: sounds[selectedSound].LFO2Wave, array: sounds[selectedSound].LFO2wavearray, amount: sounds[selectedSound].LFO2Amount}, sounds[selectedSound].LFO1);
				} else {
					this.bindLFO({lfo: sounds[selectedSound].LFO1, binder: sounds[selectedSound].LFO1Binder, wave: sounds[selectedSound].LFO1Wave, array: sounds[selectedSound].LFO1wavearray, amount: sounds[selectedSound].LFO1Amount}, sounds[selectedSound].LFO2);
				}
				break;
		}
	}

	connectRingMod(){
		if (this.RingMod.active){
			this.osc1.disconnect();
			this.osc2.disconnect();
			this.osc1.connect(this.ringGain);
			this.osc2.oscillator.connect(this.ringGain.gain);
			this.ringGain.connect(this.filter);

		} else {
			this.osc1.disconnect();
			this.osc2.disconnect();
			this.ringGain.disconnect();
			this.osc1.connect(this.filter);
			this.osc2.connect(this.filter);
		}
	}
	

	waveChange(){

		var wavetypes = ['sine', 'triangle', 'sawtooth', 'square']
		if (this.osc1Wave.value != 4) this.osc1.setType(wavetypes[this.osc1Wave.value]);
		if (this.osc2Wave.value != 4) this.osc2.setType(wavetypes[this.osc2Wave.value]);
		if (this.osc3Wave.value != 4) this.osc3.setType(wavetypes[this.osc3Wave.value]);
		if (this.LFO1Wave.value != 4) this.LFO1.setType(wavetypes[this.LFO1Wave.value]);
		if (this.LFO2Wave.value != 4) this.LFO2.setType(wavetypes[this.LFO2Wave.value]);
	}
}


