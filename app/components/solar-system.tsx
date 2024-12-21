import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import React, { useEffect, useRef } from 'react';
import { GUI } from 'dat.gui';
import { SphereSettings } from '../common/sphere';

const SolarSystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    /**
     * @Note 1 Unit = 1000 km
     */
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(32, 6, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Sun
    const sunGeometry = new Three.SphereGeometry(SphereSettings.sun_radius, 64, 64);

    const sunTextureLoader = new Three.TextureLoader();
    const sunTexture = sunTextureLoader.load('/textures/sun.jpg');
    const sunMaterial = new Three.MeshStandardMaterial({
      map: sunTexture,
      emissive: 0xffaa00,
      emissiveMap: sunTexture,
      emissiveIntensity: 2,
      metalness: 0.5,
      roughness: 0.5,
    });
    const sun = new Three.Mesh(sunGeometry, sunMaterial);
    sun.position.set(-SphereSettings.sun_distance_from_earth, 0, 0); // TODO: check distance
    scene.add(sun);

    // Sun Light itself
    const sunLightSource = new Three.PointLight(0xffffff, 5);
    sunLightSource.position.set(-SphereSettings.sun_distance_from_earth, 0, 0);
    scene.add(sunLightSource);

    // Sun Light to illuminate the earth
    const sunLight = new Three.DirectionalLight(0xffffff, 5);
    sunLight.position.set(-SphereSettings.sun_distance_from_earth, 0, 0);
    sunLight.target.position.set(0, 0, 0); // Pointing at the earth
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);

    // Dyson Sphere
    const dysonGeometry = new Three.SphereGeometry(SphereSettings.dyson_radius, 32, 32);
    const dysonMaterial = new Three.MeshBasicMaterial({ color: 0x3e5879, wireframe: true });
    const dyson = new Three.Mesh(dysonGeometry, dysonMaterial);
    dyson.position.set(5.45, 0, 0);
    scene.add(dyson);

    // Moon
    const moonGeometry = new Three.SphereGeometry(SphereSettings.moon_radius, 32, 32);

    const moonTextureLoader = new Three.TextureLoader();
    const moonTexture = moonTextureLoader.load('/textures/moon.jpg');
    const moonMaterial = new Three.MeshStandardMaterial({ map: moonTexture });
    const moon = new Three.Mesh(moonGeometry, moonMaterial);
    moon.position.set(5.384, 0, 0);
    scene.add(moon);

    // Earth
    const earthGeometry = new Three.SphereGeometry(SphereSettings.earth_radius, 32, 32);

    const earthTextureLoader = new Three.TextureLoader();
    const earthTexture = earthTextureLoader.load('/textures/earth_night.jpg');
    const earthMaterial = new Three.MeshStandardMaterial({ map: earthTexture });
    const earth = new Three.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, 0, 0);
    scene.add(earth);

    // Ambient Light
    const ambientLight = new Three.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Star Field
    const starGeometry = new Three.BufferGeometry();
    const starMaterial = new Three.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
    });
    const n_stars = 10000;
    const colors = new Float32Array(n_stars * 3);
    const positions = new Float32Array(n_stars * 3);

    for (let i = 0; i < n_stars; i++) {
      const radius = 1000 * Math.random();
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();

      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }

    starGeometry.setAttribute('color', new Three.BufferAttribute(colors, 3));
    starGeometry.setAttribute('position', new Three.BufferAttribute(positions, 3));
    const stars = new Three.Points(starGeometry, starMaterial);
    scene.add(stars);

    let twinkleDirection = 1;
    const animate = () => {
      requestAnimationFrame(animate);

      // Sun rotation
      sun.rotation.y += SphereSettings.rotation_speed;

      // Earth rotation
      earth.rotation.y += 0.00025;
      moon.rotation.y += SphereSettings.rotation_speed;

      moon.position.x =
        earth.position.x +
        (SphereSettings.earth_radius + SphereSettings.moon_distance_from_earth) *
          Math.cos(Date.now() * SphereSettings.orbit_speed);
      moon.position.z =
        earth.position.z +
        (SphereSettings.earth_radius + SphereSettings.moon_distance_from_earth) *
          Math.sin(Date.now() * SphereSettings.orbit_speed);

      dyson.rotation.y -= SphereSettings.rotation_speed;
      dyson.position.x =
        earth.position.x -
        (SphereSettings.earth_radius + SphereSettings.dyson_distance_from_earth) *
          Math.cos(Date.now() * SphereSettings.orbit_speed);
      dyson.position.z =
        earth.position.z -
        (SphereSettings.earth_radius + SphereSettings.dyson_distance_from_earth) *
          Math.sin(Date.now() * SphereSettings.orbit_speed);

      // Dyson Sphere rotation
      dyson.rotation.x += SphereSettings.rotation_speed;
      dyson.rotation.y += SphereSettings.rotation_speed;
      dyson.rotation.z += SphereSettings.rotation_speed;

      // Twinkle Stars
      stars.material.size += 0.001 * twinkleDirection;
      if (stars.material.size > 1 || stars.material.size < 0.3) {
        twinkleDirection *= -1;
      }

      renderer.render(scene, camera);
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    animate();

    //   const gui = new GUI();
    //   const settings = {
    //     earthX: 149.6,
    //     earthSize: 5,
    //     moonDistance: 0.384,
    //     dysonDistance: 0.45,
    //   };

    //   gui
    //     .add(settings, 'earthX', 140, 160)
    //     .name('Earth Distance')
    //     .onChange((value) => {
    //       earth.position.set(value, 0, 0);
    //       moon.position.set(value + settings.moonDistance, 0, 0);
    //       dyson.position.set(value + settings.dysonDistance, 0, 0);
    //     });
    //   gui
    //     .add(settings, 'earthSize', 1, 10)
    //     .name('Earth Size')
    //     .onChange((value) => {
    //       earth.scale.set(value / 5, value / 5, value / 5);
    //     });
    //   gui
    //     .add(settings, 'moonDistance', 0.3, 0.5)
    //     .name('Moon Distance')
    //     .onChange((value) => {
    //       moon.position.set(settings.earthX + value, 0, 0);
    //     });
    //   gui
    //     .add(settings, 'dysonDistance', 0.4, 0.6)
    //     .name('Dyson Distance')
    //     .onChange((value) => {
    //       dyson.position.set(settings.earthX + value, 0, 0);
    // });

    return () => {
      // gui.destroy();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default SolarSystem;
