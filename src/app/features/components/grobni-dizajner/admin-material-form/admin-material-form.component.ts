import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoneMaterial } from "../../../models/stone-material.model";
import { GrobniDizajnerStore } from "../store/grobni-dizajner.store";
import { firstValueFrom } from "rxjs";

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
  isDragging: boolean | undefined;
  selectedFile: File | null = null;

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

    const upload$ = this.selectedFile
      ? firstValueFrom(this.store.uploadTexture(this.selectedFile))
      : Promise.resolve({ textureUrl: this.form.value.textureUrl });

    upload$.then((res: any) => {
      console.warn(res);
      
      const payload = {
        ...this.form.value,
        textureUrl: res.imageUrl || '',
        pricePerM2: parseFloat(this.form.value.pricePerM2)
      };

      const req$ = this.material
        ? this.store.update(this.material.id, payload)
        : this.store.add(payload);

      req$.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.selectedFile = null;
          this.close.emit(true);
        },
        error: () => {
          this.isSubmitting = false;
          alert('Greška pri spremanju.');
        }
      });
    });
  }

    onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.previewImage(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    this.previewImage(file);
  }

  previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.currenttextureUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }


  uploadDroppedFile(file: File) {
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
