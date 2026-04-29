# Funcionalidade de Favoritos e Otimização de Dados

Este documento detalha as mudanças realizadas para implementar o sistema de favoritos (exclusivo para empresas) e as otimizações no carregamento de dados do FoodClub.

## 🚀 Novas Funcionalidades

### 1. Sistema de Favoritos (Corporate Only)
- **Regra de Negócio**: Apenas usuários do tipo `COMPANY` podem favoritar restaurantes.
- **Segurança**: Implementada validação no UseCase (`ToggleFavoriteUseCase`) que bloqueia requisições de funcionários (403 Forbidden).
- **Interface**: Adicionado ícone de coração interativo nos cards de restaurante (Mobile).

### 2. Otimização de Performance (Eager Loading)
- **Refatoração de Repositórios**: `CompanyRepository` e `EmployeeRepository` agora utilizam `include` do Sequelize para trazer o restaurante selecionado automaticamente.
- **Benefício**: Redução de chamadas à API no carregamento da Home do App, eliminando a latência de buscar o restaurante em uma requisição separada.

---

## 🛠️ Mudanças Técnicas

### Backend (NestJS + Sequelize)
- **Novas Rotas**: Hospedadas no `RestaurantController` sob o prefixo `/Restaurant/favorites`.
  - `POST /favorites/toggle`: Alterna o status de favorito.
  - `GET /favorites/:userId`: Lista favoritos de um usuário.
- **Entidades**: Criada `FavoriteRestaurantEntity` e registrada no `databaseProvider`.
- **Migrations**: Criada migration `create-table-favorite-restaurant` para persistência no PostgreSQL.
- **Swagger**: Documentação completa adicionada com a tag `Favorites`.

### Client Mobile (React Native + Expo)
- **Componentes**: `RestaurantCard` atualizado para suportar o estado `isFavorited` e disparar o toggle.
- **Hooks**: Atualizado `useFavorites` para gerenciar o estado global de favoritos.
- **Fluxo de Dados**: A Home agora consome o restaurante selecionado diretamente do objeto `user`, aproveitando o eager loading do backend.

---

## 📄 Como Testar
1. Acesse o Swagger em `/api`.
2. Utilize o endpoint de `toggle` enviando um `userType: 'company'`.
3. Verifique no Mobile se o coração "pinta" de vermelho ao clicar.
4. Note que funcionários não veem a opção de favoritar, mantendo a interface limpa.

---
*Documentação gerada automaticamente em 29/04/2026.*
