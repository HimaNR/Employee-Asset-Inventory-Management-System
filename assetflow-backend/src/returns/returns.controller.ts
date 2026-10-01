import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnsService } from './returns.service';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /** Close an ACTIVE assignment; the asset becomes AVAILABLE or DAMAGED */
  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returnsService.create(dto);
  }
}
