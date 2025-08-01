import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-monument-request-dialog',
  templateUrl: './monument-request-dialog.component.html'
})
export class MonumentRequestDialogComponent {
  @Input() visible = false;
  @Input() email = '';
  @Output() submitRequest = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      message: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['email'] && this.email) {
      this.form.patchValue({ email: this.email });
    }

    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.form.reset();
    }
  }

  submit() {
    if (this.form.valid) {
      this.submitRequest.emit(this.form.value);
    }
  }

  onClose() {
    this.close.emit();
  }
}
