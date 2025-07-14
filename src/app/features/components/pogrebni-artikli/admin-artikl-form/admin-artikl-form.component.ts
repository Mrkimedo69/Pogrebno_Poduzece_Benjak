import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArtikliStore } from '../store/pogrebni-artikli.store';
import { PogrebniArtikl } from '../../../models/pogrebni-artikli.model';

@Component({
  selector: 'app-admin-artikl-form',
  templateUrl: './admin-artikl-form.component.html'
})
export class AdminArtiklFormComponent implements OnInit {
  @Input() artikl: PogrebniArtikl | null = null;
  @Output() close = new EventEmitter<boolean>();

  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private artikliStore: ArtikliStore
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.artikl) {
      this.form.patchValue(this.artikl);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.form) {
      this.form.reset();
  
      if (this.artikl) {
        this.form.patchValue(this.artikl);
      }
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const data = this.form.value;
    const request$ = this.artikl
      ? this.artikliStore.update(this.artikl.id, data)
      : this.artikliStore.add(data);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.close.emit(false);
  }

}
