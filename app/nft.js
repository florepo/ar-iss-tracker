import { createEarthGnonomic } from './resources/threeJS/models/earth.js'
import { createIssPositionMarker, addIssModelToMarker } from './resources/threeJS/models/iss.js'
import { initOrbitalPosition, updateOrbitalPostion, visualizeOrbit, alignXeciToVernalEquinox, alignISSrelativeEarthSurface} from './resources/helper/sat.js'

const TLE_SOURCE =  'https://tle.ar-iss-tracker.info'

const CAMERA_PARAM_URL = '../resources/data/camera_para.dat'
const NFT_MARKER_URL = './resources/dataNFT/bluemarble'
const ISS_MODEL_URL = './assets/3dmodels/station-mini.gltf';

const scaleFactor = 1/100
const earthRadius = 6371    //km

const ARThreeOnLoad = function(tle) {
  console.log('inside ARThree', tle)
  ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: CAMERA_PARAM_URL,
  onSuccess: function(arScene, arController, arCamera) {

    document.body.className = arController.orientation;

    let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.8 );
    arScene.scene.add( ambientLight );

    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    let window_width = window.innerWidth

    if (arController.orientation === 'portrait') {
      let w = (window_width / arController.videoHeight) * arController.videoWidth;
      let h = window_width;
      renderer.setSize(w, h);
      renderer.domElement.style.paddingBottom = (w-h) + 'px';
    } else {
      if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
        renderer.setSize(window_width, (window_width / arController.videoWidth) * arController.videoHeight);
      } else {
        renderer.setSize(arController.videoWidth, arController.videoHeight);
        document.body.className += ' desktop';
      }
    }

    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    // x positive - left, y positive - up, z positive -towards viewer | x, y zero is bottom right of trigger
    let modelGroup = new THREE.Group();
    modelGroup.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1)); // we need flip the objects since ARtoolkit displays them mirrored
    modelGroup.position.set(80,80,80)

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

    arController.loadNFTMarker(
      NFT_MARKER_URL,
      function(markerId) {
        let markerRoot = arController.createThreeNFTMarker(markerId);
        markerRoot.add(modelGroup);
        arScene.scene.add(markerRoot);
      }
    );

    const animate = function() {
      arScene.process();
      arScene.renderOn(renderer);
      requestAnimationFrame(animate);
    };

    animate();
  }});

  delete window.ARThreeOnLoad;
};

if (window.ARController && ARController.getUserMediaThreeScene) {
  fetch(TLE_SOURCE)
    .then(response => response.json())
    .then(data => extract_first_data_set(data))
    .then(data =>  {
      console.log('data received:', data)
      ARThreeOnLoad(data);
    })
}

const extract_first_data_set = (data) => {
	return data.split("\n").splice(0,3)
}
