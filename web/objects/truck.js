/*
 *  KNOWN ISSUES: does not handle resizing well 
*/

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

window.addEventListener("load", async _ => {
    // setup canvas
    const canvas = document.getElementById("truckcanvas");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
    });

    let resize = _ => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    resize();
    canvas.addEventListener("resize", resize);

    // action queue
    let actions = [];

    {
        // setup scene
        camera.position.z = 5;
        const light = new THREE.AmbientLight(0xf0f0f0);
        scene.add(light);
    }

    {
        // load ski model
        const loader = new GLTFLoader();

        loader.load(
            'objects/models/truck.glb',
            gltf => {
                let object = gltf.scene;

                object.scale.x = object.scale.y = object.scale.z = 0.3;
                
                scene.add(object);

                actions.push(time => {
                    object.rotation.y += time.dt;
                });
            },
            undefined,
            error => { console.error(error); },
        );
    }

    // render loop
    const time = {
        time: 0,
        dt: 0,
    }

    function render(timestep){
        time.dt = (timestep - time.time) * 0.001;
        time.time = timestep;

        for(let action of actions){
            action(time);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    } requestAnimationFrame(render);
});