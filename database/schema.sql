set client_min_messages to warning;
-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;
create schema "public";
-- Below is the db designer exported code --

CREATE TABLE "users" (
	"userId" serial NOT NULL,
	"firstName" TEXT NOT NULL,
	"lastName" TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"password" TEXT NOT NULL,
	"createdAt" TIMESTAMPTZ default now() NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "jobList" (
	"jobId" serial NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"dateApplied" timestamptz NOT NULL,
	"status" text NOT NULL,
	"notes" text NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT "jobList_pk" PRIMARY KEY ("jobId")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "jobList" ADD CONSTRAINT "jobList_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
