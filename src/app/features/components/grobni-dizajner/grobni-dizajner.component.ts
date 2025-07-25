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
import { PravokutnaPloca } from '../../models/rectangle.model';
import { TrapeznaPloca } from '../../models/trapeze.model';

@Component({
  selector: 'app-grobni-dizajner',
  templateUrl: './grobni-dizajner.component.html',
  styleUrls: ['./grobni-dizajner.component.css']
})
export class GrobniDizajnerComponent implements OnInit, AfterViewInit {
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef;

  prikazi3D = false;
  prikazi2D = false;
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

  ploca2dData: (PravokutnaPloca | TrapeznaPloca)[] = [];

  readonly SCALE = 2;
  readonly MIN_DEBLJINA = 0.02;
  readonly MAX_DEBLJINA = 0.06; 
  readonly MIN_VISINA = 0.10;
  readonly MAX_VISINA = 0.20; 
  readonly MAX_NAGIB = 0.15;
  readonly MIN_NAGIB = 0.0;
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

  toggle2D() {
    this.prikazi2D = !this.prikazi2D;

    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
  }

  generiraj2DModel() {
    this.ploca2dData = [];

    let sirina = 1.0; // m
    let duzina = 2.1; // m

    if (this.tipMjesta === 'duplo') {
      sirina = 2.0;
    }

    const {
      strsenjeVani,
      strsenjeUnutra,
      debljina,
      visina,
      nagibTla
    } = this.config;

    const boja = this.store.bojaMramora();
    const pomak = strsenjeUnutra - strsenjeVani;

    const visinaPrednja = visina;
    const visinaStraznja = visina + (nagibTla / 100) * duzina;

    // === 1. Prednja i stražnja ploča ===
    this.ploca2dData.push({
      naziv: 'Prednja ploča',
      width: sirina,
      height: visinaPrednja,
      boja
    });

    this.ploca2dData.push({
      naziv: 'Stražnja ploča',
      width: sirina,
      height: visinaStraznja,
      boja
    });

    // === 2. Bočne ploče kao trapezi ===
    this.ploca2dData.push({
      naziv: 'Lijeva bočna ploča',
      width: duzina,
      height1: visinaPrednja,
      height2: visinaStraznja,
      boja
    });

    this.ploca2dData.push({
      naziv: 'Desna bočna ploča',
      width: duzina,
      height1: visinaPrednja,
      height2: visinaStraznja,
      boja
    });

    // === 3. Središnja ploča (dupli grob) ===
    if (this.tipMjesta === 'duplo') {
      const sredisnjaDebljina = debljina + strsenjeUnutra + strsenjeVani;
      const sredisnjaDuljina = duzina - 2 * (debljina + strsenjeUnutra + strsenjeVani + pomak);

      this.ploca2dData.push({
        naziv: 'Središnja ploča',
        width: sredisnjaDebljina,
        height: sredisnjaDuljina,
        boja
      });
    }

    // === 4. Gornje ploče ===
    const gornjePloce = [
      {
        naziv: 'Gornja ploča (lijeva)',
        width: debljina + 2 * (strsenjeUnutra + strsenjeVani),
        height: duzina - 2 * (debljina + strsenjeUnutra + strsenjeVani + pomak)
      },
      {
        naziv: 'Gornja ploča (desna)',
        width: debljina + 2 * (strsenjeUnutra + strsenjeVani),
        height: duzina - 2 * (debljina + strsenjeUnutra + strsenjeVani + pomak)
      },
      {
        naziv: 'Gornja ploča (prednja)',
        width: sirina + 2 * (strsenjeUnutra + strsenjeVani - pomak),
        height: debljina + 2 * (strsenjeUnutra + strsenjeVani)
      },
      {
        naziv: 'Gornja ploča (stražnja)',
        width: sirina + 2 * (strsenjeUnutra + strsenjeVani - pomak),
        height: debljina + 2 * (strsenjeUnutra + strsenjeVani)
      }
    ];

    this.ploca2dData.push(...gornjePloce.map(p => ({ ...p, boja })));

    // === 5. Postolje ===
    const postoljeSirina = (sirina + 2 * (strsenjeUnutra + strsenjeVani - pomak)) * 0.9;
    const postoljeVisina = (debljina + 2 * (strsenjeUnutra + strsenjeVani)) * 0.65;

    this.ploca2dData.push({
      naziv: 'Postolje',
      width: postoljeSirina,
      height: postoljeVisina,
      boja
    });

    // === 6. Nadgrobna ploča(e) ===
    const nadgrobnaDuljina = 1.75;
    const nadgrobnaSirina = 0.75;

    if (this.tipMjesta === 'duplo') {
      this.ploca2dData.push({
        naziv: 'Nadgrobna ploča (lijeva)',
        width: nadgrobnaSirina,
        height: nadgrobnaDuljina,
        boja
      });

      this.ploca2dData.push({
        naziv: 'Nadgrobna ploča (desna)',
        width: nadgrobnaSirina,
        height: nadgrobnaDuljina,
        boja
      });
    } else {
      this.ploca2dData.push({
        naziv: 'Nadgrobna ploča',
        width: nadgrobnaSirina,
        height: nadgrobnaDuljina,
        boja
      });
    }
  }

  getTrapezPoints(ploca: TrapeznaPloca): string {
    const w = ploca.width * 100;
    const h1 = ploca.height1 * 100;
    const h2 = ploca.height2 * 100;
    return `0,${h1} ${w},${h2} ${w},0 0,0`;
  }

  isPravokutna(ploca: any): ploca is PravokutnaPloca {
    return 'height' in ploca;
  }

  isTrapezna(ploca: any): ploca is TrapeznaPloca {
    return 'height1' in ploca && 'height2' in ploca;
  }

  getMaxHeight(ploca: TrapeznaPloca): number {
    return Math.max(ploca.height1, ploca.height2);
  }

  getDimenzijePloca(ploca: PravokutnaPloca | TrapeznaPloca): string {
    if ('height' in ploca) {
      return `${ploca.width.toFixed(2)} m × ${ploca.height.toFixed(2)} m`;
    } else if ('height1' in ploca && 'height2' in ploca) {
      return `${ploca.width.toFixed(2)} m × ${ploca.height1.toFixed(2)}–${ploca.height2.toFixed(2)} m`;
    }
    return '';
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
    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
  }

  onTipMjestaChange() {
    this.ponovnoNacrtajModel();
    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
  }

  onVisinaChange(event: SliderChangeEvent) {
    if (event.value == undefined) return;

    const vrijednostCm = event.value;
    const vrijednostM = vrijednostCm / 100;
    this.config.visina = Math.min(this.MAX_VISINA, Math.max(this.MIN_VISINA, vrijednostM));
    this.ponovnoNacrtajModel();
    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
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
    const nagibPostotak = this.config.nagibTla ?? 0;
    const nagibVisinaMetar = (nagibPostotak / 100) * duzina;
    const nagibS = nagibVisinaMetar * scale;
        const pomak = strsenjeUnutraS - strsenjeVaniS;

    if (this.tipMjesta === 'duplo') {
      const sredisnjaPlocaDebljina = debljinaS + strsenjeUnutraS + strsenjeVaniS;
      const sredisnjaPlocaVisina = visinaGornjeS;
      const sredisnjaPloca = new THREE.Mesh(
        new THREE.BoxGeometry(sredisnjaPlocaDebljina, sredisnjaPlocaVisina, dubinaS - 2 * (debljinaS + strsenjeVaniS + strsenjeUnutraS + pomak)),
        materijal
      );
      sredisnjaPloca.position.set(0, visinaS + visinaGornjeS / 2, 0);
      this.grobnicaGroup.add(sredisnjaPloca);
      this.dodajRubove(sredisnjaPloca, this.grobnicaGroup);
    }

    type Ploča = { size: [number, number, number], pos: [number, number, number] };

    const visinaPrednja = visinaS;
    const visinaStraznja = visinaS + nagibS;

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
      shape.moveTo(debljinaS, 0);
      shape.lineTo(debljinaS, visina1);
      shape.lineTo(dubinaS - debljinaS, visina1);
      shape.lineTo(dubinaS - debljinaS, - nagibS);
      shape.lineTo(debljinaS, 0);

      const extrudeSettings = { steps: 1, depth: debljinaS, bevelEnabled: false };
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(geom, materijal);
      mesh.rotation.y = Math.PI / 2;
      mesh.position.set(posX, 0, dubinaS / 2);
      this.grobnicaGroup.add(mesh);
      this.dodajRubove(mesh, this.grobnicaGroup);
    });

    const straznja = new THREE.Mesh(
      new THREE.BoxGeometry(sirinaS, visinaStraznja, debljinaS),
      materijal
    );
    straznja.position.set(0, visinaStraznja / 2 - nagibS, -dubinaS / 2 + debljinaS / 2);
    this.grobnicaGroup.add(straznja);
    this.dodajRubove(straznja, this.grobnicaGroup);

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
    const sirinaPrednjePloce = sirinaS + 2 * (strsenjeUnutraS + strsenjeVaniS - pomak);
    const dubinaPrednjePloce = debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS);

    const dimPostoljaSirina = sirinaPrednjePloce * 0.9;
    const dimPostoljaDubina = dubinaPrednjePloce * 0.65;
    const dimPostoljaVisina = 0.04 * this.SCALE;
    const pomakUnatrag = 0.01 * this.SCALE;
    const pomakPloceUnazadZ = 0.01 * this.SCALE;

    const geomPostolja = new THREE.BoxGeometry(dimPostoljaSirina, dimPostoljaVisina, dimPostoljaDubina);
    const postolje = new THREE.Mesh(geomPostolja, materijal);

    postolje.position.set(
      0,
      visinaPostolja + debljinaGornje + dimPostoljaVisina / 2,
      dubinaS / 2 - debljinaS / 2 - pomak + pomakUnatrag
    );
    this.grobnicaGroup.add(postolje);
    this.dodajRubove(postolje, this.grobnicaGroup);

    // === NADGROBNA PLOČA ===
    const dimPlocaDuljina = 1.75 * this.SCALE;
    const dimPlocaSirina = 0.75 * this.SCALE;
    const dimPlocaDebljina = 0.04 * this.SCALE;

    const geomPloca = new THREE.BoxGeometry(dimPlocaSirina, dimPlocaDebljina, dimPlocaDuljina);
    if (this.tipMjesta === 'duplo') {
      const razmak = 0.05 * this.SCALE;
      const pomakX = 0.4 * this.SCALE;

      for (const offset of [-pomakX, pomakX]) {
        const duplaPloca = new THREE.Mesh(geomPloca, materijal);
        duplaPloca.position.set(
          offset,
          visinaPostolja + dimPlocaDebljina / 2 + debljinaGornje,
          -2 * (pomakUnatrag + pomakPloceUnazadZ)
        );
        this.grobnicaGroup.add(duplaPloca);
        this.dodajRubove(duplaPloca, this.grobnicaGroup);
      }
    } else {
      const ploca = new THREE.Mesh(geomPloca, materijal);
      ploca.position.set(
        0,
        visinaPostolja + dimPlocaDebljina / 2 + debljinaGornje,
        -2 * (pomakUnatrag + pomakPloceUnazadZ)
      );
      this.grobnicaGroup.add(ploca);
      this.dodajRubove(ploca, this.grobnicaGroup);
    }

  }

  izracunajUkupnuPovrsinuMaterijala(): number {
    if (!this.grobnicaGroup) return 0;

    let ukupnaPovrsina = 0;

    const izracunajPovrsinu = (mesh: THREE.Mesh) => {
      const geometry = mesh.geometry;

      if (!geometry || !(geometry instanceof THREE.BufferGeometry)) return 0;

      geometry.computeBoundingBox();
      const box = geometry.boundingBox;

      if (!box) return 0;

      const širina = (box.max.x - box.min.x) / this.SCALE;
      const visina = (box.max.y - box.min.y) / this.SCALE;
      const dubina = (box.max.z - box.min.z) / this.SCALE;

      const povrsine = [
        širina * visina,
        širina * dubina,
        visina * dubina
      ];

      return 2 * (povrsine[0] + povrsine[1] + povrsine[2]);
    };

    this.grobnicaGroup.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        ukupnaPovrsina += izracunajPovrsinu(obj);
      }
    });

    return +(ukupnaPovrsina).toFixed(2);
  }

  get povrsinaMaterijalaM2(): number {
    return this.izracunajUkupnuPovrsinuMaterijala();
  }

  onNagibChange(event: SliderChangeEvent) {
    if (event.value == undefined) return;
    const vrijednost = Math.max(this.MIN_NAGIB * 100, Math.min(this.MAX_NAGIB * 100, event.value));
    this.sliderNagib = vrijednost;
    this.config.nagibTla = vrijednost;
    this.ponovnoNacrtajModel();
    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
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
