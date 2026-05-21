import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { parsePaginationParams } from '../common/pagination';
import { FinancesService } from './finances.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('finances')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get()
  @ApiOperation({ summary: 'Get paid finance records for the current user' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Paginated finance records' })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.financesService.findAllPaginated(
      request.user.sub,
      parsePaginationParams(page, pageSize),
    );
  }
}
