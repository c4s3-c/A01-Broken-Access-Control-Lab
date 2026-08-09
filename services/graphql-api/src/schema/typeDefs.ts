import { gql } from 'graphql-tag';

/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 1: Over-fetching
 * 
 * Este schema GraphQL expone:
 * 1. Query `tenants` que lista TODOS los tenants sin restricción
 * 2. Campo `adminEmail` en Tenant (dato sensible)
 * 3. Resolver anidado `tenant` en Project sin validación de ownership
 * 4. Filtro `tenantId` en projects que permite consultar cualquier tenant
 */
export const typeDefs = gql`
  type Query {
    projects(filter: ProjectFilter, pagination: PaginationInput): ProjectConnection!
    project(id: ID!): Project
    tenants: [Tenant!]!  # ⚠️ VULNERABLE: lista todos los tenants sin filtro
  }

  type ProjectConnection {
    items: [Project!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: ProjectStatus!
    tenant: Tenant!          # ⚠️ VULNERABLE: expone datos del tenant
    members: [ProjectMember!]!
    createdAt: String!
    updatedAt: String!
  }

  type Tenant {
    id: ID!
    name: String!
    slug: String!
    adminEmail: String!      # ⚠️ DATO SENSIBLE expuesto
    subscriptionTier: SubscriptionTier!
    created_at: String!
  }

  type ProjectMember {
    id: ID!
    userId: ID!
    email: String!
    role: MemberRole!
    project: Project!
  }

  enum ProjectStatus {
    ACTIVE
    ARCHIVED
    DRAFT
  }

  enum SubscriptionTier {
    FREE
    PRO
    ENTERPRISE
  }

  enum MemberRole {
    VIEWER
    EDITOR
    ADMIN
  }

  input ProjectFilter {
    status: ProjectStatus
    tenantId: String       # ⚠️ VULNERABLE: permite filtrar por cualquier tenant
    search: String
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 20
  }
`;
