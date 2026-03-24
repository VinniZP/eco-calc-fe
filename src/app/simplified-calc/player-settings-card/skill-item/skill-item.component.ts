import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { SelectDirective } from '../../../shared/ui/select/select.directive';
import { ToggleDirective } from '../../../shared/ui/toggle/toggle.directive';
import { SelectedSkill, UserConfigStore } from '../../../data/config';

@Component({
    selector: 'app-skill-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block border border-neutral rounded p-2' },
    imports: [FormFieldComponent, SelectDirective, ToggleDirective],
    templateUrl: './skill-item.component.html'
})
export class SkillItemComponent {
  skill = input.required<SelectedSkill>();
  userConfigStore = inject(UserConfigStore);

  changeLevel($event: number) {
    const newVar: { level: number; lavish?: boolean } = { level: $event };
    if (newVar.level < 6) {
      newVar.lavish = false;
    }
    this.userConfigStore.updateSkillParams(this.skill().skill, newVar);
  }

  changeLavish($event: boolean) {
    this.userConfigStore.updateSkillParams(this.skill().skill, { lavish: $event });
  }
}
