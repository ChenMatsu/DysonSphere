import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import React, { useEffect, useRef } from 'react';

const DysonSphere: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 10;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);

      sphere.rotation.x += 0.0005;
      sphere.rotation.y += 0.0005;
      sphere.rotation.z += 0.0005;

      renderer.render(scene, camera);
      controls.update();
    };

    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default DysonSphere;
