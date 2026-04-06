# Rastreabilidade de Testes

Documento que mapeia os casos de teste aos requisitos funcionais do sistema FoodClub, garantindo cobertura completa de todos os módulos.

## Matriz de Rastreabilidade

### Auth

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Auth-01 | Login com credenciais válidas e geração de token JWT | CT-01 |
| RF-Auth-02 | Validação de formato de e-mail no login | CT-02, CT-03 |
| RF-Auth-03 | Validação de senha mínima no login (≥ 6 caracteres) | CT-04 |
| RF-Auth-04 | Rejeição de credenciais inexistentes ou incorretas | CT-05 |
| RF-Auth-05 | Rejeição de requisição sem body | CT-06 |

### User

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-User-01 | Criar usuário employee com dados válidos | CT-07 |
| RF-User-02 | Validação de userType permitido (employee, company, restaurant) | CT-08 |
| RF-User-03 | Validação de formato de e-mail na criação | CT-09 |
| RF-User-04 | Validação de senha mínima na criação (≥ 8 caracteres) | CT-10 |
| RF-User-05 | Buscar usuário por ID existente | CT-11 |
| RF-User-06 | Retornar 404 para ID inexistente | CT-12 |
| RF-User-07 | Validar que ID deve ser numérico | CT-13 |
| RF-User-08 | Verificar se e-mail já está cadastrado | CT-14 |
| RF-User-09 | Verificar se e-mail está disponível | CT-15 |

### Company

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Company-01 | Criar empresa com dados válidos | CT-16 |
| RF-Company-02 | Validação de campos obrigatórios (cnpj, cep, number) | CT-17 |
| RF-Company-03 | Buscar empresa por ID existente | CT-18 |
| RF-Company-04 | Retornar 404 para empresa inexistente | CT-19 |
| RF-Company-05 | Listar funcionários de empresa existente | CT-20 |
| RF-Company-06 | Retornar 404 ao listar funcionários de empresa inexistente | CT-21 |

### Restaurant

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Restaurant-01 | Buscar restaurante por ID existente | CT-22 |
| RF-Restaurant-02 | Retornar 404 para restaurante inexistente | CT-23 |
| RF-Restaurant-03 | Listar pedidos de restaurante existente | CT-24 |
| RF-Restaurant-04 | Atualizar status de pedido com valor válido | CT-25 |
| RF-Restaurant-05 | Rejeitar status de pedido com valor inválido | CT-26 |
| RF-Restaurant-06 | Retornar 404 ao listar pedidos de restaurante sem pedidos | CT-48 |

### Dish

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Dish-01 | Buscar prato por ID existente | CT-27 |
| RF-Dish-02 | Retornar 404 para prato inexistente | CT-28 |
| RF-Dish-03 | Listar pratos de restaurante existente | CT-29 |
| RF-Dish-04 | Retornar lista vazia ou 404 para restaurante inexistente | CT-30 |

### Dish Rating

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-DishRating-01 | Criar avaliação de prato com dados válidos | CT-31 |
| RF-DishRating-02 | Rejeitar rating fora do intervalo (< 1) | CT-32 |
| RF-DishRating-03 | Rejeitar rating fora do intervalo (> 5) | CT-33 |
| RF-DishRating-04 | Retornar 404 para dishId inexistente | CT-34 |
| RF-DishRating-05 | Listar avaliações de prato existente | CT-35 |

### Restaurant Rating

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-RestaurantRating-01 | Criar avaliação de restaurante com dados válidos | CT-36 |
| RF-RestaurantRating-02 | Retornar 404 para restaurantId inexistente | CT-37 |
| RF-RestaurantRating-03 | Listar avaliações de restaurante existente | CT-38 |

### Employee Weekly Orders

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-WeeklyOrders-01 | Criar pedido semanal com dados válidos | CT-39 |
| RF-WeeklyOrders-02 | Retornar 404 para employeeId inexistente | CT-40 |
| RF-WeeklyOrders-03 | Listar pedidos semanais de funcionário existente | CT-41 |

### Orders (Company)

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Orders-01 | Agregar pedidos individuais pendentes da empresa | CT-42 |
| RF-Orders-02 | Retornar 404 para companyId inexistente | CT-43 |
| RF-Orders-03 | Consultar progresso de pedido existente | CT-44 |
| RF-Orders-04 | Retornar 404 para pedido inexistente | CT-45 |

### Health

| Requisito | Descrição | Casos de Teste |
|---|---|---|
| RF-Health-01 | Health check retorna status da API | CT-46 |
| RF-Health-02 | Ping retorna pong | CT-47 |

## Resumo de Cobertura

| Módulo | Requisitos | Casos de Teste | Cobertura |
|---|---|---|---|
| Auth | 5 | CT-01 a CT-06 | 100% |
| User | 9 | CT-07 a CT-15 | 100% |
| Company | 6 | CT-16 a CT-21 | 100% |
| Restaurant | 6 | CT-22 a CT-26, CT-48 | 100% |
| Dish | 4 | CT-27 a CT-30 | 100% |
| Dish Rating | 5 | CT-31 a CT-35 | 100% |
| Restaurant Rating | 3 | CT-36 a CT-38 | 100% |
| Employee Weekly Orders | 3 | CT-39 a CT-41 | 100% |
| Orders (Company) | 4 | CT-42 a CT-45 | 100% |
| Health | 2 | CT-46 a CT-47 | 100% |
| **Total** | **47** | **48** | **100%** |

## Classes de Equivalência por Campo

| Campo/Contexto | Classe Válida | Classes Inválidas |
|---|---|---|
| Email | Formato válido (`a@b.com`) | Inválido, vazio |
| Senha (login) | ≥ 6 caracteres | Vazia, < 6 caracteres |
| Senha (criação) | ≥ 8 caracteres | Vazia, < 8 caracteres |
| userType | `employee`, `company`, `restaurant` | Outros valores |
| ID em URL | Número inteiro existente | Inexistente, não numérico |
| rating (1–5) | 1, 2, 3, 4 ou 5 | 0, 6, negativo |
| status (pedido) | Valores do enum | Valor inválido |
| Campos obrigatórios | Preenchidos corretamente | Vazios, nulos |

---

*Elaborado por: Matheus Fernandes*
*Período de execução: 12/03/2026 a 01/04/2026*
*Referência: `casos-teste-particao-equivalencia.pdf`, `plano-de-teste.pdf`*
