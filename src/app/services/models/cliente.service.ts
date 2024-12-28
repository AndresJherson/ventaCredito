import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { OverlayService } from '../overlay.service';
import { StateRowTableComponent, TableComponent, TableComponentVm } from '../../views/CollectionComponents/table/table.component';
import { Cliente } from '../../models/Cliente';
import { map, tap } from 'rxjs';
import { PropBehavior } from '../../models/Model';
import { ModalService } from '../modal.service';
import { ComponentStore } from '../ComponentStore';
import { ObjectComponent, StateObjectComponent } from '../../views/ObjectComponents/object/object.component';
import { MessageBoxComponent } from '../../views/Components/message-box/message-box.component';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

    httpService = inject( HttpService );
    modalService = inject( ModalService );


    getCollection()
    {
        return this.httpService.get<Cliente[]>( 'clientes' )
        .pipe( map( data => data.map( item => new Cliente( item ) ) ) )
    }

    getItem( cliente: Cliente )
    {
        return this.httpService.getById<Cliente>({
            service: 'clientes',
            id: cliente.id
        })
        .pipe( map( item => new Cliente( item ) ) )
    }

    createItem( cliente: Cliente )
    {
        return this.httpService.post({
            service: 'clientes',
            values: { ...cliente }
        })
    }

    updateItem( cliente: Cliente )
    {
        return this.httpService.put({
            service: 'clientes',
            values: { ...cliente }
        })
    }

    deleteItem( cliente: Cliente )
    {
        return this.httpService.delete({
            service: 'clientes',
            id: cliente.id
        })
    }


    tableBindingProperties: TableComponentVm<Cliente>['bindingProperties'] = [
        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
        { title: 'Nombre', getValue: item => item.nombre, behavior: PropBehavior.string },
        { title: 'Apellido', getValue: item => item.apellido, behavior: PropBehavior.string },
        { title: 'Teléfono', getValue: item => item.telefono, behavior: PropBehavior.number},
        { title: 'Correo', getValue: item => item.correo, behavior: PropBehavior.string },
    ];


    openTableComponent( overlayService: OverlayService )
    {
        return overlayService.open( TableComponent<Cliente> ).pipe(
            tap( c => {
                
                c.store

                c.vm$.next({
                    title: 'Clientes',
                    isCloseButtonActive: false,
                    isHeadActive: true,
                    stateRow: StateRowTableComponent.select,
                    bindingProperties: this.tableBindingProperties  
                });

                c.buttonsMenuComponentVm$.next({
                    buttons: [ 
                        c.recordActions.addItem
                    ]
                });

                c.sub.add( c.onClose.subscribe( () => overlayService.close( c ) ) );

                c.sub.add( c.onAddItem.subscribe( e => 
                    this.openObjectComponent( c.store, c.store.storeFromThis( () => new Cliente() ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.create }) )
                ) );

                c.sub.add( c.onSelectItem.subscribe( e => 
                    this.openObjectComponent( c.store, c.store.storeFromThisAsync( new Cliente(), this.getItem( e.item ) ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.read }) )
                ) );

            } )
        );
    }


    openTableComponent2selectItem()
    {
        return this.modalService.open( TableComponent<Cliente> ).pipe(
            tap( c => {

                c.store.setRead( this.getCollection() )
                        .getRead()
                        .subscribe();

                c.vm$.next({
                    ...c.vm$.value,
                    title: 'Clientes',
                    stateRow: StateRowTableComponent.radioButton,
                    bindingProperties: this.tableBindingProperties
                });

            } )
        )
    }


    openObjectComponent( parentStore: ComponentStore<Cliente[]>, store: ComponentStore<Cliente> )
    {
        return this.modalService.open( ObjectComponent<Cliente> )
        .pipe(
            tap( c => {

                c.store = store;

                c.vm$.next({
                    title: 'Usuario',
                    isCloseActive: true,
                    state: StateObjectComponent.read,
                    bindingProperties: [
                        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
                        { title: 'Nombre', getValue: item => item.nombre, setValue: ( item, value ) => item.set({ nombre: value }), required: true, behavior: PropBehavior.string },
                        { title: 'Apellido', getValue: item => item.apellido, setValue: ( item, value ) => item.set({ apellido: value }), required: true, behavior: PropBehavior.string },
                        { title: 'Teléfono', getValue: item => item.telefono, setValue: ( item, value ) => item.set({ telefono: value }), required: true, behavior: PropBehavior.number },
                        { title: 'Correo', getValue: item => item.correo, setValue: ( item, value ) => item.set({ correo: value }), required: true, behavior: PropBehavior.string },
                    ]
                });


                c.sub.add( c.onUpdate.subscribe( e => {

                    this.updateItem( e.item ).subscribe({
                        next: () => this.getItem( e.item ).subscribe( item => {

                            store.setRead( this.getItem( item ) )
                            c.vm$.next({ ...c.vm$.value, state: StateObjectComponent.read });

                            parentStore.getRead().subscribe();

                        } ),
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

                c.sub.add( c.onCreate.subscribe( e => {

                    this.createItem( e.item ).subscribe({
                        next: () => this.getItem( e.item ).subscribe( item => {

                            store.setRead( this.getItem( item ) )
                            c.vm$.next({ ...c.vm$.value, state: StateObjectComponent.read });

                            parentStore.getRead().subscribe();

                        } ),
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

                c.sub.add( c.onDelete.subscribe( e => {

                    this.deleteItem( e.item ).subscribe({
                        next: () => {
                            c.close( e.event );
                            parentStore.getRead().subscribe();
                        },
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

            } )
        );
    }
}
