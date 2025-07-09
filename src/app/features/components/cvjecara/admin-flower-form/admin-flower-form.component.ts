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
  
    constructor(private fb: FormBuilder, private store: CvjecaraStore) {
      this.form = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [null, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        imageUrl: ['', Validators.required]
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
  
      const data = this.form.value;
  
      if (this.flower) {
        // UPDATE
        this.store.update(this.flower.id, data).subscribe(() => {
          this.close.emit(true);
        });
      } else {
        // CREATE
        this.store.add(data).subscribe(() => {
          this.close.emit(true);
        });
      }
    }
  
    cancel(): void {
        this.close.emit(false);
    }
  }
  