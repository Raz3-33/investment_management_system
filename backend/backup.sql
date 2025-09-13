--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: AssignmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentType" AS ENUM (
    'MANUALLY',
    'AUTOMATICALLY',
    'USER'
);


ALTER TYPE public."AssignmentType" OWNER TO postgres;

--
-- Name: UserLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserLevel" AS ENUM (
    'ADMINISTRATE',
    'HEAD',
    'MANAGER',
    'EXECUTIVE',
    'ASSOCIATE'
);


ALTER TYPE public."UserLevel" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BookingFormOfficeDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookingFormOfficeDetails" (
    id text NOT NULL,
    "officeBranchId" text,
    "leadSuccessCoordinatorId" text,
    "partnerRelationshipExecutiveId" text,
    "salesOnboardingManagerId" text,
    "leadSource" text,
    "personalDetailsId" text NOT NULL
);


ALTER TABLE public."BookingFormOfficeDetails" OWNER TO postgres;

--
-- Name: BookingFormPaymentDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookingFormPaymentDetails" (
    id text NOT NULL,
    "dealAmount" double precision,
    "tokenReceived" double precision,
    "isTokenApproved" boolean DEFAULT false NOT NULL,
    "tokenDate" timestamp(3) without time zone,
    "balanceDue" double precision,
    "paymentProof" text,
    "modeOfPayment" text,
    "additionalCommitment" text,
    remarks text,
    "personalDetailsId" text NOT NULL
);


ALTER TABLE public."BookingFormPaymentDetails" OWNER TO postgres;

--
-- Name: BookingFormPersonalDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookingFormPersonalDetails" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    "phoneNumber" text NOT NULL,
    "altPhoneNumber" text,
    "territoryId" text NOT NULL,
    state text,
    district text,
    city text,
    "streetAddress" text,
    pincode text,
    "aadharFront" text,
    "aadharFrontIsApproved" boolean DEFAULT false NOT NULL,
    "aadharBack" text,
    "aadharBackIsApproved" boolean DEFAULT false NOT NULL,
    "panCard" text,
    "panCardIsApproved" boolean DEFAULT false NOT NULL,
    "companyPan" text,
    "companyPanIsApproved" boolean DEFAULT false NOT NULL,
    "gstNumber" text,
    "addressProof" text,
    "addressProofIsApproved" boolean DEFAULT false NOT NULL,
    "attachedImage" text,
    "attachedImageIsApproved" boolean DEFAULT false NOT NULL,
    oppurtunity text,
    "isPaymentCompleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BookingFormPersonalDetails" OWNER TO postgres;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    name text NOT NULL,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Branch" OWNER TO postgres;

--
-- Name: Brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Brand" OWNER TO postgres;

--
-- Name: BusinessCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BusinessCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."BusinessCategory" OWNER TO postgres;

--
-- Name: ExecutiveAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExecutiveAssignment" (
    "associateId" text NOT NULL,
    "executiveId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExecutiveAssignment" OWNER TO postgres;

--
-- Name: ExpectedPaymentSceduledDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExpectedPaymentSceduledDetails" (
    id text NOT NULL,
    date timestamp(3) without time zone,
    amount double precision,
    "personalDetailsId" text NOT NULL
);


ALTER TABLE public."ExpectedPaymentSceduledDetails" OWNER TO postgres;

--
-- Name: Investment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Investment" (
    id text NOT NULL,
    "investorId" text NOT NULL,
    "opportunityId" text NOT NULL,
    "createdById" text,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "roiPercent" double precision,
    "payoutMode" text NOT NULL,
    "coolOffPeriod" timestamp(3) without time zone,
    "contractStart" timestamp(3) without time zone NOT NULL,
    "contractEnd" timestamp(3) without time zone NOT NULL,
    "paymentMethod" text NOT NULL,
    "agreementSigned" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'Ongoing'::text NOT NULL,
    "branchId" text NOT NULL
);


ALTER TABLE public."Investment" OWNER TO postgres;

--
-- Name: InvestmentType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvestmentType" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."InvestmentType" OWNER TO postgres;

--
-- Name: Investor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Investor" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    type text NOT NULL,
    address text,
    pan text,
    aadhaar text,
    "gstNumber" text,
    "referredBy" text,
    status text DEFAULT 'Pending'::text NOT NULL,
    password text NOT NULL,
    "relationshipManagerId" text,
    documents text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Investor" OWNER TO postgres;

--
-- Name: OpportunityBranch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OpportunityBranch" (
    id text NOT NULL,
    "opportunityId" text NOT NULL,
    "branchId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OpportunityBranch" OWNER TO postgres;

--
-- Name: PaymentSceduledDetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentSceduledDetails" (
    id text NOT NULL,
    date timestamp(3) without time zone,
    amount double precision,
    "isAmountApproved" boolean DEFAULT false NOT NULL,
    "paymentProof" text NOT NULL,
    "personalDetailsId" text NOT NULL
);


ALTER TABLE public."PaymentSceduledDetails" OWNER TO postgres;

--
-- Name: Payout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    "investmentId" text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "amountDue" double precision NOT NULL,
    "amountPaid" double precision,
    "paidDate" timestamp(3) without time zone,
    "paymentMode" text,
    "receiptRef" text,
    notes text
);


ALTER TABLE public."Payout" OWNER TO postgres;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."Permission" OWNER TO postgres;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    access text
);


ALTER TABLE public."RolePermission" OWNER TO postgres;

--
-- Name: Sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sales" (
    id text NOT NULL,
    "opportunityId" text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Sales" OWNER TO postgres;

--
-- Name: TerritoryMaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TerritoryMaster" (
    id text NOT NULL,
    "opportunityId" text NOT NULL,
    "territoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TerritoryMaster" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "UserID" text,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text,
    image_url text,
    designation text,
    "countryCode" text,
    "roleId" text,
    "branchId" text,
    "userLevel" public."UserLevel" DEFAULT 'ASSOCIATE'::public."UserLevel" NOT NULL,
    "administrateId" text,
    "headId" text,
    "managerId" text,
    "salesTarget" double precision DEFAULT 0,
    "salesAchieved" double precision DEFAULT 0,
    incentive double precision DEFAULT 0,
    "isActive" boolean DEFAULT true NOT NULL,
    "isLogin" boolean DEFAULT false NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isHead" boolean DEFAULT false NOT NULL,
    "isManager" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _OpportunityBranches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_OpportunityBranches" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_OpportunityBranches" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: investment_opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investment_opportunities (
    id text NOT NULL,
    name text NOT NULL,
    "brandName" text NOT NULL,
    "brandId" text NOT NULL,
    description text NOT NULL,
    "minAmount" double precision NOT NULL,
    "maxAmount" double precision,
    "roiPercent" double precision NOT NULL,
    "turnOverPercentage" double precision,
    "turnOverAmount" double precision,
    "renewalFee" double precision,
    "lockInMonths" integer NOT NULL,
    "exitOptions" text,
    "payoutMode" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    documents text[],
    "investmentTypeId" text NOT NULL,
    "businessCategoryId" text NOT NULL,
    "isMasterFranchise" boolean DEFAULT false NOT NULL,
    "isSignature" boolean DEFAULT false NOT NULL,
    "signatureStoreLocation" text
);


ALTER TABLE public.investment_opportunities OWNER TO postgres;

--
-- Name: territories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.territories (
    id text NOT NULL,
    "assignmentType" text NOT NULL,
    location text,
    pincode text,
    city text,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "investmentOpportunityId" text,
    "isBooked" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.territories OWNER TO postgres;

--
-- Data for Name: BookingFormOfficeDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookingFormOfficeDetails" (id, "officeBranchId", "leadSuccessCoordinatorId", "partnerRelationshipExecutiveId", "salesOnboardingManagerId", "leadSource", "personalDetailsId") FROM stdin;
\.


--
-- Data for Name: BookingFormPaymentDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookingFormPaymentDetails" (id, "dealAmount", "tokenReceived", "isTokenApproved", "tokenDate", "balanceDue", "paymentProof", "modeOfPayment", "additionalCommitment", remarks, "personalDetailsId") FROM stdin;
\.


--
-- Data for Name: BookingFormPersonalDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookingFormPersonalDetails" (id, "userId", "fullName", email, "phoneNumber", "altPhoneNumber", "territoryId", state, district, city, "streetAddress", pincode, "aadharFront", "aadharFrontIsApproved", "aadharBack", "aadharBackIsApproved", "panCard", "panCardIsApproved", "companyPan", "companyPanIsApproved", "gstNumber", "addressProof", "addressProofIsApproved", "attachedImage", "attachedImageIsApproved", oppurtunity, "isPaymentCompleted", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Branch" (id, name, location, "createdAt", "updatedAt") FROM stdin;
934d8948-2b0b-4f2f-9542-989b0e86d127	kochi	kochi	2025-09-09 19:14:05.637	2025-09-09 19:14:05.637
\.


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Brand" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BusinessCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BusinessCategory" (id, name, description) FROM stdin;
\.


--
-- Data for Name: ExecutiveAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExecutiveAssignment" ("associateId", "executiveId", "createdAt") FROM stdin;
2fff1f05-70a0-4f0e-a991-803f876b9d75	4a96a431-f86f-4b78-ab47-583803d4d566	2025-09-13 02:28:12.799
2fff1f05-70a0-4f0e-a991-803f876b9d75	e40952a0-e953-43d5-884e-13cb264448c6	2025-09-13 02:28:12.799
\.


--
-- Data for Name: ExpectedPaymentSceduledDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExpectedPaymentSceduledDetails" (id, date, amount, "personalDetailsId") FROM stdin;
\.


--
-- Data for Name: Investment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Investment" (id, "investorId", "opportunityId", "createdById", amount, date, "roiPercent", "payoutMode", "coolOffPeriod", "contractStart", "contractEnd", "paymentMethod", "agreementSigned", status, "branchId") FROM stdin;
\.


--
-- Data for Name: InvestmentType; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvestmentType" (id, name, description) FROM stdin;
\.


--
-- Data for Name: Investor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Investor" (id, name, email, phone, type, address, pan, aadhaar, "gstNumber", "referredBy", status, password, "relationshipManagerId", documents, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OpportunityBranch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OpportunityBranch" (id, "opportunityId", "branchId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PaymentSceduledDetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentSceduledDetails" (id, date, amount, "isAmountApproved", "paymentProof", "personalDetailsId") FROM stdin;
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payout" (id, "investmentId", "dueDate", "amountDue", "amountPaid", "paidDate", "paymentMode", "receiptRef", notes) FROM stdin;
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" (id, name, description) FROM stdin;
00a4a933-881a-4b32-8af4-a1b621618ac9	Investment:update	
a01b48be-2232-49a9-af67-7e3b742cbecd	Investment:view	
0ce5e6da-d1ea-40a3-8d50-d504faa57642	Booking Management:view	
c4b70d2a-8e20-434c-b248-efbaeee1bc07	Investment:approve	
2bda9f49-ed92-4276-b43f-06a55ba8e015	Booking Management:update	
0cf3d0bd-0cb4-4acb-8125-e864f50e0473	Investment:delete	
885ef343-34e5-4c6d-af3a-ceab8fd04cf9	Booking Management:approve	
aae98841-24fd-4a9a-b438-1787791d4581	Booking Management:delete	
4ac25dfc-1ea8-4b80-93a8-909f76bd71c3	Role Management:view	
740e5e51-a6f2-4833-bc81-bdc35d83bb33	Role Management:delete	
654a3713-7f06-479e-995b-fad30621e5b6	Role Management:update	
1c2deca3-d832-4550-9d6e-abfa0f4bf0d1	Role Management:approve	
e994b39c-299a-4f18-b33f-8a8552656aa5	User Management:view	
f2eb6bab-90c8-4263-8c3f-74885625fd52	User Management:delete	
30639870-2106-47b6-be3a-d6a3e562217f	User Management:approve	
6adb2f10-4cc6-486d-9555-e3f8a4e890a5	User Management:update	
ce531e27-31bb-4b17-8fa5-cc6f3f7f6d12	Investor:view	
38c8ce76-e421-4d87-abc7-0b176b6c07fd	Investor:approve	
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" (id, name, description, "createdAt", "updatedAt") FROM stdin;
3714e4f5-9071-4bf0-9402-4b95bb02379f	Manager	Manager	2025-09-09 19:14:33.17	2025-09-09 19:14:33.17
a925d9e0-184f-412e-99b7-d37d7e106967	Sales	this is sales	2025-09-10 06:53:14.672	2025-09-10 06:54:41.782
7c35ee02-cb84-4916-999d-70b54e1246f5	FInance		2025-09-13 02:26:59.127	2025-09-13 02:26:59.127
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermission" (id, "roleId", "permissionId", access) FROM stdin;
c28c537a-6d4f-4bc2-b880-c154eb04a112	3714e4f5-9071-4bf0-9402-4b95bb02379f	a01b48be-2232-49a9-af67-7e3b742cbecd	view
75c33199-b4f1-441b-96ea-9c2a6db6815c	3714e4f5-9071-4bf0-9402-4b95bb02379f	0ce5e6da-d1ea-40a3-8d50-d504faa57642	view
dab2d68b-071d-4404-91b5-18cc816e55be	3714e4f5-9071-4bf0-9402-4b95bb02379f	2bda9f49-ed92-4276-b43f-06a55ba8e015	update
f601cf49-1dcc-4e91-a1a7-34db149a3404	3714e4f5-9071-4bf0-9402-4b95bb02379f	0cf3d0bd-0cb4-4acb-8125-e864f50e0473	delete
4e7ca9bb-f777-471d-b1ef-a2a1c9b48276	3714e4f5-9071-4bf0-9402-4b95bb02379f	885ef343-34e5-4c6d-af3a-ceab8fd04cf9	approve
e60eaf8d-6e84-41cc-8d53-5caf69a5326c	3714e4f5-9071-4bf0-9402-4b95bb02379f	00a4a933-881a-4b32-8af4-a1b621618ac9	update
9f0d33e4-a96f-49ae-9b3d-0a0a3e26cc78	3714e4f5-9071-4bf0-9402-4b95bb02379f	c4b70d2a-8e20-434c-b248-efbaeee1bc07	approve
b09cc52d-9476-41de-ba10-f3a2aa649bf7	3714e4f5-9071-4bf0-9402-4b95bb02379f	aae98841-24fd-4a9a-b438-1787791d4581	delete
5855d8bd-fbd0-4c79-a18e-fa539e7a1824	a925d9e0-184f-412e-99b7-d37d7e106967	2bda9f49-ed92-4276-b43f-06a55ba8e015	view
0ea3544d-4609-4c42-981d-f8c2b08d28de	a925d9e0-184f-412e-99b7-d37d7e106967	654a3713-7f06-479e-995b-fad30621e5b6	view
31b410bb-bab9-454f-bf72-4b8b7e06a17f	a925d9e0-184f-412e-99b7-d37d7e106967	885ef343-34e5-4c6d-af3a-ceab8fd04cf9	view
cb5da1e9-e851-47e6-8de2-8fa8d4265250	a925d9e0-184f-412e-99b7-d37d7e106967	e994b39c-299a-4f18-b33f-8a8552656aa5	view
80997df9-ef58-4e5a-bc4c-d2b306e3098b	a925d9e0-184f-412e-99b7-d37d7e106967	aae98841-24fd-4a9a-b438-1787791d4581	view
44ff0217-b3f4-4229-8f1c-eb8b4e3a0f8d	a925d9e0-184f-412e-99b7-d37d7e106967	740e5e51-a6f2-4833-bc81-bdc35d83bb33	view
ffef25d9-e552-4d73-a220-a90209e069c7	a925d9e0-184f-412e-99b7-d37d7e106967	1c2deca3-d832-4550-9d6e-abfa0f4bf0d1	view
c8e0eaad-537a-4abd-9e2c-2adf729e7088	a925d9e0-184f-412e-99b7-d37d7e106967	0ce5e6da-d1ea-40a3-8d50-d504faa57642	view
326cd368-43ea-4463-8e4c-9f97008e1272	a925d9e0-184f-412e-99b7-d37d7e106967	6adb2f10-4cc6-486d-9555-e3f8a4e890a5	view
abf84505-4bed-4918-8e3b-65e7e1cc1f16	a925d9e0-184f-412e-99b7-d37d7e106967	30639870-2106-47b6-be3a-d6a3e562217f	view
48589155-5034-47e0-9045-78641b76a9d1	a925d9e0-184f-412e-99b7-d37d7e106967	f2eb6bab-90c8-4263-8c3f-74885625fd52	view
2ec8fab7-b16d-4dac-86a2-9bf0518b4a5e	a925d9e0-184f-412e-99b7-d37d7e106967	4ac25dfc-1ea8-4b80-93a8-909f76bd71c3	view
ca92ee8d-0a21-4578-aed8-6cf51faacbcd	7c35ee02-cb84-4916-999d-70b54e1246f5	885ef343-34e5-4c6d-af3a-ceab8fd04cf9	approve
7a7381a8-1806-46bc-b963-70c4d0909a77	7c35ee02-cb84-4916-999d-70b54e1246f5	2bda9f49-ed92-4276-b43f-06a55ba8e015	update
8b070665-a2d7-471d-bc03-e950b06547a1	7c35ee02-cb84-4916-999d-70b54e1246f5	0ce5e6da-d1ea-40a3-8d50-d504faa57642	view
caa10406-8364-4559-bff3-ee01b96bc2f2	7c35ee02-cb84-4916-999d-70b54e1246f5	c4b70d2a-8e20-434c-b248-efbaeee1bc07	approve
6dd8b2dc-c48a-4b77-91bc-7ef5e11bf50a	7c35ee02-cb84-4916-999d-70b54e1246f5	00a4a933-881a-4b32-8af4-a1b621618ac9	update
20cf20c4-66a8-4d58-bf9e-af2d5edf16c3	7c35ee02-cb84-4916-999d-70b54e1246f5	ce531e27-31bb-4b17-8fa5-cc6f3f7f6d12	view
eb045aaa-8651-48e3-a644-40d188c0b3a9	7c35ee02-cb84-4916-999d-70b54e1246f5	38c8ce76-e421-4d87-abc7-0b176b6c07fd	approve
2f7b9b96-350b-43aa-903c-ef8b92aeb9b7	7c35ee02-cb84-4916-999d-70b54e1246f5	a01b48be-2232-49a9-af67-7e3b742cbecd	view
\.


--
-- Data for Name: Sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sales" (id, "opportunityId", amount, date) FROM stdin;
\.


--
-- Data for Name: TerritoryMaster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TerritoryMaster" (id, "opportunityId", "territoryId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "UserID", name, email, password, phone, image_url, designation, "countryCode", "roleId", "branchId", "userLevel", "administrateId", "headId", "managerId", "salesTarget", "salesAchieved", incentive, "isActive", "isLogin", "isAdmin", "isHead", "isManager", "createdAt", "updatedAt") FROM stdin;
2ba2c777-f5fd-4e3f-ab92-57d6073225c3	\N	robin	robin@gmail.com	$2b$10$t55N7nqveTaGdPZMhfrzCO0BRfsKBiDSyV0WeXzeiGoBfsBt6kZhO	9034567839	\N	head	+91	3714e4f5-9071-4bf0-9402-4b95bb02379f	934d8948-2b0b-4f2f-9542-989b0e86d127	ADMINISTRATE	\N	\N	\N	0	0	0	t	f	t	f	f	2025-09-11 19:25:47.595	2025-09-11 19:25:47.595
309bcf6d-a268-4d05-b976-8234baceace7	\N	rauf	rauf@gmail.com	$2b$10$lUgqttqFUu4.hmJ8g3vHPOF56cwQd3fWTRgQnLhN9knmli/RxjXqK	7204474711	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	ADMINISTRATE	\N	\N	\N	0	0	0	t	f	t	f	f	2025-09-11 19:27:34.85	2025-09-11 19:27:34.85
c05732f2-1ec1-4c35-aa6a-1ee79d28746d	\N	rameez	rameez@gmail.com	$2b$10$iYyjQxuP28F4mx9agcwlmOwqjBG0BVpc8PKOkxM1bVs/CPtiIirPu	9034567839	\N	manager	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	HEAD	309bcf6d-a268-4d05-b976-8234baceace7	\N	\N	0	0	0	t	f	f	t	f	2025-09-11 19:28:13.531	2025-09-11 19:28:13.531
03380d31-ee9c-4b86-b31c-2007bed166a5	\N	ichu	ichu@gmail.com	$2b$10$FXJRd0Tsew0kagmaC6PfeOHyPap1N/vRYUQw2TbX4tIpOTYDbIJEW	7204474711	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	HEAD	309bcf6d-a268-4d05-b976-8234baceace7	\N	\N	0	0	0	t	f	f	t	f	2025-09-11 19:29:00.827	2025-09-11 19:29:00.827
e60be397-3c54-485e-b309-3cc7884f8c8a	\N	affu	affu@gmail.com	$2b$10$ZJoYn3RgTDCjxND6hQVGDePqRTNIIejUp9Q76nzPO1zROquooUELu	7204474711	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	MANAGER	309bcf6d-a268-4d05-b976-8234baceace7	03380d31-ee9c-4b86-b31c-2007bed166a5	\N	0	0	0	t	f	f	f	t	2025-09-11 19:30:45.966	2025-09-11 19:30:45.966
18190ddc-2178-4a97-86f1-58cc8893a889	\N	hari	hari@gmail.com	$2b$10$zQJVKPeD2m7J6TshUKS4CO3RGFe1dPqUMLBtOuKKIl2.0B5LtZq1S	9740413086	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	MANAGER	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	\N	0	0	0	t	f	f	f	t	2025-09-11 19:31:18.778	2025-09-11 19:31:18.778
7fef156b-4d71-4d2b-b922-85bd9507db3a	\N	shafi	shafi@gmail.com	$2b$10$LGw4YTOz3xa5BFStbYrGY.x7ZEAtWVUZzFpIQdCSjDTd/a0umvxQG	9034567839	\N	executive	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	EXECUTIVE	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	18190ddc-2178-4a97-86f1-58cc8893a889	0	0	0	t	f	f	f	f	2025-09-11 19:33:01.164	2025-09-11 19:33:01.164
4a96a431-f86f-4b78-ab47-583803d4d566	\N	mahi	mahi@gmail.com	$2b$10$sZ5SA1n5AjrjfEzofHw4uuHkdK0y3xyDpHsxcPVnVBuc5.sc9dbqu	9740413086	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	EXECUTIVE	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	18190ddc-2178-4a97-86f1-58cc8893a889	0	0	0	t	f	f	f	f	2025-09-11 19:33:54.296	2025-09-11 19:33:54.296
4549f391-c644-48d4-9423-c601cd65aec4	\N	Vishnu	vishnu@gmail.com	$2b$10$xPHxg8Qquw42gg7fvLZKTu2itj/Jwj6tjKOQMtkGBxnrIyLA/J73a	78009098736	\N	Administrate	+91	3714e4f5-9071-4bf0-9402-4b95bb02379f	934d8948-2b0b-4f2f-9542-989b0e86d127	MANAGER	4549f391-c644-48d4-9423-c601cd65aec4	fd3bf2e0-6ffe-4666-bdab-55c58a021a11	\N	0	0	0	t	t	f	f	t	2025-09-09 19:23:07.865	2025-09-10 11:06:11.892
e40952a0-e953-43d5-884e-13cb264448c6	\N	aksha	aksha@gmail.com	$2b$10$OTAq0btrAZydLW3ztAjzE.pFphyyKYaTDsdKdBR1es1oavf2HU1ui	9034567839	\N	sales	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	EXECUTIVE	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	18190ddc-2178-4a97-86f1-58cc8893a889	0	0	0	t	f	f	f	f	2025-09-11 21:21:58.875	2025-09-11 21:28:33.964
168c5d7d-de54-4c43-ac1d-967291485753	\N	Albert	albert@gmail.com	$2b$10$0kj2ilFCsbdar1Q1Jalgje9G2E1CWFIieTMTn7vkuF3aKH1wADK1u	9740413086	\N	head	+91	3714e4f5-9071-4bf0-9402-4b95bb02379f	934d8948-2b0b-4f2f-9542-989b0e86d127	HEAD	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	\N	\N	0	0	0	t	t	f	t	f	2025-09-11 19:26:35.545	2025-09-13 02:18:47.078
2fff1f05-70a0-4f0e-a991-803f876b9d75	\N	Finance	finance@ebikego.in	$2b$10$bRJXKMcF8HlxLpeaWq7QQOT92MYjrJTsebVhlpKKbvg1zvoqMMqiy	9034567839	\N	Finance	+91	7c35ee02-cb84-4916-999d-70b54e1246f5	934d8948-2b0b-4f2f-9542-989b0e86d127	ASSOCIATE	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	18190ddc-2178-4a97-86f1-58cc8893a889	0	0	0	t	t	f	f	f	2025-09-13 02:28:12.799	2025-09-13 02:28:35.755
fd3bf2e0-6ffe-4666-bdab-55c58a021a11	\N	amal	amal@ebikego.in	$2b$10$4WyTUTmibFvMo/OTEl580OoaWWxEtotasjwj2swJQThvEAofavgpC	9740413086	\N	BDM	+91	a925d9e0-184f-412e-99b7-d37d7e106967	934d8948-2b0b-4f2f-9542-989b0e86d127	MANAGER	2ba2c777-f5fd-4e3f-ab92-57d6073225c3	168c5d7d-de54-4c43-ac1d-967291485753	\N	0	0	0	t	t	f	f	t	2025-09-10 06:53:49.526	2025-09-13 02:40:41.589
3de86c36-c195-49c3-9cf6-609a0a01feda	\N	Raziq	raziqsur@gmail.com	$2b$10$BcnKeV9GqQPtx50YXcS1qubp3gOv8.EEH5.P7uUUiCcidlCfrrH4G	9087654321	https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=NJSugBzNuZqb7DJ8ZgLfYKb3qPr2EJMvKZ21Sj5Sfq4=	\N	\N	\N	\N	ADMINISTRATE	\N	\N	\N	0	0	0	t	t	t	f	f	2025-09-09 19:11:44.902	2025-09-13 02:33:16.842
\.


--
-- Data for Name: _OpportunityBranches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_OpportunityBranches" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
60c9f537-4b66-4e06-8212-ff158c361585	bb87e045fbdd091439d05816fdf85254598cf8f70ec71241acf04c6df29bd0d7	2025-09-10 00:40:58.388815+05:30	20250909191053_add_user_level_hierarchy	\N	\N	2025-09-10 00:40:58.333878+05:30	1
43758225-8057-413b-a518-60351b469a8e	bb87e045fbdd091439d05816fdf85254598cf8f70ec71241acf04c6df29bd0d7	\N	20250910070825_latest_db	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250910070825_latest_db\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "UserLevel" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"UserLevel\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1172), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250910070825_latest_db"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250910070825_latest_db"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-09-11 00:33:21.702773+05:30	2025-09-11 00:31:02.651957+05:30	0
5535a06a-5c81-4adf-9691-8b69c5c15b5f	bb87e045fbdd091439d05816fdf85254598cf8f70ec71241acf04c6df29bd0d7	2025-09-11 00:33:21.70499+05:30	20250910070825_latest_db		\N	2025-09-11 00:33:21.70499+05:30	0
ee982eba-f226-40c4-bf8e-a10a234f5d6d	c59f3903e455b742f6f277236b9b583b25b8a1b82212ed6f930e0cb8042ff14d	2025-09-11 00:34:11.216377+05:30	20250910071357_latest_db	\N	\N	2025-09-11 00:34:11.194635+05:30	1
52521bcb-33e0-4422-b6b9-a82a9652ba89	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2025-09-11 00:47:40.985617+05:30	000_init		\N	2025-09-11 00:47:40.985617+05:30	0
5eda1bf6-1b4d-4252-9260-2077f6d7eec9	bf1e476d520476f7b9ca244ef15b4e26773dbb41e021b45f5e04897a909b298a	2025-09-12 02:50:39.990314+05:30	20250911205349_add_executive_assignment	\N	\N	2025-09-12 02:50:39.984675+05:30	1
\.


--
-- Data for Name: investment_opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.investment_opportunities (id, name, "brandName", "brandId", description, "minAmount", "maxAmount", "roiPercent", "turnOverPercentage", "turnOverAmount", "renewalFee", "lockInMonths", "exitOptions", "payoutMode", "isActive", documents, "investmentTypeId", "businessCategoryId", "isMasterFranchise", "isSignature", "signatureStoreLocation") FROM stdin;
\.


--
-- Data for Name: territories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.territories (id, "assignmentType", location, pincode, city, "imageUrl", "createdAt", "updatedAt", "investmentOpportunityId", "isBooked") FROM stdin;
\.


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_pkey" PRIMARY KEY (id);


--
-- Name: BookingFormPaymentDetails BookingFormPaymentDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormPaymentDetails"
    ADD CONSTRAINT "BookingFormPaymentDetails_pkey" PRIMARY KEY (id);


--
-- Name: BookingFormPersonalDetails BookingFormPersonalDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormPersonalDetails"
    ADD CONSTRAINT "BookingFormPersonalDetails_pkey" PRIMARY KEY (id);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: BusinessCategory BusinessCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BusinessCategory"
    ADD CONSTRAINT "BusinessCategory_pkey" PRIMARY KEY (id);


--
-- Name: ExecutiveAssignment ExecutiveAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExecutiveAssignment"
    ADD CONSTRAINT "ExecutiveAssignment_pkey" PRIMARY KEY ("associateId", "executiveId");


--
-- Name: ExpectedPaymentSceduledDetails ExpectedPaymentSceduledDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpectedPaymentSceduledDetails"
    ADD CONSTRAINT "ExpectedPaymentSceduledDetails_pkey" PRIMARY KEY (id);


--
-- Name: InvestmentType InvestmentType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvestmentType"
    ADD CONSTRAINT "InvestmentType_pkey" PRIMARY KEY (id);


--
-- Name: Investment Investment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investment"
    ADD CONSTRAINT "Investment_pkey" PRIMARY KEY (id);


--
-- Name: Investor Investor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investor"
    ADD CONSTRAINT "Investor_pkey" PRIMARY KEY (id);


--
-- Name: OpportunityBranch OpportunityBranch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OpportunityBranch"
    ADD CONSTRAINT "OpportunityBranch_pkey" PRIMARY KEY (id);


--
-- Name: PaymentSceduledDetails PaymentSceduledDetails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentSceduledDetails"
    ADD CONSTRAINT "PaymentSceduledDetails_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Sales Sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sales"
    ADD CONSTRAINT "Sales_pkey" PRIMARY KEY (id);


--
-- Name: TerritoryMaster TerritoryMaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TerritoryMaster"
    ADD CONSTRAINT "TerritoryMaster_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _OpportunityBranches _OpportunityBranches_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_OpportunityBranches"
    ADD CONSTRAINT "_OpportunityBranches_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: investment_opportunities investment_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investment_opportunities
    ADD CONSTRAINT investment_opportunities_pkey PRIMARY KEY (id);


--
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (id);


--
-- Name: BookingFormOfficeDetails_personalDetailsId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BookingFormOfficeDetails_personalDetailsId_key" ON public."BookingFormOfficeDetails" USING btree ("personalDetailsId");


--
-- Name: BookingFormPaymentDetails_personalDetailsId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BookingFormPaymentDetails_personalDetailsId_key" ON public."BookingFormPaymentDetails" USING btree ("personalDetailsId");


--
-- Name: Branch_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Branch_name_key" ON public."Branch" USING btree (name);


--
-- Name: BusinessCategory_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BusinessCategory_name_key" ON public."BusinessCategory" USING btree (name);


--
-- Name: InvestmentType_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InvestmentType_name_key" ON public."InvestmentType" USING btree (name);


--
-- Name: Investor_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Investor_email_key" ON public."Investor" USING btree (email);


--
-- Name: Permission_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Permission_name_key" ON public."Permission" USING btree (name);


--
-- Name: RolePermission_roleId_permissionId_access_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_access_key" ON public."RolePermission" USING btree ("roleId", "permissionId", access);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: User_UserID_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_UserID_key" ON public."User" USING btree ("UserID");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _OpportunityBranches_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_OpportunityBranches_B_index" ON public."_OpportunityBranches" USING btree ("B");


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_leadSuccessCoordinatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_leadSuccessCoordinatorId_fkey" FOREIGN KEY ("leadSuccessCoordinatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_officeBranchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_officeBranchId_fkey" FOREIGN KEY ("officeBranchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_partnerRelationshipExecutiveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_partnerRelationshipExecutiveId_fkey" FOREIGN KEY ("partnerRelationshipExecutiveId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_personalDetailsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES public."BookingFormPersonalDetails"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BookingFormOfficeDetails BookingFormOfficeDetails_salesOnboardingManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormOfficeDetails"
    ADD CONSTRAINT "BookingFormOfficeDetails_salesOnboardingManagerId_fkey" FOREIGN KEY ("salesOnboardingManagerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BookingFormPaymentDetails BookingFormPaymentDetails_personalDetailsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormPaymentDetails"
    ADD CONSTRAINT "BookingFormPaymentDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES public."BookingFormPersonalDetails"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BookingFormPersonalDetails BookingFormPersonalDetails_territoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookingFormPersonalDetails"
    ADD CONSTRAINT "BookingFormPersonalDetails_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES public.territories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExecutiveAssignment ExecutiveAssignment_associateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExecutiveAssignment"
    ADD CONSTRAINT "ExecutiveAssignment_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExecutiveAssignment ExecutiveAssignment_executiveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExecutiveAssignment"
    ADD CONSTRAINT "ExecutiveAssignment_executiveId_fkey" FOREIGN KEY ("executiveId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExpectedPaymentSceduledDetails ExpectedPaymentSceduledDetails_personalDetailsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpectedPaymentSceduledDetails"
    ADD CONSTRAINT "ExpectedPaymentSceduledDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES public."BookingFormPersonalDetails"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Investment Investment_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investment"
    ADD CONSTRAINT "Investment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Investment Investment_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investment"
    ADD CONSTRAINT "Investment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Investment Investment_investorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investment"
    ADD CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES public."Investor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Investment Investment_opportunityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investment"
    ADD CONSTRAINT "Investment_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Investor Investor_relationshipManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Investor"
    ADD CONSTRAINT "Investor_relationshipManagerId_fkey" FOREIGN KEY ("relationshipManagerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OpportunityBranch OpportunityBranch_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OpportunityBranch"
    ADD CONSTRAINT "OpportunityBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OpportunityBranch OpportunityBranch_opportunityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OpportunityBranch"
    ADD CONSTRAINT "OpportunityBranch_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentSceduledDetails PaymentSceduledDetails_personalDetailsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentSceduledDetails"
    ADD CONSTRAINT "PaymentSceduledDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES public."BookingFormPersonalDetails"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payout Payout_investmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES public."Investment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sales Sales_opportunityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sales"
    ADD CONSTRAINT "Sales_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TerritoryMaster TerritoryMaster_opportunityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TerritoryMaster"
    ADD CONSTRAINT "TerritoryMaster_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TerritoryMaster TerritoryMaster_territoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TerritoryMaster"
    ADD CONSTRAINT "TerritoryMaster_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES public.territories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_administrateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_administrateId_fkey" FOREIGN KEY ("administrateId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_headId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_headId_fkey" FOREIGN KEY ("headId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _OpportunityBranches _OpportunityBranches_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_OpportunityBranches"
    ADD CONSTRAINT "_OpportunityBranches_A_fkey" FOREIGN KEY ("A") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _OpportunityBranches _OpportunityBranches_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_OpportunityBranches"
    ADD CONSTRAINT "_OpportunityBranches_B_fkey" FOREIGN KEY ("B") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investment_opportunities investment_opportunities_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investment_opportunities
    ADD CONSTRAINT "investment_opportunities_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: investment_opportunities investment_opportunities_businessCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investment_opportunities
    ADD CONSTRAINT "investment_opportunities_businessCategoryId_fkey" FOREIGN KEY ("businessCategoryId") REFERENCES public."BusinessCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: investment_opportunities investment_opportunities_investmentTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investment_opportunities
    ADD CONSTRAINT "investment_opportunities_investmentTypeId_fkey" FOREIGN KEY ("investmentTypeId") REFERENCES public."InvestmentType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: territories territories_investmentOpportunityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT "territories_investmentOpportunityId_fkey" FOREIGN KEY ("investmentOpportunityId") REFERENCES public.investment_opportunities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

