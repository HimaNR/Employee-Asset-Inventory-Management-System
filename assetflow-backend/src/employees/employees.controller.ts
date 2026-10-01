import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants/permissions.constant';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeAssignmentsQueryDto } from './dto/employee-assignments-query.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /** List employees with search, status/department filters and pagination */
  @Get()
  @Permissions(PERMISSIONS.EMPLOYEES_READ)
  findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  /** Distinct department names (declared BEFORE ':id' so it is not read as an id) */
  @Get('departments')
  @Permissions(PERMISSIONS.EMPLOYEES_READ)
  findDepartments() {
    return this.employeesService.findDepartments();
  }

  @Get(':id')
  @Permissions(PERMISSIONS.EMPLOYEES_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  /** Assets held now (status=ACTIVE) or in the past (status=RETURNED) */
  @Get(':id/assignments')
  @Permissions(PERMISSIONS.EMPLOYEES_READ)
  findAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: EmployeeAssignmentsQueryDto,
  ) {
    return this.employeesService.findAssignments(id, query);
  }

  @Post()
  @Permissions(PERMISSIONS.EMPLOYEES_WRITE)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.EMPLOYEES_WRITE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Post(':id/deactivate')
  @Permissions(PERMISSIONS.EMPLOYEES_WRITE)
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.deactivate(id);
  }

  @Post(':id/reactivate')
  @Permissions(PERMISSIONS.EMPLOYEES_WRITE)
  @HttpCode(HttpStatus.OK)
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.reactivate(id);
  }
}
