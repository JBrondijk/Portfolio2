const THREE = window.MINDAR.IMAGE.THREE;

//imagetracking template:
var started = false,
	scanning = true;

const selectableOjects = []; //add selectable objects to this array
/*
	//add objects like this:
	selectableobjects[0] = new THREE.Mesh(geometry, material);
	plane.add(selectableObjects[0]); //do this later where geometry, materials and plane are defined. 
*/

//html elements:
const	scanner = document.getElementById("scanning"),
		startMenu = document.getElementById("startMenu"),
		selectMenu = document.getElementById("selectMenu"),
		selectbtn = document.getElementById("btnSelect");

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/cheetah.mind",
			uiLoading: "no",
			uiScanning: "no"
		})
		const {renderer, scene, camera} = mindarThree;

		const geomerty = new THREE.PlaneGeometry(1,1);
		const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
		const plane = new THREE.Mesh(geomerty, material);

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(plane); //Build scene here.

		//on target found
		anchor.onTargetFound = () => {
			scanning = false;
			shouldScan();
			if (started){
				selectbtn.style.display = "block";
				selectMenu.style.display = "block";
			}
		}
		
		//on target lost
		anchor.onTargetLost = () => {
			scanning = true;
			shouldScan();

			selectbtn.style.display = "none";
			selectMenu.style.display = "none";
		}

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
	}
	start();
});

function shouldScan(){
	if (started&&scanning){
		scanner.style.display = "block";
	} else {
		scanner.style.display = "none";
	}
}

//select button
selectbtn.onclick = function(){
	
}


document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	started = true;
	shouldScan();
}