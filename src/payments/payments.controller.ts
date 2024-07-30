import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('key')
  @ApiOperation({ summary: 'Get Razorpay API Key' })
  @ApiResponse({ status: 200, description: 'Returns the Razorpay API Key' })
  getKey(@Res() res: any): any {
    const response = this.paymentService.getKey();
    return res.json({ key: response });
  }

  @Get('secretkey')
  @ApiOperation({ summary: 'Get Razorpay API Secret Key' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Razorpay API Secret Key',
  })
  getData(): string {
    return this.paymentService.getSecretKey();
  }

  @Post()
  @ApiOperation({ summary: 'Create Razorpay Order' })
  @ApiResponse({
    status: 200,
    description: 'Returns the created Razorpay order',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 500 },
        currency: { type: 'string', example: 'INR' },
      },
    },
  })
  async checkout(@Body() body: any) {
    const { taskId } = body;
    const order = await this.paymentService.createOrder(taskId);
    return {
      success: true,
      order,
    };
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get Payment Details' })
  @ApiParam({ name: 'paymentId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns the payment details' })
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentDetails(paymentId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Payment' })
  @ApiResponse({
    status: 200,
    description: 'Redirects on successful verification',
  })
  async verifyPayment(
    @Body() paymentDetails: any,
    @Res() res: any,
  ): Promise<any> {
    try {
      const verificationResult = await this.paymentService.verifyPayment(
        paymentDetails,
      );
      if (verificationResult.success) {
        return res.redirect(
          `http://localhost:4200/payment-success?reference=${paymentDetails.razorpay_payment_id}`,
        );
      } else {
        throw new HttpException(
          verificationResult.error,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new HttpException(
        'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('base/auth')
  @ApiOperation({ summary: 'Get Razorpay Basic Authentication' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Razorpay basic authentication details',
  })
  async PaymentAuth(@Res() res: any): Promise<any> {
    try {
      const auth = await this.paymentService.getBasicAuth();
      return res.json({ auth });
    } catch (err) {
      return res.json({ error: err.message });
    }
  }

  @Post('linked-account')
  async createLinkedAccount(@Body() body: any) {
    try {
      const result = await this.paymentService.createLinkedAccount(body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }


  @Post('accounts/:accountId/stakeholders')
  async createStakeholder(@Param('accountId') accountId: string, @Body() body: any) {
    try {
      const accountExists = await this.paymentService.checkAccountExists(accountId);
      if (!accountExists) {
        return { success: false, message: 'Account ID does not exist' };
      }

      const result = await this.paymentService.createStakeholder(accountId, body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

// write a code for checkAccountExists to check the ifd exists 
  @Post('accounts/check')
  async createAccount(@Body() body: any) {
    try {
      const result = await this.paymentService.checkAccountExists(body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  @Post('accounts/:accountId/products')
  async requestProductConfiguration(@Param('accountId') accountId: string, @Body() body: any) {
    try {
      const accountExists = await this.paymentService.checkAccountExists(accountId);
      if (!accountExists) {
        return { success: false, message: 'Account ID does not exist' };
      }

      const result = await this.paymentService.requestProductConfiguration(accountId, body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }


  @Patch('accounts/:accountId/products/:productId')
  async updateProduct(
    @Param('accountId') accountId: string,
    @Param('productId') productId: string,
    @Body() body: any,
  ) {
    try {
      const accountExists = await this.paymentService.checkAccountExists(accountId);
      if (!accountExists) {
        return { success: false, message: 'Account ID does not exist' };
      }

      const result = await this.paymentService.updateProduct(accountId, productId, body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
