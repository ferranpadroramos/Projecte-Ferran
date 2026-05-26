import "dotenv/config"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    // Rangs
    const ranks = await Promise.all([
        prisma.rank.upsert({ where: { name: "Bronze" }, update: {}, create: { name: "Bronze", desc: "Rang inicial" } }),
        prisma.rank.upsert({ where: { name: "Plata" }, update: {}, create: { name: "Plata", desc: "Rang intermedi" } }),
        prisma.rank.upsert({ where: { name: "Or" }, update: {}, create: { name: "Or", desc: "Rang avançat" } }),
        prisma.rank.upsert({ where: { name: "Diamant" }, update: {}, create: { name: "Diamant", desc: "Rang expert" } }),
    ])

    // Regions
    const regions = await Promise.all([
        prisma.region.upsert({ where: { name: "Europa" }, update: {}, create: { name: "Europa", desc: "Servidor europeu" } }),
        prisma.region.upsert({ where: { name: "Amèrica" }, update: {}, create: { name: "Amèrica", desc: "Servidor americà" } }),
        prisma.region.upsert({ where: { name: "Àsia" }, update: {}, create: { name: "Àsia", desc: "Servidor asiàtic" } }),
    ])

    // Rols
    const roles = await Promise.all([
        prisma.role.upsert({ where: { name: "Jugador" }, update: {}, create: { name: "Jugador", desc: "Usuari estàndard" } }),
        prisma.role.upsert({ where: { name: "Streamer" }, update: {}, create: { name: "Streamer", desc: "Creador de contingut" } }),
        prisma.role.upsert({ where: { name: "Pro" }, update: {}, create: { name: "Pro", desc: "Jugador professional" } }),
    ])

    // Tipus de notificació
    await Promise.all([
        prisma.notificationType.upsert({ where: { name: "like" }, update: {}, create: { name: "like", desc: "Like a una publicació o comentari" } }),
        prisma.notificationType.upsert({ where: { name: "comment" }, update: {}, create: { name: "comment", desc: "Comentari a una publicació" } }),
        prisma.notificationType.upsert({ where: { name: "friend_request" }, update: {}, create: { name: "friend_request", desc: "Sol·licitud d'amistat" } }),
        prisma.notificationType.upsert({ where: { name: "tag" }, update: {}, create: { name: "tag", desc: "Etiqueta en una publicació o comentari" } }),
        prisma.notificationType.upsert({ where: { name: "report" }, update: {}, create: { name: "report", desc: "Notificació d'un report resolt" } }),
    ])

    // Usuari admin
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@projecte.com"
    const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin1234!"
    const hashed = await bcrypt.hash(adminPassword, 10)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            username: "admin",
            email: adminEmail,
            password: hashed,
            isAdmin: true,
            rankId: ranks[3].id,   // Diamant
            regionId: regions[0].id, // Europa
            role: { connect: [{ id: roles[0].id }] }
        }
    })

    console.log("✅ Seed completat")
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`)
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
