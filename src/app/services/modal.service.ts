import { ApplicationRef, ChangeDetectorRef, Component, ComponentRef, ElementRef, EnvironmentInjector, HostListener, Injectable, Injector, Input, Type, ViewChild, ViewContainerRef, createComponent, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IComponent } from '../interfaces/IComponent';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

    private envInject = inject( EnvironmentInjector );
    private injector = inject( Injector );
    private appRef = inject( ApplicationRef );
    private components: Array<{ wrapper: ComponentRef<ModalWrapper>, ref: ComponentRef<any> }> = [];

    
    open<T extends IComponent<any>>( component: Type<T>, isClosable: boolean = true ): Observable<T>
    {
        return new Observable( o => {

            try {
                const cr = createComponent( component, { 
                    environmentInjector: this.envInject,
                    elementInjector: this.injector
                } );
        
                const wrapper = createComponent( ModalWrapper, {
                    environmentInjector: this.envInject,
                    elementInjector: this.injector
                } );
                wrapper.instance.cr = cr;
                wrapper.instance.isClosable = isClosable;
        
                this.appRef.attachView( wrapper.hostView );
                document.body.appendChild( wrapper.location.nativeElement );
        
                this.components.push({
                    wrapper: wrapper,
                    ref: cr
                });
        
                cr.instance.sub.add( cr.instance.onInit.subscribe({
                    next: () => {
                        o.next( cr.instance );
                        o.complete();
                    },
                    error: ( error: any ) => o.error( error )
                }) );
                    
                this.updateVisibility();
            
            }
            catch ( error ) {
                o.error( error );
            }
        } );
    }


    close( instance: IComponent<any> ): void
    {
        const i = this.components.map( c => c.ref.instance ).indexOf( instance );
        if ( i !== -1 ) {
            this.components[ i ].wrapper.destroy();
            this.components.splice( i, 1 );
            this.updateVisibility();
        }
    }


    clear()
    {
        this.components.reverse().forEach( pm => pm.wrapper.destroy() );
        this.components = [];
    }


    isModal( instance: any ): boolean
    {
        const i = this.components.map( c => c.ref.instance ).indexOf( instance );
        return i === -1 ? false : true;
    }


    private updateVisibility() {
        if ( this.components.length > 0 ) {
            this.components.forEach( ( pm, index ) => {

                const el = pm.wrapper.location.nativeElement;
                el.style.display = index === this.components.length - 1
                    ? el.style.display = 'flex'
                    : el.style.display = 'none';

            });
        }
    }
}


@Component({
    selector: 'modal-wrapper',
    template: `
        <ng-container #vcr>
    `,
    styles: [`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background-color: rgb(0,0,0,.5);
        }

        .modal-wrapper-hidden {
            display: none
        }
    `]
})
class ModalWrapper
{
    @Input() cr?: ComponentRef<any>;
    @Input() isClosable = true;
    @ViewChild( 'vcr', {read: ViewContainerRef} ) vcr?:ViewContainerRef;
    private modalService = inject( ModalService );
    private el = inject( ElementRef )
    private cd = inject( ChangeDetectorRef );


    ngAfterViewInit()
    {
        if ( this.cr ) this.vcr?.insert( this.cr.hostView );
        this.cd.detectChanges();
    }

    @HostListener( 'click', [ '$event' ] )
    onClick( e: Event )
    {
        if ( this.cr && this.isClosable && this.el.nativeElement === e.target ) {
            this.modalService.close( this.cr.instance );
        }
    }
}