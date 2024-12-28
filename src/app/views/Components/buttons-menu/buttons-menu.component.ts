import { Component, EventEmitter, inject, Output, Input, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-buttons-menu',
  imports: [
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './buttons-menu.component.html',
  styleUrl: './buttons-menu.component.css'
})
export class ButtonsMenuComponent {

    
    @Input() vm$ = new BehaviorSubject<ButtonsMenuComponentVm>({
        buttons: [],
    });
    isContainerActive = false;

    sub = new Subscription();
    el = inject( ElementRef );
    renderer = inject( Renderer2 );

    @Output() readonly onInit = new EventEmitter<ButtonsMenuComponent>();

    @ViewChild( 'container' ) container?: ElementRef<any>;
    private onClickDocument = ( e: Event ) => {
        if ( !this.container?.nativeElement.contains( e.target ) ) {
            this.isContainerActive = false;
        }
    }



    ngOnInit()
    {
        this.onInit.emit( this );

        this.sub.add( this.vm$.subscribe( vm => {

            if ( vm.buttons.length === 0 ) {
                this.renderer.addClass(this.el.nativeElement, 'hidden');
            } 
            else {
                this.renderer.removeClass(this.el.nativeElement, 'hidden');
            }

        } ) );
    }


    ngAfterViewInit()
    {
        document.addEventListener( 'click', this.onClickDocument );
    }


    clickContainer( e: Event )
    {
        this.isContainerActive = !this.isContainerActive;
    }


    executeAction( e: Event, bind: BindingButtonButtonsMenuComponent )
    {
        this.isContainerActive = false;
        bind.onClick( e );
    }


    ngOnDestroy()
    {
        this.sub.unsubscribe();
        document.removeEventListener( 'click', this.onClickDocument );
    }
}


export interface BindingButtonButtonsMenuComponent
{
    title: string,
    onClick: ( e: Event ) => void
}

export interface ButtonsMenuComponentVm
{
    buttons: BindingButtonButtonsMenuComponent[]
}