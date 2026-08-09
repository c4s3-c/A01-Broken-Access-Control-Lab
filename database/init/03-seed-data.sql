-- Script de seed data para el laboratorio
-- Ejecutar después de 01-create-databases.sql y 02-create-tables.sql
-- Password para todos los usuarios: Password123!
-- Hash bcrypt con 12 rounds: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy

-- ============================================
-- BASE DE DATOS: projectflow_auth
-- ============================================

-- Insertar Tenants (3 organizaciones)
INSERT INTO tenants (id, name, slug, subscription_tier, admin_email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp', 'ENTERPRISE', 'admin@acme.com'),
    ('00000000-0000-0000-0000-000000000002', 'Globex Inc', 'globex-inc', 'PRO', 'admin@globex.com'),
    ('00000000-0000-0000-0000-000000000003', 'Initech LLC', 'initech-llc', 'FREE', 'user1@initech.com');

-- Insertar Usuarios
-- Nota: El hash es para "Password123!" con bcrypt 12 rounds

-- Acme Corp Users (tenant_id: 00000000-0000-0000-0000-000000000001)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
     'owner@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'John', 'Owner', 'OWNER'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
     'admin@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Alice', 'Admin', 'ADMIN'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 
     'user1@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Bob', 'User', 'MEMBER'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 
     'user2@acme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Carol', 'Developer', 'MEMBER');

-- Globex Inc Users (tenant_id: 00000000-0000-0000-0000-000000000002)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role) VALUES
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 
     'owner@globex.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Hank', 'Owner', 'OWNER'),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 
     'admin@globex.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Diana', 'Admin', 'ADMIN'),
    ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 
     'user1@globex.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Eve', 'Tester', 'MEMBER');

-- Initech LLC Users (tenant_id: 00000000-0000-0000-0000-000000000003)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role) VALUES
    ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 
     'user1@initech.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G.2fZfZjZP9KCy', 
     'Peter', 'Gibbons', 'OWNER');

-- ============================================
-- BASE DE DATOS: projectflow_projects
-- ============================================

-- Insertar proyectos de ejemplo para cada tenant
INSERT INTO projects (id, tenant_id, name, description, status, created_by) VALUES
    -- Acme Corp Projects
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
     'Project Alpha', 'Strategic initiative for Q1', 'active', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
     'Project Beta', 'Internal tools development', 'active', '10000000-0000-0000-0000-000000000002'),
    
    -- Globex Inc Projects
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 
     'Market Expansion', 'Global market analysis', 'active', '10000000-0000-0000-0000-000000000005'),
    
    -- Initech LLC Projects
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 
     'TPS Reports', 'Cover sheet management system', 'active', '10000000-0000-0000-0000-000000000008');

-- Insertar miembros de proyecto
INSERT INTO project_members (project_id, user_id, role) VALUES
    -- Project Alpha members
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'owner'),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin'),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'member'),
    
    -- Project Beta members
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'owner'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'member'),
    
    -- Market Expansion members
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'owner'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 'admin'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'member'),
    
    -- TPS Reports members
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'owner');
