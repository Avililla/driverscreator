import { NextApiRequest, NextApiResponse } from "next";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import os from "os";
import { generateLatexPDF } from "@/lib/file-generators"; // Ajusta la ruta de importación según corresponda

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Aceptamos solo peticiones POST para generar el PDF
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  // Extraemos los parámetros del cuerpo de la petición
  const { deviceName, deviceDescription, baseAddress, bitWidth, registers } =
    req.body;

  // Validación básica de parámetros
  if (!deviceName || !baseAddress || !bitWidth || !registers) {
    res.status(400).json({ error: "Faltan parámetros obligatorios" });
    return;
  }

  try {
    // Genera el contenido LaTeX a partir de los datos enviados
    const texContent = generateLatexPDF(
      deviceName,
      deviceDescription,
      baseAddress,
      bitWidth,
      registers
    );

    // Creamos nombres de archivo únicos usando la carpeta temporal del sistema
    const tempDir = os.tmpdir();
    const uniqueId = Date.now(); // Puedes usar un generador de IDs más robusto si lo prefieres
    const texFilePath = path.join(tempDir, `${deviceName}_${uniqueId}.tex`);
    const pdfFilePath = path.join(tempDir, `${deviceName}_${uniqueId}.pdf`);

    // Escribe el archivo .tex
    writeFileSync(texFilePath, texContent, { encoding: "utf8" });
    console.log(`Archivo .tex generado en: ${texFilePath}`);

    // Ejecuta pdflatex para compilar el .tex en PDF
    // Se indica la carpeta de salida para que los archivos generados (PDF, log, aux, etc.) se almacenen en tempDir
    execSync(
      `pdflatex -interaction=nonstopmode -halt-on-error -output-directory ${tempDir} ${texFilePath}`,
      { stdio: "inherit" }
    );

    // Verifica que se haya generado el PDF
    if (!existsSync(pdfFilePath)) {
      res.status(500).json({ error: "La generación del PDF falló" });
      return;
    }

    // Lee el archivo PDF en un buffer
    const pdfBuffer = readFileSync(pdfFilePath);

    // Configura las cabeceras para la descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${deviceName}_registers.pdf`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).json({ error: "Error al generar el PDF" });
  } finally {
    // Limpieza de archivos temporales
    // Es recomendable eliminar los archivos auxiliares (.tex, .pdf, .log, .aux, etc.) generados
    // Aquí eliminamos al menos el .tex y el .pdf
    const tempFiles = ["tex", "pdf", "log", "aux"].map((ext) =>
      path.join(os.tmpdir(), `${deviceName}_${Date.now()}.${ext}`)
    );
    tempFiles.forEach((file) => {
      if (existsSync(file)) {
        try {
          unlinkSync(file);
        } catch (err) {
          console.warn(`No se pudo eliminar ${file}:`, err);
        }
      }
    });
  }
}
