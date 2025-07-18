import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnInit,
    OnChanges,
    SimpleChanges
  } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { CvjecaraStore } from '../store/cvjecara.store';
  import { FlowerModel } from '../../../models/flower.model';
  
  @Component({
    selector: 'app-admin-flower-form',
    templateUrl: './admin-flower-form.component.html'
  })
  export class AdminFlowerFormComponent implements OnInit, OnChanges {
    @Input() flower: FlowerModel | null = null;
    @Output() close = new EventEmitter<boolean>();
  
    form: FormGroup;
    isSubmitting = false;
  
    constructor(private fb: FormBuilder, private store: CvjecaraStore) {
      this.form = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [null, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        imageUrl: ['']
      });
    }
  
    ngOnInit(): void {
      if (this.flower) {
        this.form.patchValue(this.flower);
      }
    }
  
    ngOnChanges(changes: SimpleChanges): void {
        if (this.form) {
          this.form.reset();
      
          if (this.flower) {
            this.form.patchValue(this.flower);
          }
        }
      }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data = this.form.value;

    const request$ = this.flower
      ? this.store.update(this.flower.id, data)
      : this.store.add(data);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;

        if (!this.flower) {
          this.form.reset();
        }

        this.close.emit(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
        this.close.emit(false);
    }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.isSubmitting = true;
    this.store.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ imageUrl: res.imageUrl });
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        alert('Greška prilikom upload-a slike.');
      }
    });
  }
  
  }
  