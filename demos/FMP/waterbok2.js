/*
Progress bar code from https://codepen.io/theprogrammingexpert/pen/jOqGBLL
*/

import * as THREE from "../libs/three.js-r132/build/three.module.js";
import {DeviceOrientationControls} from "../libs/three.js-r132/examples/jsm/controls/DeviceOrientationControls.js";
import {
	Euler,
	EventDispatcher,
	MathUtils,
	Quaternion,
	Vector3
} from '../libs/three.js-r132/build/three.module.js';

//orientationcontrols
const _zee = new Vector3( 0, 0, 1 );
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

const _changeEvent = { type: 'change' };
const lastQuaternion = new Quaternion();
const EPS = 0.000001;
var deviceOrientation = {};
var screenOrientation = 0;

var alphaOffset = 0; // radians

const onDeviceOrientationChangeEvent = function ( event ) {
	deviceOrientation = event;
};

const onScreenOrientationChangeEvent = function () {
	screenOrientation = window.orientation || 0;
};

// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

const setObjectQuaternion = function ( quaternion, alpha, beta, gamma, orient ) {
	_euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
	quaternion.setFromEuler( _euler ); // orient the device
	quaternion.multiply( _q1 ); // camera looks out the back of the device, not the top
	quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) ); // adjust for screen orientation
};


//html elements
const	playerProgressBar = document.querySelector(".progress"),
		lionProgressBar = document.querySelector(".progressLion"),
		playerIcon = document.querySelector(".playerIcon"),
		lionIcon = document.querySelector(".lionIcon"),
		score0 = document.getElementById("score0"),
		score1 = document.getElementById("score1"),
		score2 = document.getElementById("score2"),
		startMenu = document.getElementById("startMenu"),
		warningMessage = document.getElementById("warningMessage"),
		gameOverMenu = document.getElementById("gameOverMenu"),
		win1Menu = document.getElementById("win1Menu"),
		win2Menu = document.getElementById("win2Menu"),
		iOSMenu = document.getElementById("iOSMenu"),
		btniOS = document.getElementById("btniOS");

let SIZE = {x:0,y:0,width:0,height:0};
//3D stuff. 
	const scene = new THREE.Scene();
	const loader = new THREE.TextureLoader();
	const wbgeometry = new THREE.PlaneGeometry(3,3);
	const wbtexture = loader.load("./textures/waterbok.png");
	const wbNEtexture = loader.load("./textures/waterbokNE.png");
	const wbmaterial = new THREE.MeshBasicMaterial({map: wbtexture, transparent:true, side:2, alphaTest: 0.1});
	const waterbok = new THREE.Mesh(wbgeometry, wbmaterial);

	const grasstexture = loader.load("./textures/grass.png");
	const grassmaterial = new THREE.MeshBasicMaterial({map: grasstexture, transparent:true, side:1, depthWrite: false});
	var grassgeometry = new THREE.CylinderGeometry(1,1,2.5,20,1,true);
	const grass1 = new THREE.Mesh(grassgeometry,grassmaterial);
	const grass2 = new THREE.Mesh(grassgeometry,grassmaterial);
	const grass3 = new THREE.Mesh(grassgeometry,grassmaterial);
	const grass4 = new THREE.Mesh(grassgeometry,grassmaterial);
		grassgeometry = new THREE.CylinderGeometry(10,10,2.5,20,1,true);
	const grassBG = new THREE.Mesh(grassgeometry,grassmaterial);

	const backgroundmaterial = new THREE.MeshBasicMaterial({color:0x4F453F,side:1});
		grassgeometry = new THREE.CylinderGeometry(10.1,10.1,20,20,1,true);
	const backgroundCylinder = new THREE.Mesh(grassgeometry, backgroundmaterial);

	const rotator = new THREE.Object3D();
	const camera = new THREE.PerspectiveCamera();
	camera.rotation.reorder( 'YXZ' );
	const renderer = new THREE.WebGLRenderer({alpha:true});

	let cameraWorldPos = new THREE.Vector3();
	let cameraWorldDir = new THREE.Vector3();
	const raycaster = new THREE.Raycaster();

onScreenOrientationChangeEvent(); // run once on load

// iOS 13+
if (iOS()){
	startMenu.style.display = "none";
	iOSMenu.style.display = "block";
	btniOS.addEventListener( "click", () => {
		if (typeof DeviceMotionEvent.requestPermission === 'function') {
			// Handle iOS 13+ devices.
			DeviceMotionEvent.requestPermission()
				.then((state) => {
				if (state === 'granted') {
					window.addEventListener('devicemotion', handleOrientation);
				} else {
					console.error('Request to access the orientation was rejected');
				}
			})
			.catch(console.error);
		}
		document.body.removeChild( iOSMenu );
		startMenu.style.display = "block";
	});
} else {
	window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
	window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );
}

function handleOrientation(event) {
	const device = deviceOrientation;
	if (device){
		const alpha = event.alpha ? MathUtils.degToRad( device.alpha ) + alphaOffset : 0; // Z

		const beta = event.beta ? MathUtils.degToRad( device.beta ) : 0; // X'

		const gamma = event.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''

		const orient = screenOrientation ? MathUtils.degToRad( screenOrientation ) : 0; // O

		setObjectQuaternion( camera.quaternion, alpha, beta, gamma, orient );
		/*
		if ( 8 * ( 1 - lastQuaternion.dot( camera.quaternion ) ) > EPS ) {

			lastQuaternion.copy( camera.quaternion );
			dispatchEvent( _changeEvent );

		}
		*/
	}
}

//Game logic
var PlayerProgress = 0,
	LionProgress = -10,
	playerDistance = 0,
	lionDistance = -6,
	currentRotation = 180,
	speed = 12,
	score = 0,
	highScore1 = 0,
	highScore2 = 0,
	streak = 0,
	goingLeft = true,
	switchTime = 2,
	elapsedSwitchTime = 0,
	lastTime = (new Date()).getTime(),
	currentTime = 0,
	delta = 0,
	gameState = "start";

const	totalDistance = 30,
		streakGainTime = 5,
		streakLoseTime = 2.5,
		scoreModifier = 1,
		playerSpeed = 1,
		lionSpeed = 0.8,
		minSpeed = 24,
		maxSpeed = 34,
		switchTimeC = 2,
		grassSpeed = 0.06;

//access camera
document.addEventListener("DOMContentLoaded",()=>{
	const VIDEO = document.getElementById("VIDEO");
	let promise = navigator.mediaDevices.getUserMedia({video: true, audio: false, video:{facingMode:"environment"}});
	promise.then(function(signal) {
		VIDEO.setAttribute('autoplay', '');
		VIDEO.setAttribute('muted', '');
		VIDEO.setAttribute('playsinline', '');
		VIDEO.srcObject=signal;
		VIDEO.play();
		
	}).catch(function(err) {
		alert("Website werkt niet zonder cameratoestemming.");
	});

//ready scene.
	VIDEO.addEventListener("canplay", function(e){
			let resizer= window.innerWidth/VIDEO.videoWidth;

			SIZE.width=resizer*VIDEO.videoWidth;
			SIZE.height=resizer*VIDEO.videoHeight;
			SIZE.x=VIDEO.width/2-SIZE.width/2;
			SIZE.y=VIDEO.height/2-SIZE.height/2;

			VIDEO.setAttribute("width", SIZE.width);
			VIDEO.setAttribute("height",SIZE.height);

			renderer.setSize(SIZE.width,SIZE.height);

			document.getElementById("spacer").style.height = String(SIZE.height).concat("px");
	})
	
	scene.add(rotator);
	scene.add(waterbok);
	waterbok.userData.iswaterbok = true;
	rotator.add(waterbok);
	waterbok.position.set(3.6,-0.25,0);
	waterbok.rotation.set (0,Math.PI/2,0);
	waterbok.frustumCulled = false;
	waterbok.renderOrder = 6;
	rotator.frustumCulled = false;
	addGrass();

	camera.position.set(0,0,0);
	
	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);

	animate();
});
	
function animate(){
	//calculate deltatime
	currentTime = (new Date()).getTime();
	delta = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	if (gameState == "play1" || gameState == "play2"){
		detectLookDirection();
		moveWaterbok();	
		updateProgress();
		moveLion();
	}
	updateOrientation();
}
//end of animate function

function moveWaterbok(){
	//move waterbok
	if (goingLeft){
		currentRotation = currentRotation + speed*delta;
	} else {
		currentRotation = currentRotation - speed*delta;
	}
	rotator.rotation.set(0, currentRotation*(Math.PI/180), 0);

	setWaterbokDistance(3.6+4*(PlayerProgress/100));

	//pick new direction & speed when it's time
	elapsedSwitchTime = elapsedSwitchTime + delta;
	if (elapsedSwitchTime > switchTime){
		pickDirection();
		speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
		elapsedSwitchTime = 0;
		switchTime = Math.random() * (switchTimeC) + switchTimeC;
	}
}
function pickDirection(){
	var newDirection = Math.random() >= 0.3+(PlayerProgress/200);
	if (newDirection){
		waterbok.rotation.y = waterbok.rotation.y+Math.PI;
		goingLeft = !goingLeft;
	}
}
function setWaterbokDistance(distance){
	waterbok.position.x = distance; 
	waterbok.renderOrder = 10-distance;
}

function detectLookDirection(){
	//cast ray from middle of screen, increase score if looking at waterbok, increase distance to waterbok otherwise.
	camera.getWorldPosition(cameraWorldPos);
	camera.getWorldDirection(cameraWorldDir);
	raycaster.set(cameraWorldPos,cameraWorldDir);
	const intersects = raycaster.intersectObjects(scene.children,true);

	if (intersects.length > 0){ 
		for (let i = 0; i < intersects.length; i++){
			if(intersects[i].object.userData.iswaterbok){ //check if object is the waterbok
				lookAt();
				break;
			}
			if (i == intersects.length-1){
				lookAway(); //no waterbok found
			}
		}
	} else {
		lookAway();
	}
}
function lookAt (){
	if (streak<1){
		streak = streak + delta/streakGainTime;
	} else {
		streak = 1;
	}
	score = score+(scoreModifier+streak)*delta;
	playerDistance = playerDistance + playerSpeed*delta;
	moveGrass(grass1);
    moveGrass(grass2);
    moveGrass(grass3);
    moveGrass(grass4); 
}
function lookAway(){
	if (streak>0){
	streak = streak - delta/streakLoseTime;
	} else {
		streak = 0;
	}
}
function updateProgress (){
	PlayerProgress = (playerDistance/totalDistance)*100;
	LionProgress = (lionDistance/totalDistance)*100;

	playerProgressBar.style.width = `${Math.max(PlayerProgress,0)}%`;
	playerIcon.style.left = `${getIconPosition(PlayerProgress)}vw`;
	lionProgressBar.style.width = `${Math.max(LionProgress,0)}%`;
	lionIcon.style.left = `${getIconPosition(LionProgress)}vw`;

	if (PlayerProgress > 100){
		if (gameState == "play1"){
			gameState = "win";
			win1Menu.style.display = "block";
		}
		if (gameState == "play2"){
			gameState = "finished";
			win2Menu.style.display = "block";
		}		
	}

	score0.innerHTML = Math.round(score).toString()

	if (gameState == "play1" && score > highScore1){
		score1.innerHTML = Math.round(score).toString();
	}
	if (gameState == "play2" && score > highScore2){
		score2.innerHTML = Math.round(score).toString();
	}
}
function getIconPosition (iconPosition){
	return ((iconPosition/100)*95-5);
}
function moveLion(){
	lionDistance = lionDistance+0.7*delta;
	if (lionDistance>playerDistance){
		if (gameState == "play1"){ gameState = "gameOver1"}
		if (gameState == "play2"){ gameState = "gameOver2"}
		gameOverMenu.style.display = "block";
	}
}

function moveGrass(grass){
	let scale = grass.scale.x;
	if(scale < 1.5){
  		grass.scale.set(9.5,1,9.5)
	} else {
  		grass.scale.set(scale-grassSpeed,1,scale-grassSpeed)
	}
	//update renderOrder...
	scale = grass.scale.x;
	setGrassHeight(grass);
	grass.renderOrder = 10-scale;
}
function setGrassHeight(grass){
	let scale = grass.scale.x;
	grass.position.set(0,((scale*0.03)-0.51),0);
}

function addGrass(){
	scene.add (grass1)
	grass1.userData.iswaterbok = false;
	grass1.renderOrder = 8;
	grass1.scale.set(2,1,2);
	setGrassHeight(grass1);
	scene.add (grass2)
	grass2.userData.iswaterbok = false;
	grass2.rotation.set(0,Math.PI*0.5,0);
	grass2.renderOrder = 6;
	grass2.scale.set(4,1,4);
	setGrassHeight(grass2);
	scene.add (grass3)
	grass3.userData.iswaterbok = false;
	grass3.rotation.set(0,Math.PI,0);
	grass3.renderOrder = 4;
	grass3.scale.set(6,1,6);
	setGrassHeight(grass3);
	scene.add (grass4)
	grass4.userData.iswaterbok = false;
	grass4.rotation.set(0,Math.PI*0.75,0);
	grass4.renderOrder = 2;
	grass4.scale.set(8,1,8);
	setGrassHeight(grass4);

	scene.add (grassBG)
	grassBG.userData.iswaterbok = false;
	grassBG.position.set(0,-0.21,0);
	grassBG.rotation.set(0,Math.PI*1.5,0);
	grassBG.renderOrder = 0;

	scene.add(backgroundCylinder);
	backgroundCylinder.userData.iswaterbok = false;
	backgroundCylinder.position.set(0,-10.66,0);
	backgroundCylinder.rotation.set(0,Math.PI*1.5,0);
	backgroundCylinder.renderOrder = 0;
}
function resetGame (){
	playerDistance = 0;
	lionDistance = -6;
	score = 0;
	streak = 0;
	elapsedSwitchTime= 0;

	updateProgress();
	setWaterbokDistance (3.6);
}

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

function updateOrientation(){
	const device = deviceOrientation;
	if (device){
		const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) + alphaOffset : 0; // Z

		const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'

		const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''

		const orient = screenOrientation ? MathUtils.degToRad( screenOrientation ) : 0; // O

		setObjectQuaternion( camera.quaternion, alpha, beta, gamma, orient );
		/*
		if ( 8 * ( 1 - lastQuaternion.dot( camera.quaternion ) ) > EPS ) {

			lastQuaternion.copy( camera.quaternion );
			dispatchEvent( _changeEvent );

		}
		*/
	}
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	warningMessage.style.display = "block";
}

document.getElementById("btnWarn").onclick = function(){
	resetGame();
	warningMessage.style.display = "none";
	if (gameState == "start" || gameState == "gameOver1"){gameState = "play1"}
	if (gameState == "win" || gameState == "gameOver2"){gameState = "play2"}
}
document.getElementById("btnGameOver").onclick = function(){
	gameOverMenu.style.display = "none";
	warningMessage.style.display = "block";
}
document.getElementById("btnWin1").onclick = function(){
	win1Menu.style.display = "none";
	warningMessage.style.display = "block";
	wbmaterial.map = wbNEtexture;
}