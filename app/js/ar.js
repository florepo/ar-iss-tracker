import { createEarthGnonomic } from './models/earth.js'
import { createIssPositionMarker, addIssModelToMarker } from './models/iss.js'
import { initOrbitalPosition, updateOrbitalPostion, visualizeOrbit, alignXeciToVernalEquinox, alignISSrelativeEarthSurface} from './helper/sat.js'

const TLE_SOURCE =  'https://tle.ar-iss-tracker.info'

const CAMERA_PARAM_URL = './data/camera_para.dat'
const NFT_MARKER_URL = './data/bluemarble'

const ISS_MODEL_URL = './assets/3dmodels/station-mini.gltf';

const scaleFactor = 1/100
const earthRadius = 6371

window.AROnLoad = function(tle) {

	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: CAMERA_PARAM_URL,
		onSuccess: function(arScene, arController, arCamera) {

			document.body.className = arController.orientation;

			let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
			arScene.scene.add( ambientLight );

			let renderer = new THREE.WebGLRenderer({antialias: true});
			renderer.gammaOutput = true;
			renderer.gammaFactor = 2.2;

			if (arController.orientation === 'portrait') {
				let w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
				let h = window.innerWidth;
				renderer.setSize(w, h);
				renderer.domElement.style.paddingBottom = (w-h) + 'px';
			} else {
				if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
					renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
				} else {
					renderer.setSize(arController.videoWidth, arController.videoHeight);
					document.body.className += ' desktop';
				}
			}

			console.log('display-mode:',arController.orientation)

			document.body.insertBefore(renderer.domElement, document.body.firstChild);

			let modelGroup = new THREE.Group();
			// x positive - left, y positive - up, z positive -towards viewer | x, y zero is bottom right of trigger
			modelGroup.position.set(80,80,80)

			console.log(modelGroup)

			let earth = createEarthGnonomic(earthRadius, scaleFactor)
			earth = alignXeciToVernalEquinox(earth)
			modelGroup.add(earth)	
			
			let issPosition = createIssPositionMarker()
			issPosition.scale.set(200,200,200);
			issPosition = initOrbitalPosition(issPosition, tle, 0, scaleFactor)
			issPosition = updateOrbitalPostion(issPosition, scaleFactor)
			modelGroup.add(issPosition)
			
			let orbit = visualizeOrbit(issPosition.userData.satrec, scaleFactor)
			modelGroup.add(orbit)

			addIssModelToMarker(issPosition, ISS_MODEL_URL)
			alignISSrelativeEarthSurface(issPosition)

			modelGroup.rotateOnAxis( new THREE.Vector3(1, 0, 0).normalize(), 90 * Math.PI/180 );

			arController.loadNFTMarker(NFT_MARKER_URL, function(markerId) {
				let markerRoot = arController.createThreeNFTMarker(markerId);

				arScene.scene.add(markerRoot);
				markerRoot.add(modelGroup);
			});

			const animate = function() {
				arScene.process();

				arScene.renderOn(renderer);
				requestAnimationFrame(animate);
			};

			animate();
		}
	});
	delete window.AROnLoad;
};

if (window.ARController && ARController.getUserMediaThreeScene) {
	fetch(TLE_SOURCE)
		.then(response => response.json())
		.then(data => extract_first_tle_set(data))
		.then(tle =>  window.AROnLoad(tle))
}

const extract_first_tle_set = (data) => {
	return data.split("\n").splice(0,3)
}