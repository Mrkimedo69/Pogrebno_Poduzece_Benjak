import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-dialog',
  templateUrl: './order-dialog.component.html'
})
export class OrderDialogComponent {
  @Output() submitOrder = new EventEmitter<{
    fullName: string;
    email: string;
    phone: string;
  }>();

  visible = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.form.reset();
  }

  confirm() {
    if (this.form.valid) {
      this.submitOrder.emit(this.form.value);
      this.hide();
    }
  }
}
