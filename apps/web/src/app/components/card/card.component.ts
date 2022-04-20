import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  code = `<xui-card title="foobar" [extra]="extra" [actions]="actions">Just like this</xui-card>

<ng-template #extra>
  <button xui xSize="sm" xColor="primary">More</button>
</ng-template>

<ng-template #actions>
  <button xui xType="raised" xColor="primary">Save</button>
  <button xui xColor="destructive">Discard</button>
</ng-template>
`;
}
