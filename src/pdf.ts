import * as fs from "fs";
import {PDFDocument, PDFHexString, PDFName} from 'pdf-lib';

async function addMetadata(
    src: string,
    dest: string,
    metadata: string
): Promise<void> {
    const pdfBuffer = await fs.promises.readFile(src);
    const uint8ArrayData = new Uint8Array(pdfBuffer)

    const pdfDoc = await PDFDocument.load(uint8ArrayData);

    pdfDoc['getInfoDict']().set(PDFName.of('verifymn'), PDFHexString.fromText(metadata.toString()));
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(dest, pdfBytes);
}

export {addMetadata};
