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
questions[0] = "Afrikaanse Wilde Honden jagen op mijn vee! Hoe kan ik ze nog los laten grazen?";
questions[1] = "Olifanten eten mijn gewassen op en trappen alles plat! Als ik ze probeer weg te jagen worden ze aggressief!";
questions[2] = "Leeuwen klimmen 's nachts mijn veekraal in en vallen mijn vee aan!";
questions[3] = "Een cheeta ging zomaar aan de haal met een van de schapen uit mijn veekraal!";

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
				submitAnswer(false,"Waakhonden zouden wel ingezet kunnen worden tegen afrikaanse wilde honden, maar dan is er een risico dat de waakhonden ziektes overbrengen op de wilde honden. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane2){
				submitAnswer(true,"Veel boeren laten hun vee vrij rondlopen, wat ze kwetsbaar maakt voor roofdieren. <br> Hekken plaatsen, en deze onderhouden, helpt conflicten te vermijden.")
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bijenhekken hebben als doel om gewassen te beschermen tegen olifanten. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane4){
				submitAnswer(false,"De fakkel lampen moeten op een veekraal worden vastgemaakt, om deze 's nachts beter te beschermen. Deze boer laat zijn vee 's nachts nog vrij rondlopen. <br> Er moet een andere oplossing zijn...");
			}
		} else if (currentQuestion == 1){
			if (object==selectPlane1){
				submitAnswer(false,"Olifanten laten zich niet zo snel afschrikken door een waakhond. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane2){
				submitAnswer(false,"Deze hekken zijn niet sterk genoeg om een olifant tegen te houden. Hekken die wel zo sterk zijn zouden te veel geld kosten. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane3){
				submitAnswer(true,"De bijen in bijenhekken houden olifanten weg, bestuiven gewassen en leveren boeren geld op door de verkoop van honing! <br> Allemaal voordelen, voor een goedkope oplossing!");
			}	else if (object==selectPlane4){
				submitAnswer(false,"Olifanten laten zich minder snel afschrikken dan de roofdieren waar deze lampen voor bedoeld zijn. <br> Er moet een andere oplossing zijn...");
			}
		} else if (currentQuestion == 2){
			if (object==selectPlane1){
				submitAnswer(false,"Waakhonden worden voornamelijk ingezet tegen kleinere roofdieren zoals cheeta's. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane2){
				submitAnswer(false,"Deze boer heeft al een veekraal, toch klimmen sommige roofdieren nog over de hekken heen om bij het vee te komen. <br> Zie jij een oplossing om ze verder af te schrikken?");
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bijenhekken hebben als doel om gewassen te beschermen tegen olifanten. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane4){
				submitAnswer(true,"Door boeren dit soort lampen te geven helpen we ze nog meer met het afschrikken van roofdieren. <br> Roofdieren zijn heel voorzichtig met het uikiezen van hun prooi, hoe moeilijker we het voor ze maken, hoe veiliger het vee zal zijn.");
			}
		} else if (currentQuestion == 3){
			if (object==selectPlane1){
				submitAnswer(true,"De meeste boeren zouden zelf geen waakhond kunnen betalen. <br> Door boeren honden te geven, en gratis dierenartsen te verzorgen maken we het een stuk betaalbaarder voor ze.");
			}	else if (object==selectPlane2){
				submitAnswer(false,"Ook al heeft een boer al een hek of veekraal, proberen sommige roofdieren toch een prooi te bemachtigen. <br> Zie jij een oplossing om ze verder af te schrikken?");
			}	else if (object==selectPlane3){
				submitAnswer(false,"Bijenhekken hebben als doel om gewassen te beschermen tegen olifanten. <br> Er moet een andere oplossing zijn...");
			}	else if (object==selectPlane4){
				submitAnswer(false,"Terwijl de meeste roofdieren nachts jagen, doen cheeta's dit vaker rond zonsopgang en zonsondergang. De fakkels werken het beste 's nachts. Er moet een andere oplossing zijn...");
			}
		}
    } 
}

function submitAnswer(correct, text){
	resultText.innerHTML = text;
	if (correct){
		currentQuestion = currentQuestion+1;
		updateQuestionsAnsweredTxt();
		continuebtn.innerHTML = "Ga Verder"
		resultHeader.innerHTML = "Goed Gedaan!"
	} else {
		continuebtn.innerHTML = "Probeer Opnieuw";
		resultHeader.innerHTML = "Helaas..."
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
			resultHeader.innerHTML = "Alle boeren geholpen!";
			resultText.innerHTML = "Fantastich gedaan! Alle boeren kunnen hun werk nu een stuk veiliger doen en hoeven zich minder zorgen te maken over wilde dieren. <br> Het is belangrijk goed met de boeren te overleggen, zodat een gepaste oplossing kan worden gekozen.<br><br>Naast de oplossingen die je hier zag, werken de verschillende organisaties aan allerlei andere oplossinge om conflicten tussen mens en dier te verhelpen. Kom eens langs bij Stichting Wildlife om meer hierover te leren!";
			continuebtn.innerHTML = "Speel Opnieuw";
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
