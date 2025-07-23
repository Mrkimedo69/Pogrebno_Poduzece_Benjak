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

  animationId: number | null = null;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  grobnicaGroup!: THREE.Group;
  gornjaPloca!: THREE.Mesh;
  stranice: THREE.Mesh[] = [];
  spomenik!: THREE.Mesh | THREE.Group;

  readonly SCALE = 1.5;
  readonly MIN_DEBLJINA = 0.02;
  readonly MAX_DEBLJINA = 0.06; 
  readonly MIN_VISINA = 0.10;
  readonly MAX_VISINA = 0.20; 


  tipMjesta: 'jedno' | 'duplo' = 'jedno';

  config = {
    visina: 0.12,
    debljina: 0.03,
    strsenjeUnutra: 0.10,
    strsenjeVani: 0.02
  };

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
    }else {
      this.stopAnimation();
    }
  }

  osvjeziSVG() {
    const oblik = this.store.odabraniOblik().value;
    this.ucitajSVG(oblik);
    this.dodajSpomenik();
    this.azuriraj3DBoju();
  }

  ponovnoNacrtajModel() {
    if (!this.scene) return;
    this.scene.remove(this.grobnicaGroup);
    this.createGrobniElementi();
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
    this.camera.position.set(0, 1.5, 5);
    this.camera.lookAt(0, 0.6, 0); 

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
  this.animationId = requestAnimationFrame(this.animate);
    if (this.grobnicaGroup) {
      this.grobnicaGroup.rotation.y += 0.002;
    }
    this.renderer.render(this.scene, this.camera);
  }
  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
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
    this.grobnicaGroup = new THREE.Group();
    this.scene.add(this.grobnicaGroup);

    const scale = this.SCALE;
    // definiraj širinu i dužinu prema tipu mjesta
    let sirina = 1.0;
    let duzina = 2.1;

    if (this.tipMjesta === 'duplo') {
      sirina = 2.0;
    }

    const {
      strsenjeVani,
      strsenjeUnutra
    } = this.config;

    const debljina = Math.min(this.MAX_DEBLJINA, Math.max(this.MIN_DEBLJINA, this.config.debljina));
    const visina = Math.min(this.MAX_VISINA, Math.max(this.MIN_VISINA, this.config.visina));

    // skalirane vrijednosti
    const sirinaS = sirina * scale;
    const dubinaS = duzina * scale;
    const visinaS = visina * scale;
    const debljinaS = debljina * scale;
    const visinaGornjeS = debljina * scale;
    const strsenjeUnutraS = strsenjeUnutra * scale;
    const strsenjeVaniS = strsenjeVani * scale;

    const pomak = strsenjeUnutraS - strsenjeVaniS;

    type Ploča = { size: [number, number, number], pos: [number, number, number] };

    // DONJE PLOČE
    const ploceDonje: Ploča[] = [
      // Lijeva bočna (puna dubina)
      { size: [debljinaS, visinaS, dubinaS - 2 * debljinaS], pos: [-sirinaS / 2 + debljinaS / 2, visinaS / 2, 0] },
      // Desna bočna
      { size: [debljinaS, visinaS, dubinaS - 2 * debljinaS], pos: [ sirinaS / 2 - debljinaS / 2, visinaS / 2, 0] },
      // Stražnja (kraća)
      { size: [sirinaS, visinaS, debljinaS], pos: [0, visinaS / 2, -dubinaS / 2 + debljinaS / 2] },
      // Prednja (kraća)
      { size: [sirinaS, visinaS, debljinaS], pos: [0, visinaS / 2,  dubinaS / 2 - debljinaS / 2] }
    ];

    ploceDonje.forEach(p => {
      const geom = new THREE.BoxGeometry(...p.size);
      const mesh = new THREE.Mesh(geom, materijal);
      mesh.position.set(...p.pos);
      this.grobnicaGroup.add(mesh);
      this.dodajRubove(mesh, this.grobnicaGroup);
    });

    // GORNJE PLOČE
    const ploceGornje: Ploča[] = [
      // Lijeva bočna
      {
        size: [
          debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS),
          visinaGornjeS,
          dubinaS - 2 * (debljinaS + strsenjeVaniS + strsenjeUnutraS + pomak)
        ],
        pos: [-sirinaS / 2 + debljinaS / 2 + pomak, visinaS + visinaGornjeS / 2, 0]
      },
      // Desna bočna
      {
        size: [
          debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS),
          visinaGornjeS,
          dubinaS - 2 * (debljinaS + strsenjeVaniS + strsenjeUnutraS + pomak)
        ],
        pos: [sirinaS / 2 - debljinaS / 2 - pomak, visinaS + visinaGornjeS / 2, 0]
      },
      // Stražnja (kraća)
      {
        size: [
          sirinaS + 2 * (strsenjeUnutraS + strsenjeVaniS - pomak),
          visinaGornjeS,
          debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS)
        ],
        pos: [0, visinaS + visinaGornjeS / 2, -dubinaS / 2 + debljinaS / 2 + pomak]
      },
      // Prednja (kraća)
      {
        size: [
          sirinaS + 2 * (strsenjeUnutraS + strsenjeVaniS - pomak),
          visinaGornjeS,
          debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS)
        ],
        pos: [0, visinaS + visinaGornjeS / 2, dubinaS / 2 - debljinaS / 2 - pomak]
      }
    ];

    ploceGornje.forEach(p => {
      const geom = new THREE.BoxGeometry(...p.size);
      const mesh = new THREE.Mesh(geom, materijal);
      mesh.position.set(...p.pos);
      this.grobnicaGroup.add(mesh);
      this.dodajRubove(mesh, this.grobnicaGroup);
    });
  }

  onDebljinaChange(event: Event) {
    const vrijednostCm = parseFloat((event.target as HTMLInputElement).value);
    const vrijednostM = vrijednostCm / 100;

    // Ograniči vrijednosti na definirane granice
    this.config.debljina = Math.min(this.MAX_DEBLJINA, Math.max(this.MIN_DEBLJINA, vrijednostM));

    // Ponovno nacrtaj model
    this.ponovnoNacrtajModel();
  }

  onVisinaChange(event: Event) {
    const vrijednostCm = parseFloat((event.target as HTMLInputElement).value);
    const vrijednostM = vrijednostCm / 100;
    this.config.visina = Math.min(this.MAX_VISINA, Math.max(this.MIN_VISINA, vrijednostM));
    this.ponovnoNacrtajModel();
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
