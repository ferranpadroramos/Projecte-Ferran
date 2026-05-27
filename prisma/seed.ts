import "dotenv/config"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    const BASE = "https://res.cloudinary.com/dkmt2slre/image/upload/projecte-ferran/ranks"
    const rankData = [
        { name: "Unranked",      desc: "Sense rang",         img: "unranked" },
        { name: "Iron I",        desc: "Iron I",             img: "ironI" },
        { name: "Iron II",       desc: "Iron II",            img: "ironII" },
        { name: "Iron III",      desc: "Iron III",           img: "ironIII" },
        { name: "Bronze I",      desc: "Bronze I",           img: "bronzeI" },
        { name: "Bronze II",     desc: "Bronze II",          img: "bronzeII" },
        { name: "Bronze III",    desc: "Bronze III",         img: "bronzeIII" },
        { name: "Silver I",      desc: "Silver I",           img: "silverI" },
        { name: "Silver II",     desc: "Silver II",          img: "silverII" },
        { name: "Silver III",    desc: "Silver III",         img: "silverIII" },
        { name: "Gold I",        desc: "Gold I",             img: "goldI" },
        { name: "Gold II",       desc: "Gold II",            img: "goldII" },
        { name: "Gold III",      desc: "Gold III",           img: "goldIII" },
        { name: "Platinum I",    desc: "Platinum I",         img: "platinumI" },
        { name: "Platinum II",   desc: "Platinum II",        img: "platinumII" },
        { name: "Platinum III",  desc: "Platinum III",       img: "platinumIII" },
        { name: "Diamond I",     desc: "Diamond I",          img: "diamondI" },
        { name: "Diamond II",    desc: "Diamond II",         img: "diamondII" },
        { name: "Diamond III",   desc: "Diamond III",        img: "diamondIII" },
        { name: "Ascendant I",   desc: "Ascendant I",        img: "ascendantI" },
        { name: "Ascendant II",  desc: "Ascendant II",       img: "ascendantII" },
        { name: "Ascendant III", desc: "Ascendant III",      img: "ascendantIII" },
        { name: "Immortal I",    desc: "Immortal I",         img: "immortalI" },
        { name: "Immortal II",   desc: "Immortal II",        img: "immortalII" },
        { name: "Immortal III",  desc: "Immortal III",       img: "immortalIII" },
        { name: "Radiant",       desc: "Rang màxim",         img: "radiant" },
    ]

    // Rangs
    const ranks = await Promise.all(
        rankData.map(r => prisma.rank.upsert({
            where: { name: r.name },
            update: { imageUrl: `${BASE}/${r.img}` },
            create: { name: r.name, desc: r.desc, imageUrl: `${BASE}/${r.img}` }
        }))
    )

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
            rankId: ranks[ranks.length - 1].id, // Radiant
            regionId: regions[0].id, // Europa
            role: { connect: [{ id: roles[0].id }] }
        }
    })

    console.log("✅ Seed completat")
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
