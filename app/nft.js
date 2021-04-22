const TLE_SOURCE =  'https://tle.ar-iss-tracker.info'

const CAMERA_PARAM_URL = '../resources/data/camera_para.dat'
const NFT_MARKER_URL = './resources/dataNFT/pinball'

const ARThreeOnLoad = function(tle) {
  console.log('inside ARThree', tle)
  ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: CAMERA_PARAM_URL,
  onSuccess: function(arScene, arController, arCamera) {

    document.body.className = arController.orientation;

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

    let sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshNormalMaterial()
    );

    sphere.material.flatShading;
    sphere.position.z = 40;
    sphere.position.x = 80;
    sphere.position.y = 80;
    sphere.scale.set(80,80,80);

    arController.loadNFTMarker(
      NFT_MARKER_URL,
      function(markerId) {
        let markerRoot = arController.createThreeNFTMarker(markerId);
        markerRoot.add(sphere);
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
