import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MaxApiService {
  private url = 'https://icom.yaad.net';
  private Masof: string;
  private KEY: string;
  private PassP: string;
  private Tash = 1;

  constructor(private readonly configService: ConfigService) {
    this.Masof = this.configService.get<string>('MASOF')!;
    this.KEY = this.configService.get<string>('YAD_KEY')!;
    this.PassP = this.configService.get<string>('PASSP')!;
  }

  async generateUrl(amount: number, orderId: string, user: User): Promise<string> {
    const params = new URLSearchParams();
    params.append('action', 'APISign');
    params.append('Info', 'j5 verification transaction');
    params.append('Amount', amount.toString());
    params.append('Order', orderId);
    params.append('email', '');
    params.append('ClientName', user.name!);
    params.append('ClientLName', '');
    params.append('street', '');
    params.append('city', '');
    params.append('zip', '');
    params.append('cell', '');
    params.append('UserId', '');
    params.append('Sign', 'True');
    params.append('MoreData', 'True');
    params.append('tmp', '5');
    params.append('Masof', this.Masof);
    params.append('PassP', this.PassP);
    params.append('PageLang', 'HEB');
    params.append('UTF8', 'True');
    params.append('Coin', '1');
    params.append('J5', 'True');
    params.append('Tash', this.Tash.toString());
    params.append('What', 'SIGN');
    params.append('KEY', this.KEY);
    params.append('Fild1', '');
    params.append('Fild2', Buffer.from(serialize(orderId)).toString('base64'));
    params.append('Fild3', '');

    const result = await this.ajax(params.toString(), '/cgi-bin/yaadpay/yaadpay3ds.pl?');
    return this.url + '/cgi-bin/yaadpay/yaadpay3ds.pl?' + result;
  }

  async getToken(transactionId: string): Promise<string> {
    const fields = new URLSearchParams();
    fields.append('action', 'getToken');
    fields.append('Masof', this.Masof);
    fields.append('PassP', this.PassP);
    fields.append('TransId', transactionId);

    const result = await this.ajax(fields.toString(), '/p/?');
    const params = new URLSearchParams(result);
    return params.get('Token') ?? '';
  }

  async j5Payment(data: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('action', 'soft');
    params.append('Masof', this.Masof);
    params.append('PassP', this.PassP);
    params.append('Amount', data.Amount);
    params.append('ACode', data.Acode);
    params.append('CC', data.token);
    params.append('Tmonth', data.Tmonth);
    params.append('Tyear', data.Tyear);
    params.append('Coin', data.coin);
    params.append('Info', `הזמנה ${data.clientName}`);
    params.append('Order', data.Order);
    params.append('Tash', '1');
    params.append('UserId', data.UserId);
    params.append('ClientLName', data.clientName);
    params.append('ClientName', '');
    params.append('cell', data.cell);
    params.append('email', data.email);
    params.append('street', data.street);
    params.append('city', data.city);
    params.append('zip', '');
    params.append('J5', 'False');
    params.append('MoreData', 'True');
    params.append('Postpone', 'False');
    params.append('UTF8', 'True');
    params.append('UTF8out', 'True');
    params.append('Token', 'True');
    params.append('Pritim', 'True');
    params.append('heshDesc', data.heshDesc);

    const result = await this.ajax(params.toString(), '/p3/?');
    const parsedResult = new URLSearchParams(result);

    const response = {
      result: parsedResult.get('errMsg')?.includes('(0)') ? 'success' : 'error',
      data: parsedResult,
      code: parsedResult.get('errMsg') ?? '',
    };

    return response;
  }

  private async ajax(params: string, func: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.get(this.url + func + params);
      return response.data;
    } catch (error) {
      throw new Error('Error in ajax GET: ' + error.message);
    }
  }

  private async ajaxPost(params: string, func: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(this.url + func, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error) {
      throw new Error('Error in ajax POST: ' + error.message);
    }
  }

  createPdf(transId: string): string {
    const params = new URLSearchParams();
    params.append('Masof', this.Masof);
    params.append('action', 'APISign');
    params.append('KEY', this.KEY);
    params.append('What', 'SIGN');
    params.append('PassP', this.PassP);
    params.append('TransId', transId);
    params.append('type', 'EZCOUNT');
    params.append('ACTION', 'PrintHesh');
    params.append('SendHesh', 'True');

    const result = this.ajax(params.toString(), '/cgi-bin/yaadpay/yaadpay3ds.pl?');
    return `https://icom.yaad.net/cgi-bin/yaadpay/yaadpay3ds.pl?${result}`;
  }
}

function serialize(orderId: string): string {
  return JSON.stringify(orderId);
}
