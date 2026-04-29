# Funcionalidade de Favoritos e Otimização de Dados

Este documento detalha as mudanças realizadas para implementar o sistema de favoritos (exclusivo para empresas) e as otimizações no carregamento de dados do FoodClub.

## 🚀 Novas Funcionalidades

### 1. Sistema de Favoritos (Corporate Only)
- **Regra de Negócio**: Apenas usuários do tipo `COMPANY` podem favoritar restaurantes.
- **Segurança**: Implementada validação no UseCase (`ToggleFavoriteUseCase`) que bloqueia requisições de funcionários (403 Forbidden).
- **Interface**: Adicionado ícone de coração interativo nos cards de restaurante (Mobile).

### 2. Enriquecimento de Dados e Imagens
- **Otimização de Retorno**: A listagem de favoritos agora retorna automaticamente a **média de avaliações**, **quantidade de pratos** e o **menor preço**, eliminando cálculos no frontend.
- **Padronização de Imagens**: O campo de imagem foi padronizado como `profileImage` em todo o sistema, garantindo que as fotos dos restaurantes apareçam corretamente tanto na aba geral quanto nos favoritos.

### 3. Estabilidade e Performance
- **Correção de Crash (Mobile)**: Resolvido o "Require Cycle" entre `authStore` e `baseRepository` que impedia o app de abrir.
- **Seeder de Teste**: Criado seeder `insert-favorite-restaurants` para popular o ambiente de desenvolvimento.

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
---
*Última atualização em 29/04/2026 às 20:10.*
