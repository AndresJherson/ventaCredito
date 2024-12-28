import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComponent } from '../../../interfaces/IComponent';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-buttons-footer',
  imports: [
    CommonModule,
],
  templateUrl: './buttons-footer.component.html',
  styleUrl: './buttons-footer.component.css',
})
export class ButtonsFooterComponent implements IComponent<ButtonsFooterComponent> {
    
    @Input() id = 0;
    @Input() vm$ = new BehaviorSubject<ButtonsFooterComponentVm>({
        buttonsHtml: [],
    });
    
    sub = new Subscription();
    cd = inject( ChangeDetectorRef );
    sanitizer = inject( DomSanitizer );
    el = inject( ElementRef );
    renderer = inject( Renderer2 );
    
    
    @ViewChild( 'wrapper' ) private wrapper?: TemplateRef<unknown>;
    @ViewChild( 'vcr', { read: ViewContainerRef } ) private vcr?: ViewContainerRef;
    
    @Output() readonly onInit = new EventEmitter<ButtonsFooterComponent>();
    @Output() readonly onDestroy = new EventEmitter<ButtonsFooterComponent>();


    ngOnInit()
    {
        this.onInit.emit( this );
    }


    ngAfterViewInit()
    {
        this.sub.add( this.vm$.subscribe( vm => {

            if ( vm.buttonsHtml.length === 0 ) {
                this.renderer.addClass( this.el.nativeElement, 'hidden' );
            }
            else {
                this.renderer.removeClass( this.el.nativeElement, 'hidden' );
            }
            
            if ( this.vcr && this.wrapper ) {
                
                this.vcr.clear();
                
                for( const button of vm.buttonsHtml ) {
                    const evref = this.vcr?.createEmbeddedView( this.wrapper, {
                        button: {
                            ...button,
                        }
                    } );
                }

            }

        } ) );
        
        this.cd.detectChanges();
    }


    ngOnDestroy()
    {
        this.sub.unsubscribe();
    }
}

export interface BindingButtonButtonsFooterComponent
{
    class: string,
    title: string,
    onClick: ( e: Event ) => void
}


export interface ButtonsFooterComponentVm
{
    buttonsHtml: BindingButtonButtonsFooterComponent[],
}