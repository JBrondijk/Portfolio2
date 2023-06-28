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
	clickedObject,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2, 

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
		startMenu = document.getElementById("startMenu");
var ARCamera;

//ThreeJS stuff:
const geometry = new THREE.PlaneGeometry(1,1);
const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
const plane = new THREE.Mesh(geometry, material);


document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/cheetah.mind", //change to correct imagetarget.
			uiLoading: "no",
			uiScanning: "no"//,
			//filterMinCF: 0.001,
			//filterBeta: 4000
		})
		const {renderer, scene, camera} = mindarThree;

		ARCamera = camera;

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(plane); //Build scene here.

		selectableObjects[0]=plane; //for testing purpose, be sure to remove in other apps. 

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
	} /* else if (gamestate == "menu") {
		//add additional gamestates like this
		//make sure to set new gameStates to "block" in other gamestates. 
	} */
}

function displayNone(){
	startMenu.style.display = "none";	
	scanner.style.display = "none";
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