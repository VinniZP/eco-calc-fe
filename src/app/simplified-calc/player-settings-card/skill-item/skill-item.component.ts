import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectedSkill, UserConfigStore } from '../../../data/config';

@Component({
  selector: 'app-skill-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './skill-item.component.html',
  styleUrl: './skill-item.component.scss',
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
