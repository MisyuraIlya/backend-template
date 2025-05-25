import { CartItem } from "src/modules/history/dto/create-order.dto";
import { DocumentItemsDto } from "src/erp/dto/documentItems.dto";
import { promises as fs } from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import { projectEnums } from '../settings';

//TODO
const LOGO_URL = `${projectEnums.mediaDomain}`;
const PRODUCT_IMAGE_BASE = `${projectEnums.mediaDomain}`;
const PLACEHOLDER_IMAGE_URL = `${projectEnums.mediaDomain}`;

const FONT_PATH = path.resolve(
  process.cwd(),
  'src/utils',
  'NotoSansHebrew-VariableFont_wdth,wght.ttf'
);

function buildDocumentHtml(obj: DocumentItemsDto, orderNumber: string, language: 'he' | 'en'): string {
  const dir = language === 'he' ? 'rtl' : 'ltr';
  const textAlign = language === 'he' ? 'right' : 'left';
  const oppositeAlign = language === 'he' ? 'left' : 'right';
  const shekel = '&#8362;';

  const name = projectEnums.companyName[language];
  const address = projectEnums.companyAddress[language];
  const location = projectEnums.companyLocation[language];
  const phone = projectEnums.companyPhone;
  const fax = projectEnums.companyFax;
  const businessNo = projectEnums.companyBusinessNumber;
  const vatNo = projectEnums.companyVatNumber;

  const css = `
    <style>
      @font-face {
        font-family: 'Heebo';
        src: url('file://${FONT_PATH}') format('truetype');
      }
      body { direction: ${dir}; font-family: 'Heebo', Arial, sans-serif; margin: 0; padding: 0; }
      .header, .footer, .items-table, .totals { width: 100%; }
      .header table { width: 100%; }
      .header td { vertical-align: top; }
      .logo img { max-width: 350px; height: auto; }
      .client-info, .order-details { margin: 10px 0; font-size: 12px; text-align: ${textAlign}; }
      .document-title { text-align: center; margin: 20px 0; }
      .document-title h1, .document-title h2 { margin: 0; }
      .items-table { border-collapse: collapse; font-size: 12px; margin-top: 20px; }
      .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; text-align: center; }
      .items-table th { background: #f7f7f7; }
      .totals { margin-top: 20px; font-size: 14px; text-align: ${textAlign}; }
      .totals span { display: inline-block; margin-right: 10px; padding: 6px 12px; border: 1px solid #ccc; background: #f0f0f0; }
      .footer { text-align: center; font-size: 10px; color: #7f8c8d; position: fixed; bottom: 20px; width: 100%; }
    </style>
  `;

  const {date: rawDate, type: orderType } = (obj as any).freeFields || {};
  const date = rawDate ? new Date(rawDate).toLocaleDateString('he-IL') : '';

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${css}</head><body>`;

  html += `
    <div class="header">
      <table>
        <tr>
          <td style="width: 60%; text-align: ${textAlign};">
            <h2>${name}</h2>
            <p>${address}<br>${location}<br>טלפון: ${phone}, פקס: ${fax}<br>מספר עסק: ${businessNo}<br>מספר רישום במע"מ: ${vatNo}</p>
          </td>
          <td style="width: 40%; text-align: ${oppositeAlign};" class="logo">
            <img src="${LOGO_URL}" alt="Logo" />
          </td>
        </tr>
      </table>
      <div class="client-info">
        <p>לכבוד:<br>${(obj as any).userName || ''}<br>טלפון: ${(obj as any).userPhone || ''}</p>
      </div>
      <div class="order-details">
        <p>מספר ${orderType}: ${orderNumber}</p>
        <p>תאריך הזמנה: ${date}</p>
      </div>
    </div>

    <div class="document-title">
      <h1>${orderType} ${(obj as any).userExtId || ''}</h1>
      <h2>אסמכתא: #${orderNumber}</h2>
    </div>

    <table class="items-table">
      <tr>
        <th>#</th><th>תמונה</th><th>מק"ט</th><th>תיאור פריט</th><th>כמות</th><th>מחיר</th><th>הנחה</th><th>סה"כ</th>
      </tr>
  `;

  (obj.products || []).forEach((item, idx) => {
    const imgUrl = item.product?.defaultImagePath
      ? `${PRODUCT_IMAGE_BASE}${path.basename(item.product.defaultImagePath)}`
      : PLACEHOLDER_IMAGE_URL;

    html += `
      <tr>
        <td>${idx + 1}</td>
        <td><img src="${imgUrl}" style="max-width:80px; height:auto;"/></td>
        <td>${item.sku}</td>
        <td>${item.title}</td>
        <td>${item.quantity}</td>
        <td>${item.priceByOne.toFixed(2)}${shekel}</td>
        <td>${item.discount}%</td>
        <td>${item.total.toFixed(2)}${shekel}</td>
      </tr>
    `;
  });

  html += `</table>
    <div class="totals">
      <span>סה"כ לפני מע"מ: ${obj.totalAfterDiscount}${shekel}</span>
      <span>סה"כ לתשלום: ${obj.totalPriceAfterTax}${shekel}</span>
    </div>

    <div class="footer">תודה שקניתם אצלנו!</div>
  </body></html>`;

  return html;
}

export const PdfGenerator = {
  async generateCartPdf(cartItems: CartItem[]): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.registerFont('Heebo', FONT_PATH);
    doc.font('Heebo').fontSize(18);

    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    const endPromise = new Promise<void>(resolve => doc.on('end', resolve));

    // Header
    doc.fillColor('#ffffff').rect(0, 0, doc.page.width, 80).fill('#2c3e50');
    doc.fillColor('#ecf0f1').fontSize(24)
       .text('🛒 עגלת הקניות שלך', 50, 30, { align: 'right', width: doc.page.width - 100 });
    doc.moveDown(2);
    doc.fillColor('#000').fontSize(12);

    for (const item of cartItems) {
      const yStart = doc.y;
      doc.roundedRect(50, yStart, doc.page.width - 100, 100, 5).stroke('#bdc3c7');

      const imgX = doc.page.width - 130;
      if (item.product.defaultImagePath) {
        try {
          const imgBuffer = await fs.readFile(item.product.defaultImagePath);
          doc.image(imgBuffer, imgX, yStart + 10, { width: 80, height: 80 });
        } catch {
          // ignore missing image
        }
      }

      doc.direction = 'rtl';
      doc.text(`SKU: ${item.sku}`, imgX - 20, yStart + 10)
         .text(`כותרת: ${item.product.title}`)
         .text(`כמות: ${item.quantity}`)
         .text(`מחיר ליחידה: ₪${item.price.toFixed(2)}`)
         .text(`הנחה: ${item.discount}%`)
         .text(`סה"כ: ₪${item.total.toFixed(2)}`);
      doc.direction = 'ltr';
      doc.moveDown(2);
    }

    // Footer
    const bottom = doc.page.height - 50;
    doc.moveTo(50, bottom).lineTo(doc.page.width - 50, bottom).dash(5, { space: 5 }).stroke('#7f8c8d').undash();
    doc.fontSize(10).fillColor('#7f8c8d')
       .text('תודה שקניתם אצלנו!', 50, bottom + 10, { align: 'center', width: doc.page.width - 100 });

    doc.end();
    await endPromise;
    return Buffer.concat(chunks).toString('base64');
  },

  async generateDocument(obj: DocumentItemsDto, orderNumber: string, language: 'he' | 'en' = 'he'): Promise<string> {
    const html = buildDocumentHtml(obj, orderNumber, language);
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '50px', right: '50px', bottom: '80px', left: '50px' }
    });
    await browser.close();
    const pdfBuffer = Buffer.from(pdfData);
    return pdfBuffer.toString('base64');
  }
};
