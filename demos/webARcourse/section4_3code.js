import{GLTFLoader} from "./libs/three.js-r132/examples/jsm/loaders/GLTFLoader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.body,
			imageTargetSrc: "./section4_Files/cheetah.mind"
		})
		const {renderer, scene, camera} = mindarThree;

		const geomerty = new THREE.PlaneGeometry(1,1);
		const material = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.8});
		const plane = new THREE.Mesh(geomerty, material);

		const light = new THREE.HemishpereLight(0xffffff, 0xbbbbff, 1);
		scene.add(light);

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(plane); //THREE.Group

		const loader = new GLTFLoader();
		loader.load("./section4_Files/cheetah.gltf", (gltf)=>{
			//gltf.scene, THREE.Group
			gltf.scene.scale.set(1,1,1);
			gltf.scene.position.set(0,0,0);
			anchor.group.add(gltf.scene);
		});

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
	}
	start();
});
