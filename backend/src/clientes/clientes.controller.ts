import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ConsultarClientesDto } from './dto/consultar-clientes.dto';

@Controller('clientes')
export class ClientesController {
	constructor(private readonly clientesService: ClientesService) {}

	@Post()
	crear(@Body() dto: CrearClienteDto) {
		return this.clientesService.crear(dto);
	}

	@Get()
	listar(@Query() query: ConsultarClientesDto) {
		return this.clientesService.listar(query);
	}

	@Get(':id')
	obtenerPorId(@Param('id', ParseIntPipe) id: number) {
		return this.clientesService.obtenerPorId(id);
	}

	@Patch(':id')
	actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarClienteDto) {
		return this.clientesService.actualizar(id, dto);
	}

	@Delete(':id')
	desactivar(@Param('id', ParseIntPipe) id: number) {
		return this.clientesService.desactivar(id);
	}
}
