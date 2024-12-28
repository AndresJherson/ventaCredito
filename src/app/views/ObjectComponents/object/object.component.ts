import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { IComponent } from '../../../interfaces/IComponent';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ComponentStore } from '../../../services/ComponentStore';
import { ModalService } from '../../../services/modal.service';
import { BUTTON_CLASS_BOOTSTRAP } from '../../../utils/ButtonsClass';
import { FormsModule } from '@angular/forms';
import { ItemType } from '../../../interfaces/ItemType';
import { ButtonsMenuComponent, ButtonsMenuComponentVm } from '../../Components/buttons-menu/buttons-menu.component';
import { ButtonsFooterComponent, ButtonsFooterComponentVm } from '../../Components/buttons-footer/buttons-footer.component';
import { MessageBoxComponent } from '../../Components/message-box/message-box.component';
import { PropBehavior } from '../../../models/Model';

@Component({
  selector: 'app-object',
  imports: [
    CommonModule,
    AsyncPipe,
    ButtonsMenuComponent,
    FormsModule,
    ButtonsFooterComponent
  ],
  templateUrl: './object.component.html',
  styleUrl: './object.component.css'
})
export class ObjectComponent<T extends ItemType> implements IComponent<ObjectComponent<T>> {
    
    @Input() id = -1;
    @Input() store = new ComponentStore<T>( {symbol: Symbol()} as T, () => ({symbol: Symbol()} as T) );
    item: T = {symbol: Symbol()} as T;

    @Input() vm$ = new BehaviorSubject<ObjectComponentVm<T>>({
        title: '',
        isCloseActive: true,
        state: StateObjectComponent.read,
        bindingProperties: []
    });

    buttonsMenuComponentVm$ = new BehaviorSubject<ButtonsMenuComponentVm>({
        buttons: []
    });

    buttonsFooterComponentVm$ = new BehaviorSubject<ButtonsFooterComponentVm>({
        buttonsHtml: []
    });


    @Output() readonly onInit = new EventEmitter<ObjectComponent<T>>();
    @Output() readonly onDestroy = new EventEmitter<ObjectComponent<T>>();
    @Output() readonly onClose = new EventEmitter<ObjectComponentEventData<T>>();
    
    @Output() readonly onCreate = new EventEmitter<ObjectComponentEventData<T>>();
    @Output() readonly onUpdate = new EventEmitter<ObjectComponentEventData<T>>();
    @Output() readonly onDelete = new EventEmitter<ObjectComponentEventData<T>>();
    @Output() readonly onRead = new EventEmitter<ObjectComponentEventData<T>>();
    @Output() readonly onCancelWrite = new EventEmitter<ObjectComponentEventData<T>>();

    sub = new Subscription();
    modalService = inject( ModalService );
    PropBehavior = PropBehavior;
    StateObjectComponent = StateObjectComponent;
    String = String;


    private buttonsMenu2read = () => {

        this.buttonsMenuComponentVm$.next({
            ...this.buttonsMenuComponentVm$.value,
            buttons: [
                {
                    title: 'Actualizar',
                    onClick: e => this.vm$.next({
                        ...this.vm$.value,
                        state: StateObjectComponent.update
                    })
                },
                {
                    title: 'Eliminar',
                    onClick: e => this.delete( e )
                },
            ]
        });

    }

    private buttonsMenu2create = () => {
        
        this.buttonsMenuComponentVm$.next({
            ...this.buttonsMenuComponentVm$.value,
            buttons: []
        });

    };

    private buttonsMenu2update = () => {
        
        this.buttonsMenuComponentVm$.next({
            ...this.buttonsMenuComponentVm$.value,
            buttons: [
                {
                    title: 'Eliminar',
                    onClick: e => this.delete( e )
                },
            ]
        });

    };


    private buttonsFooter2read = () => {

        this.buttonsFooterComponentVm$.next({
            ...this.buttonsFooterComponentVm$.value,
            buttonsHtml: []
        });

    }

    private buttonsFooter2create = () => {
        
        this.buttonsFooterComponentVm$.next({
            ...this.buttonsFooterComponentVm$.value,
            buttonsHtml: [
                {
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    title: 'Cancelar',
                    onClick: e => {
                        this.onCancelWrite.emit({
                            event: e,
                            sender: this,
                            item: this.item
                        });
                        this.close( e )
                    }
                },
                {
                    class: BUTTON_CLASS_BOOTSTRAP.primary,
                    title: 'Confirmar',
                    onClick: e => this.create( e )
                },
            ]
        });

    };


    private buttonsFooter2update = () => {

        this.buttonsFooterComponentVm$.next({
            ...this.buttonsFooterComponentVm$.value,
            buttonsHtml: [
                {
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    title: 'Cancelar',
                    onClick: e => {
                        this.store.getRead().subscribe();
                        this.vm$.next({
                            ...this.vm$.value,
                            state: StateObjectComponent.read
                        });
                        this.onCancelWrite.emit({
                            event: e,
                            sender: this,
                            item: this.item
                        });
                    }
                },
                {
                    class: BUTTON_CLASS_BOOTSTRAP.primary,
                    title: 'Confirmar',
                    onClick: e => this.update( e )
                },
            ]
        });

    }


    ngOnInit(): void 
    {
        this.onInit.emit( this );

        this.sub.add( this.store.state$.subscribe({
            next: state => {
                this.item = state;
                if ( this.vm$.value.state === StateObjectComponent.create ) {
                    console.log('state de objectComponent create');
                }
                else if ( this.vm$.value.state === StateObjectComponent.read ) {
                    console.log('state de objectComponent read');   
                }
            },
            error: error => this.close( new Event( 'click' ) )
        }) );

        this.sub.add( this.vm$.subscribe( vm => {

            if ( vm.state === StateObjectComponent.read ) {

                this.buttonsMenu2read();
                this.buttonsFooter2read();

            }
            else if ( vm.state === StateObjectComponent.create ) {

                this.buttonsMenu2create();
                this.buttonsFooter2create();

            }
            else if ( vm.state === StateObjectComponent.update ) {

                this.buttonsMenu2update();
                this.buttonsFooter2update();

            }

        } ) );

        this.sub.add( this.store.error$.subscribe( error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error ) ) );
    }

    getTitle( title: ObjectComponentVm<T>['title'] )
    {
        title instanceof Function
            ? title( this.store.getState() )
            : title
    }


    close( e: Event )
    {
        this.modalService.close( this );
        this.onClose.emit({
            event: e,
            sender: this,
            item: this.item
        });
    }

    
    read( e: Event )
    {
        this.store.getRead().subscribe();
        this.onRead.emit({
            event: e,
            sender: this,
            item: this.item
        });
    }


    create( e: Event )
    {
        this.onCreate.emit({
            event: e,
            sender: this,
            item: this.item
        });
    }


    update( e: Event )
    {
        this.onUpdate.emit({
            event: e,
            sender: this,
            item: this.item
        });
    }


    delete( e: Event )
    {
        this.modalService.open( MessageBoxComponent ).subscribe( c => {

            c.mensaje = "¿Estás seguro que deseas eliminar el registro?";
            c.dataBindingButtons = [
                {
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    title: 'Cancelar',
                    onClick: e => this.modalService.close( c )
                },
                {
                    class: BUTTON_CLASS_BOOTSTRAP.primary,
                    title: 'Confirmar',
                    onClick: e => {
                        this.modalService.close( c );
                        this.onDelete.emit({
                            event: e,
                            sender: this,
                            item: this.item
                        });
                    }
                },
            ];

        } )
    }


    ngOnDestroy(): void 
    {
        console.log( ObjectComponent.name, 'destruido' );
        this.onDestroy.emit( this );
        this.store.complete();
        this.sub.unsubscribe();
    }

}


export type ObjectComponentEventData<T extends ItemType> = 
{
    event: Event,
    sender: ObjectComponent<T>,
    item: T
}


export enum StateObjectComponent
{
    read,
    create,
    update,
    none
}


export interface BindingPropertyObjectComponent<T extends ItemType>
{
    title: string;
    getValue?: ( item: T, object?: boolean ) => T[keyof T] | undefined;
    setValue?: ( item: T, value?: any ) => void;
    readonly?: boolean;
    required?: boolean;
    onClick?: ( item: T ) => void;
    behavior: PropBehavior;
}


export interface ObjectComponentVm<T extends ItemType>
{
    title: String | ( ( item: T ) => T[keyof T] );
    isCloseActive: boolean;
    state: StateObjectComponent;
    bindingProperties: BindingPropertyObjectComponent<T>[];
}