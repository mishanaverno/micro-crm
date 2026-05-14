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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order for the current user client' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  create(@Body() createOrderDto: CreateOrderDto, @Req() request: AuthenticatedRequest) {
    return this.ordersService.create(createOrderDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter orders by client ID' })
  @ApiResponse({ status: 200, description: 'List of orders', type: [Order] })
  findAll(@Req() request: AuthenticatedRequest, @Query('client_id') clientId?: string) {
    return this.ordersService.findAll(request.user.sub, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.ordersService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order for the current user' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order or client not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ordersService.update(id, request.user.sub, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order for the current user' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.ordersService.remove(id, request.user.sub);
  }
}
