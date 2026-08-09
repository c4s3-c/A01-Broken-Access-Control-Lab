import { queryResolvers } from './query.resolvers';
import { projectResolvers } from './project.resolvers';
import { tenantResolvers } from './tenant.resolvers';

export const resolvers = {
  Query: queryResolvers,
  Project: projectResolvers.Project,
  Tenant: tenantResolvers.Tenant,
};
