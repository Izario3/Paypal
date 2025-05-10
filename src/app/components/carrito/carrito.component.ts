import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importar el Router
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit } from '@angular/core';
declare var paypal: any;
@Component({
  selector: 'app-carrito',
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements AfterViewInit {
  carrito: any[] = [];

constructor(
  public carritoService:CarritoService,
  private router:Router){}

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
  }
ngAfterViewInit() {
  if (this.carrito.length > 0) {
    this.renderizarBotonPaypal();
  }
}
  irAlCarrito() {
    this.router.navigate(['/']); // Regresa a la página de productos
  }
eliminarProducto(producto: any) {
  this.carritoService.eliminarProducto(producto);
  this.carrito = this.carritoService.obtenerCarrito();

  const container = document.getElementById('paypal-button-container');
  if (this.carrito.length > 0) {
    this.renderizarBotonPaypal();
  } else if (container) {
    container.innerHTML = '';
  }
}
  descargarXML() {
    this.carritoService.descargarXML();
  }
getTotal(): number {
  if (!this.carrito || this.carrito.length === 0) {
    return 0;
  }

  return this.carrito.reduce((acc, producto) => acc + Number(producto.precio), 0);
}

renderizarBotonPaypal() {
  const container = document.getElementById('paypal-button-container');
  if (container) container.innerHTML = '';

  const total = this.getTotal().toFixed(2);

  paypal.Buttons({
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: this.getTotal().toFixed(2)
          }
          
        }]
      });
    },
    onApprove: (data: any, actions: any) => {
      return actions.order.capture().then((details: any) => {

        this.carritoService.vaciarCarrito();
        this.carrito = [];
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
      });
    },
    onError: (err: any) => {
      console.error(err);
      alert('Error en el pago');
    }
  }).render('#paypal-button-container');
}
}
