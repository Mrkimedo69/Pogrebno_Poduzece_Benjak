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
      type: ['', Validators.required]
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

    const data = this.form.value;

    if (this.artikl) {
      this.artikliStore.update(this.artikl.id, data).subscribe(() => this.close.emit(true));
    } else {
      this.artikliStore.add(data).subscribe(() => this.close.emit(true));
    }
  }

  cancel() {
    this.close.emit(false);
  }

}
