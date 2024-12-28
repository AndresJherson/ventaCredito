import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { ItemType } from '../../../interfaces/ItemType';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { ComponentStore } from '../../../services/ComponentStore';


@Component({
  selector: 'app-input-search',
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe
  ],
  templateUrl: './input-search.component.html',
  styleUrl: './input-search.component.css'
})
export class InputSearchComponent<T extends ItemType> {

    @Input() store = new ComponentStore<T[]>([],of([]));

    @Input() vm$ = new BehaviorSubject<InputSearchComponentVm<T>>({
        value2search: '',
        bindingProperties: []
    });

    sub = new Subscription();

    @Output() readonly onSearch = new EventEmitter<InputSearchComponentEventData<T>>();

    
    search( e: Event ) 
    {
        const data = this.store.getState().filter( item => {

            return this.vm$.value.bindingProperties.some( bind => {
                return String( bind.getValue( item ) ?? '' ).toUpperCase().indexOf( this.vm$.value.value2search.toUpperCase() ) !== -1
            } );

        } );

        this.onSearch.emit({
            event: e,
            sender: this,
            data: data
        });
    }


    ngOnDestroy()
    {
        this.store.complete();
    }
}


export type InputSearchComponentEventData<T extends ItemType> =
{
    event: Event,
    sender: InputSearchComponent<T>,
    data: T[]
}

export interface BindingPropertyInputSearchComponent<T extends ItemType>
{
    getValue: ( item: T ) => T[keyof T] | undefined
}


export interface InputSearchComponentVm<T extends ItemType>
{
    value2search: string,
    bindingProperties: BindingPropertyInputSearchComponent<T>[]
}