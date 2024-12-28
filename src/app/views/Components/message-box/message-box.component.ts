import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComponent } from '../../../interfaces/IComponent';
import { Subscription } from 'rxjs';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-message-box',
  imports: [
    CommonModule
  ],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.css'
})
export class MessageBoxComponent implements IComponent<MessageBoxComponent> {

    modalService = inject( ModalService );
    mensaje: string = "";
    dataBindingButtons: BindingButtonMessageBoxComponent[] = [];

    @Output() readonly onInit = new EventEmitter<MessageBoxComponent>();
    @Output() readonly onDestroy = new EventEmitter<MessageBoxComponent>();
    sub = new Subscription();


    ngOnInit(): void 
    {
        this.onInit.emit( this );
    }

    
    close( e: Event )
    {
        this.modalService.close( this );
    }


    ngOnDestroy(): void 
    {
        this.onDestroy.emit( this );
        this.sub.unsubscribe();
    }
}


export type MessageBoxComponentEvenData = {
    event: Event,
    sender: MessageBoxComponent
}


export interface BindingButtonMessageBoxComponent
{
    class: string,
    title: string,
    onClick: ( e: Event ) => void
}