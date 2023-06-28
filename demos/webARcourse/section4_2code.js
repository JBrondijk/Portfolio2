const THREE = window.MINDAR.IMAGE.THREE;
import {mockWithVideo} from "../libs/camera-mock.js";
document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		
		mockWithVideo("./section4_Files/course-banner1.mp4");

		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.body,
			imageTargetSrc: "./section4_Files/course-banner.mind"
		})
		const {renderer, scene, camera} = mindarThree;

		const geomerty = new THREE.PlaneGeometry(1,1);
		const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
		const plane = new THREE.Mesh(geomerty, material);

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(plane); //THREE.Group

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
	}
	start();
});
