const THREE = window.MINDAR.IMAGE.THREE;

document.getElementById("myARcontainer").addEventListener("mousedown", onPressScreen, false);
document.getElementById("myARcontainer").addEventListener("mouseup", onReleaseScreen, false);

function onPressScreen (){
	if (gameState == "play"){
		var coords = new THREE.Vector2();
		coords.x = (event.clientX);
		coords.y = (event.clientY);

		clickedObject = findSelectedObject(coords);
		clickedObject.material = materialHover;
	}
}
function onReleaseScreen (){
	if (gameState == "play"){
		select(clickedObject);
		clickedObject.material = materialNormal;
	}
}


//imagetracking template:
var gameState = "start",
	scanning = true,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2;

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

const selectableObjects = []; //add selectable objects to this array
/*
	//add objects like this:
	selectableOjects[0] = new THREE.Mesh(geometry, material);
	plane.add(selectableObjects[0]); //do this later where geometry, materials and plane are defined. 
*/

//html elements:
const	scanner = document.getElementById("scanning"),
		startMenu = document.getElementById("startMenu"),
		continuebtn = document.getElementById("btnContinue"),
		speechBubble = document.getElementById("speechBubble"),
		speechBubbleText = document.getElementById("speechBubbleText"),
		speechBubbleArrowTop = document.getElementById("speechBubbleArrowTop"),
		foundMenu = document.getElementById("foundMenu"),
		resultHeader = document.getElementById("resultHeader"),
		resultText = document.getElementById("resultText"),
		questionsAnsweredTxt = document.getElementById("questionsAnswered"),
		selectPrompt = document.getElementById("selectPrompt");

	const arrowOffset = document.getElementById("arrowSpacer").clientWidth;

//game elements
var mouthLocation;
var currentQuestion = 0;
var gameComplete = false;
var clickedObject;
var questions = [];
questions[0] = "African wild dogs hunt my livestock! How can I let them graze freely liky this?";
questions[1] = "Elephants are eating and trampling all my crops! When I try to scare them off, they become aggressive!";
questions[2] = "Lions climb into my boma at night, and attack my livestock!";
questions[3] = "A cheetah got a hold of one of the sheep from my boma!";

updateSpeechBubbleText();

var ARCamera;

//ThreeJS stuff:
const loader = new THREE.TextureLoader();
const geometry = new THREE.PlaneGeometry(0.19,0.19);
const textureNormal = loader.load("./textures/selectCircle.png");
const textureHover = loader.load("./textures/selectCircleHover.png");
const materialNormal = new THREE.MeshBasicMaterial({map: textureNormal, transparent:true, side:2,alphaTest: 0.1});
const materialHover = new THREE.MeshBasicMaterial({map: textureHover, transparent:true, side:2,alphaTest: 0.1});

const selectPlane1 = new THREE.Mesh(geometry, materialNormal);
selectPlane1.position.set(-0.4,-0.3,0.01);
selectableObjects[0]=selectPlane1;
const selectPlane2 = new THREE.Mesh(geometry, materialNormal);
selectPlane2.position.set(-0.2,-0.3,0.01);
selectableObjects[1]=selectPlane2;
const selectPlane3 = new THREE.Mesh(geometry, materialNormal);
selectPlane3.position.set(0,-0.3,0.01);
selectableObjects[2]=selectPlane3;
const selectPlane4 =  new THREE.Mesh(geometry, materialNormal);
selectPlane4.position.set(0.2,-0.3,0.01);
selectableObjects[3]=selectPlane4;

const mouth = new THREE.Object3D();
mouth.position.set(-0.1,0.2,0);

const backgroundGeometry = new THREE.PlaneGeometry(1,1);
const backgroundMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
const background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);

background.add(selectPlane1);
background.add(selectPlane2);
background.add(selectPlane3);
background.add(selectPlane4);
background.add(mouth);

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/boeren.mind", //change to correct imagetarget.
			uiLoading: "no",
			uiScanning: "no"//,
			//filterMinCF: 0.001,
			//filterBeta: 4000
		})
		const {renderer, scene, camera} = mindarThree;

		ARCamera = camera;

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(background); //Build scene here.


		//on target found
		anchor.onTargetFound = () => {
			scanning = false;
			updateUI();
		}
		
		//on target lost
		anchor.onTargetLost = () => {
			scanning = true;
			updateUI();
		}

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});

		loop();
	}
	start();
});

function loop (){
	//calculate deltatime
	currentTime = (new Date()).getTime();
	delta = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	mouthLocation = getScreenLocation(mouth);
	updateSpeechBubble();
	requestAnimationFrame(loop);
}

function updateUI(){
	if (gameState == "play" && scanning){
		displayNone();
		scanner.style.display = "block";
	} else if (gameState == "start"){
		displayNone();
		startMenu.style.display = "block";
	} else if (gameState == "play") {
		displayNone();	
		speechBubble.style.display = "block";
		selectPrompt.style.display = "block";
	} else if (gameState == "menu") {
		displayNone();
		foundMenu.style.display = "block";
	}
}

function displayNone(){
	startMenu.style.display = "none";	
	scanner.style.display = "none";
	speechBubble.style.display = "none";
	foundMenu.style.display = "none";
	selectPrompt.style.display = "none"
}

function updateSpeechBubble(){
	speechBubble.style.top = mouthLocation.y +"px";
	speechBubbleArrowTop.style.marginLeft = Math.min(Math.max(mouthLocation.x - (0.1*documentWidth), 0), speechBubbleText.clientWidth-arrowOffset) +"px";
}

function updateSpeechBubbleText(){
	speechBubbleText.innerHTML = questions[currentQuestion];
}


function select(object){
	if (object != null){
    	if (currentQuestion == 0){
			if (object==selectPlane1){
				submitAnswer(false, "Guard dogs could be deployed against african wild dogs, but this creates a risk that the guard dogs transfer diseases to the wild dogs. <br> There has to be another solution...");
			}	else if (object==selectPlane2){
				submitAnswer(true,"Many farmers still let their livestock roam freely, which makes them vulnurable to predators. <br> Placing fences, and maintaining them, helps avoid conflicts!");
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bee fences are designed to protect crops against elephants. <br> There has to be another solution...");
			}	else if (object==selectPlane4){
				submitAnswer(false,"The torch light needs to be applied to a boma, to protect them better at night. This farmers still lets their livestock roam freely. <br> There has to be another solution...");
			}
		} else if (currentQuestion == 1){
			if (object==selectPlane1){
				submitAnswer(false,"Elephants don't let themselves get scared off so easily. <br> There has to be another solution...");
			}	else if (object==selectPlane2){
				submitAnswer(false,"These fences aren't strong enough to stop an elephant. Fences that are strong enough would cost far too much money. <br> There has to be another solution...");
			}	else if (object==selectPlane3){
				submitAnswer(true,"The bees in bee fences keep the elephants away, pollinate crops and earn farmers money through the selling of honey! <br> All these benifits, for such a cheap solution!");
			}	else if (object==selectPlane4){
				submitAnswer(false,"Elephants aren't scared as easily as the predators these lamps are designed for. <br> There has to be another solution...");
			}
		} else if (currentQuestion == 2){
			if (object==selectPlane1){
				submitAnswer(false,"Guard dogs are better suited agaisnt smaller predators, like cheetahs. <br> There has to be another solution...");
			}	else if (object==selectPlane2){
				submitAnswer(false,"This farmer already has a boma, but yet some predators climb over the fences to reach their livestock. <br> Can you find a solution to further scare off predators?");
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bee fences are designed to protect crops against elephants. <br> There has to be another solution...");
			}	else if (object==selectPlane4){
				submitAnswer(true,"By giving farmers these kinds of lights, we help them even further in scaring off predators. <br> Predators are very careful in choosing their prey. The more difficult we make it for them, the safe farmers' livestock will be.");
			}
		} else if (currentQuestion == 3){
			if (object==selectPlane1){
				submitAnswer(true,"Most famers wouldn't be able to afford a guard dog on their own. <br> By giving farmers dogs, and providing free vetrenary care, we make it a lot more affordable for them.");
			}	else if (object==selectPlane2){
				submitAnswer(false,"Alltough this farmers already has a fence or boma, cheetahs continue to try to capture a prey. <br> Do you see a solution to further scare them off cheetahs?");
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bee fences are designed to protect crops against elephants. <br> There has to be another solution...");
			}	else if (object==selectPlane4){
				submitAnswer(false,"While most predators hunt at night, cheetahs tend to do this around dusk and dawn. The torch-lights work best at night. <br> There has to be another solution...");
			}
		}
    } 
}

function submitAnswer(correct, text){
	resultText.innerHTML = text;
	if (correct){
		currentQuestion = currentQuestion+1;
		updateQuestionsAnsweredTxt();
		continuebtn.innerHTML = "Continue"
		resultHeader.innerHTML = "Well Done!"
	} else {
		continuebtn.innerHTML = "Try Again";
		resultHeader.innerHTML = "Too Bad..."
	}
	gameState = "menu";
	updateUI();
}

function updateQuestionsAnsweredTxt(){
	questionsAnsweredTxt.innerHTML = currentQuestion + " /" + questions.length;
}

continuebtn.onclick = function(){
	foundMenu.scrollTop = 0;
	if (!gameComplete){
		if (currentQuestion < questions.length){
			updateSpeechBubbleText();
			gameState = "play";
			updateUI();
		} else {
			//all farmers helped. 
			resultHeader.innerHTML = "All farmers helped!";
			resultText.innerHTML = "Fantastic job! Now all farmers can do their job safely, without having to worry about wild animals. <br> It's important to consult the farmers, so we can find a fitting solution to these problems. <br><br> Besides the solutions you saw here, various organizations are working on other solution to solve human-wildlife conflict around the globe. Come by the Wildlife Foundation at the entrance area to learn more!";
			continuebtn.innerHTML = "Play Again";
			document.getElementById("btnRet").style.display = "block";
			gameComplete = true;
		}
	} else {
		gameComplete = false;
		currentQuestion = 0;
		updateSpeechBubbleText();
		updateQuestionsAnsweredTxt();
		gameState = "play";
		updateUI();
	}
}

function findSelectedObject(point){
	var closestObject;
    var ObjectPos = new THREE.Vector3();
    var shortestdistance;         
	if (selectableObjects.length > 0){ //check which object is closest to the center.
		for (var p = 0; p < selectableObjects.length; p++) {
			ObjectPos = ObjectPos.setFromMatrixPosition(selectableObjects[p].matrixWorld);
            ObjectPos.project(ARCamera);
            ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
            ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
			ObjectPos.z = 0;
            if (p==0){
				closestObject = selectableObjects[p];
                shortestdistance = distance2D(ObjectPos,point);
			}  else {
				if (distance2D(ObjectPos,point) < shortestdistance){
					closestObject = selectableObjects[p];
                    shortestdistance = distance2D(ObjectPos,point);
				}  
            } 
		}	
        return(closestObject);
  	} else {
		return (null); //no objects to select, nothing selected.
	}
}

function getScreenLocation(object){
	var ObjectPos = new THREE.Vector3();
	ObjectPos = ObjectPos.setFromMatrixPosition(object.matrixWorld);
	ObjectPos.project(ARCamera);
	ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
	ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
	ObjectPos.z = 0;
	return (ObjectPos);
}

function distance2D(pointA, pointB){
	var distanceX = pointA.x-pointB.x;
	var distanceY = pointA.y-pointB.y;

	return(Math.sqrt(distanceX*distanceX + distanceY*distanceY));
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}
