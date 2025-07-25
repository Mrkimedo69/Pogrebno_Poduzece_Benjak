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
import { SliderChangeEvent } from 'primeng/slider';

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
  readonly MAX_NAGIB = 0.15; // 15 cm
  readonly MIN_NAGIB = 0.0; // 0 cm
  sliderNagib = 0;


  tipMjesta: 'jedno' | 'duplo' = 'jedno';

  config = {
    visina: 0.12,
    debljina: 0.03,
    strsenjeUnutra: 0.10,
    strsenjeVani: 0.02,
    nagibTla: 0.0
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

  sliderDebljina = this.config.debljina * 100;
  sliderVisina = this.config.visina * 100;

  onDebljinaChange(event: SliderChangeEvent) {
    if (event.value == undefined) return;

    const vrijednostCm = event.value;
    const vrijednostM = vrijednostCm / 100;
    this.config.debljina = Math.min(this.MAX_DEBLJINA, Math.max(this.MIN_DEBLJINA, vrijednostM));
    this.ponovnoNacrtajModel();
  }

  onVisinaChange(event: SliderChangeEvent) {
    if (event.value == undefined) return;

    const vrijednostCm = event.value;
    const vrijednostM = vrijednostCm / 100;
    this.config.visina = Math.min(this.MAX_VISINA, Math.max(this.MIN_VISINA, vrijednostM));
    this.ponovnoNacrtajModel();
  }

  createGrobniElementi() {
    const materijal = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });
    this.grobnicaGroup = new THREE.Group();
    this.scene.add(this.grobnicaGroup);

    const scale = this.SCALE;
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
    const visinaPostolja = visina * this.SCALE;
    const debljinaGornje = debljina * this.SCALE;
    const sirinaS = sirina * scale;
    const dubinaS = duzina * scale;
    const visinaS = visina * scale;
    const debljinaS = debljina * scale;
    const visinaGornjeS = debljina * scale;
    const strsenjeUnutraS = strsenjeUnutra * scale;
    const strsenjeVaniS = strsenjeVani * scale;
    const nagibPostotak = this.config.nagibTla ?? 0; // npr. 5 (%) ako slider postavi na 5%
    const nagibVisinaMetar = (nagibPostotak / 100) * duzina; // duzina u metrima
    const nagibS = nagibVisinaMetar * scale; // nagib u 3D prostoru


    const pomak = strsenjeUnutraS - strsenjeVaniS;

    type Ploča = { size: [number, number, number], pos: [number, number, number] };

    // Donje ploče uz nagib (visina prednje konstantna, stražnja podignuta za nagibS)
    const visinaPrednja = visinaS;
    const visinaStraznja = visinaS + nagibS;
    const sredinaDubine = 0;

    const bočnePloče = [
      {
        posX: -sirinaS / 2 , // desna
        visina1: visinaPrednja,
        visina2: visinaStraznja
      },
      {
        posX:  sirinaS / 2 - debljinaS, // lijeva
        visina1: visinaPrednja,
        visina2: visinaStraznja
      }
    ];

    bočnePloče.forEach(({ posX, visina1, visina2 }) => {
      const shape = new THREE.Shape();
      shape.moveTo(debljinaS, 0);                                // Donji prednji brid
      shape.lineTo(debljinaS, visina1);                          // Gornji prednji brid
      shape.lineTo(dubinaS - debljinaS, visina1);                // Gornji stražnji brid (isti kao prednji!)
      shape.lineTo(dubinaS - debljinaS, - nagibS);       // Donji stražnji brid spušten
      shape.lineTo(debljinaS, 0);                                // Zatvori


      const extrudeSettings = { steps: 1, depth: debljinaS, bevelEnabled: false };
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(geom, materijal);
      mesh.rotation.y = Math.PI / 2;
      mesh.position.set(posX, 0, dubinaS / 2);
      this.grobnicaGroup.add(mesh);
      this.dodajRubove(mesh, this.grobnicaGroup);
    });

    // Stražnja ploča – viša za nagib
    const straznja = new THREE.Mesh(
      new THREE.BoxGeometry(sirinaS, visinaStraznja, debljinaS),
      materijal
    );
    straznja.position.set(0, visinaStraznja / 2 - nagibS, -dubinaS / 2 + debljinaS / 2);
    this.grobnicaGroup.add(straznja);
    this.dodajRubove(straznja, this.grobnicaGroup);

    // Prednja ploča – ostaje ista
    const prednja = new THREE.Mesh(
      new THREE.BoxGeometry(sirinaS, visinaPrednja, debljinaS),
      materijal
    );
    prednja.position.set(0, visinaPrednja / 2, dubinaS / 2 - debljinaS / 2);
    this.grobnicaGroup.add(prednja);
    this.dodajRubove(prednja, this.grobnicaGroup);


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

    // === POSTOLJE ===
    // Dimenzije prednje gornje ploče (za pozicioniranje postolja)
    const sirinaPrednjePloce = sirinaS + 2 * (strsenjeUnutraS + strsenjeVaniS - pomak);
    const dubinaPrednjePloce = debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS);

    // Postolje dimenzije – neovisne varijable
    const dimPostoljaSirina = sirinaPrednjePloce * 0.9;
    const dimPostoljaDubina = dubinaPrednjePloce * 0.65;
    const dimPostoljaVisina = 0.04 * this.SCALE;
    const pomakUnatrag = 0.01 * this.SCALE;
    const pomakPloceUnazadZ = 0.01 * this.SCALE;

    const geomPostolja = new THREE.BoxGeometry(dimPostoljaSirina, dimPostoljaVisina, dimPostoljaDubina);
    const postolje = new THREE.Mesh(geomPostolja, materijal);

    // Pozicioniraj postolje da leži na prednjoj gornjoj ploči
    postolje.position.set(
      0,
      visinaPostolja + debljinaGornje + dimPostoljaVisina / 2,
      dubinaS / 2 - debljinaS / 2 - pomak + pomakUnatrag
    );
    this.grobnicaGroup.add(postolje);
    this.dodajRubove(postolje, this.grobnicaGroup);

    // === NADGROBNA PLOČA ===
    // Nadgrobna ploča vlastite dimenzije (neovisne o postolju)
    const dimPlocaDuljina = 1.75 * this.SCALE; // npr. nešto kraće od stvarnih 1.95
    const dimPlocaSirina = 0.75 * this.SCALE;
    const dimPlocaDebljina = 0.04 * this.SCALE; // fiksno

    const geomPloca = new THREE.BoxGeometry(dimPlocaSirina, dimPlocaDebljina, dimPlocaDuljina);
    const ploca = new THREE.Mesh(geomPloca, materijal);

    // Ploča spuštena na razinu donjih ploča (ili po potrebi malo iznad)
    ploca.position.set(
      0,
      visinaPostolja + dimPlocaDebljina / 2 + debljinaGornje, // „sjedne“ na konstrukciju
      - 2 * (pomakUnatrag + pomakPloceUnazadZ)
    );
    this.grobnicaGroup.add(ploca);
    this.dodajRubove(ploca, this.grobnicaGroup);

  }
  onNagibChange(event: SliderChangeEvent) {
    if (event.value == undefined) return;
    this.config.nagibTla = event.value;
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
