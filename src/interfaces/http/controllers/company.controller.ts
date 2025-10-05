import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res } from '@nestjs/common';
import { GetCompanyByIdService } from '../../../application/use-cases/get-company-byid.use-cases'
import { CreateCompanyService } from '../../../application/use-cases/create-company.use-cases';
import { UpdateCompanyService } from '../../../application/use-cases/update-company.use-cases';
import { DeleteCompanyService } from '../../../application/use-cases/delete-company.use-cases';
import { Response } from 'express';
import { CompanyInterface } from 'src/domain/models/company.model';
import { CompanyEntityInterface } from 'src/domain/repositories/company.repository.interface';
import { ListCompaniesService } from '../../../application/use-cases/list-companies.use-cases';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListCompanyDtoResponse } from 'src/interfaces/http/dtos/response/listCompany.dto';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { CreateCompanyDto } from 'src/interfaces/http/dtos/request/createCompany.dto';
import { ListEmployeesByCompanyService } from '../../../application/use-cases/list-employees-by-company.use-cases';
import { ListEmployeeWithProfileImageDto } from 'src/interfaces/http/dtos/response/listEmployeeWithProfileImage.dto';
import { ListIndividualOrderByCompanyUseCase } from 'src/application/use-cases/list-individual-order-by-company.use-case';
import { IndividualOrderEntityInterface } from 'src/domain/repositories/individual-order.repository.interface';
import { CreateCompanyOrderUseCase } from 'src/application/use-cases/create-company-order.use-case';
import { ListWeeklyOrdersByCompanyService } from 'src/application/use-cases/list-weekly-orders-by-company.use-cases';
import { CreateOrdersFromWeeklyOrdersUseCase } from 'src/application/use-cases/create-orders-from-weekly-orders.use-case';
import { CompanyWeeklyOrdersResponse } from 'src/interfaces/http/dtos/response/companyWeeklyOrders.dto';
import { CreateOrdersFromWeeklyResponse } from 'src/interfaces/http/dtos/response/createOrdersFromWeeklyResponse.dto';

@ApiTags('Company API')
@Controller('company')
export class CompanyController {
  constructor(
    private readonly listCompaniesService: ListCompaniesService,
    private getCompanyByIdService: GetCompanyByIdService,
    private createCompanyService: CreateCompanyService,
    private updateCompanyService: UpdateCompanyService,
    private deleteCompanyService: DeleteCompanyService,
    private listEmployeesByCompanyService: ListEmployeesByCompanyService,
    private listIndividualOrderByCompanyUseCase: ListIndividualOrderByCompanyUseCase,
    private createCompanyOrderUseCase: CreateCompanyOrderUseCase,
    private listWeeklyOrdersByCompanyService: ListWeeklyOrdersByCompanyService,
    private createOrdersFromWeeklyOrdersUseCase: CreateOrdersFromWeeklyOrdersUseCase
  ) {}

   @Get()
   @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    isArray: true,
    type: ListCompanyDtoResponse,
   })
    @ApiResponse({
      status: 500,
      description: 'Erro interno do servidor',
    })
    async list(): Promise<CompanyEntityInterface[]> {
      const employeeList = await this.listCompaniesService.execute();
      return employeeList;
    }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: ListCompanyDtoResponse,
   })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<ListCompanyDtoResponse> {
    const company = await this.getCompanyByIdService.execute(Number(id));
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    res.status(200).json(company);
  }

  @Post()
  @HttpCode(201)
  @ApiBody({
    description: 'Dados da empresa a serem criados',
    type: CreateCompanyDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar empresa',
    type: Http400,
  })
  async create(
    @Body() company: CompanyInterface, @Res() res: Response) {
    const { userId, name, cnpj, cep, number } = company;
    if(!(userId && name && cnpj && cep && number)){
      res.status(400).json({
        sucess: false,
        message: 'Todos os campos são obrigatórios'
      });
      return;
    }

    try {
      await this.createCompanyService.execute(company);
      res.status(201).json({
        success: true,
        message: 'Empresa criada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa a ser atualizada',
  })
  @ApiBody({
    description: 'Dados da empresa a serem atualizados',
    type: CreateCompanyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar empresa',
    type: Http400,
  })
  async update(@Param('id') id: string, @Body() companyData: CompanyInterface, @Res() res: Response): Promise<CompanyInterface> {
    const expectedFields = ['userId', 'name', 'cnpj', 'cep', 'number', 'restaurantId', 'profileImage'];
    const receivedFields = Object.keys(companyData);
    const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
    
    if(invalidFields.length > 0){
      res.status(400).json({
        sucess: false,
        message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`,
      });
      return;
    }

    try {
      const company = await this.updateCompanyService.execute(Number(id), companyData);
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa não encontrada',
        });
        return;
      }
      res.status(200).json(company);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa a ser deletada',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async delete(@Param('id') id: string,@Res() res: Response): Promise<void> {
    const company = await this.getCompanyByIdService.execute(Number(id));
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }
    this.deleteCompanyService.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Empresa deletada com sucesso',
    });
  }

  @Get(':id/employees')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionários da empresa encontrados',
    isArray: true,
    type: ListEmployeeWithProfileImageDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async getEmployeesByCompany(@Param('id') id: string, @Res() res: Response): Promise<ListEmployeeWithProfileImageDto[]> {
    const company = await this.getCompanyByIdService.execute(Number(id));
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    const employees = await this.listEmployeesByCompanyService.execute(Number(id));
    res.status(200).json(employees);
  }

  @Get(':id/orders')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedidos da empresa encontrados',
    isArray: true,
    // type: ListIndividualOrderDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async getOrdersByCompany(@Param('id') id: string, @Res() res: Response): Promise<IndividualOrderEntityInterface[]> {
    const orders = await this.listIndividualOrderByCompanyUseCase.execute(Number(id));
    res.status(200).json(orders);
    return;
  }

  @Post(':id/orders')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido da empresa criado com sucesso',
  })  
  async createOrder(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.createCompanyOrderUseCase.execute(Number(id));
    res.status(200).json(result);
  }

  @Get(':id/weekly-orders')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedidos semanais dos funcionários da empresa para o dia atual',
    type: CompanyWeeklyOrdersResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async getWeeklyOrdersByCompany(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const company = await this.getCompanyByIdService.execute(Number(id));
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    const weeklyOrders = await this.listWeeklyOrdersByCompanyService.execute(Number(id));
    res.status(200).json(weeklyOrders);
  }

  @Post(':id/create-orders-from-weekly')
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedidos criados com sucesso baseados nos pedidos semanais do dia atual',
    type: CreateOrdersFromWeeklyResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
    type: Http404,
  })
  async createOrdersFromWeeklyOrders(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const company = await this.getCompanyByIdService.execute(Number(id));
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    const result = await this.createOrdersFromWeeklyOrdersUseCase.execute(Number(id));
    res.status(200).json(result);
  }
}