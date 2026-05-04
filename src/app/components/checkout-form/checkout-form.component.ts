import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Cart } from '../../core/services/cart.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Local } from '../../core/services/local.service';
import {
  LucideAngularModule,
  MessageCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-angular';

import { BusinessHoursService } from '../../core/services/business-hours.service';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './checkout-form.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(Cart);
  private readonly restaurantService = inject(RestaurantService);
  private readonly _businessHours = inject(BusinessHoursService);
  private readonly _local = inject(Local);

  readonly MessageCircle = MessageCircle;
  readonly CreditCard = CreditCard;
  readonly Banknote = Banknote;
  readonly Smartphone = Smartphone;

  private readonly STORAGE_KEYS = {
    NAME: 'user_name',
    ADDRESS: 'user_address',
  };

  // Formulario reactivo
  readonly checkoutForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    paymentMethod: ['', Validators.required],
  });

  ngOnInit(): void {
    // Cargar datos persistidos
    const savedName = this._local.get<string>(this.STORAGE_KEYS.NAME);
    const savedAddress = this._local.get<string>(this.STORAGE_KEYS.ADDRESS);

    if (savedName) this.checkoutForm.get('name')?.setValue(savedName);
    if (savedAddress) this.checkoutForm.get('address')?.setValue(savedAddress);
  }

  // Datos para el formulario
  readonly paymentMethods = computed(
    () => this.restaurantService.orderConfig()?.payment_methods ?? [],
  );

  readonly whatsappConfig = this.restaurantService.whatsappConfig;

  /**
   * Envía el pedido por WhatsApp.
   */
  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // Final business hours check
    if (!this._businessHours.isOpen()) {
      this.cart.addItem({ id: 'dummy' } as any, 0); // Trigger modal
      return;
    }

    const { name, address, paymentMethod } = this.checkoutForm.value;

    // Persistir datos para futuras compras
    if (name) this._local.set(this.STORAGE_KEYS.NAME, name);
    if (address) this._local.set(this.STORAGE_KEYS.ADDRESS, address);

    const items = this.cart.items();
    const total = this.cart.total();

    // Formatear mensaje
    let message = `${this.whatsappConfig()?.message_template || 'Hola, me gustaría ordenar:'}\n\n`;

    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `*Total: S/ ${total.toFixed(2)}*\n\n`;
    message += `*Datos de entrega:*\n`;
    message += `Nombre: ${name}\n`;
    message += `Dirección: ${address}\n`;
    message += `Método de Pago: ${this.formatPaymentMethod(paymentMethod!)}\n`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = this.whatsappConfig()?.number || '';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Formatea el método de pago para el mensaje.
   */
  protected formatPaymentMethod(method: string): string {
    const formats: { [key: string]: string } = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      yape: 'Yape',
      plin: 'Plin',
    };
    return formats[method] || method;
  }

  /**
   * Obtiene el icono correspondiente al método de pago.
   */
  protected getPaymentIcon(method: string): any {
    switch (method) {
      case 'cash':
        return this.Banknote;
      case 'card':
        return this.CreditCard;
      case 'yape':
      case 'plin':
        return this.Smartphone;
      default:
        return this.CreditCard;
    }
  }

  /**
   * Obtiene el color de acento para el método de pago.
   */
  protected getPaymentColor(method: string): string {
    switch (method) {
      case 'yape':
        return '#742284'; // Morado Yape
      case 'plin':
        return '#00d4d8'; // Cyan Plin
      case 'cash':
        return '#22c55e'; // Verde
      default:
        return 'var(--color-primary)';
    }
  }
}
