import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

//Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//Puja una imatge i retorna la URL
export async function POST(req: Request) {
    // Comprovar que l'usuari estigui autenticat
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    // Obtenir el fitxer del formulari
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Cap fitxer rebut" }, { status: 400 })

    // Convertir el fitxer a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Pujar la imatge
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "projecte-ferran" },
            (error, result) => {
                if (error || !result) return reject(error)
                resolve(result)
            }
        ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
}
