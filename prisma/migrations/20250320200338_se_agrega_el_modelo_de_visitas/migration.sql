-- CreateTable
CREATE TABLE "Visitas" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "referer" TEXT,

    CONSTRAINT "Visitas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visitas" ADD CONSTRAINT "Visitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
