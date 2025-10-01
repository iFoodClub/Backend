import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res } from '@nestjs/common';

import { GetEmployeeByIdService } from '../../../application/use-cases/get-employee-byid.use-cases';
import { EmployeeInterface } from 'src/domain/models/employee.model';
import { CreateEmployeeService } from '../../../application/use-cases/create-employee.use-cases';
import { UpdateEmployeeService } from '../../../application/use-cases/update-employee.use-cases';
import { DeleteEmployeeService } from '../../../application/use-cases/delete-employee.use-cases';
import { Response } from 'express';
import { EmployeeEntityInterface } from 'src/domain/repositories/employee.repository.interface';
import { ListEmployeesService } from '../../../application/use-cases/list-employees.use-cases';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListEmployeeDtoResponse } from 'src/interfaces/http/dtos/response/listEmployee.dto';
import { CreateEmployeeDto } from 'src/interfaces/http/dtos/request/createEmployee.dto';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';

@ApiTags('Employee API')
@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly listEmployeesService: ListEmployeesService,
    private readonly getEmployeeByIdService: GetEmployeeByIdService,
    private readonly createEmployeeService: CreateEmployeeService,
    private readonly updateEmployeeService: UpdateEmployeeService,
    private readonly deleteEmployeeService: DeleteEmployeeService
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    isArray: true,
    type: ListEmployeeDtoResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async list(): Promise<EmployeeEntityInterface[]> {
    const employeeList = await this.listEmployeesService.execute();

    return employeeList;
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do funcionário',
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionário encontrado',
    type: ListEmployeeDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
  })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<EmployeeEntityInterface> {
    const employee = await this.getEmployeeByIdService.execute(Number(id));
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    res.status(200).json(employee);
  }

  @Post()
  @HttpCode(201)
  @ApiBody({
    description: 'Dados do funcionário',
    type: CreateEmployeeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Funcionário criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar funcionário',
    type: Http400,
  })
  async create(
    @Body() employee: EmployeeInterface, @Res() res: Response) {
      const expectedFields = ['userId', 'companyId', 'name', 'cpf', 'birthDate', 'vacation', 'profileImage'];
      const receivedFields = Object.keys(employee);
      const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
      if(invalidFields.length > 0) {
      res.status(400).json({
        sucess: false,
        message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`
      });
      return;
    }
    await this.createEmployeeService.execute(employee);
    res.send();
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do funcionário',
  })
  @ApiBody({
    description: 'Dados do funcionário a serem atualizados',
    type: CreateEmployeeDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionário atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar funcionário',
    type: Http400,
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
    type: Http404,
  })
  async update(@Param('id') id: string, @Body() employeeData: EmployeeInterface, @Res() res:Response): Promise<EmployeeInterface> {
    const expectedFields = ['userId', 'companyId', 'name', 'cpf', 'birthDate', 'vacation', 'profileImage'];
    const receivedFields = Object.keys(employeeData);
    const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
    const user = await this.updateEmployeeService.execute(Number(id), employeeData);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }
    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`,
      });
      return;
    }
    res.status(200).json(user);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do funcionário',
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionário deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
    type: Http404,
  })
  async delete(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const employee = await this.getEmployeeByIdService.execute(Number(id));
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    this.deleteEmployeeService.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Funcionário deletado com sucesso',
    });
  }
}