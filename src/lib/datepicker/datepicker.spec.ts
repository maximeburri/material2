import {ESCAPE} from '@angular/cdk/keycodes';
import {OverlayContainer} from '@angular/cdk/overlay';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing';
import {Component, ViewChild} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  DEC,
  JAN,
  JUL,
  JUN,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateModule,
  SEP,
} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '../input/index';
import {MatDatepicker} from './datepicker';
import {MatDatepickerInput} from './datepicker-input';
import {MatDatepickerToggle} from './datepicker-toggle';
import {MatDatepickerIntl, MatDatepickerModule} from './index';

describe('MatDatepicker', () => {
  const SUPPORTS_INTL = typeof Intl != 'undefined';

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    container.getContainerElement().parentNode!.removeChild(container.getContainerElement());
  }));

  describe('with MatNativeDateModule', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MatDatepickerModule,
          MatFormFieldModule,
          MatInputModule,
          MatNativeDateModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          DatepickerWithChangeAndInputEvents,
          DatepickerWithFilterAndValidation,
          DatepickerWithFormControl,
          DatepickerWithISOStrings,
          DatepickerWithMinAndMaxValidation,
          DatepickerWithNgModel,
          DatepickerWithStartAt,
          DatepickerWithStartView,
          DatepickerWithToggle,
          FormFieldDatepicker,
          MultiInputDatepicker,
          NoInputDatepicker,
          StandardDatepicker,
          DatepickerWithEvents,
        ],
      });

      TestBed.compileComponents();
    }));

    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(StandardDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should initialize with correct value shown in input', () => {
        if (SUPPORTS_INTL) {
          expect(fixture.nativeElement.querySelector('input').value).toBe('1/1/2020');
        }
      });

      it('open non-touch should open popup', () => {
        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
      });

      it('open touch should open dialog', () => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog mat-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog mat-dialog-container'))
            .not.toBeNull();
      });

      it('should open datepicker if opened input is set to true', () => {
        testComponent.opened = true;
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-content')).not.toBeNull();

        testComponent.opened = false;
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-content')).toBeNull();
      });

      it('open in disabled mode should not open the calendar', () => {
        testComponent.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('mat-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('mat-dialog-container')).toBeNull();
      });

      it('disabled datepicker input should open the calendar if datepicker is enabled', () => {
        testComponent.datepicker.disabled = false;
        testComponent.datepickerInput.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
      });

      it('close should close popup', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        let popup = document.querySelector('.cdk-overlay-pane')!;
        expect(popup).not.toBeNull();
        expect(parseInt(getComputedStyle(popup).height as string)).not.toBe(0);

        testComponent.datepicker.close();
        fixture.detectChanges();

        expect(parseInt(getComputedStyle(popup).height as string)).toBe(0);
      });

      it('should close the popup when pressing ESCAPE', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        let content = document.querySelector('.cdk-overlay-pane mat-datepicker-content')!;
        expect(content).toBeTruthy('Expected datepicker to be open.');

        const keyboardEvent = createKeyboardEvent('keydown', ESCAPE);
        const stopPropagationSpy = spyOn(keyboardEvent, 'stopPropagation').and.callThrough();

        dispatchEvent(content, keyboardEvent);
        fixture.detectChanges();

        content = document.querySelector('.cdk-overlay-pane mat-datepicker-content')!;

        expect(content).toBeFalsy('Expected datepicker to be closed.');
        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(keyboardEvent.defaultPrevented)
            .toBe(true, 'Expected default ESCAPE action to be prevented.');
      });

      it('close should close dialog', async(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).not.toBeNull();

        testComponent.datepicker.close();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.querySelector('mat-dialog-container')).toBeNull();
        });
      }));

      it('setting selected should update input and close calendar', async(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        dispatchMouseEvent(cells[1], 'click');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.querySelector('mat-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
        });
      }));

      it('clicking the currently selected date should close the calendar ' +
          'without firing selectedChanged', () => {
        const selectedChangedSpy =
            spyOn(testComponent.datepicker.selectedChanged, 'emit').and.callThrough();

        for (let changeCount = 1; changeCount < 3; changeCount++) {
          const currentDay = changeCount;
          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(document.querySelector('mat-datepicker-content')).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, currentDay));

          let cells = document.querySelectorAll('.mat-calendar-body-cell');
          dispatchMouseEvent(cells[1], 'click');
          fixture.detectChanges();
        }

        expect(selectedChangedSpy.calls.count()).toEqual(1);
        expect(document.querySelector('mat-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      });

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('should attach popup to native input', () => {
        let attachToRef = testComponent.datepickerInput.getPopupConnectionElementRef();
        expect(attachToRef.nativeElement.tagName.toLowerCase())
            .toBe('input', 'popup should be attached to native input');
      });

      it('input should aria-owns calendar after opened in non-touch mode', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        let ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        let ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mat-calendar');
      });

      it('input should aria-owns calendar after opened in touch mode', () => {
        testComponent.touch = true;
        fixture.detectChanges();

        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        let ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        let ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mat-calendar');
      });

      it('should not throw when given wrong data type', () => {
        testComponent.date = '1/1/2017' as any;

        expect(() => fixture.detectChanges()).not.toThrow();
      });
    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', async(() => {
        let fixture = TestBed.createComponent(MultiInputDatepicker);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker with no inputs', () => {
      let fixture: ComponentFixture<NoInputDatepicker>;
      let testComponent: NoInputDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(NoInputDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should not throw when accessing disabled property', () => {
        expect(() => testComponent.datepicker.disabled).not.toThrow();
      });

      it('should throw when opened with no registered inputs', async(() => {
        expect(() => testComponent.datepicker.open()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithStartAt);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with startView', () => {
      let fixture: ComponentFixture<DatepickerWithStartView>;
      let testComponent: DatepickerWithStartView;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithStartView);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should start at the specified view', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        const firstCalendarCell = document.querySelector('.mat-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent)
            .toBe('JAN', 'Expected the calendar to be in year-view');
      });
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithNgModel);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
        });
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', async(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(testComponent.datepickerInput.value).toEqual(selected);
          expect(testComponent.datepicker._selected).toEqual(selected);
        });
      }));

      it('should update model when date is selected', async(() => {
        expect(testComponent.selected).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._select(selected);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(testComponent.selected).toEqual(selected);
          expect(testComponent.datepickerInput.value).toEqual(selected);
        });
      }));

      it('should mark input dirty after input event', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should mark input dirty after date selected', async(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.datepicker._select(new Date(2017, JAN, 1));
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(inputEl.classList).toContain('ng-dirty');
        });
      }));

      it('should not mark dirty after model change', async(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.selected = new Date(2017, JAN, 1);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(inputEl.classList).toContain('ng-pristine');
        });
      }));

      it('should mark input touched on blur', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'focus');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      });

      it('should mark input touched on calendar selection', async(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        testComponent.datepicker._select(new Date(2017, JAN, 1));
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(inputEl.classList).toContain('ng-touched');
        });
      }));
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithFormControl);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      });

      it('should update formControl when date is selected', () => {
        expect(testComponent.formControl.value).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._select(selected);
        fixture.detectChanges();

        expect(testComponent.formControl.value).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });

      it('should disable input when form control disabled', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(inputEl.disabled).toBe(true);
      });

      it('should disable toggle when form control disabled', () => {
        expect(testComponent.datepickerToggle.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(testComponent.datepickerToggle.disabled).toBe(true);
      });
    });

    describe('datepicker with mat-datepicker-toggle', () => {
      let fixture: ComponentFixture<DatepickerWithToggle>;
      let testComponent: DatepickerWithToggle;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithToggle);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should open calendar when toggle clicked', () => {
        expect(document.querySelector('mat-dialog-container')).toBeNull();

        let toggle = fixture.debugElement.query(By.css('button'));
        dispatchMouseEvent(toggle.nativeElement, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).not.toBeNull();
      });

      it('should not open calendar when toggle clicked if datepicker is disabled', () => {
        testComponent.datepicker.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('mat-dialog-container')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).toBeNull();
      });

      it('should not open calendar when toggle clicked if input is disabled', () => {
        expect(testComponent.datepicker.disabled).toBe(false);

        testComponent.input.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('mat-dialog-container')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).toBeNull();
      });

      it('should set the `button` type on the trigger to prevent form submissions', () => {
        let toggle = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(toggle.getAttribute('type')).toBe('button');
      });

      it('should remove the underlying SVG icon from the tab order', () => {
        const icon = fixture.debugElement.nativeElement.querySelector('svg');
        expect(icon.getAttribute('focusable')).toBe('false');
      });

      it('should restore focus to the toggle after the calendar is closed', () => {
        let toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        fixture.componentInstance.touchUI = false;
        fixture.detectChanges();

        toggle.focus();
        expect(document.activeElement).toBe(toggle, 'Expected toggle to be focused.');

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        let pane = document.querySelector('.cdk-overlay-pane')!;

        expect(pane).toBeTruthy('Expected calendar to be open.');
        expect(pane.contains(document.activeElement))
            .toBe(true, 'Expected focus to be inside the calendar.');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();

        expect(document.activeElement).toBe(toggle, 'Expected focus to be restored to toggle.');
      });

      it('should re-render when the i18n labels change',
        inject([MatDatepickerIntl], (intl: MatDatepickerIntl) => {
          const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

          intl.openCalendarLabel = 'Open the calendar, perhaps?';
          intl.changes.next();
          fixture.detectChanges();

          expect(toggle.getAttribute('aria-label')).toBe('Open the calendar, perhaps?');
        }));
    });

    describe('datepicker inside mat-form-field', () => {
      let fixture: ComponentFixture<FormFieldDatepicker>;
      let testComponent: FormFieldDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(FormFieldDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should attach popup to mat-form-field underline', () => {
        let attachToRef = testComponent.datepickerInput.getPopupConnectionElementRef();
        expect(attachToRef.nativeElement.classList.contains('mat-form-field-underline'))
            .toBe(true, 'popup should be attached to mat-form-field underline');
      });
    });

    describe('datepicker with min and max dates and validation', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
      let testComponent: DatepickerWithMinAndMaxValidation;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithMinAndMaxValidation);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker._minDate).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker._maxDate).toEqual(new Date(2020, JAN, 1));
      });

      it('should mark invalid when value is before min', async(() => {
        testComponent.date = new Date(2009, DEC, 31);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .toContain('ng-invalid');
        });
      }));

      it('should mark invalid when value is after max', async(() => {
        testComponent.date = new Date(2020, JAN, 2);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .toContain('ng-invalid');
        });
      }));

      it('should not mark invalid when value equals min', async(() => {
        testComponent.date = testComponent.datepicker._minDate;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .not.toContain('ng-invalid');
        });
      }));

      it('should not mark invalid when value equals max', async(() => {
        testComponent.date = testComponent.datepicker._maxDate;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .not.toContain('ng-invalid');
        });
      }));

      it('should not mark invalid when value is between min and max', async(() => {
        testComponent.date = new Date(2010, JAN, 2);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .not.toContain('ng-invalid');
        });
      }));
    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithFilterAndValidation);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should mark input invalid', async(() => {
        testComponent.date = new Date(2017, JAN, 1);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .toContain('ng-invalid');

          testComponent.date = new Date(2017, JAN, 2);
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
                .not.toContain('ng-invalid');
          });
        });
      }));

      it('should disable filtered calendar cells', () => {
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).not.toBeNull();

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        expect(cells[0].classList).toContain('mat-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
      });
    });

    describe('datepicker with change and input events', () => {
      let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
      let testComponent: DatepickerWithChangeAndInputEvents;
      let inputEl: HTMLInputElement;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithChangeAndInputEvents);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        spyOn(testComponent, 'onChange');
        spyOn(testComponent, 'onInput');
        spyOn(testComponent, 'onDateChange');
        spyOn(testComponent, 'onDateInput');
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should fire input and dateInput events when user types input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });

      it('should fire change and dateChange events when user commits typed input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'change');
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });

      it('should fire dateChange and dateInput events when user selects calendar date', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mat-dialog-container')).not.toBeNull();

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        dispatchMouseEvent(cells[0], 'click');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });
    });

    describe('with ISO 8601 strings as input', () => {
      let fixture: ComponentFixture<DatepickerWithISOStrings>;
      let testComponent: DatepickerWithISOStrings;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithISOStrings);
        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should coerce ISO strings', async(() => {
        expect(() => fixture.detectChanges()).not.toThrow();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(testComponent.datepicker.startAt).toEqual(new Date(2017, JUL, 1));
          expect(testComponent.datepickerInput.value).toEqual(new Date(2017, JUN, 1));
          expect(testComponent.datepickerInput.min).toEqual(new Date(2017, JAN, 1));
          expect(testComponent.datepickerInput.max).toEqual(new Date(2017, DEC, 31));
        });
      }));
    });

    describe('with events', () => {
      let fixture: ComponentFixture<DatepickerWithEvents>;
      let testComponent: DatepickerWithEvents;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithEvents);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('should dispatch an event when a datepicker is opened', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(testComponent.openedSpy).toHaveBeenCalled();
      });

      it('should dispatch an event when a datepicker is closed', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        testComponent.datepicker.close();
        fixture.detectChanges();

        expect(testComponent.closedSpy).toHaveBeenCalled();
      });

    });

  });

  describe('with missing DateAdapter and MAT_DATE_FORMATS', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MatDatepickerModule,
          MatFormFieldModule,
          MatInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [StandardDatepicker],
      });

      TestBed.compileComponents();
    }));

    it('should throw when created', () => {
      expect(() => TestBed.createComponent(StandardDatepicker))
          .toThrowError(/MatDatepicker: No provider found for .*/);
    });
  });

  describe('popup positioning', () => {
    let fixture: ComponentFixture<StandardDatepicker>;
    let testComponent: StandardDatepicker;
    let input: HTMLElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          MatDatepickerModule,
          MatFormFieldModule,
          MatInputModule,
          MatNativeDateModule,
          NoopAnimationsModule
        ],
        declarations: [StandardDatepicker],
      }).compileComponents();

      fixture = TestBed.createComponent(StandardDatepicker);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.debugElement.query(By.css('input')).nativeElement;
      input.style.position = 'fixed';
    }));

    it('should be below and to the right when there is plenty of space', () => {
      input.style.top = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(inputRect.bottom), 'Expected popup to align to input bottom.');
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(inputRect.left), 'Expected popup to align to input left.');
    });

    it('should be above and to the right when there is no space below', () => {
      input.style.bottom = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
          .toBe(Math.floor(inputRect.top), 'Expected popup to align to input top.');
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(inputRect.left), 'Expected popup to align to input left.');
    });

    it('should be below and to the left when there is no space on the right', () => {
      input.style.top = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(inputRect.bottom), 'Expected popup to align to input bottom.');
      expect(Math.floor(overlayRect.right))
          .toBe(Math.floor(inputRect.right), 'Expected popup to align to input right.');
    });

    it('should be above and to the left when there is no space on the bottom', () => {
      input.style.bottom = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
          .toBe(Math.floor(inputRect.top), 'Expected popup to align to input top.');
      expect(Math.floor(overlayRect.right))
          .toBe(Math.floor(inputRect.right), 'Expected popup to align to input right.');
    });

  });

  describe('internationalization', () => {
    let fixture: ComponentFixture<DatepickerWithi18n>;
    let testComponent: DatepickerWithi18n;
    let input: HTMLInputElement;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          MatDatepickerModule,
          MatFormFieldModule,
          MatInputModule,
          MatNativeDateModule,
          NoopAnimationsModule,
          NativeDateModule,
          FormsModule
        ],
        providers: [{provide: MAT_DATE_LOCALE, useValue: 'de-DE'}],
        declarations: [DatepickerWithi18n],
      }).compileComponents();

      fixture = TestBed.createComponent(DatepickerWithi18n);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    }));

    it('should have the correct input value even when inverted date format', async(() => {
      if (typeof Intl === 'undefined') {
        // Skip this test if the internationalization API is not supported in the current
        // browser. Browsers like Safari 9 do not support the "Intl" API.
        return;
      }

      const selected = new Date(2017, SEP, 1);
      testComponent.date = selected;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        // Normally the proper date format would 01.09.2017, but some browsers seem format the
        // date without the leading zero. (e.g. 1.9.2017).
        expect(input.value).toMatch(/0?1\.0?9\.2017/);

        expect(testComponent.datepickerInput.value).toBe(selected);
      });
    }));
  });
});


@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d [touchUi]="touch" [disabled]="disabled" [opened]="opened"></mat-datepicker>
  `,
})
class StandardDatepicker {
  opened = false;
  touch = false;
  disabled = false;
  date: Date | null = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}


@Component({
  template: `
    <input [matDatepicker]="d"><input [matDatepicker]="d"><mat-datepicker #d></mat-datepicker>
  `,
})
class MultiInputDatepicker {}


@Component({
  template: `<mat-datepicker #d></mat-datepicker>`,
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}


@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d [startAt]="startDate"></mat-datepicker>
  `,
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}


@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d startView="year"></mat-datepicker>
  `,
})
class DatepickerWithStartView {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}


@Component({
  template: `
    <input [(ngModel)]="selected" [matDatepicker]="d">
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithNgModel {
  selected: Date | null = null;
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}


@Component({
  template: `
    <input [formControl]="formControl" [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
  @ViewChild(MatDatepickerToggle) datepickerToggle: MatDatepickerToggle<Date>;
}


@Component({
  template: `
    <input [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d [touchUi]="touchUI"></mat-datepicker>
  `,
})
class DatepickerWithToggle {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) input: MatDatepickerInput<Date>;
  touchUI = true;
}


@Component({
  template: `
      <mat-form-field>
        <input matInput [matDatepicker]="d">
        <mat-datepicker #d></mat-datepicker>
      </mat-form-field>
  `,
})
class FormFieldDatepicker {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}


@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithMinAndMaxValidation {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  date: Date | null;
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
}


@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date" [matDatepickerFilter]="filter">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d [touchUi]="true"></mat-datepicker>
  `,
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  date: Date;
  filter = (date: Date) => date.getDate() != 1;
}


@Component({
  template: `
    <input [matDatepicker]="d" (change)="onChange()" (input)="onInput()"
           (dateChange)="onDateChange()" (dateInput)="onDateInput()">
    <mat-datepicker #d [touchUi]="true"></mat-datepicker>
  `
})
class DatepickerWithChangeAndInputEvents {
  @ViewChild('d') datepicker: MatDatepicker<Date>;

  onChange() {}

  onInput() {}

  onDateChange() {}

  onDateInput() {}
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date">
    <mat-datepicker #d></mat-datepicker>
  `
})
class DatepickerWithi18n {
  date: Date | null = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max">
    <mat-datepicker #d [startAt]="startAt"></mat-datepicker>
  `
})
class DatepickerWithISOStrings {
  value = new Date(2017, JUN, 1).toISOString();
  min = new Date(2017, JAN, 1).toISOString();
  max = new Date (2017, DEC, 31).toISOString();
  startAt = new Date(2017, JUL, 1).toISOString();
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}

@Component({
  template: `
    <input [(ngModel)]="selected" [matDatepicker]="d">
    <mat-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></mat-datepicker>
  `,
})
class DatepickerWithEvents {
  selected: Date | null = null;
  openedSpy = jasmine.createSpy('opened spy');
  closedSpy = jasmine.createSpy('closed spy');
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}
