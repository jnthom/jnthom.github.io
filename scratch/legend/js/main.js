import './three/three.js';
import './three/GLTFLoader.js';
import './three/RGBELoader.js';
import './three/OrbitControls.js';
import { environments } from './environment/index.js';

const colors = [
  {
    name: 'Burnt Orange',
    val: 'e97300'
  },
  {
    name: 'Mars Red',
    val: 'e1261c'
  },
  {
    name: 'Rush Green',
    val: '4c9d2f'
  },
  {
    name: 'Patriot Blue',
    val: '004a88'
  },
  {
    name: 'Purple Lilac',
    val: '7c6991'
  },
  {
    name: 'Storm Gray',
    val: 'b2b2b2'
  },
  {
    name: 'Olympia White',
    val: 'ffffff'
  },
  {
    name: 'Stone Gray',
    val: 'a7a089'
  },
  {
    name: 'Slate Gray',
    val: '63656a'
  },
  {
    name: 'Jet Black',
    val: '000000'
  },
  {
    name: 'Mint Green',
    val: '007953'
  },
  {
    name: 'Ever Green',
    val: '0a5640'
  },
];
const populateColorOptions = (category) => {
  const container = document.getElementById(category);
  for (let i = 0; i < colors.length; i++) {
    const input = document.createElement('input');
    input.type = 'radio';
    input.id = `${category}_color${i}`;
    input.name = category;
    input.value = colors[i].val;
    container.appendChild(input);

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.classList.add('colorOption');
    label.style.backgroundColor = '#' + colors[i].val;
    label.title = colors[i].name;
    container.appendChild(label);
  }
};
populateColorOptions('pc');
populateColorOptions('sc');

const initialCameraPosition = {
  x: 2.739,
  y: 2.4579,
  z: 4.9824
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(camera);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.physicallyCorrectLights = true;
//renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.gammaFactor = 22;
renderer.setClearColor( 0xcccccc );
renderer.setPixelRatio( window.devicePixelRatio );
//renderer.toneMappingExposure = 1;
const body = document.querySelector('body');
renderer.setSize( body.offsetWidth, body.offsetHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

camera.position.z = 5;

let lights = [
  [ 10,  0,  10],
  [-10,  0,  10],
  [ 10,  0, -10],
  [-10,  0, -10],
  [ 10,  3,  10],
  [-10,  3,  10],
  [ 10,  3, -10],
  [-10,  3, -10],
];
for (const lightPos of lights) {
  let light = new THREE.PointLight( 0xeeeeee, 1, 100 );
  light.position.set(...lightPos);
  //scene.add( light );
}

// Need less metalness??
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
//scene.add( light );
let addLights = () => {
  const light1  = new THREE.AmbientLight(0xFFFFFF, 0.3);
  light1.name = 'ambient_light';
  camera.add( light1 );

  const light2  = new THREE.DirectionalLight(0xFFFFFF, 0.8 * Math.PI);
  light2.position.set(0.5, 0, 0.866); // ~60º
  light2.name = 'main_light';
  camera.add( light2 );
};
addLights();

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

const getCubeMapTexture = path => {

  // no envmap
  if ( ! path ) return Promise.resolve( { envMap: null } );

  return new Promise( ( resolve, reject ) => {

    new THREE.RGBELoader()
      .setDataType( THREE.UnsignedByteType )
      .load( path, ( texture ) => {

        const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
        pmremGenerator.dispose();

        resolve( { envMap } );

      }, undefined, reject );

  });

};

const updateEnvironment = () => {

  const url = 'js/environment/autoshop_01_1k.hdr';

  getCubeMapTexture( url ).then(( { envMap } ) => {

//    if ((!envMap || !this.state.background) && this.activeCamera === this.defaultCamera) {
//      this.scene.add(this.vignette);
//    } else {
//      this.scene.remove(this.vignette);
//    }

    scene.environment = envMap;
    //this.scene.background = this.state.background ? envMap : null;

  });

};
updateEnvironment();

var loader = new THREE.GLTFLoader();

loader.load( 'models/half-cage.glb', function ( gltf ) {

  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.x = 0;
  gltf.scene.position.y = 0;
  gltf.scene.position.z = 0;
  scene.add( gltf.scene );

  var boundingBox = new THREE.Box3();

  boundingBox.setFromObject( gltf.scene );
  boundingBox.getCenter(controls.target);

  camera.position.x = initialCameraPosition.x;
  camera.position.y = initialCameraPosition.y;
  camera.position.z = initialCameraPosition.z;

  // set camera to rotate around center of object
  controls.update();

  document.querySelector('#pc_color1').click();
  document.querySelector('#sc_color8').click();

  window.camera = camera;

}, undefined, function ( error ) {

    console.error( error );

} );

var controls = new THREE.OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame( animate );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render( scene, camera );
}
animate();

for (const pcOption of document.querySelectorAll('input[name=pc]')) {
  pcOption.addEventListener('change', () => {
    const leftUpright = scene.getObjectByName('Left_upright');
    leftUpright.material.color.setHex(parseInt(pcOption.value, 16));
  });
}

for (const scOption of document.querySelectorAll('input[name=sc]')) {
  scOption.addEventListener('change', () => {
    const leftUpright = scene.getObjectByName('Pull_up_bar');
    leftUpright.material.color.setHex(parseInt(scOption.value, 16));
  });
}

console.log(scene);
