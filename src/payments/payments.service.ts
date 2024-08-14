/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import shortid from 'shortid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import Payment from 'src/models-dto-type-definitions/3.models/payment.schema';
import { Task } from 'src/models-dto-type-definitions/3.models/tasks.schema';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  private PaymentModel: Model<Payment>;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {
    this.PaymentModel = paymentModel;
    this.razorpay = new Razorpay({
      key_id: configService.get<string>('RAZORPAY_API_KEY'),
      key_secret: configService.get<string>('RAZORPAY_APT_SECRET'),
    });
  }

  instance(): Razorpay {
    return this.razorpay;
  }

  apiKey = this.configService.get<string>('RAZORPAY_API_KEY');
  apiSecret = this.configService.get<string>('RAZORPAY_APT_SECRET');

  getKey(): any {
    try {
      console.log(this.configService.get<number>('RAZORPAY_API_KEY'));
      return this.configService.get<number>('RAZORPAY_API_KEY');
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  getSecretKey(): string {
    return this.configService.get<string>('RAZORPAY_APT_SECRET');
  }

  async createOrder(taskId: string): Promise<any> {
    const getTaskDetails = await this.taskModel.findById(taskId).populate('paymentId');
    
    // Check if payment is already captured
    const isCaptured = Array.isArray(getTaskDetails.paymentId) &&
    getTaskDetails.paymentId.some((payment: any) => payment.payment_status === 'captured');
  
  
    if (isCaptured) {
      return { message: 'Payment already captured' };
    }
  console.log(getTaskDetails.paymentId.toString().length)
    try {
      const order = await this.razorpay.orders.create({
        amount: getTaskDetails.taskAmount * 100,
        currency: 'INR',
        receipt: getTaskDetails.paymentId.toString(),
        payment_capture: true,
      });
  
      await this.paymentModel.findByIdAndUpdate(getTaskDetails.paymentId, {
        payment_status: 'orderid_created',
        razorpay_order_id: order.id,
      });
  
      await this.taskModel.findByIdAndUpdate(getTaskDetails._id, {
        paymentStatus: 'orderid_created',
      });
  
      console.log(order.id, "check order id ---");
      return order;
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      throw new HttpException('Failed to create Razorpay order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async getPaymentDetails(paymentId: string) {
    try {
      const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching payment details: ${error.message}`);
    }
  }

  async verifyPayment(paymentDetails: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
    
    // Check if payment is already captured
    const existingPayment = await this.paymentModel.findOne({ razorpay_payment_id });
  
    if (existingPayment && existingPayment.payment_status === 'captured') {
      return { success: false, message: 'Payment already captured' };
    }
  
    const check = await this.getPaymentDetails(razorpay_payment_id);
  
    if (check.status === 'captured') {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('RAZORPAY_API_SECRET'))
        .update(body)
        .digest('hex');
      const isAuthentic = expectedSignature === razorpay_signature;
  
      if (isAuthentic) {
        const paymentData = await this.paymentModel.findOneAndUpdate(
          { razorpay_order_id: razorpay_order_id },
          {
            razorpay_payment_id,
            razorpay_signature,
            payment_method: check.method,
            amount: check.amount / 100 + check.currency,
            payment_status: 'captured',
          },
        );
      const rr=  await this.taskModel.findOneAndUpdate(
          { paymentId: paymentData._id },
          { paymentStatus: 'Done' },
          { new: true }
        )
        console.log(rr)
        return { success: true };
      }
    }
  
    return { success: false, error: 'Invalid signature or payment not captured' };
  }
  

  async transferRoute(paymentID: string, transferData: any): Promise<void> {
    try {
      const requestBody = {
        transfers: [
          {
            account: transferData.account,
            amount: transferData.amount,
            currency: 'INR',
            notes: {
              name: transferData.name,
              roll_no: 'IEC2011025',
            },
            on_hold: false,
          },
        ],
      };
      console.log('Request Body:', requestBody);

      const response = await axios.post(
        `https://api.razorpay.com/v1/payments/${paymentID}/transfers`,
        requestBody,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:-----------------------', response.data);
    } catch (err) {
      if (err.response) {
        console.error('Error Response Data:', err.response.data);
        console.error('Error Response Status:', err.response.status);
        console.error('Error Response Headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error Request Data:', err.request);
      } else {
        console.error('Error Message:', err.message);
      }
      console.error('Config:', err.config);
      throw err;
    }
  }

  async getBasicAuth(): Promise<string> {
    try {
      const response = await axios.get(`https://api.razorpay.com/v1/payments/`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching payment details: ${error.message}`);
    }
  }

  // create linked account

  async createLinkedAccount(data: any) {
    const url = 'https://api.razorpay.com/v2/accounts';
    const authHeader = `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`;

    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: authHeader,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error creating linked account: ${error.message}`);
    }
  }

  private getAuthHeader() {
    return `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`;
  }

  async checkAccountExists(accountId: string): Promise<boolean> {
    const url = `https://api.razorpay.com/v2/accounts/${accountId}`;
    try {
      await axios.get(url, {
        headers: { Authorization: this.getAuthHeader() },
      });
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw new Error(`Error checking account: ${error.message}`);
    }
  }

  async createStakeholder(accountId: string, data: any) {
    const url = `https://api.razorpay.com/v2/accounts/${accountId}/stakeholders`;
    try {
      const response = await axios.post(url, data, {
        headers: { Authorization: this.getAuthHeader() },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error creating stakeholder: ${error}`);
    }
  }

  async requestProductConfiguration(accountId: string, data: any) {
    const url = `https://api.razorpay.com/v2/accounts/${accountId}/products`;
    try {
      const response = await axios.post(url, data, {
        headers: { Authorization: this.getAuthHeader() },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error requesting product configuration: ${error.message}`);
    }
  }

  async updateProduct(accountId: string, productId: string, data: any) {
    const url = `https://api.razorpay.com/v2/accounts/${accountId}/products/${productId}`;
    try {
      const response = await axios.patch(url, data, {
        headers: { Authorization: this.getAuthHeader() },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }
  //  write a code method to create and routes linked accounts
  // this is the request body {
//    "email":"gaurav.kumar@example.com",
//    "phone":"9000090000",
//    "type":"route",
//    "reference_id":"124124",
//    "legal_business_name":"Acme Corp",
//    "business_type":"partnership",
//    "contact_name":"Gaurav Kumar",
//    "profile":{
//       "category":"healthcare",
//       "subcategory":"clinic",
//       "addresses":{
//          "registered":{
//             "street1":"507, Koramangala 1st block",
//             "street2":"MG Road",
//             "city":"Bengaluru",
//             "state":"KARNATAKA",
//             "postal_code":"560034",
//             "country":"IN"
//          }
//       }
//    }
  
// }
// this is razorpay api https://api.razorpay.com/v2/accounts







  //


  // async verifyPayment(paymentDetails: any) {
  //   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
  //   const check = await this.getPaymentDetails(razorpay_payment_id);
  
  //   const paymentData = await this.paymentModel.findOne({ razorpay_order_id });
  
  //   switch (check.status) {
  //     case 'captured': {
  //       const body = razorpay_order_id + '|' + razorpay_payment_id;
  //       const expectedSignature = crypto.createHmac('sha256', this.configService.get<string>('RAZORPAY_APT_SECRET'))
  //         .update(body)
  //         .digest('hex');
  
  //       if (expectedSignature === razorpay_signature) {
  //         await this.paymentModel.findOneAndUpdate(
  //           { razorpay_order_id },
  //           {
  //             razorpay_payment_id,
  //             razorpay_signature,
  //             payment_method: check.method,
  //             amount: check.amount + check.currency,
  //             payment_status: 'captured',
  //             reason: 'Payment successfully captured',
  //           },
  //         );
  //         await this.taskModel.findOneAndUpdate(
  //           { paymentId: paymentData._id },
  //           { paymentStatus: 'completed' },
  //         );
  //         return { success: true, message: 'Payment successful' };
  //       } else {
  //         await this.paymentModel.findOneAndUpdate(
  //           { razorpay_order_id },
  //           { payment_status: 'failed', reason: 'Invalid signature' },
  //         );
  //         return { success: false, message: 'Invalid signature' };
  //       }
  //     }
  //     case 'failed':
  //       await this.paymentModel.findOneAndUpdate(
  //         { razorpay_order_id },
  //         { payment_status: 'failed', reason: 'Payment failed due to insufficient funds or declined by bank' },
  //       );
  //       await this.taskModel.findOneAndUpdate(
  //         { paymentId: paymentData._id },
  //         { paymentStatus: 'failed' },
  //       );
  //       return { success: false, message: 'Payment failed' };
  
  //     case 'cancelled':
  //       await this.paymentModel.findOneAndUpdate(
  //         { razorpay_order_id },
  //         { payment_status: 'cancelled', reason: 'Payment cancelled by user' },
  //       );
  //       await this.taskModel.findOneAndUpdate(
  //         { paymentId: paymentData._id },
  //         { paymentStatus: 'cancelled' },
  //       );
  //       return { success: false, message: 'Payment cancelled' };
  
  //     default:
  //       await this.paymentModel.findOneAndUpdate(
  //         { razorpay_order_id },
  //         { payment_status: 'try  again', reason: 'invalid  payment status' },
  //       );
  //       return { success: false, message: 'invalid payment status' };
  //   }
  // }
  
}

// card expired 

// invalid otp

// due to back server

// due insufficent balance 

// network error

// how to handle with customer balance is debited from his acc and not credited to the app or org 

