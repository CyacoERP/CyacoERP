import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoServicio } from '../../services/contacto.servicio';

interface Asunto {
  id: string;
  label: string;
}

interface PreguntaFAQ {
  id: number;
  pregunta: string;
  respuesta: string;
  abierta?: boolean;
}

interface VideoTutorial {
  id: number;
  titulo: string;
  duracion: string;
  url: string;
}

@Component({
  selector: 'app-formulario-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-contacto.componente.html',
  styleUrl: './formulario-contacto.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioContactoComponente {
  private readonly contactoServicio = inject(ContactoServicio);

  readonly nombre = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly asunto = signal('');
  readonly mensaje = signal('');
  readonly enviado = signal(false);

  readonly asuntos = signal<Asunto[]>([
    { id: 'soporte', label: 'Soporte Técnico' },
    { id: 'ventas', label: 'Información de Ventas' },
    { id: 'calibracion', label: 'Calibración y Certificación' },
    { id: 'cotizacion', label: 'Solicitud de Cotización' },
    { id: 'garantia', label: 'Garantía y Devoluciones' },
    { id: 'otro', label: 'Otro' },
  ]);

  readonly preguntasFAQ = signal<PreguntaFAQ[]>([
    {
      id: 1,
      pregunta: '¿Cuál es el tiempo de entrega promedio de los productos?',
      respuesta:
        'El tiempo de entrega depende del producto y la ubicación. Para productos en stock, entregamos en 1-2 días hábiles. Para productos especiales, entre 5-10 días hábiles. Consulta directamente con nuestro equipo de ventas para mayor precisión.',
    },
    {
      id: 2,
      pregunta: '¿Ofrecen servicio de calibración y certificación?',
      respuesta:
        'Sí, ofrecemos servicios completos de calibración y certificación según estándares internacionales ATEX e IECEx. Nuestro laboratorio está acreditado y cuenta con trazabilidad en patrones certificados.',
    },
    {
      id: 3,
      pregunta: '¿Cómo funciona el proceso de cotización?',
      respuesta:
        'Puedes solicitar una cotización a través de nuestro portal en línea, correo electrónico o llamando directamente. Nuestro equipo de ventas revisará tu solicitud en 24 horas hábiles y te enviará una propuesta personalizada.',
    },
    {
      id: 4,
      pregunta: '¿Tienen soporte técnico post-venta?',
      respuesta:
        'Sí, ofrecemos soporte técnico completo post-venta incluyendo asistencia remota, visitas técnicas, capacitación y resolución de problemas. Estamos disponibles de lunes a viernes 8:00 AM - 5:00 PM CST.',
    },
    {
      id: 5,
      pregunta: '¿Los productos tienen garantía?',
      respuesta:
        'Todos nuestros productos incluyen garantía de 2 años contra defectos de fabricación. Las condiciones específicas de garantía varían por producto. Consulta la documentación del producto o contacta a nuestro equipo.',
    },
    {
      id: 6,
      pregunta: '¿Ofrecen financiamiento o crédito?',
      respuesta:
        'Sí, contamos con opciones de financiamiento para compras mayores a $50,000 USD. Trabajamos con instituciones financieras de confianza. Contacta al departamento de ventas para más información.',
    },
  ]);

  readonly videosTutoriales = signal<VideoTutorial[]>([
    {
      id: 1,
      titulo: 'Instalación de transmisores de presión',
      duracion: '12 min',
      url: 'https://www.youtube.com/results?search_query=instalacion+transmisor+de+presion+industrial',
    },
    {
      id: 2,
      titulo: 'Configuración de medidores de flujo',
      duracion: '18 min',
      url: 'https://www.youtube.com/results?search_query=configuracion+medidor+de+flujo+industrial',
    },
    {
      id: 3,
      titulo: 'Calibración en campo: paso a paso',
      duracion: '22 min',
      url: 'https://www.youtube.com/results?search_query=calibracion+de+instrumentacion+en+campo+paso+a+paso',
    },
    {
      id: 4,
      titulo: 'Integración HART con sistemas SCADA',
      duracion: '15 min',
      url: 'https://www.youtube.com/results?search_query=integracion+hart+con+scada',
    },
  ]);

  actualizarNombre(valor: string): void {
    this.nombre.set(valor);
  }

  actualizarEmail(valor: string): void {
    this.email.set(valor);
  }

  actualizarTelefono(valor: string): void {
    this.telefono.set(valor);
  }

  actualizarEmpresa(valor: string): void {
    this.empresa.set(valor);
  }

  actualizarAsunto(valor: string): void {
    this.asunto.set(valor);
  }

  actualizarMensaje(valor: string): void {
    this.mensaje.set(valor);
  }

  enviar(): void {
    const datos = {
      nombre: this.nombre(),
      email: this.email(),
      telefono: this.telefono(),
      empresa: this.empresa(),
      asunto: this.asunto(),
      mensaje: this.mensaje(),
    };

    this.contactoServicio.enviarMensaje(datos).subscribe({
      next: () => {
        this.enviado.set(true);
        this.nombre.set('');
        this.email.set('');
        this.telefono.set('');
        this.empresa.set('');
        this.asunto.set('');
        this.mensaje.set('');
        setTimeout(() => this.enviado.set(false), 5000);
      },
      error: () => {
        console.error('Error al enviar mensaje');
      },
    });
  }

  togglePregunta(id: number): void {
    this.preguntasFAQ.update((preguntas) =>
      preguntas.map((p) =>
        p.id === id ? { ...p, abierta: !p.abierta } : p,
      ),
    );
  }

  trackPorId(_: number, item: any): number {
    return item.id;
  }

  readonly mapaGoogleUrl =
    'https://www.google.com/maps?q=Av.+Insurgentes+Sur+1602,+Benito+Juarez,+CDMX&z=16';

  readonly sesionRemotaUrl = 'https://teams.microsoft.com';
}
