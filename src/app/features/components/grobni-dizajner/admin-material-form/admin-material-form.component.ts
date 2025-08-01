import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoneMaterial } from "../../../models/stone-material.model";
import { GrobniDizajnerStore } from "../store/grobni-dizajner.store";

@Component({
  selector: 'app-admin-material-form',
  templateUrl: './admin-material-form.component.html'
})
export class AdminMaterialFormComponent implements OnChanges {
  @Input() material: StoneMaterial | null = null;
  @Output() close = new EventEmitter<boolean>();

  form: FormGroup;
  isSubmitting = false;
  currenttextureUrl = ''

  constructor(
    private fb: FormBuilder,
    private store: GrobniDizajnerStore
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      colorHex: ['#cccccc', Validators.required],
      textureUrl: [''],
      pricePerM2: [0, [Validators.required, Validators.min(0)]],
      isAvailable: [true]
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!this.material) {
      this.form.reset({
        name: '',
        colorHex: '#cccccc',
        textureUrl: '',
        pricePerM2: 0,
        isAvailable: true
      });
    }

    if (changes['material'] && changes['material'].currentValue) {
      this.form.patchValue(this.material!);
      this.currenttextureUrl = this.store.getImageUrl(this.form.value['textureUrl'])
    }
  }

  submit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const req$ = this.material
      ? this.store.update(this.material.id, this.form.value)
      : this.store.add(this.form.value);

    req$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit(true);
      },
      error: () => {
        this.isSubmitting = false;
        alert('Greška pri spremanju.');
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isSubmitting = true;
    this.store.uploadTexture(file).subscribe({
      next: res => {
        this.form.patchValue({ textureUrl: res.textureUrl });
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        alert('Greška kod učitavanja slike.');
      }
    });
  }
}
