import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

import { BackgroundComponent } from './background.component';

describe('BackgroundComponent', async () => {
    let fixture: ComponentFixture<BackgroundComponent>;
    let component: BackgroundComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [BackgroundComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(BackgroundComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
