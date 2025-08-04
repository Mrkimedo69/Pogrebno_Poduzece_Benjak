import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';
import * as THREE from 'three';
import { GrobniDizajnerStore } from './store/grobni-dizajner.store';
import { SliderChangeEvent } from 'primeng/slider';
import { PravokutnaPloca } from '../../models/rectangle.model';
import { TrapeznaPloca } from '../../models/trapeze.model';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { StoneMaterial } from '../../models/stone-material.model';
import html2canvas from 'html2canvas';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-grobni-dizajner',
  templateUrl: './grobni-dizajner.component.html',
  styleUrls: ['./grobni-dizajner.component.css']
})
export class GrobniDizajnerComponent implements OnInit, AfterViewInit {
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef;
  @ViewChild('hidden2dContainer') hidden2dContainer!: ElementRef;

  constructor(
    public store: GrobniDizajnerStore,
    private authStore:AuthStore
  ) {}

  prikazi3D = false;
  prikazi2D = false;
  threeInicijaliziran = false;
  dialogVisible = false;
  userEmail = '';


  isAdmin = this.authStore.isAdmin();
  materialDialogOpen = false;
  selectedMaterial: StoneMaterial | null = null;


  animationId: number | null = null;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  grobnicaGroup!: THREE.Group;
  gornjaPloca!: THREE.Mesh;
  stranice: THREE.Mesh[] = [];
  spomenik!: THREE.Mesh | THREE.Group;

  odabraniOblik = this.store.odabraniOblik();
  odabraniMaterijal = this.store.odabraniMaterijal();

  ploca2dData: (PravokutnaPloca | TrapeznaPloca)[] = [];

  SCALE = GrobniDizajnerStore.SCALE;
  MIN_DEBLJINA = GrobniDizajnerStore.MIN_DEBLJINA;
  MAX_DEBLJINA = GrobniDizajnerStore.MAX_DEBLJINA; 
  MIN_VISINA = GrobniDizajnerStore.MIN_VISINA;
  MAX_VISINA = GrobniDizajnerStore.MAX_VISINA; 
  MAX_NAGIB = GrobniDizajnerStore.MAX_NAGIB;
  MIN_NAGIB = GrobniDizajnerStore.MIN_NAGIB;
  sliderNagib = 0;

  tipMjesta: 'jedno' | 'duplo' = 'jedno';

  config = {
    visina: 0.12,
    debljina: 0.03,
    strsenjeUnutra: 0.10,
    strsenjeVani: 0.02,
    nagibTla: 0.0
  };

  sliderDebljina = this.config.debljina * 100;
  sliderVisina = this.config.visina * 100;

  ngOnInit() {
    this.store.fetchMaterijali().subscribe(() => {
      this.odabraniMaterijal = this.store.odabraniMaterijal();
      this.odabraniOblik = this.store.odabraniOblik();
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

  generiraj2DModel() {
    this.ploca2dData = [];

    let sirina = 1.0;
    let duzina = 2.1; 

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

  osvjeziSVG() {
    if (!this.grobnicaGroup) return;
    this.dodajSpomenik();
    this.azuriraj3DBoju();
  }

  ponovnoNacrtajModel() {
    if (!this.scene) return;
    this.scene.remove(this.grobnicaGroup);
    this.createGrobniElementi();
    this.azuriraj3DBoju();
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
    const textureUrl = this.store.teksturaMaterijala();
    const novaBoja = new THREE.Color(this.store.bojaMramora());

    // fallback boja materijal
    const fallbackMaterijal = new THREE.MeshStandardMaterial({ color: novaBoja });

    // ako textureUrl nije postavljen ili je prazan → koristi boju
    if (!textureUrl || textureUrl.trim() === '') {
      this.applyMaterialToScene(fallbackMaterijal);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (texture) => {
        // uspješno učitana tekstura
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        this.applyMaterialToScene(material);
      },
      undefined,
      (err) => {
        console.error('❌ Greška kod učitavanja teksture, fallback na boju:', err);
        this.applyMaterialToScene(fallbackMaterijal);
      }
    );
  }

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

  applyMaterialToScene(materijal: THREE.MeshStandardMaterial) {
    this.grobnicaGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = materijal.clone();
      }
    });
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
      this.dodajSpomenik();
  }

  get povrsinaMaterijalaM2(): number {
    if (!this.grobnicaGroup) return 0;
    return this.store.izracunajPovrsinu(this.grobnicaGroup, this.SCALE);
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

      switch (oblik) {
        case 'upright-arc': {
          const mat = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });
          const s = this.SCALE;

          let sirina = 0.65;
          let visina = 0.75;
          const debljina = 0.08;

          if (this.tipMjesta === 'duplo') {
            sirina = 1.0;
            visina = 0.9;
          }

          const sirinaS = sirina * s;
          const visinaS = visina * s;
          const debljinaS = debljina * s;

          const polumjer = sirinaS / 2;
          const lukShape = new THREE.Shape();
          lukShape.moveTo(-polumjer, 0);
          lukShape.absarc(0, 0, -polumjer, Math.PI, 0, false);
          lukShape.lineTo(polumjer, -0.01);
          lukShape.lineTo(-polumjer, -0.01);
          lukShape.lineTo(-polumjer, 0);

          const extrudeSettings = {
            depth: debljinaS,
            bevelEnabled: false
          };

          const lukGeom = new THREE.ExtrudeGeometry(lukShape, extrudeSettings);
          lukGeom.translate(0, visinaS - (sirinaS / 2), -debljinaS / 2);

          const bazaGeom = new THREE.BoxGeometry(sirinaS, visinaS - (sirinaS / 2), debljinaS);
          bazaGeom.translate(0, (visinaS  - (sirinaS / 2)) / 2, 0);

          const bazaFinal = bazaGeom.toNonIndexed();
          const lukFinal = lukGeom.toNonIndexed();

          bazaFinal.computeVertexNormals();
          lukFinal.computeVertexNormals();

          const spojenaGeom = BufferGeometryUtils.mergeGeometries([bazaFinal, lukFinal], false);
          if (!spojenaGeom) {
            console.error("Greška kod spajanja geometrija spomenika!");
            return;
          }

          const spomenikMesh = new THREE.Mesh(spojenaGeom, mat);

          const postoljeVisina = 0.04 * s;
          const debljinaGornje = this.config.debljina * s;
          const visinaGrobnice = this.config.visina * s;
          const ukupnaY = visinaGrobnice + debljinaGornje + postoljeVisina;

          const ukupnaDuzina = 2.1 * s;
          const prednjiZ = ukupnaDuzina / 2 - debljinaS;

          spomenikMesh.position.set(0, ukupnaY, prednjiZ);

          this.spomenik = spomenikMesh;
          this.grobnicaGroup.add(this.spomenik);
          return;
        }

        case 'slant': {
          const s = this.SCALE;
          const mat = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });

          let sirina = 0.6;
          let visina = 0.6;

          if (this.tipMjesta === 'duplo') {
            sirina = 1.0;
            visina = 0.8;
          }

          const w = (sirina * s) / 2;
          const h = visina * s;

          const strsenjeUnutraS = this.config.strsenjeUnutra * s;
          const strsenjeVaniS = this.config.strsenjeVani * s;
          const debljinaS = this.config.debljina * s;
          const pomak = strsenjeUnutraS - strsenjeVaniS;
          const sirinaPrednjePloce = sirina * s + 2 * (strsenjeUnutraS + strsenjeVaniS - pomak);
          const dubinaPrednjePloce = debljinaS + 2 * (strsenjeUnutraS + strsenjeVaniS);
          const dimPostoljaDubina = dubinaPrednjePloce * 0.65;

          const d1 = dimPostoljaDubina * 0.75;
          const d2 = d1 * 0.1;

          const geometry = new THREE.BufferGeometry();

          const vertices = new Float32Array([
            // Donja ploha (deblja)
            -w, 0, -d1 / 2,
            w, 0, -d1 / 2,
            w, 0,  d1 / 2,
            -w, 0,  d1 / 2,

            // Gornja ploha (tanji kraj unazad)
            -w, h, -d2 / 2,
            w, h, -d2 / 2,
            w, h,  d2 / 2,
            -w, h,  d2 / 2,
          ]);

          const indices = [
            // donja
            0, 1, 2, 0, 2, 3,
            // gornja
            4, 6, 5, 4, 7, 6,
            // prednja
            0, 4, 5, 0, 5, 1,
            // stražnja
            3, 2, 6, 3, 6, 7,
            // lijeva
            0, 3, 7, 0, 7, 4,
            // desna
            1, 5, 6, 1, 6, 2
          ];

          geometry.setIndex(indices);
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geometry.computeVertexNormals();

          const mesh = new THREE.Mesh(geometry, mat);

          // === Pozicija ===
          const postoljeVisina = 0.04 * s;
          const debljinaGornje = this.config.debljina * s;
          const visinaGrobnice = this.config.visina * s;
          const ukupnaY = visinaGrobnice + debljinaGornje + postoljeVisina;

          const ukupnaDuzina = 2.1 * s;
          const centrirajZ = ukupnaDuzina / 2 - debljinaS / 2 - pomak * 0.85;

          mesh.position.set(0, ukupnaY, centrirajZ);

          this.spomenik = mesh;
          this.grobnicaGroup.add(mesh);
          return;
        }

      case 'serpentine': {
        const s = this.SCALE;
        const mat = new THREE.MeshStandardMaterial({ color: this.store.bojaMramora() });

        let sirina = 0.6;
        let visina = 0.8;
        const debljina = 0.08;

        if (this.tipMjesta === 'duplo') {
          sirina = 1.0;
          visina = 1.0;
        }

        const sirinaS = sirina * s;
        const visinaS = visina * s;
        const debljinaS = debljina * s;

        // === Serpentinasti oblik ===
        const shape = new THREE.Shape();
        const w = sirinaS / 2;
        const h = visinaS;

        shape.moveTo(-w, 0);
        shape.lineTo(-w, h * 0.7);
        shape.quadraticCurveTo(-w * 0.5, h * 1.1, 0, h * 0.9);
        shape.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.8);
        shape.lineTo(w, 0);
        shape.lineTo(-w, 0);

        const extrudeSettings = {
          depth: debljinaS,
          bevelEnabled: false,
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.translate(0, 0, -debljinaS / 2);

        const spomenikMesh = new THREE.Mesh(geo, mat);

        const postoljeVisina = 0.04 * s;
        const debljinaGornje = this.config.debljina * s;
        const visinaGrobnice = this.config.visina * s;
        const ukupnaY = visinaGrobnice + debljinaGornje + postoljeVisina;

        const ukupnaDuzina = 2.1 * s;
        const prednjiZ = ukupnaDuzina / 2 - debljinaS;

        spomenikMesh.position.set(0, ukupnaY, prednjiZ);

        this.spomenik = spomenikMesh;
        this.grobnicaGroup.add(this.spomenik);
        return;
      }
    }
  }

  dodajRubove(mesh: THREE.Mesh, group: THREE.Group, boja: string = '#000000') {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: boja });
    const lines = new THREE.LineSegments(edges, lineMaterial);
    lines.position.copy(mesh.position);
    lines.rotation.copy(mesh.rotation);
    group.add(lines);
  }

  onOblikChange(noviOblik: any) {
    this.store.setOdabraniOblik(noviOblik);
    this.odabraniOblik = noviOblik;
    this.osvjeziSVG();
  }

  onMaterijalChange(materijal: StoneMaterial) {
    this.store.setOdabraniMaterijal(materijal);
    this.odabraniMaterijal = materijal;
    this.osvjeziSVG();
    if (this.prikazi2D) {
      this.generiraj2DModel();
    }
  }

  async capture2DImage(): Promise<string | null> {
    const element = this.hidden2dContainer?.nativeElement;
    if (!element) return null;

    const canvas = await html2canvas(element, {
      width: 1100,
      scale: 1
    });

    return canvas.toDataURL('image/png');
  }

  openRequestDialog() {
    this.dialogVisible = true;
  }

  async onSendRequest(data: { email: string; phone: string; message: string }) {
    const slikaBase64 = await this.capture2DImage();

    if (!slikaBase64) {
      console.error('Greška kod spremanja slike.');
      return;
    }

    const payload = {
      userEmail: data.email,
      userPhone: data.phone,
      userNote: data.message,
      material: this.odabraniMaterijal?.name || '',
      materialWidth: this.sliderDebljina || 0,
      monumentShape: this.odabraniOblik.label || '',
      graveType: this.tipMjesta,
      totalArea: this.povrsinaMaterijalaM2,
      totalPrice: this.store.cijena() * this.povrsinaMaterijalaM2 || 0,
      designParts: this.ploca2dData,
      image2DBase64: slikaBase64
    };


    this.store.posaljiZahtjevPonude(payload).subscribe({
      next: () => {
        this.dialogVisible = false;
        alert('Zahtjev uspješno poslan!');
      },
      error: (err) => {
        console.error('Greška pri slanju zahtjeva:', err);
        alert('Došlo je do greške pri slanju zahtjeva.');
      }
    });
  }

  openDialog() {
    this.dialogVisible = true;
  }

  async onSubmitRequest(data: any) {
    await this.onSendRequest(data);

    this.dialogVisible = false;
  }

  onAddNewMaterial() {
    this.selectedMaterial = null;
    this.materialDialogOpen = true;
  }

  onEditMaterial(material: StoneMaterial) {
    this.selectedMaterial = { ...material };
    this.materialDialogOpen = true;
  }

  onCloseMaterialDialog(refresh: boolean) {
    this.materialDialogOpen = false;
    this.selectedMaterial = null;

    if (refresh) {
      this.store.fetchMaterijali().subscribe();
    }
  }

}
