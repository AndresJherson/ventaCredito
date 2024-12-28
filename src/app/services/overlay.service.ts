import { ApplicationRef, ChangeDetectorRef, Component, ComponentRef, createComponent, Directive, ElementRef, EnvironmentInjector, inject, Injectable, Injector, Input, Renderer2, Type, ViewChild, ViewContainerRef } from "@angular/core";
import { BehaviorSubject, distinctUntilChanged, Observable, Subscription } from "rxjs";
import { IComponent } from "../interfaces/IComponent";


@Injectable({
  providedIn: null,
})
export class OverlayService {

    private appRef = inject( ApplicationRef );
    private envInject = inject( EnvironmentInjector );
    private injector = inject( Injector );
     components: Array<{ container: ComponentRef<OverlayContainerComponent>, ref: ComponentRef<any> }> = []; 
    public component$ = new BehaviorSubject<ComponentRef<OverlayContainerComponent>|undefined>( undefined );

    
    open<T extends IComponent<any>>(component: Type<T> ): Observable<T>
    {
        return new Observable( o => {

            try {
                const componentRef = createComponent( component, {
                    environmentInjector: this.envInject,
                    elementInjector: this.injector
                } );

                componentRef.instance.sub.add( componentRef.instance.onInit.subscribe({
                    next: ( c: any ) => {
                        o.next( componentRef.instance );
                        o.complete();
                    },
                    error: ( error: any ) => o.error( error )
                }));
        
                const containerRef = createComponent( OverlayContainerComponent, {
                    environmentInjector: this.envInject,
                    elementInjector: this.injector
                } );
        
                containerRef.instance.componentRef = componentRef;
        
                this.components.push({ container: containerRef, ref: componentRef });
                this.component$.next( containerRef );
            }
            catch ( error ) {
                o.error( error );
            }

        } );
    }

    

    close( instance: IComponent<any> ): void 
    {
        const index = this.components.findIndex( c => c.ref.instance === instance );
    
        if (index !== -1) {
            this.components[ index ].container.destroy();
            this.components.splice( index, 1 );

            const lastComponent = this.components.length
                                    ? this.components[this.components.length - 1].container
                                    : undefined;

            this.component$.next( lastComponent );
        }
    }


    clear(): void {
        this.components.reverse().forEach( c => c.container.destroy() );
        this.components = [];
    }
    

    isOverlay( instance: any ): boolean
    {
        const i = this.components.map( c => c.ref.instance ).indexOf( instance );
        return i === -1 ? false : true;
    }

}


@Component({
    selector: 'overlay-container',
    template: '<ng-container #vcr></ng-container>',
    styles: [`
        :host {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            
            display: flex;
            align-items: flex-start;
            justify-content: center;
        }
    `]
})
class OverlayContainerComponent
{
    @Input() componentRef?: ComponentRef<any>;
    @ViewChild( 'vcr', {read: ViewContainerRef} ) vcr?: ViewContainerRef;
    cd = inject( ChangeDetectorRef );

    ngAfterViewInit()
    {
        if ( this.componentRef ) this.vcr?.insert( this.componentRef.hostView );
        this.cd.detectChanges();
    }

    ngOnDestroy()
    {
        console.log( 'overlay container destruido' );
    }
}


@Directive({
    selector: '[overlayDirective]',
    standalone: true
})
export class OverlayDirective
{
    @Input() overlayService?: OverlayService;
    private vcr = inject( ViewContainerRef );
    private sub = new Subscription();
    private renderer = inject( Renderer2 );


    ngAfterViewInit()
    {
        this.sub.add( this.overlayService?.component$.pipe( distinctUntilChanged() ).subscribe( container => {
            if ( container ) {
                this.vcr.insert( container.hostView );
                const vcrElement = this.vcr.element.nativeElement as HTMLElement;
                vcrElement.replaceChildren();
                this.renderer.appendChild( vcrElement, container.location.nativeElement );
            }
        } ) )
    }


    ngOnDestroy()
    {
        this.sub.unsubscribe();
    }
}