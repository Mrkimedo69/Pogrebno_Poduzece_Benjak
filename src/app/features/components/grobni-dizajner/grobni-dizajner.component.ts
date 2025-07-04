import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as THREE from 'three';
import { StoneMaterial } from '../../models/stone-material.model';

@Component({
  selector: 'app-grobni-dizajner',
  templateUrl: './grobni-dizajner.component.html',
  styleUrls: ['./grobni-dizajner.component.css']
})
export class GrobniDizajnerComponent implements OnInit, AfterViewInit {
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef;

  // UI
  prikazi3D = false;
  threeInicijaliziran = false;

  // Materijali i oblici
  materijali: StoneMaterial[] = [];
  oblici = [
    { label: 'Klasični', value: 'klasicni', cijena: 100 },
    { label: 'Polukružni', value: 'polukruzni', cijena: 120 },
    { label: 'Moderni', value: 'moderni', cijena: 150 }
  ];

  odabraniMaterijal!: StoneMaterial;
  odabraniOblik = this.oblici[0];
  svgContent: SafeHtml | null = null;

  // Three.js
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  grobnicaGroup!: THREE.Group;
  gornjaPloca!: THREE.Mesh;
  stranice: THREE.Mesh[] = [];
  spomenik!: THREE.Mesh | THREE.Group;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.http.get<StoneMaterial[]>('http://localhost:3000/stone-materials')
      .subscribe((data) => {
        this.materijali = data;
        this.odabraniMaterijal = this.materijali[0];
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

  get bojaMramora(): string {
    switch (this.odabraniMaterijal?.color) {
      case 'crni': return '#2c2c2c';
      case 'sivi': return '#888888';
      case 'bijeli': return '#e0e0e0';
      default: return '#cccccc';
    }
  }

  izracunajCijenu(): number {
    const m = this.odabraniMaterijal?.pricePerM3 || 0;
    const o = this.odabraniOblik?.cijena || 0;
    return m + o;
  }

  trenutniPrikaz(): string {
    const mat = this.odabraniMaterijal?.pricePerM3 || 'prazno';
    const obl = this.odabraniOblik?.value || 'prazno';
    return `assets/dizajn/${mat}-${obl}.png`;
  }

  osvjeziSVG() {
    if (this.odabraniOblik) {
      this.ucitajSVG(this.odabraniOblik.value);
      this.dodajSpomenik();
      this.azuriraj3DBoju();
    }
  }

  ucitajSVG(naziv: string) {
    this.http
      .get(`assets/spomenici/${naziv}.svg`, { responseType: 'text' })
      .subscribe(svg => {
        const obojani = svg
          .replace(/fill="[^"]*"/g, `fill="${this.bojaMramora}"`)
          .replace(/style="[^"]*fill:[^;"]*;?/g, `style="fill:${this.bojaMramora};`);
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
    const novaBoja = new THREE.Color(this.bojaMramora);

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
    const materijal = new THREE.MeshStandardMaterial({ color: this.bojaMramora });
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
      { x: -sirina / 2 + debljina / 2, z: 0, label: 'lijeva' },
      { x:  sirina / 2 - debljina / 2, z: 0, label: 'desna' },
      { x: 0, z: -dubina / 2 + debljina / 2, label: 'stražnja' },
      { x: 0, z:  dubina / 2 - debljina / 2, label: 'prednja' }
    ];

    straniceInfo.forEach(s => {
      let geom;
      if (s.label === 'lijeva' || s.label === 'desna') {
        geom = new THREE.BoxGeometry(debljina, visina, dubina);
      } else {
        geom = new THREE.BoxGeometry(sirina - 2 * debljina, visina, debljina);
      }
      const mesh = new THREE.Mesh(geom, borderMaterijal);
      mesh.position.set(s.x, visina / 2, s.z);
      mesh.name = s.label;
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

    const materijal = new THREE.MeshStandardMaterial({ color: this.bojaMramora });

    if (this.odabraniOblik?.value === 'klasicni') {
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
    switch (this.odabraniOblik?.value) {
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

    if (this.odabraniOblik?.value === 'polukruzni') {
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