-- CreateEnum
CREATE TYPE "order_type" AS ENUM ('dine_in', 'counter', 'delivery');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('unpaid', 'paid');

-- CreateEnum
CREATE TYPE "table_status" AS ENUM ('free', 'occupied');

-- CreateEnum
CREATE TYPE "kitchen_status" AS ENUM ('queued', 'preparing', 'ready', 'delivered');

-- CreateTable
CREATE TABLE "operator" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pin_hash" TEXT,
    "pin_set" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "table_status" NOT NULL DEFAULT 'free',

    CONSTRAINT "table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "type" "order_type" NOT NULL,
    "table_id" TEXT,
    "customer_name" TEXT,
    "payment_status" "payment_status" NOT NULL DEFAULT 'unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "operator_id" TEXT NOT NULL,
    "closed_by_id" TEXT,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "final_price" INTEGER NOT NULL,
    "modifiers" JSONB,
    "kitchen_status" "kitchen_status" NOT NULL DEFAULT 'queued',
    "kitchen_status_changed_at" TIMESTAMP(3),
    "kitchen_ticket_id" TEXT,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "customization" JSONB,

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_ticket" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kitchen_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_username_key" ON "operator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "table_number_key" ON "table"("number");

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_ticket_number_key" ON "kitchen_ticket"("number");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_closed_by_id_fkey" FOREIGN KEY ("closed_by_id") REFERENCES "operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_kitchen_ticket_id_fkey" FOREIGN KEY ("kitchen_ticket_id") REFERENCES "kitchen_ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_ticket" ADD CONSTRAINT "kitchen_ticket_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
