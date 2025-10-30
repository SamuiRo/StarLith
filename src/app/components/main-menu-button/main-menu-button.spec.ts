import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenuButton } from './main-menu-button';

describe('MainMenuButton', () => {
  let component: MainMenuButton;
  let fixture: ComponentFixture<MainMenuButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMenuButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainMenuButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
