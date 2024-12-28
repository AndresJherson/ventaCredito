import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComponent } from '../../../interfaces/IComponent';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './Loader.component.html',
  styleUrl: './Loader.component.css',
})
export class LoaderComponent implements IComponent<LoaderComponent> {

    @Output() readonly onInit = new EventEmitter<LoaderComponent>();
    @Output() readonly onDestroy = new EventEmitter<LoaderComponent>();
    sub = new Subscription();


    ngOnInit(): void 
    {
        this.onInit.emit( this );
    }


    ngOnDestroy(): void 
    {
        this.onDestroy.emit( this );
        this.sub.unsubscribe();
    }
}