import { Component, OnInit } from '@angular/core';
import { NarudzbeStore } from '../store/narudzbe.store';

@Component({
  selector: 'app-employee-monument-request',
  templateUrl: './employee-monument-request.component.html'
})
export class EmployeeMonumentRequestComponent implements OnInit {
  readonly requests = this.store.requests;

  constructor(public store: NarudzbeStore ) {}

  ngOnInit() {
  this.store.loadRequests();
  }

  getDimenzije(part: any): string {
    const width = part?.width ? (part.width * 100).toFixed(0) : '0';
    if ('height1' in part && 'height2' in part) {
      return `${width} cm x ${(part.height1 * 100).toFixed(0)}-${(part.height2 * 100).toFixed(0)} cm`;
    } else if ('height' in part) {
      return `${width} cm x ${(part.height * 100).toFixed(0)} cm`;
    }
    return `${width} cm x ?`;
  }

}
