import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../history/entities/history.entity';
import { HistoryDetailed } from '../history-detailed/entities/history-detailed.entity';
import { CreateSupportCallDto } from './dto/create-support-call.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly mailer: MailerService,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}


  async sendOrderEmail(history: History) {
    const historyWithDetails = await this.historyRepository.findOne({
      where: { id: history.id },
      relations: ['historyDetaileds', 'historyDetaileds.product', 'user'],
    });

    if (!historyWithDetails) {
      throw new Error('הזמנה לא נמצאה במאגר');
    }

    const itemsRows = historyWithDetails.historyDetaileds
      .map((item: HistoryDetailed) => `
        <tr>
          <td>
            <img src="${item.product.defaultImagePath}" alt="${item.product.title}" class="product-image" />
          </td>
          <td>${item.product.title}</td>
          <td>${item.quantity}</td>
          <td>${item.singlePrice?.toFixed(2)} ש"ח</td>
          <td>${item.total?.toFixed(2)} ש"ח</td>
        </tr>
      `)
      .join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>פרטי הזמנה מספר ${historyWithDetails.orderExtId}</title>
        </head>
        <body style="margin:0;padding:0;direction:rtl;unicode-bidi:embed;font-family: sans-serif; background-color: #f9f9f9;">
          <div
            style="
              max-width:600px;
              margin:20px auto;
              background-color:#ffffff;
              padding:20px;
              border-radius:8px;
              box-shadow:0 2px 8px rgba(0,0,0,0.1);
              direction: rtl;
              text-align: right;
            "
          >
            <h1 style="font-size:24px;color:#333;margin-bottom:16px; text-align: right;">
              פרטי הזמנה מספר ${historyWithDetails.orderExtId}
            </h1>
            <div style="margin-bottom:16px; color:#555;">
              <div><strong>תאריך יצירה:</strong> ${historyWithDetails.createdAt.toLocaleDateString('he-IL')}</div>
              <div><strong>מספר הזמנה:</strong> ${historyWithDetails.orderExtId}</div>
              <div><strong>סך הכל:</strong> ${historyWithDetails.total?.toFixed(2)} ש”ח</div>
              <div><strong>משלוח:</strong> ${historyWithDetails.deliveryPrice?.toFixed(2) ?? '0.00'} ש”ח</div>
              <div><strong>הנחה:</strong> ${historyWithDetails.discount?.toFixed(2) ?? '0.00'} ש”ח</div>
            </div>
            <table
              style="
                width:100%;
                border-collapse:collapse;
                margin-top:20px;
                direction:rtl;
                text-align:center;
              "
            >
              <thead>
                <tr>
                  <th style="border:1px solid #ddd;padding:12px;background:#f4f4f4;color:#333;">תמונה</th>
                  <th style="border:1px solid #ddd;padding:12px;background:#f4f4f4;color:#333;">מוצר</th>
                  <th style="border:1px solid #ddd;padding:12px;background:#f4f4f4;color:#333;">כמות</th>
                  <th style="border:1px solid #ddd;padding:12px;background:#f4f4f4;color:#333;">מחיר יחידה</th>
                  <th style="border:1px solid #ddd;padding:12px;background:#f4f4f4;color:#333;">סה"כ פריט</th>
                </tr>
              </thead>
              <tbody>
                ${historyWithDetails.historyDetaileds
                  .map((item: HistoryDetailed) => `
                  <tr style="border:1px solid #ddd;${'/* alternate rows bg */'}">
                    <td style="border:1px solid #ddd;padding:8px;">
                      <img
                        src="${item.product.defaultImagePath}"
                        alt="${item.product.title}"
                        style="width:80px;height:auto;border-radius:4px;"
                      />
                    </td>
                    <td style="border:1px solid #ddd;padding:8px;">${item.product.title}</td>
                    <td style="border:1px solid #ddd;padding:8px;">${item.quantity}</td>
                    <td style="border:1px solid #ddd;padding:8px;">${item.singlePrice?.toFixed(2)} ש”ח</td>
                    <td style="border:1px solid #ddd;padding:8px;">${item.total?.toFixed(2)} ש”ח</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    await this.mailer.sendMail({
      to: process.env.SUPPORT_TEAM_EMAIL!,
      subject: `פרטי הזמנה מספר ${historyWithDetails.orderExtId}`,
      html: htmlBody,
    });
  }

  async sendSupportCallEmail(data: CreateSupportCallDto) {
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>בקשת יצירת קשר עם התמיכה</title>
      </head>
      <body style="
          margin:0;
          padding:0;
          direction:rtl;
          unicode-bidi:embed;
          font-family:sans-serif;
          background-color:#f9f9f9;
        ">
        <div style="
            max-width:600px;
            margin:20px auto;
            padding:20px;
            background-color:#ffffff;
            border-radius:8px;
            box-shadow:0 2px 8px rgba(0,0,0,0.1);
            text-align:right;
          ">
          <h1 style="
              font-size:24px;
              color:#333333;
              margin-bottom:16px;
            ">
            בקשת יצירת קשר עם התמיכה
          </h1>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">שם:</span>
            ${data.name}
          </div>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">טלפון:</span>
            ${data.phone}
          </div>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">אימייל:</span>
            ${data.email}
          </div>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">מזהה משתמש חיצוני:</span>
            ${data.userExtId}
          </div>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">עסק:</span>
            ${data.bussnies}
          </div>
          
          <div style="margin-bottom:12px;">
            <span style="font-weight:bold;">הודעה:</span>
            <p style="margin:8px 0 0 0;">${data.message}</p>
          </div>
        </div>
      </body>
    </html>
    `;

    await this.mailer.sendMail({
      to: process.env.SUPPORT_TEAM_EMAIL!,
      subject: `יצירת קשר ממערכת B2B ${data.name}`,
      html: htmlBody,
    });
  }
}
