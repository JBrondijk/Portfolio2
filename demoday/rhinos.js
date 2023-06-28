const THREE = window.MINDAR.IMAGE.THREE;

//imagetracking template:
var gameState = "start",
	scanning = true,
	clickedObject,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2;

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

//html elements:
const	scanner = document.getElementById("scanning"),
		startMenu = document.getElementById("startMenu"),
		controlsMenu = document.getElementById("controlsMenu"),
		enclMenu = document.getElementById("enclMenu"),
		enclMenuScroll = document.getElementById("enclMenuScroll"),
		menuTitle = document.getElementById("menuTitle"),
		enclMales = document.getElementById("enclMales"),
		enclFemales = document.getElementById("enclFemales"),
		problemHeader = document.getElementById("problemHeader"),
		enclProblemCount = document.getElementById("enclProblemCount"),
		menuFight = document.getElementById("menuFight"),
		menuBreed = document.getElementById("menuBreed"),
		menuMan = document.getElementById("menuMan"),
		menuCrowd = document.getElementById("menuCrowd"),
		enclInfo = document.getElementById("enclInfo"),
		dummyrhino = document.getElementById("iconMaster"),
		selectionMales = document.getElementById("selectionMales"),
		selectionFemales = document.getElementById("selectionFemales"),
		selectPrompt = document.getElementById("selectPrompt"),
		selectionMenu = document.getElementById("selectionMenu"),
		winMenu = document.getElementById("winMenu");

//MAKING ALL THE ENCLOSURES/RHINOS
const enclosures = [];
	enclosures[0] = new enclosure(
							"Enclosure 1",
							document.getElementById("encl0"), 
							document.getElementById("encl0Contents"), 
							document.getElementById("encl0Fight"), 
							document.getElementById("encl0Breed"), 
							document.getElementById("encl0Man"), 
							document.getElementById("encl0Crowd"), 
							[new rhino (true, "#308DFF", "#308DFF"),
							new rhino (false, "#308DFF", "#308DFF"),
							new rhino (false, "# FF3030", "#FF30FF"),
							new rhino (false, "#3030FF", "#3030FF")
							]);
	enclosures[1] = new enclosure(
							"Enclosure 2",
							document.getElementById("encl1"), 
							document.getElementById("encl1Contents"), 
							document.getElementById("encl1Fight"), 
							document.getElementById("encl1Breed"), 
							document.getElementById("encl1Man"), 
							document.getElementById("encl1Crowd"), 
							[new rhino (true, "#3030FF", "#3030FF"),
							new rhino (true, "#308DFF", "#9030FF"),
							new rhino (false, "#FF3030", "#3030FF"),
							new rhino (false, "#FF3030", "#308DFF")
							]);
	enclosures[2] = new enclosure(
							"Enclosure 3",
							document.getElementById("encl2"), 
							document.getElementById("encl2Contents"), 
							document.getElementById("encl2Fight"), 
							document.getElementById("encl2Breed"), 
							document.getElementById("encl2Man"), 
							document.getElementById("encl2Crowd"), 
							[new rhino (true, "#FF3030", "#FF3030"),
							new rhino (false, "#FFED30", "#FFED30"),
							new rhino (false, "#9030FF", "#9030FF")
							]);
	enclosures[3] = new enclosure(
							"Enclosure 4",
							document.getElementById("encl3"), 
							document.getElementById("encl3Contents"), 
							document.getElementById("encl3Fight"), 
							document.getElementById("encl3Breed"), 
							document.getElementById("encl3Man"), 
							document.getElementById("encl3Crowd"), 
							[new rhino (true, "#30FF41", "#30FF41"),
							new rhino (true, "#FFED30", "#30FF41"),
							new rhino (false, "#FF9030", "#FF9030"),
							new rhino (false, "#30FFED", "#30FFED")
							]);
	enclosures[4] = new enclosure(
							"Enclosure 5",
							document.getElementById("encl4"), 
							document.getElementById("encl4Contents"), 
							document.getElementById("encl4Fight"), 
							document.getElementById("encl4Breed"), 
							document.getElementById("encl4Man"), 
							document.getElementById("encl4Crowd"), 
							[new rhino (true, "#FF3030", "#FF3030"),
							new rhino (true, "#FF3030", "#FF9030"),
							new rhino (false, "#FF30FF", "#FF30FF"),
							new rhino (false, "#FF9030", "#FF9030"),
							new rhino (false, "#FF9030", "#FF3030")
							]);
const selection = [];
var roundselection = [];

//Setting all the border colors + appending elements + updating all enclosures
for (var i = 0; i < enclosures.length; i++) {
	for (var p = 0; p < enclosures[i].rhinos.length; p++) {
		enclosures[i].rhinos[p].setupRhino();
	}
	enclosures[i].updateEncl();
	enclosures[i].displayNoRhinos();
}
updateSelection();


//game variables
var	openMenu;
var moves = 0;

var ARCamera;

//ThreeJS stuff:
 
const enclosureTrackers = [];
enclosureTrackers[0]= new THREE.Object3D();
enclosureTrackers[1]= new THREE.Object3D();
enclosureTrackers[2]= new THREE.Object3D();
enclosureTrackers[3]= new THREE.Object3D();
enclosureTrackers[4]= new THREE.Object3D();

enclosureTrackers[0].position.set(-0.35,0.20,0.01);
enclosureTrackers[1].position.set(0.12,0.22,0.01);
enclosureTrackers[2].position.set(-0.22,-0.05,0.01);
enclosureTrackers[3].position.set(-0.30,-0.35,0.01);
enclosureTrackers[4].position.set(0.13,-0.23,0.01);

const backgroundGeometry = new THREE.PlaneGeometry(1,1);
const backgroundMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
const background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);

background.add(enclosureTrackers[0]);
background.add(enclosureTrackers[1]);
background.add(enclosureTrackers[2]);
background.add(enclosureTrackers[3]);
background.add(enclosureTrackers[4]);



document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/neushoorns.mind", //change to correct imagetarget.
			uiLoading: "no",
			uiScanning: "no"//,
			//filterMinCF: 0.001,
			//filterBeta: 4000
		})
		const {renderer, scene, camera} = mindarThree;

		ARCamera = camera;

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(background); 

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

	updateInfoMenuLocations();


	requestAnimationFrame(loop);
}

function updateInfoMenuLocations (){
	for (var i = 0; i < enclosures.length; i++) {
		let coords = getScreenLocation(enclosureTrackers[i])
		coords.y= coords.y-(enclosures[i].infoMenu.offsetWidth/2);
		coords.x=coords.x- (enclosures[i].infoMenu.offsetHeight/2);
		enclosures[i].infoMenu.style.top = coords.y+"px";
		enclosures[i].infoMenu.style.left= coords.x+"px";
	}
}

function updateUI(){
	if (gameState == "play" && scanning){
		displayNone();
		scanner.style.display = "block";
	} else if (gameState == "start"){
		displayNone();
		startMenu.style.display = "block";	
	} else if (gameState == "controls"){
		displayNone(); 
		controlsMenu.style.display = "block";	
	}else if (gameState == "play") {
		displayNone();
		enclInfo.style.display = "block";
		selectPrompt.style.display = "block";
	}  else if (gameState == "menu") {
		displayNone();
		enclMenu.style.display = "block";
		enclMenuScroll.scrollTop = 0;
	} else if (gameState == "win") {
		displayNone();
		winMenu.style.display = "block";
	}
}

function displayNone(){
	startMenu.style.display = "none";	
	controlsMenu.style.display = "none";
	scanner.style.display = "none";
	enclMenu.style.display= "none";
	enclInfo.style.display = "none";
	selectPrompt.style.display = "none";
	winMenu.style.display = "none";
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

function rhino(male, gene1, gene2){
	this.div = dummyrhino.cloneNode(true);
	this.male = male;
	this.gene1 = gene1;
	this.gene2 = gene2;

	this.setupRhino = function () {
		this.div.style.borderTopColor = enclosures[i].rhinos[p].gene1;
		this.div.style.borderLeftColor = enclosures[i].rhinos[p].gene1;
		this.div.style.borderRightColor = enclosures[i].rhinos[p].gene2;
		this.div.style.borderBottomColor = enclosures[i].rhinos[p].gene2;
		this.div.addEventListener("mousedown", function (){selectRhino(this)},false);
		if (this.male){
			enclMales.appendChild(this.div);
		} else {
			enclFemales.appendChild(this.div);
		}
	}
}

function enclosure(enclName, infoMenu, infoContents, infoFight, infoBreed, infoMan, infoCrowd, rhinos){
	this.enclName = enclName;
	this.infoMenu = infoMenu;
	this.infoContents = infoContents;
	this.infoFight = infoFight;
	this.infoBreed = infoBreed;
	this.infoMan = infoMan;
	this.infoCrowd = infoCrowd;
	this.rhinos = rhinos;

	this.maleCount = 0;
	this.femaleCount = 0;
	this.problemAmount = 0;
	this.inbreeding = false;
	this.breedingError = false;
	this.fighting = false;
	this.overCrowded = false;

	//UPDATE FUNCTION
	this.updateEncl = function () {
		//reset  variables
		this.maleCount = 0;
		this.femaleCount = 0;
		this.problemAmount = 0;
		this.inbreeding = false;
		this.breedingError = false;
		this.fighting = false;
		this.overCrowded = false;

		//count males/females
		for( var i = 0; i < this.rhinos.length; i++){  
			if (this.rhinos[i].male){
				this.maleCount++;
			} else {
				this.femaleCount++;
			}

			for( var p = 0; p < this.rhinos.length; p++){  
				if ((this.rhinos[i].gene1 == this.rhinos[p].gene1 || this.rhinos[i].gene2 == this.rhinos[p].gene1 || this.rhinos[i].gene1 == this.rhinos[p].gene2 || this.rhinos[i].gene2 == this.rhinos[p].gene2) && this.rhinos[i].male != this.rhinos[p].male){
					this.inbreeding = true;
					break;
				}
			}
		}
		this.fighting = (this.maleCount > 1 && this.femaleCount > 0);
		this.breedingError = (this.maleCount == 0 && this.femaleCount > 0);
		this.overCrowded = (this.maleCount + this.femaleCount > 5);
		this.problemAmount = this.inbreeding + this.breedingError + this.fighting + this.overCrowded;
		//set all UI elements.
		this.infoContents.innerHTML = "("+this.maleCount+"m - "+this.femaleCount+"f)";

		if (this.fighting){
			this.infoFight.style.display = "inline-block";
		} else {
			this.infoFight.style.display = "none";
		}
		if (this.inbreeding){
			this.infoBreed.style.display = "inline-block";
		} else {
			this.infoBreed.style.display = "none";
		}
		if (this.breedingError){
			this.infoMan.style.display = "inline-block";
		} else {
			this.infoMan.style.display = "none";
		}
		if (this.overCrowded){
			this.infoCrowd.style.display = "inline-block";
		} else {
			this.infoCrowd.style.display = "none";
		}
	}
	//DISPLAY FUNCTION
	this.displayMenu = function () {
		menuTitle.innerHTML = this.enclName;
		if (this.problemAmount > 0){
			problemHeader.style.backgroundColor = "#CC282E";
		} else {
			problemHeader.style.backgroundColor = "#909090";
		}
		enclProblemCount.innerHTML = "("+this.problemAmount+")";
		for (var i = 0; i < this.rhinos.length; i++) {
			this.rhinos[i].div.style.display = "inline-block"
		}	

		if (this.fighting){
			menuFight.style.display = "block";
		} else {
			menuFight.style.display = "none";
		}
		if (this.inbreeding){
			menuBreed.style.display = "block";
		} else {
			menuBreed.style.display = "none";
		}
		if (this.breedingError){
			menuMan.style.display = "block";
		} else {
			menuMan.style.display = "none";
		}
		if (this.overCrowded){
			menuCrowd.style.display = "block";
		} else {
			menuCrowd.style.display = "none";
		}
	}
	this.displayNoRhinos = function () {
		for (var i = 0; i < this.rhinos.length; i++) {
			this.rhinos[i].div.style.display = "none"
		}
	} 
	
}

document.getElementById("btnStart").onclick = function(){
	gameState = "controls";
	updateUI();
}

document.getElementById("btnControls").onclick = function(){
	gameState = "play";
	updateUI();
}

document.getElementById("btnWin").onclick = function(){
	location.reload();
}

document.getElementById("movebtn").onclick = function(){
	gameState = "play";
	updateUI();
}
document.getElementById("closeMenu").onclick = function(){
	gameState = "play";
	updateUI();
}

document.getElementById("encl0").onclick = function(){
	openEnclosureMenu(0);
}
document.getElementById("encl1").onclick = function(){
	openEnclosureMenu(1);
}
document.getElementById("encl2").onclick = function(){
	openEnclosureMenu(2);
}
document.getElementById("encl3").onclick = function(){
	openEnclosureMenu(3);
}
document.getElementById("encl4").onclick = function(){
	openEnclosureMenu(4);
}



function openEnclosureMenu(menuToOpen){
	roundselection = []; //reset roundselection so selection can be tracked. 
	//set the correct menu to open
	if (openMenu!= null){
		enclosures[openMenu].displayNoRhinos();
	}
	openMenu = menuToOpen;
	enclosures[openMenu].displayMenu();
	gameState = "menu";
	updateUI();
}

function selectRhino(element){
	let isSelected = false;
	for( var i = 0; i < selection.length; i++){ 
		if (selection[i].div === element){
			isSelected = true;
			break;
		}
	}
	if (isSelected){
		//move from selection to enclosure
		for( var i = 0; i < selection.length; i++){ 
			if (selection[i].div === element) { 
				enclosures[openMenu].rhinos.push(Object.assign({},selection[i]));
				if (!roundselection.includes(selection[i].div)){
					//this rhino comes from another enclosure
					moves++;
				}


				if (selection[i].male){
					enclMales.appendChild(selection[i].div);
				} else {
					enclFemales.appendChild(selection[i].div);
				}
				selection.splice(i, 1); 
				
				updateSelection();
				enclosures[openMenu].updateEncl();
				enclosures[openMenu].displayMenu();
				checkWin();
				break; 
			}
		}
	} else {
		//move from enclosure to selection
		for( var i = 0; i < enclosures[openMenu].rhinos.length; i++){ 
			if ( enclosures[openMenu].rhinos[i].div === element) { 
				selection.push(Object.assign({},enclosures[openMenu].rhinos[i]));
				roundselection.push(selection[selection.length-1].div);
				if (enclosures[openMenu].rhinos[i].male){
					selectionMales.appendChild(enclosures[openMenu].rhinos[i].div);
				} else {
					selectionFemales.appendChild(enclosures[openMenu].rhinos[i].div);
				}
				enclosures[openMenu].rhinos.splice(i, 1); 

				updateSelection();
				enclosures[openMenu].updateEncl();
				enclosures[openMenu].displayMenu();
			}
		}

	}
}

function updateSelection(){
	let maleCount = 0;
	let femaleCount = 0;
	selectionMenu.style.background = "#FCCF4D";
	selectionMenu.style.color = "black";
	if (selection.length > 0){
		for( var i = 0; i < selection.length; i++){  
			if (selection[i].male){
				maleCount++;
			} else {
				femaleCount++;
			}
		}
		selectionMenu.innerHTML = "Tap an enclosure to add rhinos to it ("+ maleCount+"m - "+ femaleCount + "f selected)";
		document.getElementById("movebtn").innerHTML =  "Move Rhinos ("+(maleCount+femaleCount)+")";
		
		let totalProblems = 0;
		for( var i = 0; i < enclosures.length; i++){ 
			totalProblems = totalProblems + enclosures[i].problemAmount;
		} 
		if (totalProblems == 0) {
			selectionMenu.innerHTML = "You still have "+ maleCount+"m - "+ femaleCount + "f selected, add them to an enclosure to complete the game!";
			selectionMenu.style.background = "#CC282E";
			selectionMenu.style.color = "white";
		}


	} else {
		selectionMenu.innerHTML = "Tap an enclosure to open it";
		document.getElementById("movebtn").innerHTML =  "Return to the overview";
	}
	
}

function checkWin(){
	let totalProblems = 0;
	for( var i = 0; i < enclosures.length; i++){ 
		totalProblems = totalProblems + enclosures[i].problemAmount;
	}
	if (selection.length == 0 && totalProblems == 0){
		//WIN 
		gameState = "win";
		document.getElementById("score").innerHTML = moves;
		updateUI();
	}
}