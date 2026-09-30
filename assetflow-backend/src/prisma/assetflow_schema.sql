--
-- PostgreSQL database dump
--

\restrict BNzJEiNRd4zGOHe04eeoseo3KOzJyDwJDJjJLxdEgI6HMfwUjceXv81WZgP580J

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AssetCondition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetCondition" AS ENUM (
    'NEW',
    'GOOD',
    'FAIR',
    'DAMAGED'
);


--
-- Name: AssetHistoryAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetHistoryAction" AS ENUM (
    'CREATED',
    'UPDATED',
    'ASSIGNED',
    'RETURNED',
    'STATUS_CHANGED',
    'DEACTIVATED',
    'REACTIVATED'
);


--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'AVAILABLE',
    'ASSIGNED',
    'DAMAGED',
    'UNDER_REPAIR',
    'LOST',
    'RETIRED'
);


--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ACTIVE',
    'RETURNED'
);


--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: prevent_asset_history_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_asset_history_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'asset_history is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: asset_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_assignments (
    id uuid NOT NULL,
    "assetId" uuid NOT NULL,
    "employeeId" uuid NOT NULL,
    status public."AssignmentStatus" DEFAULT 'ACTIVE'::public."AssignmentStatus" NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedById" uuid,
    notes text,
    "returnedAt" timestamp(3) without time zone,
    "returnedById" uuid,
    "returnCondition" public."AssetCondition",
    "returnNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT asset_assignments_return_after_assign_chk CHECK ((("returnedAt" IS NULL) OR ("returnedAt" >= "assignedAt"))),
    CONSTRAINT asset_assignments_return_consistency_chk CHECK (((status = 'RETURNED'::public."AssignmentStatus") = ("returnedAt" IS NOT NULL)))
);


--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_categories (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: asset_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_history (
    id uuid NOT NULL,
    "assetId" uuid NOT NULL,
    action public."AssetHistoryAction" NOT NULL,
    "previousStatus" public."AssetStatus",
    "newStatus" public."AssetStatus",
    description text NOT NULL,
    metadata jsonb,
    "assignmentId" uuid,
    "performedById" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id uuid NOT NULL,
    "assetCode" text NOT NULL,
    name text NOT NULL,
    "serialNumber" text,
    brand text,
    model text,
    "categoryId" uuid NOT NULL,
    status public."AssetStatus" DEFAULT 'AVAILABLE'::public."AssetStatus" NOT NULL,
    condition public."AssetCondition" DEFAULT 'GOOD'::public."AssetCondition" NOT NULL,
    "purchaseDate" date,
    "purchasePrice" numeric(12,2),
    "warrantyExpiryDate" date,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    CONSTRAINT assets_purchase_price_non_negative_chk CHECK ((("purchasePrice" IS NULL) OR ("purchasePrice" >= (0)::numeric))),
    CONSTRAINT assets_warranty_after_purchase_chk CHECK ((("warrantyExpiryDate" IS NULL) OR ("purchaseDate" IS NULL) OR ("warrantyExpiryDate" >= "purchaseDate")))
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    "employeeCode" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    department text,
    designation text,
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    permissions text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "roleId" uuid NOT NULL,
    "employeeId" uuid,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: asset_assignments asset_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_pkey PRIMARY KEY (id);


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: asset_history asset_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_history
    ADD CONSTRAINT asset_history_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: asset_assignments_assetId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asset_assignments_assetId_status_idx" ON public.asset_assignments USING btree ("assetId", status);


--
-- Name: asset_assignments_assignedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asset_assignments_assignedAt_idx" ON public.asset_assignments USING btree ("assignedAt");


--
-- Name: asset_assignments_employeeId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asset_assignments_employeeId_status_idx" ON public.asset_assignments USING btree ("employeeId", status);


--
-- Name: asset_assignments_one_active_per_asset; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_assignments_one_active_per_asset ON public.asset_assignments USING btree ("assetId") WHERE (status = 'ACTIVE'::public."AssignmentStatus");


--
-- Name: asset_categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asset_categories_name_key ON public.asset_categories USING btree (name);


--
-- Name: asset_history_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asset_history_action_idx ON public.asset_history USING btree (action);


--
-- Name: asset_history_assetId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asset_history_assetId_createdAt_idx" ON public.asset_history USING btree ("assetId", "createdAt");


--
-- Name: assets_assetCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "assets_assetCode_key" ON public.assets USING btree ("assetCode");


--
-- Name: assets_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assets_categoryId_idx" ON public.assets USING btree ("categoryId");


--
-- Name: assets_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assets_createdAt_idx" ON public.assets USING btree ("createdAt");


--
-- Name: assets_isActive_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "assets_isActive_status_idx" ON public.assets USING btree ("isActive", status);


--
-- Name: assets_serialNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "assets_serialNumber_key" ON public.assets USING btree ("serialNumber");


--
-- Name: assets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assets_status_idx ON public.assets USING btree (status);


--
-- Name: employees_department_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_department_idx ON public.employees USING btree (department);


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: employees_employeeCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "employees_employeeCode_key" ON public.employees USING btree ("employeeCode");


--
-- Name: employees_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "employees_lastName_firstName_idx" ON public.employees USING btree ("lastName", "firstName");


--
-- Name: employees_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employees_status_idx ON public.employees USING btree (status);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_employeeId_key" ON public.users USING btree ("employeeId");


--
-- Name: users_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_roleId_idx" ON public.users USING btree ("roleId");


--
-- Name: asset_history asset_history_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER asset_history_append_only BEFORE DELETE OR UPDATE ON public.asset_history FOR EACH ROW EXECUTE FUNCTION public.prevent_asset_history_changes();


--
-- Name: asset_assignments asset_assignments_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT "asset_assignments_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_assignments asset_assignments_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT "asset_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_assignments asset_assignments_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT "asset_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_assignments asset_assignments_returnedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT "asset_assignments_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_history asset_history_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_history
    ADD CONSTRAINT "asset_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_history asset_history_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_history
    ADD CONSTRAINT "asset_history_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public.asset_assignments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_history asset_history_performedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_history
    ADD CONSTRAINT "asset_history_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assets assets_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict BNzJEiNRd4zGOHe04eeoseo3KOzJyDwJDJjJLxdEgI6HMfwUjceXv81WZgP580J

