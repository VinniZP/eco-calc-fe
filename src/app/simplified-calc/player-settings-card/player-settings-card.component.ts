import { Component, inject, Signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { SelectedSkill, UserConfigStore } from '../../data/config';
import { RecipesStore } from '../../data/recipes';
import { SkillItemComponent } from './skill-item/skill-item.component';

@Component({
  selector: 'app-player-settings-card',
  standalone: true,
  imports: [FormsModule, NgSelectModule, SkillItemComponent],
  templateUrl: './player-settings-card.component.html',
  styleUrl: './player-settings-card.component.scss',
})
export class PlayerSettingsCardComponent {
  userConfigStore = inject(UserConfigStore);
  recipesStore = inject(RecipesStore);
  skills: Signal<string[]> = this.recipesStore.skills;
  selectedSkills: Signal<SelectedSkill[]> = this.userConfigStore.selectedSkills;

  select = viewChild(NgSelectComponent);

  onChange($event: string) {
    if ($event) {
      this.select()?.clearModel();
      this.userConfigStore.enableSkill($event);
    }
  }
}
