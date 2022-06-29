import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FormatValuePipeModule } from '../../../pipes/format-value/format-value.pipe.module';

import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', async () => {
    let fixture: ComponentFixture<LeaderboardComponent>;
    let component: LeaderboardComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, FormatValuePipeModule],
                declarations: [LeaderboardComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
