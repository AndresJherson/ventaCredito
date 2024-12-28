import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ejecutarPrueba } from './models/prueba';
import { CommonModule } from '@angular/common';
import { OverlayDirective, OverlayService } from './services/overlay.service';
import { ProductoService } from './services/models/producto.service';
import { VentaCreditoService } from './services/models/venta-credito.service';
import { ClienteService } from './services/models/cliente.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    OverlayDirective
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    OverlayService
  ]
})
export class AppComponent {
    overlayService = inject( OverlayService );
    isActiveMenu = true;

    @ViewChild( 'menuHorizontal' ) menuHorizontal?: ElementRef<HTMLElement>;
    @ViewChild( 'menuVertical' ) menuVertical?: ElementRef<HTMLElement>;

    ventaCreditoService = inject( VentaCreditoService );
    productoService = inject( ProductoService );
    clienteService = inject( ClienteService );


    menuData: OptionAppComponent[] = [
        {
            title: 'Venta',
            onClick: app => this.ventaCreditoService.openTableComponent( this.overlayService ).subscribe()
        },
        {
            title: 'Productos',
            onClick: app => this.productoService.openTableComponent( this.overlayService ).subscribe()
        },
        {
            title: 'Clientes',
            onClick: app => this.clienteService.openTableComponent( this.overlayService ).subscribe()
        },
    ];

    private onClickWindow = ( e: Event ) => {
        if ( 
            !this.menuHorizontal?.nativeElement.contains( e.target as any ) &&
            !this.menuVertical?.nativeElement.contains( e.target as any )
        ) {
            this.isActiveMenu = false;
        }
    }


    ngOnInit()
    {
        // this.generoService.tableComponent( this.overlayService ).subscribe();
        // this.clickOption( this.menuData[3] );
        ejecutarPrueba();
    }
    
    ngAfterViewInit()
    {
        window.addEventListener( 'click', this.onClickWindow );

    }


    clickOption( option: OptionAppComponent )
    {
        this.overlayService.clear();
        this.isActiveMenu = false;
        option.onClick( this );
    }


    ngOnDestroy()
    {
        window.removeEventListener( 'click', this.onClickWindow );
        this.overlayService.clear();
    }
}


export interface OptionAppComponent
{
    title: string,
    onClick: ( app: AppComponent ) => void
}