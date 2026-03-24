import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { DividerComponent } from '../../shared/ui/divider/divider.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { SelectedSkill, UserConfigStore } from '../../data/config';
import { RecipesStore } from '../../data/recipes';
import { SkillItemComponent } from './skill-item/skill-item.component';

@Component({
    selector: 'app-player-settings-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SelectComponent, SkillItemComponent, CardComponent, DividerComponent],
    templateUrl: './player-settings-card.component.html',
    styleUrl: './player-settings-card.component.scss'
})
export class PlayerSettingsCardComponent {
  userConfigStore = inject(UserConfigStore);
  recipesStore = inject(RecipesStore);
  skills: Signal<string[]> = this.recipesStore.skills;
  selectedSkills: Signal<SelectedSkill[]> = this.userConfigStore.selectedSkills;

  selectedSkill = signal<string | null>(null);

  onSkillSelected(skill: string | null) {
    if (skill) {
      this.userConfigStore.enableSkill(skill);
      this.selectedSkill.set(null);
    }
  }
}
