const VIDEO = document.getElementById("VIDEO");
let SIZE={x:0,y:0,width:0,height:0};
let CANVAS = document.getElementById("myCanvas");
let CONTEXT = CANVAS.getContext("2d");

CANVAS.width=CANVAS.clientWidth;
CANVAS.height= CANVAS.clientHeight;

let promise = navigator.mediaDevices.getUserMedia({video: true, audio: false, video:{facingMode:"environment"}});
	promise.then(function(signal) {
		VIDEO.setAttribute('autoplay', '');
		VIDEO.setAttribute('muted', '');
		VIDEO.setAttribute('playsinline', '');
		VIDEO.srcObject=signal;
		VIDEO.play();

		VIDEO.onloadeddata=function(){
			if(iOS()){
				VIDEO.style.width = "0.0001px";	
				VIDEO.style.height = "0.0001px";	
				document.getElementById("videoContainer").appendChild(VIDEO);
				handleResize();
				updateCanvas();
			} else {
				CANVAS.style.display = "none";
			}
		}	
	}).catch(function(err) {
		alert("Website werkt niet zonder cameratoestemming.");
	});

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function handleResize(){	
	let resizer= CANVAS.clientHeight/VIDEO.videoHeight;

	SIZE.width=resizer*VIDEO.videoWidth;
	SIZE.height=resizer*VIDEO.videoHeight;
	SIZE.x=CANVAS.width/2-SIZE.width/2;
	SIZE.y=CANVAS.height/2-SIZE.height/2;
}

function updateCanvas(){
	CONTEXT.drawImage(VIDEO,SIZE.x,SIZE.y,SIZE.width,SIZE.height);
	
	var imageData = CONTEXT.getImageData(0,0,CANVAS.width,CANVAS.height);
	var data = imageData.data;
	
	//apply colorblindness filter
	for(var id = 0, length = data.length; id < length; id += 4) {
		var sr = data[id], // source-pixel
			sg = data[id + 1],
			sb = data[id + 2],
			dr = sr, // destination-pixel
			dg = sg,
			db = sb;
		
			const m = [0.567,0.433,0,0,0, 0.558,0.442,0,0,0, 0,0.242,0.758,0,0, 0,0,0,1,0, 0,0,0,0,1]
			dr=((sr*m[0])+(sg*m[1])+(sb*m[2])+(1*m[3])+m[4]);
			dg=((sr*m[5])+(sg*m[6])+(sb*m[7])+(1*m[8])+m[9]);
			db=((sr*m[10])+(sg*m[11])+(sb*m[12])+(1*m[13])+m[14]);
			dr = fu(dr);
			dg = fu(dg);
			db = fu(db);
				
			data[id] = dr >> 0;
			data[id + 1] = dg >> 0;
			data[id + 2] = db >> 0;
	}	
	CONTEXT.putImageData(imageData,0,0);
	
	window.requestAnimationFrame(updateCanvas);
}

function fu(n){ return(n<0?0:(n<255?n:255)); }
