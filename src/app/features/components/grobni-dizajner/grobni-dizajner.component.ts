import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as THREE from 'three';
import { GrobniDizajnerStore } from './grobni-dizajner.store';

@Component({
  selector: 'app-grobni-dizajner',
  templateUrl: './grobni-dizajner.component.html',
  styleUrls: ['./grobni-dizajner.component.css']
})
export class GrobniDizajnerComponent implements OnInit, AfterViewInit {
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef;

  prikazi3D = false;
  threeInicijaliziran = false;

  svgContent: SafeHtml | null = null;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  grobnicaGroup!: THREE.Group;
  gornjaPloca!: THREE.Mesh;
  stranice: THREE.Mesh[] = [];
  spomenik!: THREE.Mesh | THREE.Group;

  constructor(
    public store: GrobniDizajnerStore,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.store.fetchMaterijali().subscribe(() => {
      this.osvjeziSVG();
    });
  }

  ngAfterViewInit() {
    if (this.prikazi3D && !this.threeInicijaliziran) {
      this.initThreeJS();
      this.animate();
      this.azuriraj3DBoju();
      this.threeInicijaliziran = true;
    }
  }

  toggle3D() {
    this.prikazi3D = !this.prikazi3D;
    if (this.prikazi3D) {
      setTimeout(() => {
        if (this.renderer && this.renderer.domElement) {
          this.renderer.dispose();
          this.threeContainer.nativeElement.innerHTML = '';
        }
        this.initThreeJS();
        this.animate();
        this.azuriraj3DBoju();
      }, 0);
    }
  }

  osvjeziSVG() {
    const oblik = this.store.odabraniOblik().value;
    this.ucitajSVG(oblik);
    this.dodajSpomenik();
    this.azuriraj3DBoju();
  }

  ucitajSVG(naziv: string) {
    fetch(`assets/spomenici/${naziv}.svg`)
      .then(res => res.text())
      .then(svg => {
        const boja = this.store.bojaMramora();
        const obojani = svg
          .replace(/fill="[^"]*"/g, `fill="${boja}"`)
          .replace(/style="[^\"]*fill:[^;\"]*;?/g, `style="fill:${boja};`);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(obojani);
      });
  }

  initThreeJS() {
    const width = this.threeContainer.nativeElement.clientWidth;
    const height = this.threeContainer.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.threeContainer.nativeElement.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(ambientLight, directionalLight);

    this.createGrobniElementi();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.grobnicaGroup) {
      this.grobnicaGroup.rotation.y += 0.002;
      this.grobnicaGroup.position.y = 0.4;
    }
    this.renderer.render(this.scene, this.camera);
  }

  azuriraj3DBoju() {
    const novaBoja = new THREE.Color(this.store.bojaMramora());

    const updateBoja = (objekt: THREE.Object3D) => {
      if (objekt instanceof THREE.Mesh) {
        const mat = objekt.material as THREE.MeshStandardMaterial;
        mat.color.set(novaBoja);
      }
      if (objekt instanceof THREE.Group) {
        objekt.children.forEach(child => updateBoja(child));
      }
    };

    updateBoja(this.gornjaPloca);
    this.stranice.forEach(updateBoja);
    if (this.spomenik) updateBoja(this.spomenik);
  }

  createGrobniElementi() {
    const materijal = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });
    const borderMaterijal = new THREE.MeshStandardMaterial({ color: '#444444' });

    this.grobnicaGroup = new THREE.Group();
    this.scene.add(this.grobnicaGroup);

    const sirina = 3.5;
    const dubina = 1.6;
    const visina = 0.8;
    const debljina = 0.1;

    const gornjaGeom = new THREE.BoxGeometry(sirina, 0.2, dubina);
    this.gornjaPloca = new THREE.Mesh(gornjaGeom, materijal);
    this.gornjaPloca.position.y = 0.1;
    this.grobnicaGroup.add(this.gornjaPloca);

    const straniceInfo = [
      { x: -sirina / 2 + debljina / 2, z: 0 },
      { x:  sirina / 2 - debljina / 2, z: 0 },
      { x: 0, z: -dubina / 2 + debljina / 2 },
      { x: 0, z:  dubina / 2 - debljina / 2 }
    ];

    straniceInfo.forEach(s => {
      let geom = (s.x === 0)
        ? new THREE.BoxGeometry(sirina - 2 * debljina, visina, debljina)
        : new THREE.BoxGeometry(debljina, visina, dubina);

      const mesh = new THREE.Mesh(geom, borderMaterijal);
      mesh.position.set(s.x, visina / 2, s.z);
      this.grobnicaGroup.add(mesh);
      this.stranice.push(mesh);
      this.dodajRubove(mesh, this.grobnicaGroup);
    });

    const nadgrobnaPlocaGeom = new THREE.BoxGeometry(sirina, 0.05, dubina);
    const nadgrobnaPloca = new THREE.Mesh(nadgrobnaPlocaGeom, materijal);
    nadgrobnaPloca.position.set(0, visina + 0.025, 0);
    this.grobnicaGroup.add(nadgrobnaPloca);

    this.dodajSpomenik();
  }

  dodajSpomenik() {
    if (this.spomenik) {
      this.grobnicaGroup.remove(this.spomenik);
    }

    const materijal = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });
    const oblik = this.store.odabraniOblik().value;

    if (oblik === 'klasicni') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 1.2), materijal);
      const arc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32, 1, false, 0, Math.PI), materijal);
      arc.rotation.z = Math.PI / 2;
      arc.rotation.y = Math.PI;
      arc.position.set(0, 0.2, 0);

      const spomenikGroup = new THREE.Group();
      spomenikGroup.add(base);
      spomenikGroup.add(arc);
      spomenikGroup.position.set(-1.7, 1.4, 0);
      this.spomenik = spomenikGroup;
      this.grobnicaGroup.add(this.spomenik);
      return;
    }

    let geom: THREE.BufferGeometry;
    switch (oblik) {
      case 'polukruzni':
        geom = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32, 1, false, 0, Math.PI);
        break;
      case 'moderni':
        geom = new THREE.TorusGeometry(0.5, 0.15, 16, 100);
        break;
      default:
        geom = new THREE.BoxGeometry(1, 1.2, 0.2);
    }

    this.spomenik = new THREE.Mesh(geom, materijal);
    this.spomenik.position.set(-1.7, 1.4, 0);

    if (oblik === 'polukruzni') {
      this.spomenik.rotation.z = Math.PI / 2;
    }

    this.grobnicaGroup.add(this.spomenik);
  }

  dodajRubove(mesh: THREE.Mesh, group: THREE.Group, boja: string = '#000000') {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: boja });
    const lines = new THREE.LineSegments(edges, lineMaterial);
    lines.position.copy(mesh.position);
    lines.rotation.copy(mesh.rotation);
    group.add(lines);
  }
}
