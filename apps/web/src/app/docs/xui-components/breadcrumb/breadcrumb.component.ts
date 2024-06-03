import { Component } from '@angular/core';
import { Information } from '../../components/information';

@Component({
  standalone: true,
  imports: [Information],
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {}
