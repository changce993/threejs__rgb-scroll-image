import './style.css';
import * as THREE from 'three';
import vertexShader from './glsl/vertexShader';
import fragmentShader from './glsl/fragmentShader';
import gsap from 'gsap';

const scrollable = document.querySelector(".scrollable");

let current = 0, target = 0, ease = 0.075;

function lerp( start, end, t ) {
  return start * (1 - t) + end * t;
};

function init() {
  document.body.style.height = `${scrollable.getBoundingClientRect().height}px`;
};

function smoothScroll() {
  target = window.scrollY;
  current = lerp(current, target, ease);
  scrollable.style.transform = `translate3d(0, ${-current}px, 0)`;
  // requestAnimationFrame(smoothScroll);
};

class EffectCanvas {
  constructor() {
    this.container = document.querySelector("main");
    this.images = [...document.querySelectorAll("img")];
    this.meshItems = [];
    this.setupCamera();
    this.createMeshItems();
    this.render();
  };

  get viewport() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspect = width/height;

    return { width, height, aspect };
  };

  setupCamera() {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    this.scene = new THREE.Scene();

    let perspective = 1000;
    const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;

    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspect, 1, 1000);
    this.camera.position.set(0, 0, perspective);

    this.renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
  };

  onWindowResize() {
    init();
    this.camera.aspect = this.viewport.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  };

  createMeshItems() {
    this.images.forEach(image => {
      let meshItem = new MeshItem(image, this.scene);
      this.meshItems.push(meshItem);
    });
  };

  render() {
    smoothScroll();
    for(let i = 0; i < this.meshItems.length; i++) {
      this.meshItems[i].render();
    };
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  };
};

class MeshItem {
  constructor(element, scene) {
    this.element = element;
    this.scene = scene;
    this.offset = new THREE.Vector2(0, 0);
    this.sizes = new THREE.Vector2(0, 0);
    this.createMesh();
  };

  getDimensions() {
    const { width, height, top, left } = this.element.getBoundingClientRect();
    this.sizes.set(width, height);
    this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2);
  };

  createMesh() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    this.imageTexture = new THREE.TextureLoader().load(this.element.src);
    this.uniforms = {
      uAlpha: { value: 1.0 },
      uOffset: { value: new THREE.Vector2(0.0, 0.0) },
      uTexture: { value: this.imageTexture },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.getDimensions();
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
    this.scene.add(this.mesh)
  };

  render() {
    this.getDimensions();
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
    this.uniforms.uOffset.value.set(this.offset.x * 0.0, (target- current) * 0.0003)
  }
};

init();
new EffectCanvas();

gsap.to("h2 .title", {
  y: -10,
  duration: 1,
  stagger: 0.25,
  delay: 1.25,
  ease: "easeInOut"
})

gsap.to("p .text", {
  y: 0,
  duration: .75,
  delay: 1.75,
  stagger: 0.2,
  ease: "easeInOut"
})

gsap.to(".hero", {
  scrollTrigger: {
    scrub: true
  }, 
  y: .6,
  delay: 1.25,
  ease: "none"
});

gsap.from(".container", {
  opacity: 0,
  duration: 2,
  delay: 1.25,
})

gsap.from(".blur", {
  scale: 0,
  duration: 1,
  delay: 1.25,
  ease: "ease-in-out"
})

gsap.to("body", {
  opacity: 1,
  duration: 1.5
})

// gsap.to("body", {
//   opacity: 0,
//   delay: 10,
//   duration: 1.5
// })

gsap.from("canvas", {
  delay: 2.25,
  duration: 1,
  y: 64,
  opacity: 0
})