const THREE = window.MINDAR.IMAGE.THREE;

document.getElementById("myARcontainer").addEventListener("click", onClickScreen, false);
document.getElementById("xrayBox").addEventListener("click", onClickXray, false);

function onClickScreen (){
	if (gameState == "play"){
		var coords = new THREE.Vector2();
		coords.x = (event.clientX);
		coords.y = (event.clientY);

		let selectedObject = findSelectedObject(coords,true);
		select(selectedObject);
	}
}


function onClickXray (){
	if (gameState == "play"){
		var coords = new THREE.Vector2();
		coords.x = (event.clientX);
		coords.y = (event.clientY);

		let selectedObject = findSelectedObject(coords,true);
		select(selectedObject);
	}
}

//imagetracking template:
var gameState = "start",
	scanning = true,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	boxOffset = (document.getElementById("myARcontainer").clientHeight)-documentHeight, //offset the selectionbox using this variable to make its location the same on every browser. 
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2, 
	selectionBox = new DOMRect(documentWidth*0.1, documentHeight*0.25+boxOffset, documentWidth*0.8, documentWidth*0.8-boxOffset);

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

	//game variables:
	var conveyorOffset = 0.5,
		conveyorSpeed = 0.2,
		spawnTimer = 0,
		spawnTime = 1,
		souvenirCount = getRandomInt(3,4), //after spawning this many items a souvenir is spawned instead.
		souvenirToSpawn,
		lastSpawnX = 0,
		ARCamera,
		souvenirsFound = 0,
		postGame = false;

	//html elements:
	const	scanner = document.getElementById("scanning"),
			startMenu = document.getElementById("startMenu"),
			selectMenu = document.getElementById("selectMenu"),
			foundMenu = document.getElementById("foundMenu"),
			nothingFound = document.getElementById("nothingFound"),
			allFound = document.getElementById("allFound"),
			souvenirPages = [],
			souvenirsFoundTxt = document.getElementById("souvenirsFound");

	souvenirPages[0] = document.getElementById("souvenir0");
	souvenirPages[1] = document.getElementById("souvenir1");
	souvenirPages[2] = document.getElementById("souvenir2");
	souvenirPages[3] = document.getElementById("souvenir3");
	souvenirPages[4] = document.getElementById("souvenir4");


	updateSouvenirsFoundTxt ();

//ThreeJS stuff:
const loader = new THREE.TextureLoader();
	//geometries
	const geometry = new THREE.PlaneGeometry(1,1);
	const suitcaseGeometry = new THREE.PlaneGeometry(0.3,0.3);
	const souvenirGeometry = new THREE.PlaneGeometry(0.1,0.1);
	const xrayGeometry = new THREE.PlaneGeometry(0.03,0.03);

	//textures
	const conveyorTexture = loader.load("./textures/souvenirs/conveyor.png");
		conveyorTexture.wrapS=THREE.RepeatWrapping;
		conveyorTexture.wrapT = THREE.RepeatWrapping;
	const souvenirTextures = [];
		souvenirTextures[0] = loader.load("./textures/souvenirs/souvenir1_bracelet_xray.png");
		souvenirTextures[1] = loader.load("./textures/souvenirs/souvenir2_feather_xray.png");
		souvenirTextures[2] = loader.load("./textures/souvenirs/souvenir3_ivory_xray.png");
		souvenirTextures[3] = loader.load("./textures/souvenirs/souvenir4_turtles_xray.png");
		souvenirTextures[4] = loader.load("./textures/souvenirs/souvenir5_medicine_xray.png");
	const suitcaseOpenTextures = [];
		suitcaseOpenTextures[0] = loader.load("./textures/souvenirs/suitcase1.1_open.png");
		suitcaseOpenTextures[1] = loader.load("./textures/souvenirs/suitcase1.2_open.png");
		suitcaseOpenTextures[2] = loader.load("./textures/souvenirs/suitcase2.1_open.png");
		suitcaseOpenTextures[3] = loader.load("./textures/souvenirs/suitcase2.2_open.png");
		suitcaseOpenTextures[4] = loader.load("./textures/souvenirs/suitcase3.1_open.png");
		suitcaseOpenTextures[5] = loader.load("./textures/souvenirs/suitcase3.2_open.png");
		suitcaseOpenTextures[6] = loader.load("./textures/souvenirs/suitcase4.1_open.png");
		suitcaseOpenTextures[7] = loader.load("./textures/souvenirs/suitcase4.2_open.png");
		suitcaseOpenTextures[8] = loader.load("./textures/souvenirs/suitcase4.3_open.png");
		suitcaseOpenTextures[9] = loader.load("./textures/souvenirs/suitcase4.4_open.png");
	const suitcaseClosedTextures = [];
		suitcaseClosedTextures[0] = loader.load("./textures/souvenirs/suitcase1.1_closed.png");
		suitcaseClosedTextures[1] = loader.load("./textures/souvenirs/suitcase1.2_closed.png");
		suitcaseClosedTextures[2] = loader.load("./textures/souvenirs/suitcase2.1_closed.png");
		suitcaseClosedTextures[3] = loader.load("./textures/souvenirs/suitcase2.2_closed.png");
		suitcaseClosedTextures[4] = loader.load("./textures/souvenirs/suitcase3.1_closed.png");
		suitcaseClosedTextures[5] = loader.load("./textures/souvenirs/suitcase3.2_closed.png");
		suitcaseClosedTextures[6] = loader.load("./textures/souvenirs/suitcase4.1_closed.png");
		suitcaseClosedTextures[7] = loader.load("./textures/souvenirs/suitcase4.2_closed.png");
		suitcaseClosedTextures[8] = loader.load("./textures/souvenirs/suitcase4.3_closed.png");
		suitcaseClosedTextures[9] = loader.load("./textures/souvenirs/suitcase4.4_closed.png");
	//materials
	const conveyorMaterial = new THREE.MeshBasicMaterial({map:conveyorTexture,side:3});
	//const xrayMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent : !0, opacity : 0, side:2 } );
	//const xrayMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent : !0, opacity : 0.5, side:2 } );
	const hidePlaneMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, colorWrite: false});
	const souvenirMaterials = [];
		souvenirMaterials[0] = new THREE.MeshBasicMaterial({map: souvenirTextures[0], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[1] = new THREE.MeshBasicMaterial({map: souvenirTextures[1], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[2] = new THREE.MeshBasicMaterial({map: souvenirTextures[2], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[3] = new THREE.MeshBasicMaterial({map: souvenirTextures[3], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[4] = new THREE.MeshBasicMaterial({map: souvenirTextures[4], transparent:true, side:3, alphaTest: 0.1});
	const suitcaseMaterials = [];
		suitcaseMaterials[0] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[0], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[1] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[1], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[2] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[2], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[3] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[3], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[4] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[4], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[5] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[5], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[6] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[6], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[7] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[7], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[8] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[8], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[9] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[9], transparent:true, side:3, alphaTest: 0.1});
	const suitcaseOpenMaterials = [];
		suitcaseOpenMaterials[0] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[0], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[1] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[1], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[2] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[2], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[3] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[3], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[4] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[4], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[5] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[5], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[6] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[6], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[7] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[7], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[8] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[8], transparent:true, side:3, alphaTest: 0.1});
		suitcaseOpenMaterials[9] = new THREE.MeshBasicMaterial({map: suitcaseOpenTextures[9], transparent:true, side:3, alphaTest: 0.1});

	const suitcases = [];
	
	const souvenirFound = [];
	//set all of souvenirFound's values to false. 
	for (var i = 0; i < souvenirTextures.length; i++){
		souvenirFound [i] = false;
	}	

const conveyor = new THREE.Mesh(geometry, conveyorMaterial);
const hidePlaneTop = new THREE.Mesh(geometry, hidePlaneMaterial);
	hidePlaneTop.position.set(0,1,0.02);
	conveyor.add(hidePlaneTop);
const hidePlaneBottom = new THREE.Mesh(geometry, hidePlaneMaterial);
	hidePlaneBottom.position.set(0,-1,0.02);
	conveyor.add(hidePlaneBottom);

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/souvenirs.mind",
			uiLoading: "no",
			uiScanning: "no"//,
			//filterMinCF: 0.001,
			//filterBeta: 4000
		})
		const {renderer, scene, camera} = mindarThree;
		ARCamera = camera;
		//renderer.domElement.style.top = boxOffset+"px";
		
		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(conveyor); //Build scene here.

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

	updateSelectionBox()

	if (gameState != "menu"){
		//animate the conveyor belt
		conveyorOffset = conveyorOffset+conveyorSpeed*delta;
		if (conveyorOffset > 1){
    		conveyorOffset = 0;
		}
		conveyor.material.map.offset.set(0,conveyorOffset);
		moveObjects(suitcases);

			//check if need to spawn new suitcase
		spawnTimer = spawnTimer+delta;
		if (spawnTimer > spawnTime){
    		spawn();
			spawnTimer = 0;
		}
	}
	
	checkXray();



	requestAnimationFrame(loop);
}

function moveObjects(arrayToMove){
	if (arrayToMove.length > 0) {
		for(var i = arrayToMove.length-1; i >= 0; i--){
			arrayToMove[i].position.y=arrayToMove[i].position.y-conveyorSpeed*delta;
			if (arrayToMove[i].userData.isSouvenircase){
			}
			if (arrayToMove[i].position.y < -0.65){
        			conveyor.remove(arrayToMove[i]);
				arrayToMove.splice(i,1);
			}
		}
	}
}

function checkXray (){
	if (suitcases.length > 0) {
		for(var i = suitcases.length-1; i >= 0; i--){
			if (suitcases[i].userData.isSouvenircase && !suitcases[i].userData.isOpen){
				var objectPos = new THREE.Vector3;
				objectPos = objectPos.setFromMatrixPosition(suitcases[i].matrixWorld);
				objectPos.project(ARCamera);
				objectPos.x = (objectPos.x * widthHalf) + widthHalf;
				objectPos.y = - (objectPos.y * heightHalf) + heightHalf;
				objectPos.z = 0;
				if (selectionBoxContains(objectPos.x, objectPos.y) && selectMenu.style.display == "block"){
					suitcases[i].children[0].visible = false;
				} else {
					suitcases[i].children[0].visible = true;
				}
			}
		}
	}
}

function spawn(){
	let spawnX = 0.35-(0.7*Math.random());
	if (spawnX-lastSpawnX < 0.3+Math.random()*0.1){
    	spawnX = lastSpawnX + 0.3;
		if (spawnX > 0.35){
       		spawnX = spawnX-0.7;
		}
	}
	lastSpawnX = spawnX;

	souvenirCount = souvenirCount -1;

    if (souvenirCount <= 0){
		souvenirCount = getRandomInt(6,10)
		spawnSouvenir(spawnX);
    } else {
		var suitcaseNumber = getRandomInt(0,suitcaseMaterials.length-1);
		suitcases.push(new THREE.Mesh(suitcaseGeometry,suitcaseMaterials[suitcaseNumber]));
		
		suitcases[suitcases.length-1].position.set(spawnX,0.65,0.01);
		suitcases[suitcases.length-1].userData.suitcaseNumber = suitcaseNumber;
		suitcases[suitcases.length-1].userData.isOpen = false;
		suitcases[suitcases.length-1].userData.isSouvenircase = false;

		conveyor.add(suitcases[suitcases.length-1]);
    }
}

function spawnSouvenir(x){
	var suitcaseNumber = getRandomInt(0,suitcaseMaterials.length-1);
	souvenirToSpawn = getRandomInt(0,souvenirPages.length-1);
	if (souvenirsFound < souvenirPages.length){
		checkSouvenirToSpawn();
	}
	suitcases.push(new THREE.Mesh(suitcaseGeometry,suitcaseMaterials[suitcaseNumber]));
		
    suitcases[suitcases.length-1].position.set(x,0.65,0.01);
	suitcases[suitcases.length-1].add(new THREE.Mesh(suitcaseGeometry,suitcaseMaterials[suitcaseNumber]));
	suitcases[suitcases.length-1].children[0].position.z=0.002;
	suitcases[suitcases.length-1].add(new THREE.Mesh(souvenirGeometry,souvenirMaterials[souvenirToSpawn]));
	suitcases[suitcases.length-1].children[1].position.z=0.001;
	suitcases[suitcases.length-1].userData.souvenirNumber = souvenirToSpawn;
	suitcases[suitcases.length-1].userData.suitcaseNumber = suitcaseNumber;
	suitcases[suitcases.length-1].userData.isOpen = false; 
	suitcases[suitcases.length-1].userData.isSouvenircase = true;

    conveyor.add(suitcases[suitcases.length-1]);
}

//check if value of souvenirToSpawn is an unfound souvenir
function checkSouvenirToSpawn (){
	if (souvenirFound[souvenirToSpawn]){
		souvenirToSpawn = souvenirToSpawn +1;
		if (souvenirToSpawn > souvenirPages.length-1){
			souvenirToSpawn = 0;
		}
		checkSouvenirToSpawn();
	} else {
		return;
	}
}

function select(objectToSelect){
	if (objectToSelect != null){
		if (objectToSelect.userData.isSouvenircase){
			//selection is a souvenir
			objectToSelect.remove(objectToSelect.children[0]);
			objectToSelect.remove(objectToSelect.children[0]);
			objectToSelect.material = suitcaseOpenMaterials[objectToSelect.userData.suitcaseNumber]
			objectToSelect.userData.isOpen = true;
			if (!souvenirFound[objectToSelect.userData.souvenirNumber]){
				souvenirFound[objectToSelect.userData.souvenirNumber] = true;
				souvenirsFound = souvenirsFound +1;
				updateSouvenirsFoundTxt();
			}
			gameState = "menu";
			souvenirPages[objectToSelect.userData.souvenirNumber].style.display = "block"; //open correct menu
			updateUI();
		} else {
			//selection is not a souvenir
			objectToSelect.material = suitcaseOpenMaterials[objectToSelect.userData.suitcaseNumber]
			objectToSelect.userData.isOpen = true;
			gameState = "menu";
			nothingFound.style.display = "block";
			updateUI();
		}
	}
}


function findSelectedObject(point,touch){
	var closestObject;
    var ObjectPos = new THREE.Vector3();
    var shortestdistance;    
	if (suitcases.length > 0){ //check which object is closest to the center.
		for (var p = 0; p < suitcases.length; p++) {
			ObjectPos = ObjectPos.setFromMatrixPosition(suitcases[p].matrixWorld);
            ObjectPos.project(ARCamera);
            ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
            ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
			ObjectPos.z = 0;
			if (!suitcases[p].userData.isOpen){
				if (closestObject == null){
					closestObject = suitcases[p];
					shortestdistance = distance2D(ObjectPos,point);
				} else {
					if (distance2D(ObjectPos,point) < shortestdistance){
						closestObject = suitcases[p];
                		shortestdistance = distance2D(ObjectPos,point);
					}
				}
			}
		}	
		if (closestObject != null){
			if (touch){
				return (closestObject);
			} else {
				//check if closest object is in the selectionbox.
				ObjectPos = ObjectPos.setFromMatrixPosition(closestObject.matrixWorld);
				ObjectPos.project(ARCamera);
				ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
				ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
				if (selectionBoxContains(ObjectPos.x, ObjectPos.y)){
					return(closestObject);
				} else {
					return (null); 
				}
			}
		} else {
			return (null); 
		}
  	} else {
		return (null);
	}
}

function distance2D(pointA, pointB){
	var distanceX = pointA.x-pointB.x;
	var distanceY = pointA.y-pointB.y;

	return(Math.sqrt(distanceX*distanceX + distanceY*distanceY));
}

function updateSelectionBox(){
	selectionBox = selectMenu.getBoundingClientRect(); 
}
function selectionBoxContains(x,y){
	return (selectionBox.x <= x && x <= selectionBox.x+selectionBox.width && selectionBox.y <= y && y <= selectionBox.y + selectionBox.height);
}

//generate random integer (for array selections)
function getRandomInt(min, max) {
	var output = Math.floor(Math.random() * (max - min + 1) + min)
	return Math.floor(output);
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
		selectMenu.style.display = "block";
	}  else if (gameState == "menu") {
		displayNone();
		foundMenu.style.display = "block";
	} 
}

function displayNone(){
		scanner.style.display = "none";
		startMenu.style.display = "none";	
		selectMenu.style.display = "none";
		foundMenu.style.display = "none";
}

function updateSouvenirsFoundTxt(){
	souvenirsFoundTxt.innerHTML = souvenirsFound + " /" + souvenirPages.length;
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}

document.getElementById("btnContinue").onclick = function(){
	foundMenu.scrollTop = 0;	
	nothingFound.style.display = "none";
	allFound.style.display = "none";
	for (var p = 0; p < souvenirPages.length; p++) {
		souvenirPages[p].style.display = "none";
	}
	if (souvenirsFound >= souvenirPages.length && !postGame){ //if the game is completed for the first time
		postGame = true; //set the game to be completed before
		allFound.style.display = "block" //open the completion menu.
		document.getElementById("btnRet").style.display = "block";
	} else {
		gameState = "play";
		updateUI();
	}
}